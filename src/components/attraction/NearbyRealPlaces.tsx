import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import {
  localizedCategory,
  localizedProvince,
} from "@/shared/i18n/placeLocalization";
import { validPlaceCoordinates } from "@/shared/utils/placeDetail";
import { useNearbyAttractions } from "@/shared/hooks/useAttractionQueries";
import type { SearchResult } from "@/shared/types/search";

interface NearbyRealPlacesProps {
  placeId: string;
  category: string;
  coordinates?: { lat: number; lng: number } | null;
  currentLanguage: "th" | "en";
}

export default function NearbyRealPlaces({
  placeId,
  category,
  coordinates,
  currentLanguage,
}: NearbyRealPlacesProps) {
  const validCoordinates = validPlaceCoordinates(coordinates)
    ? coordinates!
    : null;
  // The centre is the public place's coordinates, never the visitor's device location.
  const nearby = useNearbyAttractions(validCoordinates, 100);
  const places = (nearby.data?.attractions || [])
    .filter((place: SearchResult) => place.id !== placeId)
    .sort(
      (a, b) =>
        Number(b.category === category) - Number(a.category === category) ||
        (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    )
    .slice(0, 4);

  if (!validCoordinates) return null;

  return (
    <section
      className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-6"
      data-testid="real-nearby-places"
    >
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        {currentLanguage === "th"
          ? "สถานที่ท่องเที่ยวใกล้เคียง"
          : "Nearby destinations"}
      </h2>
      {nearby.isLoading ? (
        <p role="status" className="text-muted-foreground">
          {currentLanguage === "th"
            ? "กำลังค้นหาสถานที่ใกล้เคียง..."
            : "Finding nearby places..."}
        </p>
      ) : nearby.isError ? (
        <p className="text-sm text-muted-foreground">
          {currentLanguage === "th"
            ? "ยังโหลดสถานที่ใกล้เคียงไม่ได้"
            : "Nearby places are unavailable."}
        </p>
      ) : places.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {currentLanguage === "th"
            ? "ยังไม่มีสถานที่ใกล้เคียงในฐานข้อมูล"
            : "No nearby destinations in the catalogue yet."}
        </p>
      ) : (
        <ul className="flex gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {places.map((place) => (
            <li key={place.id} className="w-[78%] shrink-0 sm:w-auto min-w-0">
              <Link
                to={`/attraction/${encodeURIComponent(place.id)}`}
                className="block h-full overflow-hidden rounded-2xl border border-border/70 hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <OptimizedImage
                  unavailableLabel={
                    currentLanguage === "th"
                      ? "รูปภาพไม่พร้อมใช้งาน · รอ Admin ตรวจสอบ"
                      : "Image unavailable · Pending admin review"
                  }
                  src={place.image}
                  alt={
                    currentLanguage === "th"
                      ? place.nameLocal || place.name
                      : place.name
                  }
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                  width="400"
                  height="300"
                  sizes="(min-width: 1024px) 280px, 75vw"
                />
                <div className="p-4">
                  <div className="min-w-0">
                    <p className="font-medium break-words">
                      {currentLanguage === "th"
                        ? place.nameLocal || place.name
                        : place.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {localizedProvince(place, currentLanguage)} ·{" "}
                      {localizedCategory(place.category, currentLanguage)}
                    </p>
                  </div>
                  {Number.isFinite(place.distanceKm) && (
                    <span className="text-xs shrink-0 text-muted-foreground">
                      {place.distanceKm!.toFixed(1)} km
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {currentLanguage === "th"
          ? "แนะนำจากสถานที่ที่มีข้อมูลจริงภายในรัศมี 100 กม. ระยะทางเป็นเส้นตรง"
          : "From real catalogue places within 100 km. Straight-line distances."}
      </p>
    </section>
  );
}
