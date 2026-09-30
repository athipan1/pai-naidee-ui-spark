import type { AttractionDetail } from "@/shared/types/attraction";
import type { SearchResult } from "@/shared/types/search";

const DEFAULT_API_BASE_URL = "https://painaidee-api-production.up.railway.app";
const REQUEST_TIMEOUT_MS = 8_000;

function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return (configured || DEFAULT_API_BASE_URL).replace(/\/$/, "");
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

export async function getRailwayAttractionDetail(
  id: string,
): Promise<AttractionDetail> {
  return requestJson<AttractionDetail>(`/api/places/${encodeURIComponent(id)}`);
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

  return requestJson<RailwayAttractionsResponse>(
    `/api/places?${params.toString()}`,
  );
}

export { getApiBaseUrl };
