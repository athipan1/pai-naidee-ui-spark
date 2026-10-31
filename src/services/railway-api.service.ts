import type { AttractionDetail } from "@/shared/types/attraction";
import type { SearchResult } from "@/shared/types/search";
import { correctKnownIncorrectPhoto } from '@/shared/data/photoCorrections';
import { addVerifiedPhotoIfMissing, addUserProvidedGalleryIfMissing } from '@/shared/data/verifiedPlacePhotoFallbacks';

function withMissingPlacePhotos<T extends { id: string; image?: string | null; images?: string[]; mediaCredits?: import('@/shared/types/attraction').AttractionPhotoCredit[] }>(place: T): T {
  return addUserProvidedGalleryIfMissing(addVerifiedPhotoIfMissing(correctKnownIncorrectPhoto(place)));
}

const DEFAULT_API_BASE_URL = "https://painaidee-api-production.up.railway.app";
const REQUEST_TIMEOUT_MS = 8_000;

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  // Accept either a service origin or a legacy base ending in /api.
  // Endpoint builders already prefix every path with /api.
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, "").replace(/\/api$/i, "");
}

async function requestJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Attraction not found");
      }
      throw new Error(`PaiNaiDee API request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("PaiNaiDee API request timed out");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export interface RailwayAttractionsResponse {
  attractions: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

export interface RailwayNearbyResponse {
  attractions: SearchResult[];
  center: { lat: number; lng: number };
  radiusKm: number;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
}

export async function getRailwayPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (query.trim().length < 2) return [];
  const params = new URLSearchParams({ q: query.trim().slice(0, 120), limit: '6' });
  const result = await requestJson<{ suggestions: PlaceSuggestion[] }>(`/api/places/suggest?${params}`);
  return result.suggestions;
}

export async function getRailwayNearbyAttractions(options: {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
}): Promise<RailwayNearbyResponse> {
  const params = new URLSearchParams({
    lat: String(options.lat),
    lng: String(options.lng),
    radiusKm: String(options.radiusKm ?? 25),
    limit: String(options.limit ?? 30),
  });
  const response = await requestJson<RailwayNearbyResponse>(`/api/places/nearby?${params}`);
  return { ...response, attractions: response.attractions.map(withMissingPlacePhotos) };
}

export async function getRailwayAttractionDetail(
  id: string,
): Promise<AttractionDetail> {
  const place = await requestJson<AttractionDetail>(`/api/places/${encodeURIComponent(id)}`);
  return withMissingPlacePhotos(place);
}

export async function getRailwayAttractions(options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<RailwayAttractionsResponse> {
  const params = new URLSearchParams();
  params.set("page", String(options?.page || 1));
  params.set("limit", String(options?.limit || 10));

  if (options?.category) params.set("category", options.category);
  if (options?.search) params.set("search", options.search);

  const response = await requestJson<RailwayAttractionsResponse>(
    `/api/places?${params.toString()}`,
  );
  return { ...response, attractions: response.attractions.map(withMissingPlacePhotos) };
}

export { getApiBaseUrl };
