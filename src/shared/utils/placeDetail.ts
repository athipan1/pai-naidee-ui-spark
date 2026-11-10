import type { AttractionDetail } from "@/shared/types/attraction";
import { STORAGE_KEYS } from "./constants";

/** Public PaiNaiDee places are in Thailand; never coerce blank/null to zero. */
export function parsePlaceCoordinates(
  point: unknown
): { lat: number; lng: number } | null {
  if (!point || typeof point !== "object") return null;
  const { lat, lng } = point as { lat?: unknown; lng?: unknown };
  const number = (value: unknown) =>
    typeof value === "number" ||
    (typeof value === "string" && value.trim() !== "")
      ? Number(value)
      : NaN;
  const latitude = number(lat),
    longitude = number(lng);
  return Number.isFinite(latitude) &&
    latitude >= 5 &&
    latitude <= 21 &&
    Number.isFinite(longitude) &&
    longitude >= 97 &&
    longitude <= 106
    ? { lat: latitude, lng: longitude }
    : null;
}

export function validPlaceCoordinates(point: unknown): boolean {
  return parsePlaceCoordinates(point) !== null;
}

export function placeNavigationUrl(
  place: Pick<
    AttractionDetail,
    "navigation" | "nameLocal" | "name" | "province"
  >
): string {
  const access = parsePlaceCoordinates(place.navigation);
  return access
    ? `https://www.google.com/maps/dir/?api=1&destination=${access.lat},${access.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.nameLocal || place.name} ${place.province}`)}`;
}

export function readSavedPlaceIds(): string[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.FAVORITES) || "[]"
    );
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is string => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}
