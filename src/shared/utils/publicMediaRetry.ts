import { RateLimitError, retryAfterTime } from './retryAfter';

let retryAt = 0;
let active = false;

// Native <img> failures conceal status and headers. Only probe the failed
// representation when the user asks, with one recovery request per tab at a time.
export function publicMediaRetryAt(): number {
  return retryAt;
}

export async function fetchPublicMedia(url: string, signal: AbortSignal): Promise<Blob> {
  if (Date.now() < retryAt) throw new RateLimitError(retryAt);
  const response = await fetch(url, { signal, credentials: 'omit', redirect: 'error' });
  if (response.status === 429) {
    retryAt = Math.max(retryAt, retryAfterTime(response.headers.get('Retry-After')));
    throw new RateLimitError(retryAt);
  }
  if (!response.ok || !/^image\/(?:jpeg|png|webp)(?:;|$)/i.test(response.headers.get('Content-Type') ?? '')) {
    throw new Error('Image unavailable');
  }
  return response.blob();
}

export async function retryPublicMedia(url: string, signal: AbortSignal): Promise<Blob> {
  if (active) throw new Error('Another image retry is in progress');
  active = true;
  try {
    return await fetchPublicMedia(url, signal);
  } finally {
    active = false;
  }
}
