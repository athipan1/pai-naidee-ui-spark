import { useState } from 'react';

type Review = {
  status: string;
  provinceGate: string;
  coordinateKind: string;
  holds: string[];
  baselineCount: number;
  duplicate: { action: string; matches: { placeId: string; reason: string; distanceMeters: number | null }[] };
  publishAllowed: false;
};
type Availability = { enabled: boolean; reasons: string[]; dailyLimit: number };
type GoogleEvidence = { status: string; results?: { placeId: string; name: string; address: string; types: string[]; mapsUrl: string | null; attributions: { name: string; url: string | null }[] }[] };
type Props = {
  draft: { id: string; payload: { name?: string | null; nameLocal?: string | null; province?: string | null } };
  api: (path: string, options?: RequestInit) => Promise<unknown>;
};
const labels: Record<string, string> = {
  EXISTING_PLACE:'มีรายการเดิมแล้ว — แก้รายการเดิมเท่านั้น', PROBABLE_DUPLICATE:'อาจเป็นสถานที่ซ้ำ',
  NEW_CANDIDATE:'ผู้สมัครสถานที่ใหม่ — รอผู้ดูแลตรวจ', NEEDS_REVIEW:'ต้องตรวจสอบเพิ่มเติม', REJECTED:'ไม่ผ่าน', PASS:'ผ่าน',
  site_center:'จุดกลางสถานที่', vehicle_entrance:'ทางเข้ารถยนต์', parking:'ลานจอดรถ', trailhead:'จุดเริ่มเดินเท้า', unknown:'ยังไม่ระบุ',
  missing_names_or_province:'ชื่อหรือจังหวัดยังไม่ครบ', source_license_unverified:'ยังไม่ยืนยันแหล่งข้อมูลและสิทธิ์การใช้',
  coordinate_missing_or_invalid:'ยังไม่มีพิกัดที่ใช้ตรวจได้', independent_coordinate_evidence_required:'ต้องมีหลักฐานพิกัดจากแหล่งอิสระ',
  province_polygon_unverified:'ยังไม่ยืนยันพิกัดกับขอบเขตจังหวัด', outside_province_polygon:'พิกัดอยู่นอกจังหวัด',
  coordinate_role_unverified:'ยังไม่ทราบว่าพิกัดเป็นจุดใดของสถานที่', entrance_not_verified:'จุดกลางสถานที่ยังใช้ยืนยันทางเข้าไม่ได้',
  public_access_evidence_required:'ต้องมีหลักฐานจุดเข้าเยี่ยมชมสาธารณะ', restricted_access_not_authorized:'ต้องยืนยันจุดนำทางที่หน่วยงานอนุญาต',
  existing_place_id:'ตรงกับรหัสสถานที่เดิม',exact_source_id:'รหัสแหล่งข้อมูลตรงกัน',exact_google_place_id:'Google Place ID ตรงกัน',
  normalized_name_or_alias:'ชื่อหรือชื่ออื่นตรงกัน',nearby_location:'ตำแหน่งใกล้กันมาก',nearby_entity_review:'ต้องตรวจสถานที่ใกล้เคียง',
};
const label = (value: string) => labels[value] || value;

export default function PlaceCandidateReview({ draft, api }: Props) {
  const [review, setReview] = useState<Review | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [google, setGoogle] = useState<GoogleEvidence | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function inspect() {
    setBusy(true); setError(''); setGoogle(null); setReview(null); setAvailability(null);
    try {
      const result = await api(`/places/${encodeURIComponent(draft.id)}/quality-review`) as Review;
      setReview(result);
      setAvailability(await api('/google-verification/status') as Availability);
    } catch { setError('ตรวจคุณภาพไม่สำเร็จ ยังไม่มีการอนุมัติข้อมูล'); }
    finally { setBusy(false); }
  }
  async function verify(language: 'th' | 'en') {
    setBusy(true); setError(''); setGoogle(null);
    try {
      setGoogle(await api('/google-verification', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: language === 'en' ? draft.payload.name : draft.payload.nameLocal || draft.payload.name,
          province: draft.payload.province, language }),
      }) as GoogleEvidence);
    } catch { setError('Google Verification ไม่พร้อมใช้งาน หรือโควตาเต็ม กรุณาตรวจการอนุมัติและโควตา'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-3 border-t pt-3" data-testid="candidate-quality-review">
    <button type="button" disabled={busy} onClick={() => void inspect()} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-50">ตรวจคุณภาพแบบอ่านอย่างเดียว</button>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {review && <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm">
      <p>ผลตรวจ: <strong>{label(review.status)}</strong> · เทียบฐานข้อมูล {review.baselineCount} แห่ง</p>
      <p>ขอบเขตจังหวัด: {label(review.provinceGate)} · ชนิดพิกัด: {label(review.coordinateKind)}</p>
      <p className="font-semibold text-amber-800">รายงานนี้ยังไม่อนุมัติให้เผยแพร่</p>
      {!!review.holds.length && <ul className="list-inside list-disc break-words">{review.holds.map(hold => <li key={hold}>{label(hold)}</li>)}</ul>}
      {!!review.duplicate.matches.length && <ul className="list-inside list-disc break-all">{review.duplicate.matches.map((match, index) => <li key={`${match.placeId}-${index}`}>{match.placeId} · {label(match.reason)}{match.distanceMeters === null ? '' : ` · ${match.distanceMeters} เมตร`}</li>)}</ul>}
      {availability && <div className="space-y-2 border-t pt-2">
        <p>Google Verification: {availability.enabled && availability.dailyLimit > 0 ? 'พร้อมตรวจด้วยตนเอง' : 'ปิดอยู่ / รอยืนยันโควตาและการอนุมัติ'}</p>
        <p className="text-xs text-slate-600">ใช้โควตาร่วมกับรายละเอียดสถานที่ · ไม่บันทึกผล Google ลงฐานข้อมูล · Billing Alerts ไม่ใช่ตัวตัดค่าใช้จ่าย</p>
        <div className="flex flex-wrap gap-2">{(['th', 'en'] as const).map(language => <button key={language} type="button" disabled={busy || !availability.enabled || availability.dailyLimit === 0}
          onClick={() => void verify(language)} className="rounded-lg border px-3 py-2 disabled:opacity-50">ตรวจ Google ({language})</button>)}</div>
      </div>}
    </div>}
    {google && <aside aria-label="หลักฐานสด Google Maps" className="space-y-3 rounded-xl border-2 border-slate-300 bg-white p-3 text-sm">
      <p className="font-semibold">Google Maps</p><p>ผลสดสำหรับตรวจด้วยตนเอง: {google.status} — ยังไม่ยืนยันว่าเป็นสถานที่เดียวกัน</p>
      {google.results?.map((result, index) => <div key={`${result.placeId}-${index}`} className="space-y-1 break-words border-t pt-2">
        <p className="font-medium">{result.name}</p><p>{result.address}</p><p>{result.types.join(', ')}</p>
        <p className="break-all">Place ID: {result.placeId}</p>
        {result.mapsUrl && <a className="underline" target="_blank" rel="noopener noreferrer" href={result.mapsUrl}>เปิด Google Maps เพื่อตรวจสถานที่</a>}
        {result.attributions.map((a, i) => <p key={i}>{a.url ? <a href={a.url} target="_blank" rel="noopener noreferrer" className="underline">{a.name}</a> : a.name}</p>)}
      </div>)}
    </aside>}
  </div>;
}
