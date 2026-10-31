import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type Coordinate = { lat: number; lng: number };
type Props = { value: Coordinate | null; onChange: (value: Coordinate) => void };
const icon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow,
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41] });

export function validThaiCoordinate(value: Coordinate) {
  return Number.isFinite(value.lat) && Number.isFinite(value.lng) &&
    value.lat >= 5 && value.lat <= 21 && value.lng >= 97 && value.lng <= 106;
}

function ClickToSelect({ onChange }: Pick<Props, 'onChange'>) {
  useMapEvents({ click(event) {
    const value = { lat: event.latlng.lat, lng: event.latlng.lng };
    if (validThaiCoordinate(value)) onChange(value);
  } });
  return null;
}

function Recenter({ value }: { value: Coordinate | null }) {
  const map = useMap();
  useEffect(() => { if (value && validThaiCoordinate(value)) map.setView([value.lat, value.lng], Math.max(map.getZoom(), 14)); }, [map, value?.lat, value?.lng]);
  return null;
}

export default function AdminCoordinatePicker({ value, onChange }: Props) {
  const center = useMemo<[number, number]>(() => value && validThaiCoordinate(value)
    ? [value.lat, value.lng] : [13.7367, 100.5231], []);
  return <div className="overflow-hidden rounded-xl border border-slate-200">
    <MapContainer center={center} zoom={value ? 14 : 6} scrollWheelZoom={false} className="h-64 w-full sm:h-80">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter value={value} />
      <ClickToSelect onChange={onChange} />
      {value && validThaiCoordinate(value) && <Marker position={[value.lat, value.lng]} icon={icon} draggable eventHandlers={{ dragend(event) {
        const position = event.target.getLatLng();
        const next = { lat: position.lat, lng: position.lng };
        if (validThaiCoordinate(next)) onChange(next);
      } }} />}
    </MapContainer>
    <p className="bg-white px-3 py-2 text-xs text-slate-600">แตะแผนที่หรือเลื่อนหมุดเพื่อปรับพิกัด · แสดงแผนที่จาก OpenStreetMap</p>
  </div>;
}
