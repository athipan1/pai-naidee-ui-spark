import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { MapBounds, markerIcon } from "./leafletShared";
import { NearbyPlaceSummary } from "@/components/attraction/NearbyPlaceSummary";
import type { NearbyMapPlace } from "@/shared/utils/nearbyPlaces";

// Static markup only. Place names stay in React text nodes, never HTML strings.
const currentIcon = L.divIcon({
  className: "nearby-current-marker",
  html: '<span style="display:block;width:30px;height:30px;border-radius:50%;background:#0f766e;border:4px solid white;box-shadow:0 0 0 2px #0f766e"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
});
function Interaction({
  active,
  places,
}: {
  active: boolean;
  places: NearbyMapPlace[];
}) {
  const map = useMap();
  useEffect(() => {
    for (const handler of [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.boxZoom,
      map.keyboard,
    ]) {
      if (active) handler.enable();
      else handler.disable();
    }
    map.scrollWheelZoom.disable();
    if (!active) map.closePopup();
    const closePopup = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        map.closePopup();
        event.stopPropagation();
      }
    };
    // Keep keyboard/touch targets behind the popup out of the interaction order.
    // Leaflet emits map.popupclose before the marker restores focus.
    const markerPane = map.getPane("markerPane");
    const lockMarkers = () => {
      if (markerPane) markerPane.inert = true;
    };
    const unlockMarkers = () => {
      if (markerPane) markerPane.inert = false;
    };
    const restoreBounds = () => {
      unlockMarkers();
      // Popup auto-pan can move the primary pin outside a small map (WebKit).
      // Stop the pending pan before returning both the pins and keyboard focus.
      if (!map.getPane("mapPane")?.isConnected) return;
      map.stop();
      map.fitBounds(
        L.latLngBounds(
          places.map(
            (place) =>
              [place.coordinates.lat, place.coordinates.lng] as [number, number]
          )
        ),
        { padding: [45, 45], maxZoom: 13, animate: false }
      );
    };
    map.on("popupopen", lockMarkers);
    map.on("popupclose", restoreBounds);
    const container = map.getContainer();
    container.addEventListener("keydown", closePopup);
    return () => {
      container.removeEventListener("keydown", closePopup);
      map.off("popupopen", lockMarkers);
      map.off("popupclose", restoreBounds);
      unlockMarkers();
    };
  }, [map, active, places]);
  return null;
}
export default function NearbyAttractionsMap({
  current,
  nearby,
  active,
  currentLanguage,
}: {
  current: NearbyMapPlace;
  nearby: NearbyMapPlace[];
  active: boolean;
  currentLanguage: "th" | "en";
}) {
  const places = useMemo(() => [current, ...nearby], [current, nearby]);
  return (
    <div
      className="[&_.leaflet-popup-content-wrapper]:bg-card [&_.leaflet-popup-tip]:bg-card [&_.leaflet-popup-content]:text-foreground [&_.leaflet-bar_a]:!h-[44px] [&_.leaflet-bar_a]:!w-[44px] [&_.leaflet-bar_a]:!leading-[44px] relative z-0 h-[300px] overflow-hidden rounded-2xl border border-border sm:h-[360px]"
      role="region"
      aria-label={
        currentLanguage === "th"
          ? "แผนที่สถานที่และจุดใกล้เคียง"
          : "This place and nearby map"
      }
      data-testid="embedded-nearby-map"
      data-marker-count={places.length}
      {...(!active ? { inert: "" } : {})}
    >
      <MapContainer
        center={[current.coordinates.lat, current.coordinates.lng]}
        zoom={13}
        zoomAnimation={false}
        fadeAnimation={false}
        markerZoomAnimation={false}
        dragging={active}
        touchZoom={active}
        keyboard={active}
        doubleClickZoom={active}
        scrollWheelZoom={false}
        className="h-full w-full"
        minZoom={7}
        maxZoom={18}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapBounds places={places} />
        <Interaction active={active} places={places} />
        {places.map((place) => {
          const isCurrent = place.id === current.id;
          const name =
            currentLanguage === "th"
              ? place.nameLocal || place.name
              : place.name;
          const label = isCurrent
            ? `${currentLanguage === "th" ? "สถานที่นี้" : "This place"}: ${name}`
            : name;
          return (
            <Marker
              key={`${place.id}:${currentLanguage}`}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={isCurrent ? currentIcon : markerIcon}
              title={label}
              alt={label}
              eventHandlers={{
                popupopen: (event) =>
                  event.popup
                    .getElement()
                    ?.querySelector<HTMLAnchorElement>(
                      ".leaflet-popup-close-button"
                    )
                    ?.focus({ preventScroll: true }),
                popupclose: (event) =>
                  event.target.getElement()?.focus({ preventScroll: true }),
              }}
            >
              <Popup
                maxWidth={200}
                minWidth={160}
                maxHeight={260}
                autoPanPadding={[10, 30]}
              >
                <NearbyPlaceSummary
                  place={place}
                  currentLanguage={currentLanguage}
                  current={isCurrent}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
