// Helpers for serving place media out of the private `place-media` bucket.
//
// The bucket is private, so stored URLs are never used directly — a short-lived
// signed URL is generated for every read instead.
import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'place-media';
const URL_VALIDITY_SECONDS = 60 * 60 * 24; // 1 day

interface MediaRow {
  url?: string | null;
  storage_path?: string | null;
}

interface PlaceRow {
  media?: MediaRow[] | null;
  image_url?: string | null;
}

/**
 * Returns the object path for a media value, or null when the value is already
 * a full external URL (or empty).
 */
function toObjectPath(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) {
    // Accept legacy rows that stored a public bucket URL.
    const marker = `/${BUCKET}/`;
    const index = value.indexOf(marker);
    if (index === -1) return null;
    const path = value.slice(index + marker.length).split('?')[0];
    return path || null;
  }
  return value;
}

/**
 * Signs a batch of object paths in one request and returns path -> signed URL.
 */
async function signPaths(supabase: SupabaseClient, paths: string[]): Promise<Map<string, string>> {
  const signed = new Map<string, string>();
  if (paths.length === 0) return signed;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, URL_VALIDITY_SECONDS);

  if (error || !data) {
    console.error('Failed to sign media URLs:', error?.message ?? 'unknown error');
    return signed;
  }

  data.forEach((entry, index) => {
    const path = paths[index];
    if (entry?.signedUrl) signed.set(path, entry.signedUrl);
  });

  return signed;
}

/**
 * Replaces stored media paths with fresh signed URLs on a list of places.
 * Rows whose media cannot be signed keep their original value.
 */
export async function withSignedMediaUrls<T extends PlaceRow>(
  supabase: SupabaseClient,
  rows: T[]
): Promise<T[]> {
  if (!rows || rows.length === 0) return rows;

  const paths = new Set<string>();
  rows.forEach((row) => {
    (row.media ?? []).forEach((item) => {
      const path = toObjectPath(item?.storage_path ?? item?.url);
      if (path) paths.add(path);
    });
    const cover = toObjectPath(row.image_url);
    if (cover) paths.add(cover);
  });

  const signed = await signPaths(supabase, Array.from(paths));
  if (signed.size === 0) return rows;

  return rows.map((row) => {
    const media = (row.media ?? []).map((item) => {
      const path = toObjectPath(item?.storage_path ?? item?.url);
      const signedUrl = path ? signed.get(path) : undefined;
      return signedUrl ? { ...item, url: signedUrl } : item;
    });

    const coverPath = toObjectPath(row.image_url);
    const coverUrl = coverPath ? signed.get(coverPath) : undefined;

    return {
      ...row,
      media,
      ...(coverUrl ? { image_url: coverUrl } : {}),
    } as T;
  });
}

/**
 * Signs a single object path (used right after an upload so the freshly
 * created record can be rendered immediately).
 */
export async function signMediaPath(
  supabase: SupabaseClient,
  path: string
): Promise<string | null> {
  const signed = await signPaths(supabase, [path]);
  return signed.get(path) ?? null;
}

export { BUCKET as PLACE_MEDIA_BUCKET };
export { toObjectPath as resolveObjectPath };
