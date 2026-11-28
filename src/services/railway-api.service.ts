import type { AttractionDetail } from "@/shared/types/attraction";
import type { SearchResult } from "@/shared/types/search";
import { withPublishedPlaceImages } from '@/shared/utils/publishedPlaceImages';
import { RateLimitError, retryAfterTime } from '@/shared/utils/retryAfter';

const DEFAULT_API_BASE_URL = "https://painaidee-api-production.up.railway.app";
const REQUEST_TIMEOUT_MS = 8_000;
let retryAt = 0;

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  // Accept either a service origin or a legacy base ending in /api.
  // Endpoint builders already prefix every path with /api.
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "").replace(/\/api$/i, "");
}

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  signal?.throwIfAborted();
  if (Date.now() < retryAt) throw new RateLimitError(retryAt);
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      cache: 'no-store',
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        retryAt = Math.max(retryAt, retryAfterTime(response.headers.get('Retry-After')));
        throw new RateLimitError(retryAt);
      }
      if (response.status === 404) {
        throw new Error("Attraction not found");
      }
      throw new Error(`PaiNaiDee API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("PaiNaiDee API request timed out");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

export interface RailwayAttractionsResponse {
  attractions: SearchResult[];
  sort?: 'latest' | 'rotation';
  total: number;
  page: number;
  limit: number;
}

export interface RailwayNearbyResponse {
  attractions: SearchResult[];
  center: { lat: number; lng: number };
  radiusKm: number;
  limit?: number;
  hasMore?: boolean;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  categories?: string[];
}

export interface PlaceFacets {
  provinces: string[];
  categories: string[];
}

export function getRailwayPlaceFacets(signal?: AbortSignal): Promise<PlaceFacets> {
  return requestJson<PlaceFacets>('/api/places/facets', signal);
}

export async function getRailwayPlaceSuggestions(query: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 2) return [];
  const params = new URLSearchParams({ q: query.trim().slice(0, 120), limit: '6' });
  const result = await requestJson<{ suggestions: PlaceSuggestion[] }>(`/api/places/suggest?${params}`, signal);
  return result.suggestions;
}

export async function getRailwayNearbyAttractions(options: {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
  excludeId?: string;
  signal?: AbortSignal;
}): Promise<RailwayNearbyResponse> {
  const params = new URLSearchParams({
    lat: String(options.lat),
    lng: String(options.lng),
    radiusKm: String(options.radiusKm ?? 25),
    limit: String(options.limit ?? 30),
  });
  if (options.excludeId) params.set("excludeId", options.excludeId);
  const response = await requestJson<RailwayNearbyResponse>(`/api/places/nearby?${params}`, options.signal);
  return { ...response, attractions: response.attractions.map(withPublishedPlaceImages) };
}

export async function getRailwayAttractionDetail(
  id: string,
  signal?: AbortSignal,
): Promise<AttractionDetail> {
  const place = await requestJson<AttractionDetail>(`/api/places/${encodeURIComponent(id)}`, signal);
  return withPublishedPlaceImages(place);
}

export async function getRailwayAttractions(options?: {
  page?: number;
  limit?: number;
  category?: string;
  province?: string;
  search?: string;
  sort?: 'latest' | 'rotation';
  signal?: AbortSignal;
}): Promise<RailwayAttractionsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(options?.page || 1));
  params.set("limit", String(options?.limit || 10));

  if (options?.category) params.set("category", options.category);
  if (options?.province) params.set("province", options.province);
  if (options?.search) params.set("search", options.search);
  if (options?.sort) params.set("sort", options.sort);

  const response = await requestJson<RailwayAttractionsResponse>(
    `/api/places?${params.toString()}`, options?.signal,
  );
  // Do not label an old backend's catalogue order as newest during staggered deployments.
  if (options?.sort && response.sort !== options.sort) throw new Error('Discovery ordering is unavailable');
  return { ...response, attractions: response.attractions.map(withPublishedPlaceImages) };
}

export interface DiscoveryEntry {
  id: string;
  province: string;
  category: string;
  categories: string[];
  publishedAt: string;
}

export async function getDiscoveryIndex(signal?: AbortSignal): Promise<DiscoveryEntry[]> {
  const entries = new Map<string, DiscoveryEntry>();
  let cursor: string | null = "";
  // Bounded metadata requests; never silently pretend an incomplete index is complete.
  for (let page = 0; page < 40; page++) {
    const params = new URLSearchParams(cursor ? { after: cursor } : {});
    const result: { entries: DiscoveryEntry[]; nextCursor: string | null } =
      await requestJson(`/api/places/discovery-index?${params}`, signal);
    if (!Array.isArray(result.entries) || !(result.nextCursor === null || typeof result.nextCursor === "string"))
      throw new Error("Discovery index unavailable");
    for (const entry of result.entries) {
      if (typeof entry.id === "string" && typeof entry.category === "string" &&
          typeof entry.province === "string" && Array.isArray(entry.categories))
        entries.set(entry.id, entry);
    }
    if (result.nextCursor === null) return [...entries.values()];
    if (result.nextCursor === cursor) throw new Error("Discovery cursor did not advance");
    cursor = result.nextCursor;
  }
  throw new Error("Discovery index exceeds the supported size");
}

export async function getDiscoveryBatch(ids: string[], signal?: AbortSignal): Promise<SearchResult[]> {
  const params = new URLSearchParams();
  for (const id of ids) params.append("id", id);
  const result = await requestJson<{ attractions: SearchResult[] }>(`/api/places/discovery-batch?${params}`, signal);
  const byId = new Map(result.attractions.map(place => [place.id, withPublishedPlaceImages(place)]));
  return [...new Set(ids)].flatMap(id => {
    const place = byId.get(id);
    return place ? [place] : [];
  });
}

export { getApiBaseUrl };
