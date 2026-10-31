import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CloudUpload, FilePenLine, ImagePlus, LogOut, MapPin, Plus, Search, ShieldCheck } from 'lucide-react';
import { getApiBaseUrl } from '@/services/railway-api.service';

type Draft = { id: string; status: string; payload: PlaceForm; target_place_id?: string };
type CatalogPlace = { id: string; name: string; name_local: string | null; province: string };
type ExistingImage = { id: string; url: string; title: string };
type PlaceForm = { name: string; nameLocal: string; province: string; category: string; description: string; lat: string; lng: string; imageUrl: string };
const empty: PlaceForm = { name: '', nameLocal: '', province: '', category: 'Culture', description: '', lat: '', lng: '', imageUrl: '' };
const AdminCoordinatePicker = lazy(() => import('./AdminCoordinatePicker'));
type GeocodeCandidate = { lat: number; lng: number; label: string; source: string };
const validCoordinate = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106;

export default function AdminCms() {
  const [token, setToken] = useState(() => {
    try { return window.sessionStorage.getItem('painaidee.admin.token'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<PlaceForm>({ ...empty });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState<CatalogPlace[]>([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'new' | 'existing' | 'drafts'>('new');
  const [searched, setSearched] = useState(false);
  const [brokenImage, setBrokenImage] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [geoCandidates, setGeoCandidates] = useState<GeocodeCandidate[]>([]);
  const [proposedCoordinate, setProposedCoordinate] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodeBusy, setGeocodeBusy] = useState(false);
  const [geocodeNote, setGeocodeNote] = useState('');
  const lastAutoLookup = useRef('');
  const base = getApiBaseUrl();

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void fetch(`${base}/api/admin/me`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error('Session invalid'); return res.json(); })
      .then(data => setIsAdmin(data.role === 'admin'))
      .catch(() => { if (!controller.signal.aborted) { setIsAdmin(false); setToken(null); window.sessionStorage.removeItem('painaidee.admin.token'); } })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [token, base]);

  async function signOut() {
    try { await api('/logout', { method: 'POST' }); } catch { /* Expired tokens are invalid regardless. */ }
    window.sessionStorage.removeItem('painaidee.admin.token');
    setToken(null); setIsAdmin(false);
  }

  async function api(path: string, options: RequestInit = {}) {
    if (!token) throw new Error('กรุณาเข้าสู่ระบบใหม่');
    const res = await fetch(`${base}/api/admin${path}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...options.headers },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.errors?.join(', ') || `HTTP ${res.status}`);
    return data;
  }

  useEffect(() => {
    if (!token || !isAdmin) return;
    const controller = new AbortController();
    void fetch(`${base}/api/admin/places`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`ไม่สามารถโหลดฉบับร่าง (${response.status})`);
        return response.json();
      }).then(data => setDrafts(data.drafts || []))
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [token, isAdmin, base]);

  useEffect(() => {
    if (tab !== 'existing' || !token || !isAdmin || searched) return;
    const controller = new AbortController();
    void fetch(`${base}/api/admin/catalog?page=1`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error(`ไม่สามารถโหลดสถานที่ (${response.status})`); return response.json(); })
      .then(data => { if (!controller.signal.aborted) { setCatalog(data.places || []); setCatalogTotal(data.total || 0); setCatalogPage(1); setSearched(true); } })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [tab, token, isAdmin, base, searched]);

  // Search only after both fields settle. Never overwrite the administrator's coordinates.
  useEffect(() => {
    const name = (form.nameLocal || form.name).trim();
    const province = form.province.trim();
    if (tab !== 'new' || !token || !isAdmin || !name || !province || name.length < 3 ||
        (form.lat.trim() && form.lng.trim())) return;
    const key = `${name}|${province}`;
    if (key === lastAutoLookup.current) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      lastAutoLookup.current = key;
      setGeocodeBusy(true);
      void fetch(`${base}/api/admin/geocode?name=${encodeURIComponent(name)}&province=${encodeURIComponent(province)}`, {
        headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
      }).then(response => { if (!response.ok) throw new Error('ค้นหาพิกัดไม่สำเร็จ'); return response.json(); })
        .then(result => { if (!controller.signal.aborted) { setGeoCandidates(result.candidates || []); setGeocodeNote(result.candidates?.length ? 'พบพิกัดที่อาจตรงกับสถานที่ โปรดตรวจบนแผนที่' : 'ยังไม่พบพิกัดจากแหล่งข้อมูลที่เชื่อมต่อ'); } })
        .catch(() => { if (!controller.signal.aborted) setGeocodeNote('ค้นหาพิกัดไม่สำเร็จ คุณสามารถเลือกหมุดเองได้'); })
        .finally(() => { if (!controller.signal.aborted) setGeocodeBusy(false); });
    }, 1000);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [form.name, form.nameLocal, form.province, form.lat, form.lng, tab, token, isAdmin, base]);

  async function lookupCoordinates() {
    const name = (form.nameLocal || form.name).trim();
    if (name.length < 2 || !form.province.trim()) { setGeocodeNote('กรุณากรอกชื่อสถานที่และจังหวัดก่อน'); return; }
    setGeocodeBusy(true); setGeocodeNote(''); setGeoCandidates([]);
    try {
      const result = await api(`/geocode?name=${encodeURIComponent(name)}&province=${encodeURIComponent(form.province.trim())}`);
      setGeoCandidates(result.candidates || []);
      setGeocodeNote(result.candidates?.length ? 'เลือกผลลัพธ์ด้านล่าง แล้วตรวจหมุดบนแผนที่ก่อนยืนยัน' :
        result.providerConfigured ? 'ไม่พบตำแหน่งที่ตรงกัน ลองปรับชื่อหรือเลือกบนแผนที่' : 'ไม่พบในฐานข้อมูลเดิม หากเป็นสถานที่ใหม่สามารถเลือกหมุดเอง หรือกำหนด GEOAPIFY_API_KEY ใน Railway');
    } catch (error) { setGeocodeNote(error instanceof Error ? error.message : 'ค้นหาพิกัดไม่สำเร็จ'); }
    finally { setGeocodeBusy(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const path = editing ? `/places/${editing}` : '/places';
      const data = await api(path, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setDrafts(current => editing
        ? current.map(draft => draft.id === editing ? { ...draft, payload: form } : draft)
        : [{ id: data.id, status: 'draft', payload: form }, ...current]);
      setForm({ ...empty }); setEditing(null); setTab('drafts'); setProposedCoordinate(null); setGeoCandidates([]); setMessage('บันทึกฉบับร่างสำเร็จ ยังไม่ปรากฏบนเว็บไซต์จนกว่าจะกดเผยแพร่');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function findPlaces(page = 1) {
    setBusy(true); setMessage('');
    try { const result = await api(`/catalog?q=${encodeURIComponent(search.trim())}&page=${page}`); setCatalog(result.places); setCatalogTotal(result.total); setCatalogPage(page); setSearched(true); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'ค้นหาไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function editExisting(place: CatalogPlace) {
    setBusy(true); setMessage('');
    try {
      const draft = await api(`/catalog/${encodeURIComponent(place.id)}/edit`, { method: 'POST' });
      setDrafts(current => [draft, ...current]); setEditing(draft.id);
      setForm({ ...empty, ...draft.payload }); setCatalog([]); setTab('new'); setBrokenImage(false);
      setProposedCoordinate(null); setGeoCandidates([]);
      void loadExistingImages(place.id);
      setMessage('สร้างฉบับร่างแก้ไขแล้ว ข้อมูลบนเว็บไซต์ยังไม่เปลี่ยนจนกว่าจะกดเผยแพร่');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'สร้างฉบับร่างไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function loadExistingImages(placeId?: string) {
    setExistingImages([]);
    if (!placeId) return;
    setLoadingImages(true);
    try {
      const result = await api(`/catalog/${encodeURIComponent(placeId)}/media`);
      setExistingImages(result.images || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'โหลดภาพเดิมไม่สำเร็จ'); }
    finally { setLoadingImages(false); }
  }

  async function upload(file: File) {
    setBusy(true); setMessage('');
    try {
      const data = new FormData(); data.append('image', file);
      const result = await api('/media', { method: 'POST', body: data });
      setForm(current => ({ ...current, imageUrl: result.imageUrl })); setBrokenImage(false);
      setMessage('อัปโหลดภาพสำเร็จ กรุณาบันทึกฉบับร่าง');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function publish(draft: Draft) {
    if (!window.confirm(`เผยแพร่ “${draft.payload.name}” บนเว็บไซต์จริงหรือไม่?`)) return;
    setBusy(true); setMessage('');
    try {
      const result = await api(`/places/${draft.id}/publish`, { method: 'POST' });
      setDrafts(current => current.map(item => item.id === draft.id ? { ...item, status: 'published' } : item));
      setMessage(`เผยแพร่สำเร็จ: ${result.placeId}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'เผยแพร่ไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  if (isLoading) return <div className="p-8">กำลังตรวจสอบสิทธิ์...</div>;
  if (!token) return <div className="p-8">กรุณา <Link className="underline" to="/login">เข้าสู่ระบบแอดมิน</Link></div>;
  if (!isAdmin) return <div className="p-8">บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ</div>;

  const inputStyle = 'mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
  const activeDrafts = drafts.filter(d => d.status === 'draft');
  return <main className="min-h-screen min-w-0 bg-slate-50 pb-16 text-slate-900">
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white shadow-sm sm:p-7">
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-teal-100">PaiNaiDee · Content Studio</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">จัดการสถานที่ท่องเที่ยว</h1><p className="mt-2 text-sm text-teal-50">เพิ่ม แก้ไข และเผยแพร่ข้อมูลอย่างปลอดภัย</p></div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-3 py-2 text-sm hover:bg-white/10" onClick={() => void signOut()}><LogOut size={16} /> ออกจากระบบ</button>
      </header>
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><ShieldCheck size={18} className="shrink-0" /> การเปลี่ยนแปลงจะไม่ขึ้นเว็บไซต์จนกว่าจะกดเผยแพร่</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">รอดำเนินการ</p><p className="mt-1 text-2xl font-bold text-teal-700">{activeDrafts.length}</p><p className="text-xs text-slate-500">ฉบับร่าง</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">เผยแพร่ผ่าน CMS</p><p className="mt-1 text-2xl font-bold">{drafts.filter(d => d.status === 'published').length}</p><p className="text-xs text-slate-500">รายการ</p></div>
        <div className="col-span-2 flex items-center gap-3 rounded-xl border bg-white p-4 sm:col-span-1"><CheckCircle2 className="text-emerald-600" /><div><p className="font-medium">ระบบจัดการเนื้อหา</p><p className="text-xs text-slate-500">เข้าสู่ระบบแล้ว</p></div></div>
      </div>
      <nav aria-label="ส่วนจัดการสถานที่" className="grid grid-cols-3 gap-2 rounded-2xl border bg-white p-2 shadow-sm">
        {([{ id: 'new', label: 'เพิ่ม / แก้ไข', Icon: Plus }, { id: 'existing', label: 'ค้นหาสถานที่', Icon: Search }, { id: 'drafts', label: `ฉบับร่าง (${activeDrafts.length})`, Icon: FilePenLine }] as const).map(item => <button key={item.id} type="button" aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-3 text-center text-xs font-semibold transition sm:flex-row sm:text-sm ${tab === item.id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><item.Icon size={17} /><span>{item.label}</span></button>)}
      </nav>
      {message && <div role="status" aria-live="polite" className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">{message}</div>}
      {tab === 'existing' && <section className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div><h2 className="flex items-center gap-2 text-xl font-bold"><Search className="text-teal-600" /> ค้นหาสถานที่เดิม</h2><p className="mt-1 text-sm text-slate-500">แสดงสถานที่ที่มีอยู่ใน Railway และค้นหาได้ด้วยชื่อเต็ม ชื่อย่อ หรือจังหวัด</p></div>
        <form className="flex min-w-0 flex-wrap gap-2" onSubmit={event => { event.preventDefault(); void findPlaces(1); }}><input aria-label="ค้นหาสถานที่เดิม" className={`${inputStyle} mt-0 min-w-0 flex-1`} value={search} onChange={e => setSearch(e.target.value)} placeholder="เช่น วัดภูมโนรมย์" /><button type="submit" disabled={busy} className="rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white disabled:opacity-50">ค้นหา</button></form>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500"><span>พบ {catalogTotal} สถานที่ {search.trim() ? '(ตามคำค้นล่าสุด)' : '(ทั้งหมด)'}</span><button type="button" className="font-medium text-teal-700 underline" disabled={busy} onClick={() => { setSearch(''); setSearched(false); }}>แสดงทั้งหมด</button></div>
        {searched && !catalog.length && <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">ไม่พบสถานที่ ลองใช้คำค้นที่สั้นลงหรือชื่อจังหวัด</p>}
        <div className="divide-y">{catalog.map(place => <div key={place.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="break-words font-semibold">{place.name_local || place.name}</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {place.province}</p></div><button type="button" disabled={busy} onClick={() => void editExisting(place)} className="rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50">แก้ไขสถานที่</button></div>)}</div>
        {catalogTotal > 30 && <div className="flex items-center justify-between gap-3 border-t pt-4"><button type="button" disabled={busy || catalogPage === 1} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40" onClick={() => void findPlaces(catalogPage - 1)}>ก่อนหน้า</button><span className="text-sm text-slate-500">หน้า {catalogPage} / {Math.ceil(catalogTotal / 30)}</span><button type="button" disabled={busy || catalogPage * 30 >= catalogTotal} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40" onClick={() => void findPlaces(catalogPage + 1)}>ถัดไป</button></div>}
      </section>}
      {tab === 'new' && <form onSubmit={save} className="space-y-6 rounded-2xl border bg-white p-4 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-bold">{editing ? 'แก้ไขข้อมูลฉบับร่าง' : 'เพิ่มสถานที่ใหม่'}</h2><p className="mt-1 text-sm text-slate-500">ช่องที่มี * จำเป็นต้องกรอก</p></div>{editing && <button type="button" className="text-sm font-medium text-teal-700 underline" onClick={() => { setEditing(null); setForm({ ...empty }); setBrokenImage(false); setExistingImages([]); }}>เริ่มรายการใหม่</button>}</div>
        <section className="grid min-w-0 gap-4 sm:grid-cols-2">
          {(['name', 'nameLocal', 'province', 'category', 'lat', 'lng'] as const).map(key => <label key={key} className="min-w-0 text-sm font-medium"><span>{({ name: 'ชื่อสถานที่ (หลัก)', nameLocal: 'ชื่อภาษาไทย', province: 'จังหวัด', category: 'หมวดหมู่', lat: 'ละติจูด', lng: 'ลองจิจูด' })[key]}{['name', 'province', 'category', 'lat', 'lng'].includes(key) ? ' *' : ''}</span><input className={inputStyle} value={form[key]} inputMode={key === 'lat' || key === 'lng' ? 'decimal' : 'text'} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} required={['name', 'province', 'category', 'lat', 'lng'].includes(key)} /></label>)}
        </section>
        <section className="space-y-3 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="flex items-center gap-2 font-semibold"><MapPin size={18} className="text-teal-700" /> ค้นหาและเลือกพิกัดบนแผนที่</h3><p className="mt-1 text-xs text-slate-600">กรอกชื่อและจังหวัดเพื่อเสนอพิกัดอัตโนมัติ แล้วตรวจตำแหน่งก่อนยืนยัน</p></div><button type="button" disabled={geocodeBusy || !form.province.trim() || !(form.nameLocal || form.name).trim()} onClick={() => void lookupCoordinates()} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{geocodeBusy ? 'กำลังค้นหา...' : 'ค้นหาพิกัด'}</button></div>
          {geocodeNote && <p aria-live="polite" className="text-sm text-slate-700">{geocodeNote}</p>}
          {geoCandidates.length > 0 && <div className="space-y-2">{geoCandidates.map((candidate, index) => <button key={`${candidate.source}-${index}`} type="button" onClick={() => setProposedCoordinate({ lat: candidate.lat, lng: candidate.lng })} className="flex w-full items-start justify-between gap-2 rounded-lg border bg-white p-3 text-left text-sm hover:border-teal-500"><span>{candidate.label}<span className="mt-1 block text-xs text-slate-500">{candidate.source} · {candidate.lat.toFixed(5)}, {candidate.lng.toFixed(5)}</span></span><MapPin size={16} className="shrink-0 text-teal-600" /></button>)}</div>}
          <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-200" />}>
            <AdminCoordinatePicker value={proposedCoordinate || (validCoordinate(Number(form.lat), Number(form.lng)) && form.lat.trim() && form.lng.trim() ? { lat: Number(form.lat), lng: Number(form.lng) } : null)} onChange={setProposedCoordinate} onSearch={query => api(`/geocode?name=${encodeURIComponent(query)}`)} />
          </Suspense>
          {proposedCoordinate && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3"><span className="text-sm">หมุดที่เลือก: <strong>{proposedCoordinate.lat.toFixed(6)}, {proposedCoordinate.lng.toFixed(6)}</strong></span><button type="button" onClick={() => { setForm(current => ({ ...current, lat: proposedCoordinate.lat.toFixed(6), lng: proposedCoordinate.lng.toFixed(6) })); setProposedCoordinate(null); setGeocodeNote('ยืนยันพิกัดในแบบฟอร์มแล้ว กรุณาบันทึกฉบับร่างเพื่อเก็บการเปลี่ยนแปลง'); }} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">ยืนยันใช้พิกัดนี้</button></div>}
          <p className="text-xs text-slate-500">พิกัดจากระบบเป็นเพียงข้อเสนอ ตรวจสอบหมุดก่อนทุกครั้ง · ยังไม่มีการบันทึกลงฐานข้อมูล</p>
        </section>
        <label className="block text-sm font-medium"><span>รายละเอียดสถานที่</span><textarea className={`${inputStyle} min-h-36 resize-y`} value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} placeholder="จุดเด่น ประวัติ การเดินทาง และข้อมูลที่เป็นประโยชน์..." /></label>
        <section className="space-y-3 rounded-xl border border-dashed border-teal-200 bg-teal-50/40 p-4">
          <h3 className="flex items-center gap-2 font-semibold"><ImagePlus size={19} className="text-teal-700" /> รูปภาพสถานที่</h3>
          {loadingImages && <p className="text-sm text-slate-500">กำลังโหลดรูปภาพที่มีอยู่...</p>}
          {existingImages.length > 0 && <div className="space-y-3 rounded-xl bg-white p-3"><div><h4 className="font-semibold">รูปภาพที่ใช้อยู่บนเว็บไซต์ ({existingImages.length})</h4><p className="text-xs text-slate-500">แตะรูปเพื่อเลือกเป็นรูปหลักในฉบับร่าง รูปอื่นยังคงอยู่ ไม่ถูกลบ</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{existingImages.map(image => <button key={image.id} type="button" onClick={() => { setForm(current => ({ ...current, imageUrl: image.url })); setBrokenImage(false); }} className={`min-w-0 overflow-hidden rounded-xl border-2 text-left transition ${form.imageUrl === image.url ? 'border-teal-600 ring-2 ring-teal-100' : 'border-slate-200 hover:border-teal-300'}`}><img src={image.url} alt={image.title || 'รูปสถานที่เดิม'} className="aspect-[4/3] w-full bg-slate-100 object-cover" loading="lazy" /><span className="block truncate p-2 text-xs text-slate-600">{form.imageUrl === image.url ? '✓ เลือกเป็นรูปหลัก' : image.title || 'รูปเดิม'}</span></button>)}</div></div>}
          {editing && !loadingImages && existingImages.length === 0 && <p className="rounded-lg bg-white p-3 text-sm text-slate-600">ไม่พบรูปเดิมในคลังภาพของสถานที่นี้ คุณสามารถอัปโหลดรูปใหม่ได้</p>}
          {form.imageUrl && !brokenImage && <img src={form.imageUrl} alt="ตัวอย่างภาพสถานที่" className="h-48 w-full rounded-xl bg-slate-100 object-cover sm:h-64" onError={() => setBrokenImage(true)} />}
          {form.imageUrl && brokenImage && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">ไม่สามารถแสดงตัวอย่างภาพได้ กรุณาตรวจสอบ URL</p>}
          <label className="block cursor-pointer rounded-xl border border-teal-200 bg-white px-4 py-5 text-center text-sm text-teal-800"><CloudUpload className="mx-auto mb-2" /><span className="font-semibold">เลือกภาพจากอุปกรณ์</span><span className="mt-1 block text-xs text-slate-500">JPG, PNG, WebP ไม่เกิน 5 MB</span><input className="mt-3 block w-full min-w-0 text-xs" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ''; }} /></label>
          <label className="block text-sm font-medium">หรือใส่ URL รูปภาพ HTTPS<input className={inputStyle} type="url" value={form.imageUrl} onChange={e => { setBrokenImage(false); setForm(current => ({ ...current, imageUrl: e.target.value })); }} placeholder="https://..." /></label>
        </section>
        <div className="sticky bottom-2 z-10 rounded-xl border bg-white/95 p-2 shadow-lg backdrop-blur"><button className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50" disabled={busy} type="submit">{busy ? 'กำลังดำเนินการ...' : editing ? 'บันทึกการแก้ไขเป็นฉบับร่าง' : 'บันทึกสถานที่เป็นฉบับร่าง'}</button><p className="mt-2 text-center text-xs text-slate-500">ยังไม่เผยแพร่จนกว่าจะยืนยันในแท็บฉบับร่าง</p></div>
      </form>}
      {tab === 'drafts' && <section className="space-y-4"><div><h2 className="text-xl font-bold">รายการฉบับร่างและการเผยแพร่</h2><p className="mt-1 text-sm text-slate-500">ตรวจสอบและแก้ไขข้อมูลให้ถูกต้องก่อนเผยแพร่</p></div>
        {!drafts.length && <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">ยังไม่มีฉบับร่าง เริ่มเพิ่มสถานที่ใหม่ได้เลย</div>}
        {drafts.map(draft => <article key={draft.id} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-bold">{draft.payload.nameLocal || draft.payload.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {draft.payload.province}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${draft.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{draft.status === 'draft' ? 'รอเผยแพร่' : 'เผยแพร่แล้ว'}</span></div><p className="text-xs text-slate-500">{draft.target_place_id ? 'แก้ไขสถานที่เดิม' : 'สถานที่ใหม่'}</p>{draft.status === 'draft' && <div className="flex flex-wrap gap-2 border-t pt-3"><button type="button" className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold" onClick={() => { setEditing(draft.id); setForm({ ...empty, ...draft.payload }); setBrokenImage(false); void loadExistingImages(draft.target_place_id); setTab('new'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>แก้ไขร่าง</button><button type="button" disabled={busy} className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" onClick={() => void publish(draft)}>เผยแพร่</button></div>}</article>)}
      </section>}
    </div>
  </main>;
}
