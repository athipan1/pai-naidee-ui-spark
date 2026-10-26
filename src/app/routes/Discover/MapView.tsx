import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Loader2, LocateFixed, MapPin, RefreshCw } from 'lucide-react';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { Button } from '@/components/ui/button';
import { useAllAttractions, useNearbyAttractions } from '@/shared/hooks/useAttractionQueries';
import type { SearchResult } from '@/shared/types/search';
import { localizedProvince } from '@/shared/i18n/placeLocalization';

const markerIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const THAILAND_CENTER: [number, number] = [15.87, 100.99];
const RADII_KM = [5, 10, 25, 50, 100] as const;

function hasValidCoordinates(place: SearchResult): boolean {
  const coordinates = place.coordinates ?? place.location;
  return !!coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng) &&
    coordinates.lat >= 5 && coordinates.lat <= 21 &&
    coordinates.lng >= 97 && coordinates.lng <= 106;
}

function RecenterMap({ target, zoom }: { target: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => { map.setView(target, zoom); }, [map, target[0], target[1], zoom]);
  return null;
}

interface MapViewProps {
  currentLanguage: 'th' | 'en';
  selectedAttractionId?: string;
}

const MapView = ({ currentLanguage, selectedAttractionId }: MapViewProps) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(25);
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const catalogue = useAllAttractions();
  const nearby = useNearbyAttractions(showNearby ? location : null, radiusKm);
  const rawPlaces = showNearby ? nearby.data?.attractions : catalogue.data?.attractions;
  const places = useMemo(() => (rawPlaces ?? []).filter(hasValidCoordinates), [rawPlaces]);
  const selectedPlace = places.find(place => place.id === selectedAttractionId);
  const selectedCoordinates = selectedPlace?.coordinates ?? selectedPlace?.location;
  const target: [number, number] = showNearby && location
    ? [location.lat, location.lng]
    : selectedCoordinates
      ? [selectedCoordinates.lat, selectedCoordinates.lng]
      : THAILAND_CENTER;
  const zoom = showNearby && location ? (radiusKm <= 10 ? 12 : radiusKm <= 25 ? 10 : 9) : selectedCoordinates ? 13 : 6;
  const loading = showNearby ? nearby.isLoading : catalogue.isLoading;
  const requestError = showNearby ? nearby.error : catalogue.error;
  const th = currentLanguage === 'th';

  const findNearMe = () => {
    if (!navigator.geolocation) {
      setLocationError(th ? 'อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง' : 'Geolocation is unavailable.');
      return;
    }
    setLocationError('');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        // Approximate to ~100 m before sending a URL query, limiting location precision.
        setLocation({
          lat: Math.round(coords.latitude * 1000) / 1000,
          lng: Math.round(coords.longitude * 1000) / 1000,
        });
        setShowNearby(true);
        setLocating(false);
      },
      (error) => {
        setLocationError(error.code === 1
          ? (th ? 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาเปิดสิทธิ์ในเบราว์เซอร์' : 'Location permission was denied.')
          : (th ? 'ไม่สามารถรับตำแหน่งได้ กรุณาลองอีกครั้ง' : 'Unable to determine your location.'));
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  return (
    <section className="container mx-auto space-y-4 px-4 py-5" data-testid="real-attractions-map">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{th ? 'แผนที่สถานที่ท่องเที่ยวจริง' : 'Map of real places'}</h2>
          <p className="text-sm text-muted-foreground">
            {th ? 'หมุดมาจากฐานข้อมูลสถานที่ท่องเที่ยว ไม่สร้างพิกัดจำลอง' : 'Markers come from the places database; no simulated locations.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="nearby-radius" className="text-sm">{th ? 'รัศมี' : 'Radius'}</label>
          <select
            id="nearby-radius"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
          >
            {RADII_KM.map(radius => <option key={radius} value={radius}>{radius} km</option>)}
          </select>
          <Button onClick={findNearMe} disabled={locating}>
            {locating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
            {th ? 'ค้นหาใกล้ฉัน' : 'Find near me'}
          </Button>
          {showNearby && <Button variant="outline" onClick={() => setShowNearby(false)}>{th ? 'ดูทั้งหมด' : 'Show all'}</Button>}
        </div>
      </div>

      {locationError && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{locationError}</p>}
      {requestError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
          {th ? 'โหลดข้อมูลสถานที่จากเซิร์ฟเวอร์ไม่สำเร็จ' : 'Could not load places from the server.'}
          <Button size="sm" variant="outline" onClick={() => { void (showNearby ? nearby.refetch() : catalogue.refetch()); }}>
            <RefreshCw className="mr-1 h-4 w-4" /> {th ? 'ลองอีกครั้ง' : 'Retry'}
          </Button>
        </div>
      )}

      <div className="h-[440px] overflow-hidden rounded-xl border" aria-label={th ? 'แผนที่สถานที่ท่องเที่ยว' : 'Attractions map'}>
        <MapContainer center={THAILAND_CENTER} zoom={6} scrollWheelZoom className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <RecenterMap target={target} zoom={zoom} />
          {places.map(place => {
            const coords = place.coordinates ?? place.location!;
            const displayName = th ? (place.nameLocal || place.name) : place.name;
            return (
              <Marker key={place.id} position={[coords.lat, coords.lng]} icon={markerIcon}>
                <Popup>
                  <div className="space-y-1">
                    <strong>{displayName}</strong>
                    <div>{localizedProvince(place, currentLanguage)}</div>
                    {typeof place.distanceKm === 'number' && <div>{place.distanceKm.toFixed(1)} km</div>}
                    <div><Link to={`/attraction/${encodeURIComponent(place.id)}`}>{th ? 'ดูรายละเอียด' : 'View details'}</Link></div>
                    <div><a href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`} target="_blank" rel="noopener noreferrer">{th ? 'นำทาง' : 'Directions'}</a></div>
                    {place.source?.url && <div><a href={place.source.url} target="_blank" rel="noopener noreferrer">{th ? 'แหล่งข้อมูล' : 'Source'}</a></div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {loading ? <p role="status">{th ? 'กำลังโหลดสถานที่จริง...' : 'Loading places...'}</p> : !requestError && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {showNearby
              ? (th ? `พบ ${places.length} สถานที่ในฐานข้อมูลภายใน ${radiusKm} กม. (ไม่ใช่สถานที่ทั้งหมดในพื้นที่)` : `${places.length} catalogued places within ${radiusKm} km (not all places in the area).`)
              : (th ? `แสดง ${places.length} สถานที่จากฐานข้อมูล` : `Showing ${places.length} database locations`)}
          </p>
          {places.length === 0 && <p>{th ? 'ยังไม่มีสถานที่พร้อมพิกัดในบริเวณนี้ ลองเพิ่มรัศมีค้นหา' : 'No catalogued places with coordinates here. Try a larger radius.'}</p>}
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {places.map(place => <li key={place.id} className="rounded-lg border p-3">
              <Link className="flex items-center gap-2 font-medium hover:underline" to={`/attraction/${encodeURIComponent(place.id)}`}>
                <MapPin className="h-4 w-4 shrink-0" /> {th ? place.nameLocal || place.name : place.name}
              </Link>
              <p className="text-sm text-muted-foreground">{localizedProvince(place, currentLanguage)}{typeof place.distanceKm === 'number' ? ` · ${place.distanceKm.toFixed(1)} km` : ''}</p>
            </li>)}
          </ul>
          <p className="text-xs text-muted-foreground">{th ? 'ใช้ตำแหน่งเพื่อค้นหาเท่านั้น ไม่บันทึกลงฐานข้อมูลผู้ใช้ (ผู้ให้บริการอาจมีบันทึกคำขอ)' : 'Used only for nearby search, not saved to a user database (the service provider may log requests).'}</p>
        </div>
      )}
    </section>
  );
};

export default MapView;
