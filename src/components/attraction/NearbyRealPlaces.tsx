import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNearbyAttractions } from "@/shared/hooks/useAttractionQueries";
import { parsePlaceCoordinates } from "@/shared/utils/placeDetail";
import {
  NEARBY_RADII,
  nearbyMapPlaces,
  type NearbyMapPlace,
} from "@/shared/utils/nearbyPlaces";
import type { AttractionDetail } from "@/shared/types/attraction";
import { NearbyPlaceSummary } from "./NearbyPlaceSummary";

const NearbyAttractionsMap = lazy(
  () => import("@/components/maps/NearbyAttractionsMap")
);
export default function NearbyRealPlaces({
  place,
  currentLanguage,
}: {
  place: AttractionDetail;
  currentLanguage: "th" | "en";
}) {
  const th = currentLanguage === "th";
  const [radius, setRadius] = useState<number>(5);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const section = useRef<HTMLDivElement>(null);
  const coordinates = useMemo(
    () => parsePlaceCoordinates(place.coordinates),
    [place.coordinates]
  );
  const nearby = useNearbyAttractions(coordinates, radius, place.id);
  const places = useMemo(
    () => nearbyMapPlaces(nearby.data?.attractions || [], place.id, radius),
    [nearby.data, place.id, radius]
  );
  const current = useMemo<NearbyMapPlace | null>(
    () =>
      coordinates
        ? {
            ...place,
            coordinates,
            image: place.image || "/placeholder-attraction.svg",
          }
        : null,
    [place, coordinates]
  );
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, [!!current]);
  if (!current)
    return (
      <p className="mt-5 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
        {th
          ? "ยังไม่มีพิกัดที่ใช้แสดงแผนที่ได้"
          : "Map coordinates are unavailable."}
      </p>
    );
  return (
    <div ref={section} className="mt-5 space-y-4 motion-reduce:[&_*]:transition-none">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {th ? "ค้นหารอบสถานที่นี้" : "Search around this place"}
        </legend>
        <div className="flex flex-wrap gap-2">
          {NEARBY_RADII.map((value) => (
            <Button
              key={value}
              type="button"
              variant={radius === value ? "default" : "outline"}
              aria-pressed={radius === value}
              className="min-h-[44px] min-w-[48px] px-3"
              onClick={() => setRadius(value)}
            >
              {value} {th ? "กม." : "km"}
            </Button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {th
            ? "● สีเขียว: สถานที่นี้ · หมุดสีน้ำเงิน: สถานที่ใกล้เคียง"
            : "● Green: this place · Blue pins: nearby places"}
        </p>
        <Button
          type="button"
          variant="outline"
          className="min-h-[44px] whitespace-normal"
          aria-pressed={active}
          onClick={() => setActive((value) => !value)}
        >
          {active
            ? th
              ? "พักแผนที่เพื่อเลื่อนหน้า"
              : "Pause map to scroll page"
            : th
              ? "แตะเพื่อใช้แผนที่"
              : "Activate map"}
        </Button>
      </div>
      {visible ? (
        <Suspense fallback={<MapLoading th={th} />}>
          <NearbyAttractionsMap
            current={current}
            nearby={places}
            active={active}
            currentLanguage={currentLanguage}
          />
        </Suspense>
      ) : (
        <MapLoading th={th} />
      )}
      <p className="text-xs text-muted-foreground">
        {th
          ? "ระยะทางวัดเป็นเส้นตรงจากสถานที่นี้ ไม่ใช่ระยะเดินทาง"
          : "Distances are straight-line from this place, not travel distances."}
      </p>
      <div data-testid="real-nearby-places" aria-busy={nearby.isFetching}>
        <h3 className="text-lg font-semibold">
          {th ? "สถานที่ท่องเที่ยวใกล้เคียง" : "Nearby destinations"}
        </h3>
        {nearby.isLoading ? (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {th ? "กำลังค้นหาสถานที่ใกล้เคียง..." : "Finding nearby places..."}
          </p>
        ) : nearby.isError ? (
          <div role="alert" className="mt-3 rounded-xl bg-muted p-4">
            <p>
              {th
                ? "ยังโหลดสถานที่ใกล้เคียงไม่ได้ ลองอีกครั้งได้"
                : "Nearby places are unavailable. Please try again."}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-2 min-h-[44px]"
              onClick={() => void nearby.refetch()}
            >
              {th ? "ลองอีกครั้ง" : "Retry"}
            </Button>
          </div>
        ) : !places.length ? (
          <p role="status" className="mt-3 text-sm text-muted-foreground">
            {th
              ? "ยังไม่พบสถานที่ท่องเที่ยวใน PaiNaiDee ภายในรัศมีนี้ ลองเลือกรัศมีที่กว้างขึ้น"
              : "No PaiNaiDee destinations within this radius yet. Try a larger radius."}
          </p>
        ) : (
          <>
            <p role="status" className="my-3 text-sm text-muted-foreground">
              {th
                ? `แสดง ${places.length} แห่ง ภายใน ${radius} กม. (สูงสุด 30 แห่ง)`
                : `Showing ${places.length} places within ${radius} km (up to 30)`}
              {nearby.data?.hasMore &&
                (th
                  ? " · ยังมีสถานที่อื่นในรัศมีนี้"
                  : " · More places exist within this radius")}
            </p>
            <ul
              className="grid max-h-[32rem] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2"
              aria-label={th ? "รายการสถานที่ใกล้เคียง" : "Nearby places list"}
            >
              {places.map((item) => (
                <li
                  key={item.id}
                  className="min-w-0 rounded-xl border border-border p-3"
                >
                  <NearbyPlaceSummary
                    place={item}
                    currentLanguage={currentLanguage}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
function MapLoading({ th }: { th: boolean }) {
  return (
    <div
      className="flex h-[300px] items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground sm:h-[360px]"
      role="status"
    >
      {th ? "กำลังโหลดแผนที่..." : "Loading map..."}
    </div>
  );
}
