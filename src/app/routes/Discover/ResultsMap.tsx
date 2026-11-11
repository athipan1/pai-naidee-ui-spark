import { MapBounds, markerIcon, THAILAND_CENTER, hasValidCoordinates } from "@/components/maps/leafletShared";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import OptimizedImage from "@/components/common/OptimizedImage";
import type { SearchResult } from "@/shared/types/search";
import { localizedProvince } from "@/shared/i18n/placeLocalization";


export { hasValidCoordinates, THAILAND_CENTER } from "@/components/maps/leafletShared";

export default function ResultsMap({
  places: rawPlaces,
  currentLanguage,
  target,
  zoom,
}: {
  places: SearchResult[];
  currentLanguage: "th" | "en";
  target?: [number, number];
  zoom?: number;
}) {
  const places = useMemo(
    () => rawPlaces.filter(hasValidCoordinates),
    [rawPlaces]
  );
  const th = currentLanguage === "th";
  // Results maps can unmount during a zoom. Leaflet 1.x transition callbacks
  // otherwise outlive their pane and throw when the pending zoom completes.
  return (
    <div
      className="relative z-0 h-[min(65svh,600px)] min-h-72 overflow-hidden rounded-2xl border border-border"
      aria-label={th ? "แผนที่สถานที่ท่องเที่ยว" : "Attractions map"}
      data-marker-count={places.length}
    >
      <MapContainer
        center={THAILAND_CENTER}
        zoom={6}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapBounds places={places} target={target} zoom={zoom} />
        {places.map((place) => {
          const coords = place.coordinates ?? place.location!;
          const name = th ? place.nameLocal || place.name : place.name;
          return (
            <Marker
              key={`${place.id}:${currentLanguage}`}
              position={[coords.lat, coords.lng]}
              icon={markerIcon}
              title={name}
              alt={name}
            >
              <Popup>
                <div className="w-44 max-w-full space-y-2">
                  <OptimizedImage
                    src={place.image}
                    alt={name}
                    width={176}
                    height={132}
                    className="aspect-[4/3] w-full object-cover"
                    unavailableLabel={
                      th ? "รูปภาพไม่พร้อมใช้งาน" : "Image unavailable"
                    }
                  />
                  {place.mediaCredits
                    ?.filter((credit) => credit.url === place.image)
                    .map((credit) => (
                      <p key={credit.url} className="text-xs">
                        © {credit.photographer} · {credit.licenseName}
                        {credit.sourcePage &&
                          /^https?:\/\//i.test(credit.sourcePage) && (
                            <a
                              href={credit.sourcePage}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {" "}
                              {th ? "เครดิตภาพ" : "Photo credit"}
                            </a>
                          )}
                      </p>
                    ))}
                  <strong>{name}</strong>
                  <div>{localizedProvince(place, currentLanguage)}</div>
                  {typeof place.distanceKm === "number" && (
                    <div>{place.distanceKm.toFixed(1)} km</div>
                  )}
                  <Link
                    className="inline-flex min-h-11 items-center"
                    to={`/attraction/${encodeURIComponent(place.id)}`}
                  >
                    {th ? "ดูรายละเอียด" : "View details"}
                  </Link>
                  <a
                    className="block py-2"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {th ? "นำทาง" : "Directions"}
                  </a>
                  {place.source?.url &&
                    /^https?:\/\//i.test(place.source.url) && (
                      <a
                        className="block py-2"
                        href={place.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {th ? "แหล่งข้อมูล" : "Source"}
                      </a>
                    )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
