import {useState} from 'react';
const THAI_PROVINCES = ["กรุงเทพมหานคร","กระบี่","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร","ขอนแก่น","จันทบุรี","ฉะเชิงเทรา","ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่","ตรัง","ตราด","ตาก","นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน","บึงกาฬ","บุรีรัมย์","ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี","พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่","ภูเก็ต","มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน","ยโสธร","ยะลา","ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี","ลพบุรี","ลำปาง","ลำพูน","เลย","ศรีสะเกษ","สกลนคร","สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์","หนองคาย","หนองบัวลำภู","อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี"];
type DiscoveryCandidate={sourceId:string;name:string;lat:number|null;lng:number|null;mapsUrl?:string|null;duplicateStatus?:string;duplicateMatches?:{placeId:string;name:string;reason:string;distanceMeters:number|null}[];holds?:string[]};
type Candidate={id:string;version:string;status:string;state:string;payload:Record<string,string|number|null>;target_place_id?:string};
type Province={province:string;existing:{total:number;missing_images:number;missing_details:number;last_verified:string|null};review:{discovered:number;duplicates:number;license_hold:number;coordinate_hold:number;approved:number;published:number;confirmed_new:number}};
type Job={id:string;state:string;candidate_count:number;next_index:number;result:{draftId:string;state:string;holds:string[]}[]};
type Props={api:(path:string,options?:RequestInit)=>Promise<unknown>;onOpenCandidate:(candidate:Candidate)=>void};
export default function ProvinceQualityDashboard({api,onOpenCandidate}:Props) {
  const [provinces,setProvinces]=useState<Province[]>([]),[province,setProvince]=useState('ชลบุรี');
  const [queue,setQueue]=useState<Candidate[]>([]),[page,setPage]=useState(1),[total,setTotal]=useState(0);
  const [batch,setBatch]=useState<{province:string;candidates:unknown[]}|null>(null),[requestKey,setRequestKey]=useState('');
  const [discovery,setDiscovery]=useState<DiscoveryCandidate[]>([]),[discoveryStatus,setDiscoveryStatus]=useState('');
  const [draftResult,setDraftResult]=useState('');
  const [job,setJob]=useState<Job|null>(null),[jobId,setJobId]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function run(action:()=>Promise<unknown>) {setBusy(true);setError('');try{await action();}catch(e){setError(e instanceof Error?e.message:'ดำเนินการไม่สำเร็จ');}finally{setBusy(false);}}
  async function loadQueue(nextPage:number,selected=province) {
    const result=await api(`/candidate-queue?province=${encodeURIComponent(selected)}&page=${nextPage}`) as {candidates:Candidate[];total:number};
    setQueue(result.candidates);setTotal(result.total);setPage(nextPage);
  }
  async function load() {const result=await api('/province-quality') as {provinces:Province[]};setProvinces(result.provinces);await loadQueue(1);}
  async function readBatch(file:File) {
    if(file.size>200000)throw Error('ไฟล์ต้องไม่เกิน 200 KB');
    const value=JSON.parse(await file.text()) as {province?:string;candidates?:unknown[]};
    if(typeof value.province!=='string'||!Array.isArray(value.candidates)||value.candidates.length<1||value.candidates.length>20)throw Error('ใช้ JSON หนึ่งจังหวัดและ 1–20 รายการ พร้อม payload/evidence ของแต่ละแห่ง');
    setBatch({province:value.province,candidates:value.candidates});setRequestKey(crypto.randomUUID());setJob(null);
  }
  async function searchGoogle() {
    setDiscovery([]);setDiscoveryStatus('กำลังค้นหา...');
    try {
      const result=await api('/google-place-discovery/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({province,sources:['google'],limit:10})}) as {status?:string;candidates?:DiscoveryCandidate[];warning?:string};
      setDiscovery(result.candidates||[]);
      setDiscoveryStatus(result.candidates?.length ? 'ตัวอย่างจาก Google '+result.candidates.length+' รายการ · แสดงชั่วคราวเท่านั้น ห้ามนำเข้าข้อมูล Google' : 'ไม่พบรายการในผลค้นหาชุดนี้ (ไม่ใช่การตรวจครบทั้งจังหวัด)');
    } catch(e) {setDiscoveryStatus('ค้นหาไม่สำเร็จ: '+(e instanceof Error?e.message:'ไม่สามารถเชื่อมต่อบริการได้'));}
  }
  async function createReferenceDraft(candidate:DiscoveryCandidate) {
    if(candidate.duplicateStatus!=='not_detected')throw Error('สถานที่อาจซ้ำ ต้องตรวจสอบก่อนสร้างฉบับร่าง');
    const placeId=candidate.sourceId.startsWith('google:')?candidate.sourceId.slice(7):'';
    if(!placeId)throw Error('ไม่พบ Google Place ID');
    const result=await api('/places/google-reference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId})}) as {id:string;existing?:boolean};
    setDraftResult((result.existing?'มีฉบับร่างนี้แล้ว':'สร้างฉบับร่างสำเร็จ')+' · รหัส '+result.id+' · ชื่อและพิกัดต้องได้รับการยืนยันโดย Admin ก่อนเผยแพร่');
    await loadQueue(1);
  }
  const selected=provinces.find(p=>p.province===province);
  return <section className="space-y-4 rounded-2xl border bg-white p-4 sm:p-6" data-testid="province-quality-dashboard">
    <h2 className="text-xl font-bold">คิวตรวจและคุณภาพข้อมูลรายจังหวัด</h2>
    <p className="text-sm text-slate-600">จำนวนด้านล่างเป็นข้อมูลที่ตรวจนับได้ ไม่ใช่จำนวนสถานที่ทั้งหมดที่ควรมี และไม่มีการเผยแพร่อัตโนมัติ</p>
    <button type="button" disabled={busy} className="rounded-xl border px-4 py-2" onClick={()=>void run(load)}>โหลดคิวและสถิติจังหวัด</button>
    {error&&<p role="alert" className="break-words text-sm text-red-700">{error}</p>}
    {<label className="block text-sm">จังหวัด<select className="ml-2 rounded-lg border p-2" value={province} onChange={event=>{setProvince(event.target.value);void run(()=>loadQueue(1,event.target.value));}}>{THAI_PROVINCES.map(p=><option key={p}>{p}</option>)}</select></label>}
    <div className="space-y-3 rounded-xl border p-3">
      <button type="button" disabled={busy||province!=='ชลบุรี'} className="rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50" onClick={()=>void run(searchGoogle)}>ค้นหาสถานที่ท่องเที่ยวใหม่</button>
      <p className="text-sm text-slate-600">Google Places (New) เฉพาะชลบุรี · สูงสุด 10 รายการต่อครั้ง · แสดงข้อมูลชั่วคราว ไม่บันทึกข้อมูล Google ลงฐานข้อมูล</p>
      {discoveryStatus&&<p role="status" className="text-sm">{discoveryStatus}</p>}
      {discovery.length>0&&<ul className="grid gap-3 sm:grid-cols-2">{discovery.map(c=><li key={c.sourceId} className="min-w-0 space-y-2 rounded-xl border p-3 text-sm">
        <h3 className="break-words font-semibold text-base">{c.name}</h3>
        <p className="break-all text-slate-600">พิกัด: {c.lat===null||c.lng===null?'ไม่พบพิกัด':c.lat.toFixed(6)+', '+c.lng.toFixed(6)}</p>
        <p className={c.duplicateStatus==='not_detected'?'text-green-700':'text-amber-700'}>{c.duplicateStatus==='existing_place'?'พบ Google Place ID ที่มีอยู่แล้ว':c.duplicateStatus==='possible_duplicate'?'อาจซ้ำกับสถานที่เดิม':'ไม่พบรายการซ้ำจากการตรวจเบื้องต้น'}</p>
        {!!c.duplicateMatches?.length&&<p className="break-words text-slate-600">รายการที่ตรงกัน: {c.duplicateMatches.map(m=>m.name+' ('+(m.reason==='google_place_id'?'รหัส Google':m.reason==='name'?'ชื่อ':'พิกัดใกล้กัน')+')').join(', ')}</p>}
        <p className="text-slate-600">สร้างฉบับร่างได้ทันทีโดยไม่บันทึกชื่อหรือพิกัดจาก Google · Admin กรอกและยืนยันข้อมูลก่อนเผยแพร่</p>
        <div className="flex flex-wrap gap-2">
          {c.mapsUrl&&<a href={c.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border px-3 py-2">ดูใน Google Maps</a>}
          <button type="button" disabled={busy||c.duplicateStatus!=='not_detected'} className="rounded-lg bg-teal-700 px-3 py-2 text-white disabled:opacity-50" onClick={()=>void run(()=>createReferenceDraft(c))}>สร้างฉบับร่าง</button>
        </div>
      </li>)}</ul>}
      {draftResult&&<p role="status" className="break-all text-green-700">{draftResult}</p>}
    </div>
    {selected&&<div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">{[
      ['มีในฐานข้อมูล',selected.existing.total],['ค้นพบเข้าคิว',selected.review.discovered],['ยืนยันรายการใหม่',selected.review.confirmed_new],['เสี่ยงซ้ำ',selected.review.duplicates],
      ['รอสิทธิ์',selected.review.license_hold],['รอพิกัด',selected.review.coordinate_hold],['อนุมัติ',selected.review.approved],['เผยแพร่ผ่านคิว',selected.review.published],
      ['ขาดภาพ',selected.existing.missing_images],['ขาดรายละเอียด',selected.existing.missing_details],
    ].map(([title,count])=><div key={title} className="rounded-xl bg-slate-50 p-3"><p>{title}</p><strong>{count}</strong></div>)}
      <p className="col-span-2">ตรวจข้อมูลล่าสุด: {selected.existing.last_verified?new Date(selected.existing.last_verified).toLocaleDateString('th-TH'):'ยังไม่ยืนยัน'}</p></div>}
    {!!queue.length&&<ul className="space-y-2">{queue.map(candidate=><li key={candidate.id} className="flex flex-wrap justify-between gap-2 rounded-lg border p-3 text-sm"><span className="break-words">{candidate.payload.nameLocal||candidate.payload.name} · {candidate.state}</span><button type="button" className="rounded-lg border px-3 py-1" onClick={()=>onOpenCandidate(candidate)}>ตรวจรายการ</button></li>)}</ul>}
    {!!total&&<div className="flex items-center gap-3 text-sm"><button type="button" disabled={busy||page===1} onClick={()=>void run(()=>loadQueue(page-1))}>หน้าก่อน</button><span>หน้า {page} · ทั้งหมด {total} รายการ</span><button type="button" disabled={busy||page*30>=total} onClick={()=>void run(()=>loadQueue(page+1))}>หน้าถัดไป</button></div>}
    <details className="space-y-3 rounded-xl border p-3"><summary className="cursor-pointer font-semibold">จัดข้อมูลอิสระเข้าคิวตรวจทีละจังหวัด</summary>
      <p className="mt-3 text-sm text-slate-600">ใช้ข้อมูลจริงจากแหล่งที่ระบุสิทธิ์ได้ ไม่รับ Google Content ขั้นตอนนี้สร้างฉบับร่างให้ตรวจเท่านั้น</p>
      <label className="block text-sm">ไฟล์ JSON (ไม่เกิน 20 รายการ)<input className="mt-2 block w-full min-w-0 text-sm" type="file" accept="application/json,.json" disabled={busy} onChange={event=>{const file=event.target.files?.[0];if(file)void run(()=>readBatch(file));}}/></label>
      {batch&&<div className="mt-3 space-y-2 text-sm"><p>{batch.province} · {batch.candidates.length} รายการ</p><button type="button" disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2 text-white" onClick={()=>void run(async()=>{const result=await api('/province-import-jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...batch,requestKey})}) as Job;setJob(result);setJobId(result.id);})}>สร้างฉบับร่างเข้าคิวตรวจ</button></div>}
      <label className="mt-4 block text-sm">รหัสงานเดิมเพื่อทำต่อ<input className="mt-1 w-full rounded-lg border p-2" value={jobId} onChange={event=>setJobId(event.target.value)}/></label>
      <button type="button" disabled={busy||!jobId} className="mt-2 rounded-lg border px-3 py-2 text-sm" onClick={()=>void run(async()=>setJob(await api('/province-import-jobs/'+encodeURIComponent(jobId)) as Job))}>โหลดสถานะงานเดิม</button>
      {job&&<div className="mt-3 space-y-2 text-sm"><p className="break-all">{job.id}</p><p>{job.state} · ตรวจแล้ว {job.next_index}/{job.candidate_count} รายการ</p>
        <button type="button" disabled={busy||job.state==='REVIEW_PENDING'} className="rounded-lg border px-3 py-2" onClick={()=>void run(async()=>{setJob(await api(`/province-import-jobs/${encodeURIComponent(job.id)}/resume`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'}) as Job);await loadQueue(1);})}>ตรวจชุดถัดไป (ไม่เกิน 5 รายการ)</button>
        <p>ขั้นถัดไปต้องตรวจหลักฐานและอนุมัติแต่ละรายการก่อนเผยแพร่</p></div>}
    </details>
  </section>;
}
