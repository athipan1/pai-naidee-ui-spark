import { useEffect, useMemo, useState, type FormEvent } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

type Coordinate = { lat: number; lng: number };
type SearchResult = { candidates: Array<Coordinate & { label: string; source: string }>; providerConfigured: boolean };
type Props = { value: Coordinate | null; onChange: (value: Coordinate) => void; onSearch: (name: string) => Promise<SearchResult> };
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

export default function AdminCoordinatePicker({ value, onChange, onSearch }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult['candidates']>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const center = useMemo<[number, number]>(() => value && validThaiCoordinate(value)
    ? [value.lat, value.lng] : [13.7367, 100.5231], []);
  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 2) { setNotice('กรุณาพิมพ์ชื่อสถานที่อย่างน้อย 2 ตัวอักษร'); return; }
    setBusy(true);
    setNotice('');
    setResults([]);
    try {
      const response = await onSearch(query.trim());
      const candidates = response.candidates.filter(candidate => validThaiCoordinate(candidate));
      setResults(candidates);
      setNotice(candidates.length ? `พบ ${candidates.length} ตำแหน่ง เลือกรายการเพื่อเลื่อนหมุดบนแผนที่` :
        response.providerConfigured ? 'ไม่พบสถานที่ ลองใช้ชื่อเต็มหรือชื่อจังหวัดประกอบ' :
          'ยังไม่พบในฐานข้อมูล PaiNaiDee หากต้องการค้นหาสถานที่ใหม่ทั่วประเทศ ให้ตั้งค่า GEOAPIFY_API_KEY บน Railway หรือแตะแผนที่เลือกเอง');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'ค้นหาสถานที่ไม่สำเร็จ');
    } finally { setBusy(false); }
  }
  return <div className="overflow-hidden rounded-xl border border-slate-200">
    <div className="space-y-2 bg-white p-3">
      <form onSubmit={search} className="flex flex-col gap-2 sm:flex-row">
        <input aria-label="ค้นหาชื่อสถานที่บนแผนที่" type="search" value={query} onChange={event => setQuery(event.target.value)}
          placeholder="พิมพ์ชื่อสถานที่ เช่น ตลาดน้ำอัมพวา" maxLength={120}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
        <button type="submit" disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? 'กำลังค้นหา...' : 'ค้นหาบนแผนที่'}
        </button>
      </form>
      {notice && <p role="status" aria-live="polite" className="text-xs text-slate-600">{notice}</p>}
      {results.length > 0 && <div aria-label="ผลการค้นหาสถานที่" className="max-h-52 space-y-1 overflow-y-auto">
        {results.map((result, index) => <button type="button" key={`${result.source}-${result.lat}-${result.lng}-${index}`}
          onClick={() => { onChange({ lat: result.lat, lng: result.lng }); setResults([]); setNotice('เลื่อนหมุดแล้ว ตรวจตำแหน่งและกดยืนยันใช้พิกัดนี้ด้านล่าง'); }}
          className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-teal-500 hover:bg-teal-50 focus-visible:outline-teal-600">
          <span className="block font-medium">{result.label}</span>
          <span className="block text-xs text-slate-500">{result.source} · {result.lat.toFixed(5)}, {result.lng.toFixed(5)}</span>
        </button>)}
      </div>}
    </div>
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
