import type { AttractionDetail } from "@/shared/types/attraction";
import { STORAGE_KEYS } from "./constants";

export function validPlaceCoordinates(
  point: { lat: number; lng: number } | null | undefined
): boolean {
  return (
    !!point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180 &&
    !(point.lat === 0 && point.lng === 0)
  );
}

export function placeNavigationUrl(
  place: Pick<
    AttractionDetail,
    "navigation" | "nameLocal" | "name" | "province"
  >
): string {
  const access = place.navigation;
  return access && validPlaceCoordinates(access)
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
