import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import type { SearchResult } from "@/shared/types/search";
import { parsePlaceCoordinates } from "@/shared/utils/placeDetail";
export const markerIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
export const THAILAND_CENTER: [number, number] = [15.87, 100.99];
export function hasValidCoordinates(place: SearchResult): boolean {
  return parsePlaceCoordinates(place.coordinates ?? place.location) !== null;
}

export function MapBounds({
  places,
  target,
  zoom,
}: {
  places: Pick<SearchResult, "coordinates" | "location">[];
  target?: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  useEffect(() => {
    if (target) map.setView(target, zoom ?? 6, { animate: false });
    else if (places.length)
      map.fitBounds(
        L.latLngBounds(
          places.map((place) => {
            const coords = place.coordinates ?? place.location!;
            return [coords.lat, coords.lng] as [number, number];
          })
        ),
        { padding: [35, 35], maxZoom: 13, animate: false }
      );
    else map.setView(THAILAND_CENTER, 6);
  }, [map, places, target?.[0], target?.[1], zoom]);
  return null;
}
