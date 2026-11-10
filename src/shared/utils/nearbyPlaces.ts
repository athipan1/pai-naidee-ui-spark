import type { AttractionDetail } from "@/shared/types/attraction";
import type { SearchResult } from "@/shared/types/search";
import { parsePlaceCoordinates } from "./placeDetail";

export const NEARBY_RADII = [3, 5, 10, 20] as const;
export type NearbyMapPlace = Pick<
  SearchResult,
  | "id"
  | "name"
  | "nameLocal"
  | "province"
  | "provinceEn"
  | "category"
  | "image"
  | "mediaCredits"
  | "distanceKm"
  | "description"
> & {
  coordinates: { lat: number; lng: number };
  navigation?: AttractionDetail["navigation"];
};

/** Defensive validation of public responses; canonical ID, never name-based deduplication. */
export function nearbyMapPlaces(
  places: SearchResult[],
  currentId: string,
  radius: number
): NearbyMapPlace[] {
  const seen = new Set([currentId]);
  return places
    .flatMap((place) => {
      const coordinates = parsePlaceCoordinates(
        place.coordinates ?? place.location
      );
      if (
        !coordinates ||
        seen.has(place.id) ||
        !Number.isFinite(place.distanceKm) ||
        place.distanceKm! < 0 ||
        place.distanceKm! > radius
      )
        return [];
      seen.add(place.id);
      return [{ ...place, coordinates }];
    })
    .sort((a, b) => a.distanceKm! - b.distanceKm! || a.id.localeCompare(b.id))
    .slice(0, 30);
}
