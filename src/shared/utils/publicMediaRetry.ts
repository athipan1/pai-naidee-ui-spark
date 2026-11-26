import { RateLimitError, retryAfterTime } from './retryAfter';

let retryAt = 0;
let active = false;

// Native <img> failures conceal status and headers. Only probe the failed
// representation when the user asks, with one recovery request per tab at a time.
export async function retryPublicMedia(url: string, signal: AbortSignal): Promise<Blob> {
  if (Date.now() < retryAt) throw new RateLimitError(retryAt);
  if (active) throw new Error('Another image retry is in progress');
  active = true;
  try {
    const response = await fetch(url, { signal, credentials: 'omit', redirect: 'error' });
    if (response.status === 429) {
      retryAt = retryAfterTime(response.headers.get('Retry-After'));
      throw new RateLimitError(retryAt);
    }
    if (!response.ok || !/^image\/(?:jpeg|png|webp)(?:;|$)/i.test(response.headers.get('Content-Type') ?? '')) {
      throw new Error('Image unavailable');
    }
    return await response.blob();
  } finally {
    active = false;
  }
}
