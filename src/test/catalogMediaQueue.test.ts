import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const image = () => new Response('fixture', { headers: { 'Content-Type': 'image/png' } });
const flush = () => vi.advanceTimersByTimeAsync(0);

describe('Catalog media queue', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers({ now: new Date('2026-11-26T12:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('coalesces the same variant and cancels stale queued work without aborting a shared image', async () => {
    const signals: AbortSignal[] = [];
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      const signal = options.signal!;
      signals.push(signal);
      return new Promise<Response>((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { queueCatalogMedia } = await import('@/shared/utils/catalogMediaQueue');
    const a = queueCatalogMedia('/image-a?w=256');
    const peer = queueCatalogMedia('/image-a?w=256');
    const b = queueCatalogMedia('/image-a?w=640');
    const stale = queueCatalogMedia('/stale?w=256');
    const outcomes = Promise.allSettled([a.promise, peer.promise, b.promise, stale.promise]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(peer.promise).toBe(a.promise);
    a.release();
    expect(signals[0].aborted).toBe(false);
    stale.release();
    peer.release();
    b.release();
    expect(signals[0].aborted).toBe(true);
    await outcomes;
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('paces 36 Catalog fetch starts per rolling minute and eventually loads the next visible image', async () => {
    const fetchMock = vi.fn(async () => image());
    vi.stubGlobal('fetch', fetchMock);
    const { queueCatalogMedia } = await import('@/shared/utils/catalogMediaQueue');
    const jobs = Array.from({ length: 37 }, (_, index) => queueCatalogMedia('/img/' + index));
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(36);
    await vi.advanceTimersByTimeAsync(59_999);
    expect(fetchMock).toHaveBeenCalledTimes(36);
    await vi.advanceTimersByTimeAsync(1);
    const blob = await jobs[36].promise;
    expect(blob.type).toBe('image/png');
    expect(await blob.text()).toBe('fixture');
    expect(fetchMock).toHaveBeenCalledTimes(37);
    jobs.forEach(job => job.release());
  });

  it.each(['seconds', 'http-date'])('shares a %s cooldown with manual recovery without retrying the rejected image', async format => {
    const header = format === 'seconds' ? '5' : new Date(Date.now() + 5000).toUTCString();
    const fetchMock = vi.fn(async () => image()).mockImplementationOnce(async () => new Response(null, {
      status: 429, headers: { 'Retry-After': header },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { queueCatalogMedia } = await import('@/shared/utils/catalogMediaQueue');
    const { retryPublicMedia } = await import('@/shared/utils/publicMediaRetry');
    const rejected = queueCatalogMedia('/limited');
    await expect(rejected.promise).rejects.toMatchObject({ retryAt: Date.now() + 5000 });
    const queued = queueCatalogMedia('/visible');
    await expect(retryPublicMedia('/limited', new AbortController().signal)).rejects.toMatchObject({ retryAt: Date.now() + 5000 });
    await vi.advanceTimersByTimeAsync(4999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    const blob = await queued.promise;
    expect(blob.type).toBe('image/png');
    expect(await blob.text()).toBe('fixture');
    expect(fetchMock.mock.calls).toHaveLength(2);
    expect(fetchMock).toHaveBeenLastCalledWith('/visible', expect.anything());
    rejected.release();
    queued.release();
  });
});
