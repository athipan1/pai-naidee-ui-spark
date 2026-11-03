import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, LoaderCircle, Plus, Bot, UserRound } from 'lucide-react';
import { getRailwayPlaceFacets } from '@/services/railway-api.service';
import { parseTripIntent, type TripIntent } from '@/shared/utils/tripIntent';
import TripTimelineMap from './TripTimelineMap';
import type { TripStop } from '@/shared/utils/tripPlanner';

interface Props { currentLanguage: 'th' | 'en' }
type Message = {id:number;role:'user'|'assistant';text:string;plan?:any};
const API='https://painaidee-api-production.up.railway.app';
const money=(n:number)=>'฿'+n.toLocaleString('th-TH');
const missingPrompt=(intent:TripIntent,th:boolean)=>{
  if(!intent.province)return th?'อยากไปเที่ยวจังหวัดไหนครับ?':'Which province would you like to visit?';
  if(!intent.days||intent.days>5)return th?'อยากเที่ยวกี่วันครับ? (1–5 วัน)':'How many days? (1–5)';
  if(intent.totalBudget===null)return th?'ตั้งงบประมาณรวมไว้กี่บาทครับ?':'What is your total budget in baht?';
  if(intent.issues.length)return intent.issues.join(' · ');
  return '';
};
function planStops(plan:any):TripStop[]{
 return (plan?.days??[]).flatMap((day:any)=>(day.stops??[]).flatMap((stop:any,index:number)=>{
  if(!stop?.coordinates||!stop?.id)return [];
  const place={...stop,name:stop.name||stop.nameLocal||'สถานที่ท่องเที่ยว',nameLocal:stop.nameLocal||stop.name||'สถานที่ท่องเที่ยว',province:stop.province||plan.province,category:stop.category||'Place',rating:stop.rating||0,reviewCount:stop.reviewCount||0,images:stop.images||[],tags:stop.tags||[]};
  return [{place,day:day.day,order:index+1}];
 }));
}
export default function TripPlanner({currentLanguage}:Props){
 const th=currentLanguage==='th';
 const [draft,setDraft]=useState('');
 const [messages,setMessages]=useState<Message[]>([]);
 const [pending,setPending]=useState(false);
 const [context,setContext]=useState('');
 const bottom=useRef<HTMLDivElement>(null);
 const facets=useQuery({queryKey:['places','facets'],queryFn:getRailwayPlaceFacets,staleTime:300000});
 useEffect(()=>{
  // Effects must return only a cleanup function or undefined. Some browser
  // implementations return a non-function value from scrollIntoView; returning
  // it implicitly makes React try to call that value on the next chat update.
  try{
   bottom.current?.scrollIntoView({behavior:'smooth',block:'end'});
  }catch{
   // Scrolling is optional; a browser quirk must never crash the chat.
  }
 },[messages,pending]);
 const add=(role:Message['role'],text:string,plan?:any)=>setMessages(m=>[...m,{id:Date.now()+Math.random(),role,text,plan}]);
 const submit=async(textOverride?:string)=>{
  const value=(textOverride??draft).trim();
  if(!value||pending)return;
  setDraft('');add('user',value);
  // Follow-up answers fill missing slots; a new full request starts a new plan.
  const full=/\d+\s*(วัน|days?)/i.test(value)&&/(เที่ยว|trip|จังหวัด|งบ)/i.test(value)?value:[context,value].filter(Boolean).join(' ');
  const parsed=parseTripIntent(full,facets.data?.provinces??[]);
  setContext(full);
  const question=missingPrompt(parsed,th);
  if(question){add('assistant',question);return;}
  setPending(true);
  try{
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),65000);
   let result:any=null;let usedFallback=false;
   try{
    const response=await fetch(API+'/api/ai/trip-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:full,province:parsed.province,days:parsed.days,people:parsed.people,budget:parsed.totalBudget,transport:parsed.transport}),signal:controller.signal});
    if(response.ok)result=await response.json();
    else{
     const body=await response.json().catch(()=>({}));
     if(response.status===429)throw Error(th?'มีคำขอมากเกินไป กรุณารอสักครู่':'Too many requests. Please wait.');
     if(response.status>=500||response.status===422){usedFallback=true;}else throw Error(body.error||'Unable to plan this trip');
    }
    if(usedFallback){
     const fallback=await fetch(API+'/api/trips/basic-road-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({province:parsed.province,days:parsed.days,transport:parsed.transport,maxRoadMinutes:parsed.avoidLongDrives?45:90}),signal:controller.signal});
     if(!fallback.ok)throw Error(th?'ยังไม่สามารถตรวจเส้นทางได้ กรุณาลองใหม่':'Road verification is unavailable.');
     const basic=await fallback.json();
     result={province:parsed.province,days:Array.from({length:parsed.days},(_,i)=>({day:i+1,stops:(basic.stops||[]).filter((s:any)=>s.day===i+1).map((s:any)=>s.place)})),completeness:{status:basic.status,requestedDays:parsed.days,plannedDays:new Set((basic.stops||[]).map((s:any)=>s.day)).size},provider:'smart_fallback',budget:{estimatedTotal:parsed.totalBudget}};
    }
   }finally{clearTimeout(timeout);}
   const complete=result?.completeness?.status==='complete';
   const source=usedFallback?(th?'OpenRouter AI ไม่พร้อม จึงใช้ Smart Planner ตรวจเส้นทางแทน':'AI unavailable; Smart Planner checked the roads instead'):result?.recovery?.googlePlacesUsed?(th?'AI + Smart Planner เสริมสถานที่จาก Google Maps':'AI + Smart Planner supplemented by Google Maps'):result?.recovery?(th?'AI + Smart Planner เติมเฉพาะส่วนที่ขาด':'AI + Smart Planner filled missing parts'):(th?'AI จัดแผนและตรวจเงื่อนไขแล้ว':'AI planned and checked the trip');
   add('assistant',`${source}\n${complete?(th?'จัดแผนครบตามจำนวนวันที่ขอ':'All requested days planned'):(th?'แผนบางส่วน: ยังมีวันที่หรือเส้นทางที่ตรวจสอบไม่ครบ':'Partial plan: some days or roads remain unverified')}\n${parsed.province} · ${parsed.days} ${th?'วัน':'days'} · ${money(parsed.totalBudget!)} ${th?'งบที่ระบุ':'requested budget'}`,result);
  }catch(error){add('assistant',error instanceof Error&&error.name==='AbortError'?(th?'การสร้างแผนใช้เวลานานเกินไป กรุณาลองใหม่':'Request timed out. Please retry.'):(error instanceof Error?error.message:(th?'เกิดข้อผิดพลาด กรุณาลองใหม่':'Something went wrong.')));}
  finally{setPending(false);}
 };
 return <div className="relative flex h-[100dvh] min-h-0 w-full max-w-full min-w-0 flex-col overflow-hidden bg-background">
  <header className="z-20 flex w-full min-w-0 shrink-0 items-center gap-2 border-b bg-background/95 px-3 py-3 backdrop-blur sm:gap-3 sm:px-4">
   <Link to="/" aria-label={th?'กลับหน้าแรก':'Home'} className="shrink-0 rounded-full p-2 hover:bg-muted"><ArrowLeft className="h-5 w-5"/></Link>
   <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/15 text-teal-500"><Sparkles className="h-5 w-5"/></span>
   <div className="min-w-0 flex-1"><h1 className="font-semibold">PaiNaiDee AI</h1><p className="text-xs text-muted-foreground">{th?'ผู้ช่วยวางแผนเที่ยวส่วนตัว':'Your personal trip planner'}</p></div>
   <button type="button" onClick={()=>{setMessages([]);setContext('');setDraft('');}} aria-label={th?'เริ่มแชตใหม่':'New chat'} className="shrink-0 rounded-full border p-2"><Plus className="h-5 w-5"/></button>
  </header>
  <main className="min-h-0 min-w-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-4 sm:px-6" aria-label={th?'บทสนทนาวางแผนเที่ยว':'Trip planning conversation'}>
   <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-4">
    {!messages.length&&<div className="space-y-4 py-10 text-center"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-500"><Sparkles className="h-8 w-8"/></span><h2 className="text-2xl font-bold">{th?'อยากไปเที่ยวที่ไหน?':'Where would you like to go?'}</h2><p className="text-sm text-muted-foreground">{th?'บอกจังหวัด จำนวนวัน งบรวม และสไตล์ที่ชอบได้เลย':'Tell me your destination, days, budget and travel style'}</p><button type="button" onClick={()=>submit(th?'อยากเที่ยวเชียงใหม่ 3 วัน งบ 6000 บาท เน้นธรรมชาติ ไม่อยากขับรถไกล':'Chiang Mai 3 days budget 6000 baht nature short drives')} className="rounded-2xl border px-4 py-3 text-left text-sm hover:bg-muted">{th?'ลอง: เชียงใหม่ 3 วัน งบ 6,000 บาท เน้นธรรมชาติ':'Try: Chiang Mai, 3 days, ฿6,000, nature'}</button></div>}
    {messages.map(message=><div key={message.id} className={message.role==='user'?'flex min-w-0 justify-end':'flex min-w-0 items-start gap-1.5 sm:gap-2'}>
     {message.role==='assistant'&&<span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-500"><Bot className="h-4 w-4"/></span>}
     <div className={`min-w-0 max-w-[calc(100%-2.5rem)] break-words rounded-2xl px-3 py-3 text-sm leading-6 whitespace-pre-line sm:max-w-[88%] sm:px-4 ${message.role==='user'?'rounded-br-sm bg-teal-500/15':'rounded-bl-sm border bg-card'}`}>
      {message.text}
      {message.plan&&<div className="mt-4 w-full min-w-0 max-w-full space-y-3 overflow-hidden border-t pt-3"><p className="font-semibold">{th?'แผนเที่ยวรายวัน':'Day-by-day itinerary'}</p><TripTimelineMap key={message.id} th={th} days={message.plan.completeness?.requestedDays??message.plan.days?.length??1} stops={planStops(message.plan)} available={[]} verifiedRoad={message.plan.completeness?.status==='complete'}/>{message.plan.recovery?.sources&&<p className="text-xs text-muted-foreground">{Object.entries(message.plan.recovery.sources as Record<string,string>).map(([d,s])=>`${th?'วันที่':'Day'} ${d}: ${s==='ai'?'AI':s==='smart'?'Smart Planner':s==='hybrid'?'AI + Smart Planner':s==='google'?'Google Maps':'Partial'}`).join(' · ')}</p>}</div>}
     </div>
     {message.role==='user'&&<span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"><UserRound className="h-4 w-4"/></span>}
    </div>)}
    {pending&&<div role="status" className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin"/>{th?'กำลังจัดทริปและตรวจเส้นทางถนน...':'Planning and verifying road routes...'}</div>}
    <div ref={bottom}/>
   </div>
  </main>
  <form onSubmit={e=>{e.preventDefault();void submit();}} className="z-30 w-full min-w-0 shrink-0 border-t bg-background px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-3">
   <div className="mx-auto flex w-full min-w-0 max-w-3xl items-end gap-2 rounded-3xl border bg-card p-2 shadow-sm">
    <textarea aria-label={th?'ข้อความถึง PaiNaiDee AI':'Message PaiNaiDee AI'} rows={1} maxLength={500} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void submit();}}} placeholder={th?'ถามเรื่องทริปหรือบอกสถานที่ที่อยากไป...':'Ask about your next trip...'} className="max-h-32 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none"/>
    <button type="submit" disabled={pending||!draft.trim()||facets.isLoading} aria-label={th?'ส่งข้อความ':'Send'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500 text-slate-950 disabled:opacity-40"><Send className="h-5 w-5"/></button>
   </div>
   {facets.isError&&<p className="mx-auto mt-1 max-w-3xl text-xs text-red-500">{th?'ไม่สามารถโหลดรายชื่อจังหวัดได้ กรุณาลองใหม่':'Unable to load provinces. Please retry.'}</p>}
  </form>
 </div>;
}
