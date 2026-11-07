import { useState, type FormEvent } from 'react';
type Group = 'source' | 'coordinate' | 'media';
type Evidence = { source:Record<string,string>;coordinate:Record<string,string|boolean>;media:Record<string,string>;
  openingHours?:Record<string,string>;admissionFee?:Record<string,string>;
  district:string;detailSourceUrl:string;googlePlaceId:string;duplicateResolutions:{placeId:string;note:string;sourceUrl:string}[] };
type Report = {holds:string[];payloadMatches:boolean;provinceGate:string;duplicate:{matches:{placeId:string;confidence?:string;reason:string}[]}};
type Review = {state:string;revision:number;evidence:Evidence|null;report:Report|null;history:{actor_id:string;action:string;to_state:string;reason:string;created_at:string}[]};
type Props = {draft:{id:string;version:string;target_place_id?:string;payload:{name?:string|null;nameLocal?:string|null;province?:string|null;description?:string|null;imageUrl?:string|null;lat?:string|number|null;lng?:string|number|null}};
  api:(path:string,options?:RequestInit)=>Promise<unknown>;onApprovalChange:(approved:boolean,reasons?:string[])=>void};
const holdLabels:Record<string,string>={
  source_license_unverified:'ยังไม่ยืนยันแหล่งข้อมูลหรือสิทธิ์การใช้ข้อมูล',
  coordinate_hold:'หลักฐานพิกัดหรือทางเข้ายังไม่ผ่านการตรวจ',
  province_polygon_unverified:'ยังยืนยันพิกัดว่าอยู่ในขอบเขตจังหวัดไม่ได้',
  media_probe_failed:'ไฟล์รูปภาพยังไม่ผ่านการตรวจ',
  duplicate_image:'รูปภาพซ้ำกับสถานที่อื่น',
  unresolved_duplicate:'พบสถานที่อาจซ้ำ ต้องตรวจสอบและแนบหลักฐานแยกรายการ',
  license_hold:'ยังไม่ยืนยันสิทธิ์การใช้ข้อมูลหรือรูปภาพ',
  draft_changed_since_review:'ข้อมูลฉบับร่างเปลี่ยน ต้องบันทึกหลักฐานใหม่',
};
export const publishHoldLabel=(hold:string)=>holdLabels[hold]||'ยังไม่ผ่านการตรวจ: '+hold.replace(/_/g,' ');
const licences=['','Operator permission','CC0 1.0','CC BY 4.0','CC BY 3.0','CC BY 3.0 au','CC BY 2.0','CC BY-SA 4.0','CC BY-SA 3.0','CC BY-SA 2.0','Public domain'];
const fieldGroups:{group:Group;title:string;fields:[string,string][]}[]=[
  {group:'source',title:'แหล่งข้อมูลสถานที่และสิทธิ์',fields:[['namespace','ระบบรหัสแหล่งข้อมูล เช่น tat หรือ operator'],['id','รหัสสถานที่จากแหล่งข้อมูล'],['name','ชื่อแหล่งข้อมูล'],['url','URL หลักฐานสถานที่'],['licenseUrl','URL เงื่อนไขสิทธิ์'],['permissionUrl','URL หลักฐานการอนุญาต'],['checkedAt','วันที่ตรวจแหล่งข้อมูล']]},
  {group:'coordinate',title:'หลักฐานพิกัดจากแหล่งอิสระ',fields:[['sourceUrl','URL แหล่งพิกัดอิสระ'],['licenseUrl','URL สิทธิ์พิกัด'],['permissionUrl','URL การอนุญาตใช้พิกัด'],['publicAccessUrl','URL ยืนยันการเข้าสาธารณะ'],['authorityUrl','URL อนุญาตโดยหน่วยงาน (พื้นที่จำกัด)'],['checkedAt','วันที่ตรวจพิกัด']]},
  {group:'media',title:'สิทธิ์ภาพหลัก',fields:[['photographer','เจ้าของภาพ / ช่างภาพ'],['sourcePage','URL หน้าต้นฉบับภาพ'],['licenseUrl','URL สิทธิ์ภาพ'],['permissionUrl','URL การอนุญาตใช้ภาพ']]},
];
export default function PlaceApprovalReview({draft,api,onApprovalChange}:Props) {
  const [review,setReview]=useState<Review|null>(null);
  const [evidence,setEvidence]=useState<Evidence>({source:{},coordinate:{},media:{url:draft.payload.imageUrl||''},district:'',detailSourceUrl:'',googlePlaceId:'',duplicateResolutions:[]});
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[attested,setAttested]=useState(false),[reason,setReason]=useState('');
  const path=`/places/${encodeURIComponent(draft.id)}`;
  async function load() {
    const data=await api(path+'/review') as Review;setReview(data);
    if(data.evidence)setEvidence(data.evidence);
    const reasons:string[]=[];
    if(!data.evidence)reasons.push('ยังไม่ได้บันทึกหลักฐานแหล่งข้อมูลและพิกัด');
    if(data.state==='REJECTED')reasons.push('รายการถูกปฏิเสธ ต้องแก้ไขก่อนเผยแพร่');
    if(data.report&&!data.report.payloadMatches)reasons.push('ข้อมูลฉบับร่างเปลี่ยน ต้องบันทึกหลักฐานใหม่');
    if(data.report)reasons.push(...data.report.holds.map(publishHoldLabel));
    if(!data.report)reasons.push('ยังไม่มีผลตรวจคุณภาพ');
    onApprovalChange(reasons.length===0&&data.state!=='PUBLISHED',reasons);
    return data;
  }
  async function run(action:()=>Promise<unknown>) {
    setBusy(true);setError('');onApprovalChange(false);
    try{await action();}catch(e){setError(e instanceof Error?e.message:'ไม่สามารถดำเนินการได้');}finally{setBusy(false);}
  }
  function update(group:Group,key:string,value:string|boolean) {setEvidence(current=>({...current,[group]:{...current[group],[key]:value}}));setAttested(false);onApprovalChange(false);}
  async function save(event:FormEvent) {
    event.preventDefault();if(!attested||!review)return;
    await run(async()=>{await api(path+'/evidence',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({version:draft.version,revision:review.revision,evidence:{...evidence,media:{...evidence.media,url:draft.payload.imageUrl||''}}})});await load();setAttested(false);});
  }
  async function transition(action:string) {
    await run(async()=>{await api(path+'/review-transition',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,revision:review?.revision,reason})});await load();});
  }
  return <section className="space-y-3 border-t pt-3" data-testid="place-approval-review">
    <button type="button" disabled={busy} className="rounded-xl border px-4 py-2 text-sm font-semibold" onClick={()=>void run(load)}>ตรวจหลักฐานและคุณภาพอัตโนมัติ</button>
    {error&&<p role="alert" className="break-words text-sm text-red-700">{error}</p>}
    {review&&<div className="space-y-4 rounded-xl border bg-slate-50 p-3 text-sm">
      <p>ขั้นตรวจ: <strong>{review.state}</strong> · รุ่นหลักฐาน {review.revision}</p>
      <details><summary className="cursor-pointer font-semibold">ดูข้อมูลก่อนเผยแพร่</summary><p>{draft.payload.nameLocal||draft.payload.name} · {draft.payload.province}</p><p>{draft.payload.description}</p><p>พิกัดที่เสนอ: {draft.payload.lat}, {draft.payload.lng}</p></details>
      {review.report&&<div><p>ขอบเขตจังหวัด: {review.report.provinceGate}</p>{!review.report.payloadMatches&&<p className="text-amber-800">ข้อมูลร่างเปลี่ยนแล้ว ต้องตรวจหลักฐานใหม่</p>}
        {!!review.report.holds.length&&<ul className="list-inside list-disc break-words text-amber-800">{review.report.holds.map(h=><li key={h}>{publishHoldLabel(h)}</li>)}</ul>}</div>}
      {!['PUBLISHED'].includes(review.state)&&<form onSubmit={event=>void save(event)} className="space-y-4">
        {fieldGroups.filter(group=>group.group!=='media'||draft.payload.imageUrl).map(group=><fieldset key={group.group} className="space-y-2 rounded-lg border p-3"><legend className="px-1 font-semibold">{group.title}</legend>
          {group.fields.map(([key,title])=><label key={key} className="block">{title}<input className="mt-1 w-full min-w-0 rounded-lg border bg-white p-2" type={key==='checkedAt'?'date':'text'}
            value={String(evidence[group.group][key]||'').split(key==='checkedAt'?'T':'\u0000')[0]} onChange={event=>update(group.group,key,event.target.value)}/></label>)}
          <label className="block">สิทธิ์การใช้ ({group.title})<select className="mt-1 w-full rounded-lg border p-2" value={String(evidence[group.group].licenseName||'')} onChange={event=>update(group.group,'licenseName',event.target.value)}>{licences.map(l=><option key={l} value={l}>{l||'ยังไม่ยืนยันสิทธิ์'}</option>)}</select></label>
        </fieldset>)}
        <label className="block">ชนิดจุดนำทาง<select className="mt-1 w-full rounded-lg border p-2" value={String(evidence.coordinate.kind||'unknown')} onChange={event=>update('coordinate','kind',event.target.value)}>
          <option value="unknown">ยังไม่ระบุ</option><option value="site_center">จุดกลางสถานที่</option><option value="vehicle_entrance">ทางเข้ารถยนต์</option><option value="parking">ลานจอดรถ</option><option value="trailhead">จุดเริ่มเดินเท้า</option></select></label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={evidence.coordinate.restricted===true} onChange={event=>update('coordinate','restricted',event.target.checked)}/>เป็นพื้นที่จำกัดหรือพื้นที่ทหาร</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={evidence.coordinate.publicNavigationPoint===true} onChange={event=>update('coordinate','publicNavigationPoint',event.target.checked)}/>ยืนยันว่าหน่วยงานอนุญาตจุดนำทางนี้</label>
        <label className="block">URL อ้างอิงรายละเอียด<input className="mt-1 w-full rounded-lg border p-2" value={evidence.detailSourceUrl} onChange={event=>{setEvidence({...evidence,detailSourceUrl:event.target.value});setAttested(false);onApprovalChange(false);}}/></label>
        <label className="block">อำเภอ (เมื่อมีหลักฐาน)<input className="mt-1 w-full rounded-lg border p-2" value={evidence.district} onChange={event=>{setEvidence({...evidence,district:event.target.value});setAttested(false);onApprovalChange(false);}}/></label>
        {(['openingHours','admissionFee'] as const).map(fact=><fieldset key={fact} className="space-y-2 rounded-lg border p-3"><legend>{fact==='openingHours'?'เวลาเปิดปิด (ไม่จำเป็นต้องมี)':'ค่าเข้าชม (ไม่จำเป็นต้องมี)'}</legend>
          {(['text','sourceUrl','checkedAt'] as const).map(key=><label key={key} className="block">{key==='text'?'ข้อความจากหลักฐาน':key==='sourceUrl'?'URL อ้างอิงข้อมูลปัจจุบัน':'วันที่ตรวจ (ภายใน 30 วัน)'}<input className="mt-1 w-full rounded-lg border p-2" type={key==='checkedAt'?'date':'text'} value={evidence[fact]?.[key]?.split(key==='checkedAt'?'T':'\u0000')[0]||''}
            onChange={event=>{setEvidence(current=>({...current,[fact]:{...current[fact],[key]:event.target.value}}));setAttested(false);onApprovalChange(false);}}/></label>)}
        </fieldset>)}
        <label className="block">Google Place ID (เก็บเฉพาะรหัส)<input className="mt-1 w-full rounded-lg border p-2" value={evidence.googlePlaceId} onChange={event=>{setEvidence({...evidence,googlePlaceId:event.target.value});setAttested(false);onApprovalChange(false);}}/></label>
        {review.report?.duplicate.matches.filter(m=>m.placeId!==draft.target_place_id).map(match=><div key={match.placeId} className="space-y-2 rounded-lg border p-2"><p>ตรวจความซ้ำกับ {match.placeId}: {match.reason}</p>
          {match.confidence==='identifier_match'?<p>รหัสตรงกัน ต้องแก้รายการเดิมเท่านั้น</p>:['note','sourceUrl'].map(key=><label className="block" key={key}>{key==='note'?'เหตุผลที่ยืนยันว่าเป็นคนละสถานที่ (อย่างน้อย 10 ตัวอักษร)':'URL หลักฐานแยกสถานที่'}<input className="mt-1 w-full rounded border p-2" value={evidence.duplicateResolutions.find(r=>r.placeId===match.placeId)?.[key as 'note'|'sourceUrl']||''} onChange={event=>{setEvidence(current=>({...current,duplicateResolutions:[...current.duplicateResolutions.filter(r=>r.placeId!==match.placeId),{placeId:match.placeId,note:'',sourceUrl:'',...current.duplicateResolutions.find(r=>r.placeId===match.placeId),[key]:event.target.value}]}));setAttested(false);onApprovalChange(false);}}/></label>)}</div>)}
        <label className="flex items-start gap-2"><input type="checkbox" checked={attested} onChange={event=>setAttested(event.target.checked)}/>ฉันตรวจแหล่งอ้างอิง สิทธิ์ พิกัดและการเข้าถึงแล้ว และไม่ได้นำ Google Content มาบันทึก</label>
        <button type="submit" disabled={busy||!attested} className="rounded-lg bg-slate-800 px-4 py-2 text-white disabled:opacity-50">บันทึกหลักฐานเข้าตรวจ</button>
      </form>}
      <div className="flex flex-wrap gap-2">
        {review.state==='STAGED'&&draft.payload.imageUrl&&<button type="button" disabled={busy} className="rounded-lg border p-2" onClick={()=>void run(async()=>{await api(path+'/probe-media',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:review.revision})});await load();})}>ตรวจไฟล์ภาพจริง</button>}
        {Object.entries({verify:['STAGED']}).filter(([,states])=>states.includes(review.state)).map(([action])=><button key={action} type="button" disabled={busy} className="rounded-lg bg-teal-700 px-4 py-2 text-white" onClick={()=>void transition(action)}>{{verify:'ตรวจทุก Gate'}[action]}</button>)}
      </div>
      {!['PUBLISHED','REJECTED','DISCOVERED'].includes(review.state)&&<div className="space-y-2"><label className="block">เหตุผลการตรวจ<input className="mt-1 w-full rounded border p-2" value={reason} onChange={event=>setReason(event.target.value)}/></label>
        <button type="button" disabled={busy||reason.trim().length<5} className="mr-2 rounded-lg border p-2" onClick={()=>void transition('reject')}>ปฏิเสธรายการ</button>
        {['REVIEW_PENDING','APPROVED','POSSIBLE_DUPLICATE','LICENSE_HOLD','COORDINATE_HOLD'].includes(review.state)&&<button type="button" disabled={busy||reason.trim().length<5} className="rounded-lg border p-2" onClick={()=>void transition('request_changes')}>ขอแก้ไขหลักฐาน</button>}</div>}
      <details><summary className="cursor-pointer font-semibold">ประวัติการตรวจ</summary><ul className="space-y-2">{review.history.map((entry,index)=><li key={index} className="break-words">{entry.actor_id} · {entry.action} → {entry.to_state} · {entry.reason} · {new Date(entry.created_at).toLocaleString('th-TH')}</li>)}</ul></details>
    </div>}
  </section>;
}
