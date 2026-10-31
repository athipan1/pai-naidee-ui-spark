import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getApiBaseUrl } from '@/services/railway-api.service';

type Draft = { id: string; status: string; payload: PlaceForm };
type PlaceForm = { name: string; nameLocal: string; province: string; category: string; description: string; lat: string; lng: string; imageUrl: string };
const empty: PlaceForm = { name: '', nameLocal: '', province: '', category: 'Culture', description: '', lat: '', lng: '', imageUrl: '' };

export default function AdminCms() {
  const [token, setToken] = useState(() => {
    try { return window.sessionStorage.getItem('painaidee.admin.token'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState<PlaceForm>({ ...empty });
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
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

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const path = editing ? `/places/${editing}` : '/places';
      const data = await api(path, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      setDrafts(current => editing
        ? current.map(draft => draft.id === editing ? { ...draft, payload: form } : draft)
        : [{ id: data.id, status: 'draft', payload: form }, ...current]);
      setForm({ ...empty }); setEditing(null); setMessage('บันทึกฉบับร่างสำเร็จ ยังไม่ปรากฏบนเว็บไซต์จนกว่าจะกดเผยแพร่');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function upload(file: File) {
    setBusy(true); setMessage('');
    try {
      const data = new FormData(); data.append('image', file);
      const result = await api('/media', { method: 'POST', body: data });
      setForm(current => ({ ...current, imageUrl: result.imageUrl }));
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

  return <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
    <header className="flex items-center justify-between"><h1 className="text-2xl font-bold">จัดการสถานที่ท่องเที่ยว · PaiNaiDee</h1><button className="underline" onClick={() => void signOut()}>ออกจากระบบ</button></header>
    <p className="text-sm text-muted-foreground">สถานที่ใหม่จะอยู่ในฉบับร่างก่อนเผยแพร่ ไม่แก้ไขรายการเดิม</p>
    {message && <p role="status" className="rounded-md border p-3">{message}</p>}
    <form onSubmit={save} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      {(['name', 'nameLocal', 'province', 'category', 'lat', 'lng', 'imageUrl'] as const).map(key => <label key={key} className="space-y-1 text-sm">
        <span>{({ name: 'ชื่อสถานที่ (อังกฤษ/หลัก)', nameLocal: 'ชื่อภาษาไทย', province: 'จังหวัด', category: 'หมวดหมู่', lat: 'ละติจูด', lng: 'ลองจิจูด', imageUrl: 'URL รูปภาพ HTTPS' })[key]}</span>
        <input className="w-full rounded border bg-background p-2" value={form[key]} onChange={e => setForm(current => ({ ...current, [key]: e.target.value }))} required={['name', 'province', 'category', 'lat', 'lng'].includes(key)} />
      </label>)}
      <label className="space-y-1 text-sm"><span>อัปโหลดภาพ (JPG, PNG, WebP; ไม่เกิน 5 MB)</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); }} /></label>
      <label className="space-y-1 text-sm sm:col-span-2"><span>รายละเอียดสถานที่</span><textarea className="min-h-28 w-full rounded border bg-background p-2" value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} /></label>
      <button className="rounded bg-primary p-3 text-primary-foreground disabled:opacity-50 sm:col-span-2" disabled={busy} type="submit">{editing ? 'บันทึกการแก้ไขฉบับร่าง' : 'บันทึกสถานที่เป็นฉบับร่าง'}</button>
    </form>
    <section className="space-y-3"><h2 className="text-xl font-semibold">รายการฉบับร่าง</h2>
      {drafts.map(draft => <div key={draft.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
        <span>{draft.payload.nameLocal || draft.payload.name} · {draft.payload.province} · {draft.status === 'draft' ? 'ร่าง' : 'เผยแพร่แล้ว'}</span>
        {draft.status === 'draft' && <div className="flex gap-3"><button className="underline" onClick={() => { setEditing(draft.id); setForm({ ...empty, ...draft.payload }); window.scrollTo(0, 0); }}>แก้ไข</button><button className="font-semibold text-primary disabled:opacity-50" disabled={busy} onClick={() => void publish(draft)}>เผยแพร่</button></div>}
      </div>)}
    </section>
  </main>;
}
