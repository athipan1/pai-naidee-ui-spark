import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminMediaPreview from './AdminMediaPreview';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export type DuplicateCandidate = {
  placeId: string; name: string; nameLocal?: string; province: string; category: string;
  lat?: number; lng?: number; imageUrl?: string; reasons: string[]; canResolve: boolean;
};
type PlaceData = {
  name?: string; nameLocal?: string; description?: string; descriptionEn?: string; province?: string;
  lat?: number; lng?: number; category?: string; categories?: string[]; tags?: string[];
  imageUrl?: string; imageUrls?: string[]; removedImageUrls?: string[];
};
export type ResolutionDraft = { id: string; status: string; target_place_id?: string; payload: PlaceData; version: string };
type Comparison = {
  source: PlaceData; published: PlaceData; existingEdit: ResolutionDraft | null; gallery: string[];
  sourceVersion: string; targetVersion: string; galleryVersion: string;
};
type Request = (path: string, options?: RequestInit) => Promise<Response>;
type Choice = 'keep' | 'draft' | 'merge' | 'clear';

const fieldLabels = {
  nameLocal: 'ชื่อภาษาไทย', name: 'ชื่อภาษาอังกฤษ', description: 'รายละเอียดภาษาไทย',
  descriptionEn: 'รายละเอียดภาษาอังกฤษ', province: 'จังหวัด', coordinates: 'พิกัด',
  categories: 'หมวดหมู่', tags: 'หัวข้อที่เกี่ยวข้อง',
};
type Field = keyof typeof fieldLabels;
const fields = Object.keys(fieldLabels) as Field[];
const reasonLabels: Record<string, string> = {
  EXACT_NAME_MATCH: 'ชื่อและจังหวัดตรงกัน',
  EXTERNAL_IDENTITY_MATCH: 'รหัสสถานที่จากแหล่งข้อมูลตรงกัน',
};
const buttonStyle = 'min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-800 dark:focus-visible:ring-teal-300 disabled:opacity-50';
const primaryStyle = `${buttonStyle} bg-teal-800 text-white hover:bg-teal-900 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-teal-200`;
const detailsStyle = 'min-w-0 rounded-lg bg-muted/60 p-3 text-sm [overflow-wrap:anywhere] whitespace-pre-wrap';

function fieldValue(data: PlaceData, field: Field) {
  if (field === 'coordinates') return data.lat == null || data.lng == null ? '' : `${data.lat}, ${data.lng}`;
  if (field === 'categories') return data.categories?.join(' · ') || data.category || '';
  if (field === 'tags') return data.tags?.join(' · ') || '';
  return data[field] || '';
}

