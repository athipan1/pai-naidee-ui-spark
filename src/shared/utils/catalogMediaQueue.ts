import { fetchPublicMedia, publicMediaRetryAt } from './publicMediaRetry';

// A per-tab Catalog allowance leaves 24 of the server's 60 media slots for
// other images. The server still arbitrates traffic across devices and tabs.
const startsPerMinute = 36;
const concurrency = 2;
const windowMs = 60_000;

type Job = {
  url: string;
  controller: AbortController;
  promise: Promise<Blob>;
  resolve: (blob: Blob) => void;
  reject: (error: unknown) => void;
  consumers: number;
  started: boolean;
};

const jobs = new Map<string, Job>();
const pending = new Set<Job>();
const starts: number[] = [];
let active = 0;
let wakeup: ReturnType<typeof setTimeout> | undefined;

function pump() {
  clearTimeout(wakeup);
  if (!pending.size || active >= concurrency) return;
  const now = Date.now();
  while (starts.length && now - starts[0] >= windowMs) starts.shift();
  const nextStart = Math.max(publicMediaRetryAt(), starts.length >= startsPerMinute ? starts[0] + windowMs : 0);
  if (nextStart > now) {
    wakeup = setTimeout(pump, Math.min(nextStart - now, windowMs));
    return;
  }

  const job = pending.values().next().value;
  if (!job) return;
  pending.delete(job);
  job.started = true;
  starts.push(now);
  active++;
  const timeout = setTimeout(() => job.controller.abort(), 12_000);
  void fetchPublicMedia(job.url, job.controller.signal).then(job.resolve, job.reject).finally(() => {
    clearTimeout(timeout);
    if (jobs.get(job.url) === job) jobs.delete(job.url);
    active--;
    pump();
  });
  pump();
}

export function queueCatalogMedia(url: string) {
  let job = jobs.get(url);
  if (!job) {
    let resolve!: Job['resolve'];
    let reject!: Job['reject'];
    const promise = new Promise<Blob>((onSuccess, onFailure) => { resolve = onSuccess; reject = onFailure; });
    job = { url, controller: new AbortController(), promise, resolve, reject, consumers: 0, started: false };
    jobs.set(url, job);
    pending.add(job);
  }
  job.consumers++;
  const lease = job;
  pump();

  return {
    promise: lease.promise,
    release() {
      if (--lease.consumers > 0) return;
      if (jobs.get(url) === lease) jobs.delete(url);
      pending.delete(lease);
      lease.controller.abort();
      if (!lease.started) lease.reject(lease.controller.signal.reason);
      pump();
    },
  };
}
