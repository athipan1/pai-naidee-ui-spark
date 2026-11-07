declare const __PAINAIDEE_BUILD__: string;
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock3, CloudUpload, FilePenLine, ImagePlus, LogOut, MapPin, Plus, Search, ShieldCheck } from 'lucide-react';
import { getApiBaseUrl } from '@/services/railway-api.service';
import PlaceCandidateReview from '@/components/admin/PlaceCandidateReview';
import ProvinceQualityDashboard from '@/components/admin/ProvinceQualityDashboard';

type DraftPayload = Partial<Record<Exclude<keyof PlaceForm, 'lat' | 'lng' | 'imageUrls'>, string | null>> & {
  imageUrls?: string[];
  removedImageUrls?: string[];
  lat?: string | number | null;
  lng?: string | number | null;
};
type Draft = { id: string; status: string; payload: DraftPayload; version: string; target_place_id?: string };
type CatalogPlace = { id: string; name: string; name_local: string | null; province: string };
type ReconcileData = { draft: DraftPayload; latest: DraftPayload; version: string; stale: boolean; placeUpdatedAt: string; fields: string[] };
type ExistingImage = { id: string; url: string; title: string };
type PlaceAlias = { id: string; alias_name: string; language: string; status: string };
type PlaceForm = { name: string; nameLocal: string; province: string; category: string; description: string; lat: string; lng: string; imageUrl: string; imageUrls: string[]; removedImageUrls: string[] };
const empty: PlaceForm = { name: '', nameLocal: '', province: '', category: 'Culture', description: '', lat: '', lng: '', imageUrl: '', imageUrls: [], removedImageUrls: [] };
function toPlaceForm(payload: DraftPayload): PlaceForm {
  const coordinate = (value: string | number | null | undefined) => value == null ? '' : String(value).trim();
  return {
    name: payload.name ?? empty.name,
    nameLocal: payload.nameLocal ?? empty.nameLocal,
    province: payload.province ?? empty.province,
    category: payload.category ?? empty.category,
    description: payload.description ?? empty.description,
    imageUrl: payload.imageUrl ?? empty.imageUrl,
    imageUrls: payload.imageUrls ?? (payload.imageUrl ? [payload.imageUrl] : []),
    removedImageUrls: payload.removedImageUrls ?? [],
    lat: coordinate(payload.lat),
    lng: coordinate(payload.lng),
  };
}

function cmsImageFilename(url: string, base: string) {
  try {
    const image = new URL(url);
    if (image.origin !== new URL(base, window.location.origin).origin) return null;
    return /^\/api\/media\/cms\/([a-f0-9-]{36}\.(?:jpg|png|webp))$/.exec(image.pathname)?.[1] ?? null;
  } catch {
    return null;
  }
}

const AdminCoordinatePicker = lazy(() => import('./AdminCoordinatePicker'));
type GeocodeCandidate = { lat: number; lng: number; label: string; source: string };
const validCoordinate = (lat: number, lng: number) => Number.isFinite(lat) && Number.isFinite(lng) && lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106;