export default function DuplicateResolutionDialog({
  draftId, candidates, base, request, close, openDraft, returnToSource, returnFocus,
}: {
  draftId: string; candidates: DuplicateCandidate[]; base: string; request: Request;
  close: () => void; returnToSource: () => void; openDraft: (draft: ResolutionDraft) => void;
  returnFocus?: HTMLElement | null;
}) {
  const [selected, setSelected] = useState(candidates.length === 1 ? candidates[0].placeId : '');
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [reviewExisting, setReviewExisting] = useState(false);
  const [choices, setChoices] = useState<Partial<Record<Field, Choice>>>({});
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string>();
  const [preview, setPreview] = useState<PlaceData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePage, setImagePage] = useState(0);
  const target = candidates.find(candidate => candidate.placeId === selected);
  const path = `/places/${encodeURIComponent(draftId)}/duplicate-resolution`;

  async function load() {
    setBusy(true);
    setMessage('');
    try {
      const response = await request(`${path}?targetPlaceId=${encodeURIComponent(selected)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'โหลดข้อมูลเปรียบเทียบไม่สำเร็จ');
      if (data.linkedDraft) { close(); openDraft(data.linkedDraft); return; }
      setComparison(data);
      setChoices({});
      setImages([]);
      setPrimaryImage(undefined);
      setImagePage(0);
      setPreview(null);
      setReviewExisting(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'โหลดข้อมูลเปรียบเทียบไม่สำเร็จ'); }
    finally { setBusy(false); }
  }

  async function submit(previewOnly: boolean) {
    if (!comparison) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await request(path, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          targetPlaceId: selected, sourceVersion: comparison.sourceVersion, targetVersion: comparison.targetVersion,
          galleryVersion: comparison.galleryVersion, editVersion: comparison.existingEdit?.version ?? null,
          choices, imageUrls: images, primaryImage, preview: previewOnly,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.errors?.join(', ') || 'ดำเนินการไม่สำเร็จ');
      if (previewOnly) setPreview(data.preview);
      else { close(); openDraft(data.draft); }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ดำเนินการไม่สำเร็จ');
    } finally { setBusy(false); }
  }

  const current = comparison ? { ...comparison.published, ...comparison.existingEdit?.payload } : null;
  const sourceImages = comparison ? [...new Set([comparison.source.imageUrl, ...(comparison.source.imageUrls || [])].filter((url): url is string => Boolean(url)))] : [];
  const oldGallery = comparison ? [...new Set([current?.imageUrl, ...(current?.imageUrls || []), ...comparison.gallery]
    .filter((url): url is string => Boolean(url) && !current?.removedImageUrls?.includes(url!)))] : [];
  const options = [...new Set([...oldGallery, ...images])];
  const imageCards = [...new Set([...oldGallery, ...sourceImages])];
  const heading = comparison ? 'เปรียบเทียบฉบับร่างกับสถานที่เดิม' : 'พบสถานที่นี้ในระบบแล้ว';

  return <Dialog open onOpenChange={open => { if (!open && !busy) close(); }}>
    <DialogContent
      onCloseAutoFocus={event => { if (returnFocus?.isConnected) { event.preventDefault(); returnFocus.focus(); } }}
      className="flex max-h-[94dvh] w-[calc(100%-1rem)] max-w-4xl flex-col gap-0 overflow-hidden p-0"
    >
      <DialogHeader className="px-4 pb-3 pt-5 pr-10 sm:px-6">
        <DialogTitle>{heading}</DialogTitle>
        <DialogDescription className="text-slate-600 dark:text-slate-300">นำข้อมูลที่เลือกไปปรับปรุงฉบับร่างของสถานที่เดิมได้ แล้วตรวจสอบก่อนเผยแพร่</DialogDescription>
      </DialogHeader>
      <div className="min-h-0 overflow-y-auto overflow-x-hidden px-4 py-2 sm:px-6" aria-busy={busy}>
        {message && <p role="alert" className="mb-3 rounded-lg border border-destructive/50 p-3 text-sm">{message}</p>}
        {busy && <p role="status" className="mb-3 text-sm">กำลังประมวลผล…</p>}
        {!comparison && <>
          {candidates.length > 1 && <label className="block text-sm font-medium">เลือกสถานที่เดิม
            <select className="mt-1 block min-h-11 w-full rounded-lg border bg-background px-3" value={selected}
              onChange={event => setSelected(event.target.value)}>
              <option value="">กรุณาเลือกรายการ</option>
              {candidates.map(item => <option key={item.placeId} value={item.placeId}>{item.nameLocal || item.name} · {item.province} · {item.placeId}</option>)}
            </select>
          </label>}
          {target && <div className="mt-3 grid gap-3 sm:grid-cols-[10rem_1fr]">
            {target.imageUrl && <AdminMediaPreview url={target.imageUrl} base={base} request={request}
              alt="รูปหลักของสถานที่เดิม" className="h-28 w-full rounded-lg object-cover" />}
            <div className="min-w-0 space-y-1 break-words text-sm">
              <p className="font-semibold">{target.nameLocal || target.name}</p><p>{target.name}</p>
              <p>{target.province} · {target.category}</p>
              <p>{target.lat ?? '—'}, {target.lng ?? '—'}</p>
              <p>Place ID {target.placeId}</p>
              <p>{target.reasons.map(reason => reasonLabels[reason] || reason).join(' · ')}</p>
              <Link className="inline-flex min-h-11 items-center font-medium underline" to={`/attraction/${encodeURIComponent(target.placeId)}`}
                target="_blank" rel="noopener">ดูข้อมูลสถานที่เดิม</Link>
            </div>
          </div>}
        </>}
        {comparison?.existingEdit && !reviewExisting && <section className="space-y-3 rounded-xl border p-3">
          <h3 className="font-semibold">สถานที่นี้มีฉบับร่างที่กำลังแก้ไขอยู่</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={buttonStyle} onClick={() => { close(); openDraft(comparison.existingEdit!); }}>เปิดฉบับร่างที่มีอยู่</button>
            <button type="button" className={buttonStyle} onClick={() => setReviewExisting(true)}>เปรียบเทียบและเลือกข้อมูลที่จะนำเข้า</button>
          </div>
        </section>}
        {comparison && current && (!comparison.existingEdit || reviewExisting) && <fieldset disabled={busy || Boolean(preview)} className="space-y-3">
          <legend className="sr-only">เลือกข้อมูลที่จะนำเข้า</legend>
          {fields.map(field => {
            const published = fieldValue(comparison.published, field);
            const draft = fieldValue(comparison.source, field);
            const baseValue = fieldValue(current, field);
            const status = draft === baseValue && draft ? 'ข้อมูลเหมือนกัน' : !draft ? 'ข้อมูลฉบับร่างว่าง'
              : !baseValue ? 'มีข้อมูลใหม่' : published !== baseValue ? 'ข้อมูลขัดแย้งกัน' : 'ข้อมูลเปลี่ยนแปลง';
            return <section className="space-y-2 rounded-lg border p-3" key={field}>
              <h3 className="font-semibold">{fieldLabels[field]} <span className="text-xs font-normal text-slate-600 dark:text-slate-300">{status}</span></h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className={detailsStyle}><div className="font-medium">เผยแพร่แล้ว</div>{published || '—'}
                  {comparison.existingEdit && baseValue !== published && <><div className="mt-2 font-medium">ฉบับร่างแก้ไขเดิม</div>{baseValue || '—'}</>}
                </div>
                <div className={detailsStyle}><div className="font-medium">ฉบับร่างต้นทาง</div>{draft || '—'}</div>
              </div>
              <label className="inline-flex max-w-full flex-wrap items-center gap-2 text-sm">{fieldLabels[field]}
                <select aria-label={`เลือกข้อมูล ${fieldLabels[field]}`} className="min-h-11 rounded-lg border bg-background px-2"
                  value={choices[field] || 'keep'} onChange={event => setChoices(current => ({ ...current, [field]: event.target.value as Choice }))}>
                  <option value="keep">คงข้อมูลเดิม</option>
                  <option value="draft" disabled={!draft}>ใช้ข้อมูลจากฉบับร่าง</option>
                  {(field === 'categories' || field === 'tags') && <option value="merge" disabled={!draft}>รวมข้อมูลโดยไม่ซ้ำ</option>}
                  {['nameLocal', 'description', 'descriptionEn', 'tags'].includes(field) && <option value="clear">ล้างข้อมูลฟิลด์นี้</option>}
                </select>
              </label>
            </section>;
          })}
          {imageCards.length > 0 && <section className="space-y-2 rounded-lg border p-3">
            <h3 className="font-semibold">รูปภาพหลักและแกลเลอรี</h3>
            {Boolean(current.removedImageUrls?.length) && <p className="text-sm">
              ฉบับร่างแก้ไขเดิมระบุให้ถอด {current.removedImageUrls?.length} รูปเมื่อเผยแพร่ ตรวจสอบรายการนี้ได้ในหน้าฉบับร่างหลังนำเข้า
            </p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {imageCards.slice(imagePage * 4, (imagePage + 1) * 4).map((url, i) => <div key={url} className="min-w-0">
                <AdminMediaPreview url={url} base={base} request={request} alt={`รูปภาพ ${imagePage * 4 + i + 1}`}
                  className="aspect-[4/3] w-full rounded-lg object-cover" />
                {oldGallery.includes(url) ? <p className="text-xs">{url === current.imageUrl ? 'รูปหลักเดิม' : 'เก็บรูปเดิม'}</p> :
                  <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={images.includes(url)} onChange={event => {
                    setImages(current => event.target.checked ? [...current, url] : current.filter(item => item !== url));
                    if (!event.target.checked && primaryImage === url) setPrimaryImage(undefined);
                  }} /> เพิ่มรูปนี้</label>}
              </div>)}
            </div>
            {imageCards.length > 4 && <div className="flex gap-2">
              <button type="button" className={buttonStyle} disabled={imagePage === 0} onClick={() => setImagePage(page => page - 1)}>รูปก่อนหน้า</button>
              <button type="button" className={buttonStyle} disabled={(imagePage + 1) * 4 >= imageCards.length} onClick={() => setImagePage(page => page + 1)}>รูปถัดไป</button>
            </div>}
            <label className="block text-sm">เลือกรูปหลัก
              <select value={primaryImage || ''} className="ml-2 min-h-11 rounded-lg border bg-background px-2"
                onChange={event => setPrimaryImage(event.target.value || undefined)}>
                <option value="">คงรูปหลักเดิม</option>
                {options.map(url => <option key={url} value={url}>รูปที่ {imageCards.indexOf(url) + 1}</option>)}
              </select>
            </label>
          </section>}
        </fieldset>}
        {preview && <section className="mt-3 space-y-2 rounded-lg border p-3" aria-label="ตัวอย่างก่อนยืนยัน">
          <h3 className="font-semibold">ตัวอย่างก่อนยืนยัน</h3>
          <dl className="grid gap-2 sm:grid-cols-2">{fields.map(field => <div key={field} className={detailsStyle}>
            <dt className="font-medium">{fieldLabels[field]}</dt><dd>{fieldValue(preview, field) || '—'}</dd>
          </div>)}</dl>
          <p className="text-sm">รูปภาพทั้งหมด {preview.imageUrls?.length || 0} รูป</p>
          {preview.imageUrl && <AdminMediaPreview url={preview.imageUrl} base={base} request={request} alt="ตัวอย่างรูปหลัก"
            className="h-28 w-40 rounded-lg object-cover" />}
        </section>}
      </div>
      <div className="flex flex-wrap justify-end gap-2 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" className={buttonStyle} disabled={busy} onClick={returnToSource}>กลับไปแก้ไขฉบับร่าง</button>
        {!comparison && <button type="button" disabled={busy || !target?.canResolve} className={primaryStyle} onClick={() => void load()}>นำข้อมูลฉบับร่างไปปรับปรุงสถานที่เดิม</button>}
        {comparison && message && <button type="button" disabled={busy} className={buttonStyle} onClick={() => void load()}>โหลดข้อมูลล่าสุด</button>}
        {comparison && (!comparison.existingEdit || reviewExisting) && (preview ? <>
          <button type="button" className={buttonStyle} disabled={busy} onClick={() => setPreview(null)}>กลับไปเลือกข้อมูล</button>
          <button type="button" className={primaryStyle} disabled={busy} onClick={() => void submit(false)}>ยืนยันการนำเข้าฉบับร่าง</button>
        </> : <button type="button" className={primaryStyle} disabled={busy} onClick={() => void submit(true)}>ดูตัวอย่างก่อนยืนยัน</button>)}
      </div>
    </DialogContent>
  </Dialog>;
}
