import { getApiBaseUrl } from '@/services/railway-api.service';

const cmsPath = /^\/api\/media\/cms\/([a-f0-9-]{36}\.(?:jpg|png|webp))$/;

export function cmsImageFilename(source: string, base = getApiBaseUrl()) {
  try {
    const url = new URL(source);
    if (url.origin !== new URL(base, window.location.origin).origin ||
        url.username || url.password || url.search || url.hash) return null;
    return cmsPath.exec(url.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

export function hasCmsImageVariants(filename: string | null) {
  return filename?.[14] === '8';
}

export function cmsImageSrcSet(source: string, maxWidth: 256 | 640 | 1200) {
  if (!hasCmsImageVariants(cmsImageFilename(source))) return undefined;
  return [256, 640, 1200].filter(width => width <= maxWidth)
    .map(width => `${source}?w=${width} ${width}w`).join(', ');
}