export default function AdminCms() {
  const [token, setToken] = useState(() => {
    try { return window.sessionStorage.getItem('painaidee.admin.token'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [form, setForm] = useState<PlaceForm>({ ...empty });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [search, setSearch] = useState('');
  const [catalog, setCatalog] = useState<CatalogPlace[]>([]);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [editing, setEditing] = useState<Pick<Draft, 'id' | 'version'> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'new' | 'existing' | 'drafts' | 'history' | 'quality'>('new');
  const [searched, setSearched] = useState(false);
  const [privatePreview, setPrivatePreview] = useState<{ url: string; src: string } | null>(null);
  const [brokenImage, setBrokenImage] = useState(false);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [reconcile, setReconcile] = useState<{ draftId: string; data: ReconcileData; selected: string[]; retainGallery: boolean } | null>(null);
  const [aliasPlace, setAliasPlace] = useState<CatalogPlace | null>(null);
  const [placeAliases, setPlaceAliases] = useState<PlaceAlias[]>([]);
  const [newAliasName, setNewAliasName] = useState('');
  const [aliasLanguage, setAliasLanguage] = useState('th');
  const [loadingImages, setLoadingImages] = useState(false);
  const [geoCandidates, setGeoCandidates] = useState<GeocodeCandidate[]>([]);
  const [proposedCoordinate, setProposedCoordinate] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodeBusy, setGeocodeBusy] = useState(false);
  const [geocodeNote, setGeocodeNote] = useState('');
  const [aiModels,setAiModels] = useState<{id:string;label:string}[]>([]);
  const [aiModel,setAiModel] = useState('');
  const [aiStructured,setAiStructured] = useState(false);
  const [aiBusy,setAiBusy] = useState(false);
  const [aiMessage,setAiMessage] = useState('');
  const [aiResult,setAiResult] = useState<Record<string,unknown>|null>(null);
  const [aiSaved,setAiSaved] = useState<{model:string;structuredOutput:boolean;source?:string;updatedAt?:string|null}|null>(null);
  const [aiBackendCommit,setAiBackendCommit] = useState<string|null>(null);
  const [aiValidated,setAiValidated] = useState(false);
  const lastAutoLookup = useRef('');
  const imageRequest = useRef<AbortController | null>(null);
  const base = getApiBaseUrl();

  const clearSession = useCallback((notice = '') => {
    try { window.sessionStorage.removeItem('painaidee.admin.token'); } catch { /* Storage may be disabled. */ }
    setToken(null);
    setIsAdmin(false);
    setIsLoading(false);
    setSessionError(notice);
  }, []);

  const requestAdmin = useCallback(async (path: string, options: RequestInit = {}) => {
    if (!token) throw new Error('กรุณาเข้าสู่ระบบใหม่');
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${base}/api/admin${path}`, { ...options, headers });
    if (response.status === 401 && !options.signal?.aborted) clearSession('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    return response;
  }, [base, token, clearSession]);

  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    const response = await requestAdmin(path, options);
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error || data?.errors?.join(', ') || `HTTP ${response.status}`);
    if (!data) throw new Error('เซิร์ฟเวอร์ตอบกลับในรูปแบบที่ไม่ถูกต้อง');
    return data;
  }, [requestAdmin]);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    void api('/me', { signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return;
        if (data.role === 'admin') setIsAdmin(true);
        else clearSession('บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ');
      })
      .catch(() => {
        if (!controller.signal.aborted) setSessionError(current => current || 'ตรวจสอบเซสชันไม่สำเร็จ กรุณาลองใหม่');
      })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [token, api, clearSession, sessionAttempt]);

  async function signOut() {
    setBusy(true);
    try {
      await api('/logout', { method: 'POST' });
      clearSession();
    } catch {
      setMessage('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่');
    } finally { setBusy(false); }
  }

  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    void api('/places', { signal: controller.signal })
      .then(data => { if (!controller.signal.aborted) setDrafts(data.drafts || []); })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [isAdmin, api]);

  useEffect(() => {
    if (tab !== 'existing' || !isAdmin || searched) return;
    const controller = new AbortController();
    void api('/catalog?page=1', { signal: controller.signal })
      .then(data => {
        if (controller.signal.aborted) return;
        setCatalog(data.places || []);
        setCatalogTotal(data.total || 0);
        setCatalogPage(1);
        setCatalogQuery('');
        setSearched(true);
      })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, [tab, isAdmin, searched, api]);

  const mediaFilename = cmsImageFilename(form.imageUrl, base);
  const previewSrc = mediaFilename
    ? (privatePreview?.url === form.imageUrl ? privatePreview.src : null)
    : (/^https:\/\//i.test(form.imageUrl) ? form.imageUrl : null);

  useEffect(() => {
    if (!isAdmin || !mediaFilename) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    void requestAdmin(`/media/${mediaFilename}`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
      })
      .then(blob => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        setPrivatePreview({ url: form.imageUrl, src: objectUrl });
      })
      .catch(() => { if (!controller.signal.aborted) setBrokenImage(true); });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPrivatePreview(null);
    };
  }, [isAdmin, mediaFilename, form.imageUrl, requestAdmin]);

  useEffect(() => {
    if(!isAdmin || !token) return;
    void api('/ai/models').then(data=>{
      setAiModels(data.options || []);
      setAiModel(data.selected?.model || '');
      setAiStructured(Boolean(data.selected?.structuredOutput));
      setAiSaved({model:data.selected?.model || '',structuredOutput:Boolean(data.selected?.structuredOutput),source:data.selected?.source,updatedAt:data.selected?.updatedAt});
      setAiBackendCommit(data.backendCommit || null);
    }).catch(()=>setAiMessage('ไม่สามารถโหลดการตั้งค่า AI'));
  }, [isAdmin, token, api]);

  async function saveAiModel() {
    if(!window.confirm('ยืนยันเปลี่ยนโมเดล AI สำหรับผู้ใช้ทุกคนหรือไม่?')) return;
    setAiBusy(true);setAiMessage('');setAiResult(null);
    try {
      await api('/ai/models',{method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:aiModel,structuredOutput:aiStructured})});
      const confirmed=await api('/ai/models');
      setAiSaved({model:confirmed.selected?.model||'',structuredOutput:Boolean(confirmed.selected?.structuredOutput),source:confirmed.selected?.source,updatedAt:confirmed.selected?.updatedAt});
      setAiBackendCommit(confirmed.backendCommit||null);setAiResult(null);
      setAiMessage('บันทึกโมเดลสำเร็จ กรุณากดทดสอบ AI ก่อนใช้งานจริง');
    } catch(e){setAiMessage(e instanceof Error?e.message:'บันทึกไม่ได้');}
    finally{setAiBusy(false);}
  }
  async function validateAiSelection() {
    setAiBusy(true);setAiMessage('');setAiResult(null);setAiValidated(false);
    try {
      const data=await api('/ai/models/validate?model='+encodeURIComponent(aiModel)+'&structuredOutput='+String(aiStructured));
      setAiValidated(Boolean(data.ok));setAiMessage(data.ok?'พบ Model ID ใน OpenRouter Catalog (ยังไม่ยืนยันว่า Provider พร้อมตอบ)':'ไม่ผ่านการตรวจสอบโมเดล');
    } catch(e){setAiMessage(e instanceof Error?e.message:'ไม่สามารถตรวจสอบโมเดลได้');}
    finally{setAiBusy(false);}
  }
  async function testAi() {
    if (!token) return;
    setAiBusy(true); setAiMessage(''); setAiResult(null);
    try {
      const response = await requestAdmin('/ai/health-check', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:'{}',
      });
      const result = await response.json();
      setAiResult(result);
      if (response.ok && result.status === 'ok') setAiMessage('ทดสอบ AI สำเร็จ');
      else if (response.status === 429) setAiMessage(result.status === 'cooldown'
        ? `โปรดรออีก ${result.retryAfterSeconds || 300} วินาทีก่อนทดสอบใหม่`
        : 'มีการทดสอบ AI กำลังทำงานอยู่');
      else setAiMessage(`ทดสอบ AI ไม่ผ่าน: ${result.status || 'unknown'} (HTTP ${response.status})`);
    } catch {setAiMessage('ไม่สามารถติดต่อ Backend ได้ กรุณาลองใหม่');}
    finally {setAiBusy(false);}
  }

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
      void api(`/geocode?name=${encodeURIComponent(name)}&province=${encodeURIComponent(province)}`, { signal: controller.signal })
        .then(result => { if (!controller.signal.aborted) { setGeoCandidates(result.candidates || []); setGeocodeNote(result.candidates?.length ? 'พบพิกัดที่อาจตรงกับสถานที่ โปรดตรวจบนแผนที่' : 'ยังไม่พบพิกัดจากแหล่งข้อมูลที่เชื่อมต่อ'); } })
        .catch(() => { if (!controller.signal.aborted) setGeocodeNote('ค้นหาพิกัดไม่สำเร็จ คุณสามารถเลือกหมุดเองได้'); })
        .finally(() => { if (!controller.signal.aborted) setGeocodeBusy(false); });
    }, 1000);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
      setGeocodeBusy(false);
    };
  }, [form.name, form.nameLocal, form.province, form.lat, form.lng, tab, token, isAdmin, api]);

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
      const path = editing ? `/places/${editing.id}` : '/places';
      const data: Draft = await api(path, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, version: editing?.version }) });
      setDrafts(current => [data, ...current.filter(draft => draft.id !== data.id)]);
      setForm({ ...empty }); setEditing(null); setTab('drafts'); setProposedCoordinate(null); setGeoCandidates([]); setMessage('บันทึกฉบับร่างสำเร็จ ยังไม่ปรากฏบนเว็บไซต์จนกว่าจะกดเผยแพร่');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function findPlaces(page: number, query: string) {
    setBusy(true); setMessage('');
    try { const result = await api(`/catalog?q=${encodeURIComponent(query)}&page=${page}`); setCatalogQuery(query); setCatalog(result.places); setCatalogTotal(result.total); setCatalogPage(page); setSearched(true); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'ค้นหาไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function manageAliases(place: CatalogPlace) {
    setAliasPlace(place); setPlaceAliases([]); setMessage('');
    try {
      const result = await api(`/catalog/${encodeURIComponent(place.id)}/aliases`);
      setPlaceAliases(result.aliases || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'โหลดชื่อเรียกไม่สำเร็จ'); }
  }

  async function addAlias(event: FormEvent) {
    event.preventDefault();
    if (!aliasPlace) return;
    setBusy(true); setMessage('');
    try {
      await api(`/catalog/${encodeURIComponent(aliasPlace.id)}/aliases`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aliasName: newAliasName, language: aliasLanguage }) });
      setNewAliasName('');
      await manageAliases(aliasPlace);
      setMessage('เพิ่มชื่อเรียกแล้ว รออนุมัติก่อนใช้ค้นหาจริง');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'เพิ่มชื่อเรียกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function reviewAlias(alias: PlaceAlias, status: 'approved' | 'rejected') {
    if (!aliasPlace) return;
    setBusy(true); setMessage('');
    try {
      await api(`/aliases/${alias.id}/review`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      await manageAliases(aliasPlace);
      setMessage(status === 'approved' ? 'อนุมัติชื่อเรียกแล้ว พร้อมใช้ค้นหา' : 'ปฏิเสธชื่อเรียกแล้ว');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'ตรวจสอบชื่อเรียกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function loadReconciliation(draft: Draft) {
    setBusy(true); setMessage('');
    try {
      const data: ReconcileData = await api(`/places/${encodeURIComponent(draft.id)}/reconcile`);
      setReconcile({ draftId: draft.id, data, selected: [], retainGallery: false });
      setTab('drafts');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'โหลดข้อมูลล่าสุดไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function confirmReconciliation() {
    if (!reconcile) return;
    if (!window.confirm('ยืนยันใช้ข้อมูลล่าสุด และเก็บเฉพาะรายการแก้ไขที่เลือกหรือไม่?')) return;
    setBusy(true); setMessage('');
    try {
      const draft: Draft = await api(`/places/${encodeURIComponent(reconcile.draftId)}/reconcile`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: reconcile.data.version,
          expectedPlaceUpdatedAt: reconcile.data.placeUpdatedAt,
          selectedFields: reconcile.selected, retainGallery: reconcile.retainGallery }),
      });
      setDrafts(current => current.map(item => item.id === draft.id ? draft : item));
      setReconcile(null);
      setMessage('ปรับฉบับร่างตามข้อมูลล่าสุดแล้ว กรุณาตรวจสอบก่อนเผยแพร่');
      openDraft(draft);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'ปรับฉบับร่างไม่สำเร็จ กรุณาโหลดข้อมูลล่าสุดอีกครั้ง'); }
    finally { setBusy(false); }
  }

  async function editExisting(place: CatalogPlace) {
    setBusy(true); setMessage('');
    try {
      const draft = await api(`/catalog/${encodeURIComponent(place.id)}/edit`, { method: 'POST' });
      setDrafts(current => [draft, ...current.filter(item => item.id !== draft.id)]);
      openDraft(draft);
      setMessage('เปิดฉบับร่างแก้ไขแล้ว ข้อมูลบนเว็บไซต์ยังไม่เปลี่ยนจนกว่าจะกดเผยแพร่');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'สร้างฉบับร่างไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  function openDraft(draft: Draft) {
    setReconcile(null);
    setEditing({ id: draft.id, version: draft.version });
    setForm(toPlaceForm(draft.payload));
    setTab('new');
    setBrokenImage(false);
    setProposedCoordinate(null);
    setGeoCandidates([]);
    setGeocodeNote('');
    lastAutoLookup.current = '';
    void loadExistingImages(draft.target_place_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadExistingImages(placeId?: string) {
    imageRequest.current?.abort();
    setExistingImages([]);
    setLoadingImages(Boolean(placeId));
    if (!placeId) return;
    const controller = new AbortController();
    imageRequest.current = controller;
    try {
      const result = await api(`/catalog/${encodeURIComponent(placeId)}/media`, { signal: controller.signal });
      if (!controller.signal.aborted) {
        const images: ExistingImage[] = result.images || [];
        setExistingImages(images);
        setForm(current => ({ ...current, imageUrls: [...new Set([...images.filter(image => !current.removedImageUrls.includes(image.url)).map(image => image.url), ...current.imageUrls])] }));
      }
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : 'โหลดภาพเดิมไม่สำเร็จ');
    } finally {
      if (!controller.signal.aborted) setLoadingImages(false);
    }
  }

  async function upload(files: File[]) {
    if (!files.length) return;
    if (form.imageUrls.length + files.length > 20) {
      setMessage('เพิ่มรูปได้สูงสุด 20 รูปต่อสถานที่'); return;
    }
    if (files.some(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setMessage('กรุณาเลือกภาพ JPG, PNG หรือ WebP ขนาดไม่เกิน 5 MB ต่อรูป'); return;
    }
    setBusy(true); setMessage('');
    try {
      const urls: string[] = [];
      for (const file of files) {
        const data = new FormData(); data.append('image', file);
        const result = await api('/media', { method: 'POST', body: data });
        urls.push(result.imageUrl);
      }
      setForm(current => ({
        ...current,
        imageUrl: current.imageUrl || urls[0],
        imageUrls: [...new Set([...current.imageUrls, ...urls])],
      }));
      setBrokenImage(false);
      setMessage(`อัปโหลดสำเร็จ ${urls.length} รูป เลือกรูปหลักแล้วบันทึกฉบับร่าง`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function deleteDraft(draft: Draft) {
    if (draft.status !== 'draft' || !window.confirm(`ลบฉบับร่าง “${draft.payload.nameLocal || draft.payload.name}” หรือไม่? การลบไม่กระทบสถานที่ที่เผยแพร่แล้ว`)) return;
    setBusy(true); setMessage('');
    try {
      await api(`/places/${draft.id}`, { method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: draft.version }) });
      setDrafts(current => current.filter(item => item.id !== draft.id));
      if (editing?.id === draft.id) { setEditing(null); setForm({ ...empty }); setExistingImages([]); }
      setMessage('ลบฉบับร่างสำเร็จ');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'ลบฉบับร่างไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function publish(draft: Draft) {
    if (!window.confirm(`เผยแพร่ “${draft.payload.name}” บนเว็บไซต์จริงหรือไม่?`)) return;
    setBusy(true); setMessage('');
    try {
      const result = await api(`/places/${draft.id}/publish`, { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: draft.version }) });
      setDrafts(current => current.map(item => item.id === draft.id ? { ...item, status: 'published' } : item));
      setMessage(`เผยแพร่สำเร็จ: ${result.placeId}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'เผยแพร่ไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  if (isLoading) return <div className="p-8">กำลังตรวจสอบสิทธิ์...</div>;
  if (!token) return <div className="p-8">{sessionError && <p role="alert">{sessionError}</p>}กรุณา <Link className="underline" to="/login">เข้าสู่ระบบแอดมิน</Link></div>;
  if (!isAdmin) return <div className="space-y-3 p-8">
    <p role="alert">{sessionError || 'บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ'}</p>
    <button type="button" className="underline" onClick={() => { setSessionError(''); setIsLoading(true); setSessionAttempt(count => count + 1); }}>ลองใหม่</button>
  </div>;

  const inputStyle = 'mt-1.5 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-base text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
  const activeDrafts = drafts.filter(d => d.status === 'draft');
  const publishedDrafts = drafts.filter(d => d.status === 'published');
  return <main className="min-h-screen min-w-0 bg-slate-50 pb-16 text-slate-900">
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-teal-700 to-cyan-700 p-5 text-white shadow-sm sm:p-7">
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-teal-100">PaiNaiDee · Content Studio</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">จัดการสถานที่ท่องเที่ยว</h1><p className="mt-2 text-sm text-teal-50">เพิ่ม แก้ไข และเผยแพร่ข้อมูลอย่างปลอดภัย</p></div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-3 py-2 text-sm hover:bg-white/10" disabled={busy} onClick={() => void signOut()}><LogOut size={16} /> ออกจากระบบ</button>
      </header>
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><ShieldCheck size={18} className="shrink-0" /> การเปลี่ยนแปลงจะไม่ขึ้นเว็บไซต์จนกว่าจะกดเผยแพร่</div>
      <section className="space-y-3 rounded-2xl border border-teal-200 bg-white p-4 sm:p-6" aria-label="AI Model Management">
        <h2 className="text-lg font-bold">จัดการ AI วางแผนเที่ยว</h2>
        <p className="text-sm text-slate-600">เลือกโมเดลฟรีที่อนุญาต และทดสอบกับ OpenRouter ผ่าน Backend โดยใช้บัญชี Admin ที่ล็อกอินอยู่</p>
        <label className="block text-sm font-medium" htmlFor="ai-model-picker">โมเดล AI</label>
        <select id="ai-model-picker" className="w-full rounded-xl border border-slate-300 bg-white p-3" value={aiModel} disabled={aiBusy} onChange={e=>{setAiModel(e.target.value);setAiValidated(false);setAiResult(null);setAiMessage("");}}>
          {aiModels.map(model=><option key={model.id} value={model.id}>{model.label}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={aiStructured} disabled={aiBusy} onChange={e=>{setAiStructured(e.target.checked);setAiValidated(false);setAiResult(null);setAiMessage("");}}/>
          ใช้ Strict JSON Schema (เฉพาะโมเดลที่รองรับ)
        </label>
        <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-700">
          <p>Frontend Build: {__PAINAIDEE_BUILD__}</p>
          <p>Backend Build: {aiBackendCommit || 'ไม่ทราบ'}</p>
          <p>แหล่งตั้งค่า: {aiSaved?.source || 'ยังไม่ทราบ'}</p>
          <p>บันทึกล่าสุด: {aiSaved?.updatedAt ? new Date(aiSaved.updatedAt).toLocaleString('th-TH') : 'ไม่ได้บันทึกใน PostgreSQL หรือยังไม่มีข้อมูล'}</p>
        </div>
        <p className="text-sm text-teal-900">โมเดลที่ใช้งานจริง: <strong>{aiSaved?.model || 'ยังไม่ทราบ'}</strong> · Strict JSON: {aiSaved?.structuredOutput?'เปิด':'ปิด'}</p>
        <p className="text-sm text-slate-600">โมเดลที่กำลังเลือก: {aiModel || 'ยังไม่เลือก'} {aiValidated?'· ตรวจ Catalog แล้ว':'· ยังไม่ตรวจ Catalog'}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={aiBusy||!aiModel} onClick={()=>void validateAiSelection()} className="rounded-xl border border-slate-400 px-4 py-3">ตรวจ Model ID</button>
          <button type="button" disabled={aiBusy||!aiModel||!aiValidated} onClick={()=>void saveAiModel()} className="rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:opacity-50">บันทึกโมเดล</button>
          <button type="button" disabled={aiBusy||!aiSaved||aiSaved.model!==aiModel||aiSaved.structuredOutput!==aiStructured} onClick={()=>void testAi()} className="rounded-xl border border-teal-700 px-4 py-3 font-semibold text-teal-800 disabled:opacity-50">ทดสอบ AI</button>
        </div>
        {aiMessage&&<p role="status" className="text-sm text-slate-700">{aiMessage}</p>}
        {aiResult&&<div className="rounded-xl bg-slate-50 p-3 text-sm" aria-live="polite">
          <p>สถานะ: {String(aiResult.status||'unknown')}</p>
          <p>Validation Error: {String(aiResult.errorCode ?? 'ไม่มี')}</p>
          <p>Validation Reason: {String(aiResult.errorReason ?? 'ไม่รายงาน')}</p>
          <p>Provider Error: {String(aiResult.providerErrorType ?? 'ไม่รายงาน')}</p>
          <p>Provider Code: {String(aiResult.providerErrorCode ?? 'ไม่รายงาน')}</p>
          <p>Request ID: {String(aiResult.requestId ?? 'ไม่รายงาน')}</p>
          <p>Finish Reason: {String(aiResult.finishReason ?? 'ไม่รายงาน')}</p>
          {typeof aiResult.retryAfterSeconds === 'number' && <p>รออีก {aiResult.retryAfterSeconds} วินาที</p>}
          <p>โมเดล: {String(aiResult.model||'unknown')}</p>
          <p>HTTP OpenRouter: {String(aiResult.upstreamHttpStatus??'ไม่ทราบ')}</p>
          <p>Tokens: {String((aiResult.usage as {totalTokens?:number|null}|undefined)?.totalTokens??'ไม่ทราบ')}</p>
          <p>ค่าใช้จ่าย USD: {String((aiResult.usage as {costUsd?:number|null}|undefined)?.costUsd??'ไม่รายงาน')}</p>
        </div>}
        <p className="text-xs text-slate-500">เปลี่ยนโมเดลมีผลต่อคำขอใหม่ทันที ไม่เรียกโมเดลเสียเงินโดยอัตโนมัติ และ Health Check จำกัดทุก 5 นาที</p>
      </section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">รอดำเนินการ</p><p className="mt-1 text-2xl font-bold text-teal-700">{activeDrafts.length}</p><p className="text-xs text-slate-500">ฉบับร่าง</p></div>
        <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">เผยแพร่ผ่าน CMS</p><p className="mt-1 text-2xl font-bold">{drafts.filter(d => d.status === 'published').length}</p><p className="text-xs text-slate-500">รายการ</p></div>
        <div className="col-span-2 flex items-center gap-3 rounded-xl border bg-white p-4 sm:col-span-1"><CheckCircle2 className="text-emerald-600" /><div><p className="font-medium">ระบบจัดการเนื้อหา</p><p className="text-xs text-slate-500">เข้าสู่ระบบแล้ว</p></div></div>
      </div>
      <nav aria-label="ส่วนจัดการสถานที่" className="grid grid-cols-2 gap-2 rounded-2xl border bg-white p-2 shadow-sm sm:grid-cols-4">
        {([{ id: 'new', label: 'เพิ่ม / แก้ไข', Icon: Plus }, { id: 'existing', label: 'แก้ไขสถานที่ที่เผยแพร่แล้ว', Icon: Search }, { id: 'drafts', label: `ฉบับร่าง (${activeDrafts.length})`, Icon: FilePenLine }, { id: 'history', label: `ประวัติการเผยแพร่ (${publishedDrafts.length})`, Icon: Clock3 }, {id:'quality',label:'คุณภาพรายจังหวัด',Icon:ShieldCheck}] as const).map(item => <button key={item.id} type="button" aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-3 text-center text-xs font-semibold transition sm:flex-row sm:text-sm ${tab === item.id ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><item.Icon size={17} /><span>{item.label}</span></button>)}
      </nav>
      {message && <div role="status" aria-live="polite" className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">{message}</div>}
      {tab === 'existing' && <section className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
        <div><h2 className="flex items-center gap-2 text-xl font-bold"><Search className="text-teal-600" /> ค้นหาสถานที่เดิม</h2><p className="mt-1 text-sm text-slate-500">แสดงสถานที่ที่มีอยู่ใน Railway และค้นหาได้ด้วยชื่อเต็ม ชื่อย่อ หรือจังหวัด</p></div>
        <form className="flex min-w-0 flex-wrap gap-2" onSubmit={event => { event.preventDefault(); void findPlaces(1, search.trim()); }}><input aria-label="ค้นหาสถานที่เดิม" className={`${inputStyle} mt-0 min-w-0 flex-1`} value={search} onChange={e => setSearch(e.target.value)} placeholder="เช่น วัดภูมโนรมย์" /><button type="submit" disabled={busy} className="rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white disabled:opacity-50">ค้นหา</button></form>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500"><span>พบ {catalogTotal} สถานที่ {catalogQuery ? '(ตามคำค้นล่าสุด)' : '(ทั้งหมด)'}</span><button type="button" className="font-medium text-teal-700 underline" disabled={busy} onClick={() => { setSearch(''); setSearched(false); }}>แสดงทั้งหมด</button></div>
        {searched && !catalog.length && <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">ไม่พบสถานที่ ลองใช้คำค้นที่สั้นลงหรือชื่อจังหวัด</p>}
        <div className="divide-y">{catalog.map(place => <div key={place.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="min-w-0"><p className="break-words font-semibold">{place.name_local || place.name}</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {place.province}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void manageAliases(place)} className="rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50">ชื่อเรียกอื่น</button><button type="button" disabled={busy} onClick={() => void editExisting(place)} className="rounded-xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-50" >แก้ไขสถานที่ที่เผยแพร่แล้ว</button></div></div>)}</div>
        {aliasPlace && <section className="space-y-3 rounded-xl border border-teal-200 bg-teal-50 p-4" aria-label="จัดการชื่อเรียกสถานที่">
          <div className="flex items-center justify-between gap-2"><h3 className="font-semibold">ชื่อเรียกอื่น: {aliasPlace.name_local || aliasPlace.name}</h3><button type="button" className="text-sm underline" onClick={() => setAliasPlace(null)}>ปิด</button></div>
          <p className="text-xs text-slate-600">ชื่อที่เพิ่มจะรอตรวจสอบก่อน จึงไม่กระทบผลค้นหาบนเว็บไซต์ทันที</p>
          <form className="flex flex-wrap gap-2" onSubmit={event => void addAlias(event)}><input aria-label="เพิ่มชื่อเรียกสถานที่" value={newAliasName} onChange={event => setNewAliasName(event.target.value)} maxLength={150} required minLength={2} className="min-w-0 flex-1 rounded-lg border px-3 py-2" placeholder="เช่น ชื่อท้องถิ่น หรือชื่อภาษาอังกฤษ" /><select aria-label="ภาษาของชื่อเรียก" className="rounded-lg border px-2" value={aliasLanguage} onChange={event => setAliasLanguage(event.target.value)}><option value="th">ไทย</option><option value="en">English</option><option value="other">อื่น ๆ</option></select><button type="submit" disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50">เพิ่มชื่อ</button></form>
          {placeAliases.length === 0 && <p className="text-sm text-slate-500">ยังไม่มีชื่อเรียกเพิ่มเติม</p>}
          <div className="space-y-2">{placeAliases.map(alias => <div key={alias.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3"><div><p className="font-medium">{alias.alias_name}</p><p className="text-xs text-slate-500">{alias.language} · {alias.status === 'approved' ? 'อนุมัติแล้ว' : alias.status === 'rejected' ? 'ปฏิเสธแล้ว' : 'รอตรวจสอบ'}</p></div>{alias.status === 'pending' && <div className="flex gap-2"><button type="button" disabled={busy} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white disabled:opacity-50" onClick={() => void reviewAlias(alias, 'approved')}>อนุมัติ</button><button type="button" disabled={busy} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50" onClick={() => void reviewAlias(alias, 'rejected')}>ปฏิเสธ</button></div>}</div>)}</div>
        </section>}
        {catalogTotal > 30 && <div className="flex items-center justify-between gap-3 border-t pt-4"><button type="button" disabled={busy || catalogPage === 1} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40" onClick={() => void findPlaces(catalogPage - 1, catalogQuery)}>ก่อนหน้า</button><span className="text-sm text-slate-500">หน้า {catalogPage} / {Math.ceil(catalogTotal / 30)}</span><button type="button" disabled={busy || catalogPage * 30 >= catalogTotal} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40" onClick={() => void findPlaces(catalogPage + 1, catalogQuery)}>ถัดไป</button></div>}
      </section>}
      {tab === 'new' && <form onSubmit={save} className="space-y-6 rounded-2xl border bg-white p-4 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xl font-bold">{editing ? 'แก้ไขข้อมูลฉบับร่าง' : 'เพิ่มสถานที่ใหม่'}</h2><p className="mt-1 text-sm text-slate-500">ช่องที่มี * จำเป็นต้องกรอก</p></div>{editing && <button type="button" className="text-sm font-medium text-teal-700 underline" onClick={() => { setEditing(null); setForm({ ...empty }); setBrokenImage(false); setProposedCoordinate(null); setGeoCandidates([]); setGeocodeNote(''); lastAutoLookup.current = ''; void loadExistingImages(); }}>เริ่มรายการใหม่</button>}</div>
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
          {existingImages.filter(image => !form.removedImageUrls.includes(image.url)).length > 0 && <div className="space-y-3 rounded-xl bg-white p-3">
            <div><h4 className="font-semibold">รูปภาพที่ใช้อยู่บนเว็บไซต์ ({existingImages.filter(image => !form.removedImageUrls.includes(image.url)).length})</h4><p className="text-xs text-slate-500">เลือกรูปหลักหรือทำเครื่องหมายลบรูปเดิม การเปลี่ยนแปลงจะมีผลเมื่อบันทึกฉบับร่างและเผยแพร่</p></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{existingImages.filter(image => !form.removedImageUrls.includes(image.url)).map(image => <div key={image.id} className={`min-w-0 overflow-hidden rounded-xl border-2 ${form.imageUrl === image.url ? 'border-teal-600' : 'border-slate-200'}`}>
              <button type="button" className="w-full text-left" onClick={() => { setForm(current => ({ ...current, imageUrl: image.url, imageUrls: [...new Set([...current.imageUrls, image.url])] })); setBrokenImage(false); }}>
                <img src={image.url} alt={image.title || 'รูปสถานที่เดิม'} className="aspect-[4/3] w-full bg-slate-100 object-cover" loading="lazy" />
                <span className="block truncate p-2 text-xs">{form.imageUrl === image.url ? '✓ รูปภาพหลัก' : 'เลือกเป็นรูปหลัก'}</span>
              </button>
              <button type="button" className="w-full border-t p-2 text-xs text-red-700" onClick={() => {
                if (!window.confirm('นำรูปนี้ออกจากเว็บไซต์เมื่อเผยแพร่การแก้ไขหรือไม่?')) return;
                setForm(current => { const imageUrls = current.imageUrls.filter(url => url !== image.url); return { ...current, imageUrls, removedImageUrls: [...new Set([...current.removedImageUrls, image.url])], imageUrl: current.imageUrl === image.url ? (imageUrls[0] || '') : current.imageUrl }; });
              }}>ลบรูปจากเว็บไซต์</button>
            </div>)}</div>
          </div>}
          {form.removedImageUrls.length > 0 && <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">เตรียมลบรูปเดิม {form.removedImageUrls.length} รูป เมื่อเผยแพร่การแก้ไข <button type="button" className="ml-2 underline" onClick={() => setForm(current => ({ ...current, removedImageUrls: [], imageUrls: [...new Set([...existingImages.map(image => image.url), ...current.imageUrls])] }))}>ยกเลิกการลบทั้งหมด</button></div>}
          {editing && !loadingImages && existingImages.length === 0 && <p className="rounded-lg bg-white p-3 text-sm text-slate-600">ไม่พบรูปเดิมในคลังภาพของสถานที่นี้ คุณสามารถอัปโหลดรูปใหม่ได้</p>}
          {form.imageUrls.length > 0 && <div className="space-y-2 rounded-xl bg-white p-3">
            <h4 className="font-semibold">รูปภาพที่จะเผยแพร่ ({form.imageUrls.length}/20)</h4>
            <p className="text-xs text-slate-500">แตะรูปเพื่อเลือกเป็นภาพหลัก หรือเอาออกจากชุดรูปใหม่</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.imageUrls.map(url => <div key={url} className={`overflow-hidden rounded-xl border-2 ${form.imageUrl === url ? 'border-teal-600' : 'border-slate-200'}`}>
                <button type="button" className="w-full" onClick={() => { setForm(current => ({ ...current, imageUrl: url })); setBrokenImage(false); }}>
                  <img src={url} alt="รูปในแกลเลอรี" className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <span className="block p-2 text-xs">{form.imageUrl === url ? '✓ รูปภาพหลัก' : 'เลือกเป็นรูปหลัก'}</span>
                </button>
                <button type="button" className="w-full border-t p-2 text-xs text-red-700" onClick={() => setForm(current => {
                  const imageUrls = current.imageUrls.filter(image => image !== url);
                  return { ...current, imageUrls, removedImageUrls: existingImages.some(image => image.url === url) ? [...new Set([...current.removedImageUrls, url])] : current.removedImageUrls, imageUrl: current.imageUrl === url ? (imageUrls[0] || '') : current.imageUrl };
                })}>นำออกจากรายการ</button>
              </div>)}
            </div>
          </div>}
          {previewSrc && !brokenImage && <img src={previewSrc} alt="ตัวอย่างภาพสถานที่" className="h-48 w-full rounded-xl bg-slate-100 object-cover sm:h-64" onError={() => setBrokenImage(true)} />}
          {form.imageUrl && brokenImage && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">ไม่สามารถแสดงตัวอย่างภาพได้ กรุณาตรวจสอบ URL</p>}
          <label className="block cursor-pointer rounded-xl border border-teal-200 bg-white px-4 py-5 text-center text-sm text-teal-800"><CloudUpload className="mx-auto mb-2" /><span className="font-semibold">เลือกภาพจากอุปกรณ์</span><span className="mt-1 block text-xs text-slate-500">เลือกหลายรูปพร้อมกันได้ สูงสุด 20 รูป · JPG, PNG, WebP ไม่เกิน 5 MB ต่อรูป</span><input className="mt-3 block w-full min-w-0 text-xs" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { const files = Array.from(e.target.files || []); if (files.length) void upload(files); e.target.value = ''; }} /></label>
          <label className="block text-sm font-medium">หรือใส่ URL รูปภาพ HTTPS<input className={inputStyle} type="url" value={form.imageUrl} onChange={e => { setBrokenImage(false); setForm(current => ({ ...current, imageUrl: e.target.value, imageUrls: e.target.value ? [...new Set([...current.imageUrls, e.target.value])] : current.imageUrls })); }} placeholder="https://..." /></label>
        </section>
        <div className="sticky bottom-2 z-10 rounded-xl border bg-white/95 p-2 shadow-lg backdrop-blur"><button className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50" disabled={busy} type="submit">{busy ? 'กำลังดำเนินการ...' : editing ? 'บันทึกการแก้ไขเป็นฉบับร่าง' : 'บันทึกสถานที่เป็นฉบับร่าง'}</button><p className="mt-2 text-center text-xs text-slate-500">ยังไม่เผยแพร่จนกว่าจะยืนยันในแท็บฉบับร่าง</p></div>
      </form>}
      {tab === 'quality' && <ProvinceQualityDashboard api={api} onOpenCandidate={candidate=>{const draft=candidate as Draft;setDrafts(current=>[draft,...current.filter(item=>item.id!==draft.id)]);setTab('drafts');}} />}
      {reconcile && tab === 'drafts' && <section className="space-y-3 rounded-2xl border border-amber-300 bg-white p-4 shadow-sm" aria-label="เปรียบเทียบข้อมูลล่าสุด">
        <h2 className="text-lg font-bold">เปรียบเทียบฉบับร่างกับข้อมูลล่าสุด</h2>
        <p className="text-sm text-slate-600">ติ๊กเฉพาะการแก้ไขจากฉบับร่างที่ต้องการเก็บไว้ ช่องที่ไม่เลือกจะใช้ข้อมูลล่าสุดบนเว็บไซต์</p>
        {reconcile.data.fields.map(field => {
          const names: Record<string,string> = {name:'ชื่อ',nameLocal:'ชื่อภาษาไทย',province:'จังหวัด',category:'หมวดหมู่',description:'รายละเอียด',lat:'ละติจูด',lng:'ลองจิจูด',imageUrl:'รูปหลัก'};
          const oldValue = String(reconcile.data.draft[field as keyof DraftPayload] ?? '');
          const latestValue = String(reconcile.data.latest[field as keyof DraftPayload] ?? '');
          return <label key={field} className="block rounded-lg border p-3 text-sm">
            <span className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={reconcile.selected.includes(field)} onChange={event => setReconcile(current => current && ({...current,selected:event.target.checked?[...current.selected,field]:current.selected.filter(item=>item!==field)}))} />เก็บการแก้ไข: {names[field] || field}</span>
            <span className="mt-2 block break-all text-slate-600">ฉบับร่าง: {oldValue.slice(0,250) || '(ว่าง)'}</span>
            <span className="block break-all text-teal-700">ข้อมูลล่าสุด: {latestValue.slice(0,250) || '(ว่าง)'}</span>
          </label>;
        })}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={reconcile.retainGallery} onChange={event=>setReconcile(current=>current&&({...current,retainGallery:event.target.checked}))}/>เก็บการเพิ่มและลบรูปภาพจากฉบับร่างนี้</label>
        <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} className="rounded-xl bg-teal-600 px-4 py-3 font-semibold text-white" onClick={()=>void confirmReconciliation()}>ยืนยันการแก้ไขเฉพาะส่วนที่เลือก</button><button type="button" className="rounded-xl border px-4 py-3" onClick={()=>setReconcile(null)}>ยกเลิก</button></div>
      </section>}
      {tab === 'drafts' && <section className="space-y-4"><div><h2 className="text-xl font-bold">รายการฉบับร่าง</h2><p className="mt-1 text-sm text-slate-500">ตรวจสอบและแก้ไขข้อมูลให้ถูกต้องก่อนเผยแพร่</p></div>
        {!activeDrafts.length && <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">ไม่มีฉบับร่างที่รอเผยแพร่</div>}
        {activeDrafts.map(draft => <article key={draft.id} className="space-y-3 rounded-2xl border bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><h3 className="break-words font-bold">{draft.payload.nameLocal || draft.payload.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {draft.payload.province}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${draft.status === 'draft' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{draft.status === 'draft' ? 'ฉบับร่าง · พร้อมเผยแพร่' : 'เผยแพร่แล้ว'}</span></div><p className="text-xs text-slate-500">{draft.target_place_id ? 'แก้ไขสถานที่เดิม' : 'สถานที่ใหม่'}</p><PlaceCandidateReview draft={draft} api={api} />{draft.status === 'draft' && <div className="flex flex-wrap gap-2 border-t pt-3"><button type="button" className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold" onClick={() => openDraft(draft)}>แก้ไขร่าง</button><button type="button" disabled={busy} className="flex-1 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" onClick={() => void publish(draft)}>เผยแพร่</button><button type="button" disabled={busy} className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-50" onClick={() => void deleteDraft(draft)}>ลบฉบับร่าง</button></div>}</article>)}
      </section>}      {tab === 'history' && <section className="space-y-4">
        <div><h2 className="text-xl font-bold">ประวัติการเผยแพร่</h2><p className="mt-1 text-sm text-slate-500">รายการที่เผยแพร่แล้ว แยกจากฉบับร่างที่รอดำเนินการ</p></div>
        {!publishedDrafts.length && <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">ยังไม่มีประวัติการเผยแพร่</div>}
        {publishedDrafts.map(draft => <article key={draft.id} className="rounded-2xl border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-bold">{draft.payload.nameLocal || draft.payload.name}</h3><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {draft.payload.province}</p><p className="mt-1 text-xs text-slate-500">{draft.target_place_id ? 'อัปเดตสถานที่เดิม' : 'เผยแพร่สถานที่ใหม่'}</p></div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">เผยแพร่แล้ว</span>
          </div>
        </article>)}
      </section>}

    </div>
  </main>;
}
