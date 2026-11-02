import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import { ArrowDown, ArrowUp, MapPinned, Navigation, Plus, Trash2, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TripStop } from '@/shared/utils/tripPlanner';
import { auditTripRoute, mapDirectionsUrl } from '@/shared/utils/tripPlanner';
import type { AttractionDetail } from '@/shared/types/attraction';

type Props = { stops: TripStop[]; available: AttractionDetail[]; days: number; th: boolean; onChange?: (next: TripStop[]) => void; verifiedRoad?: boolean };
const valid = (p: AttractionDetail) => Number.isFinite(p.coordinates?.lat) && Number.isFinite(p.coordinates?.lng) && p.coordinates.lat >= 5 && p.coordinates.lat <= 21 && p.coordinates.lng >= 97 && p.coordinates.lng <= 106;
function FocusMap({ points }: { points: [number,number][] }) {
  const map=useMap();
  // The map remounts when selected day changes, so a one-time initial fit is sufficient.
  useEffect(()=>{if(points.length>1)map.fitBounds(points,{padding:[26,26]});else if(points.length===1)map.setView(points[0],12);},[map,points]);
  return null;
}
export default function TripTimelineMap({stops,available,days,th,onChange,verifiedRoad=false}:Props){
  const [selectedDay,setSelectedDay]=useState(1);
  const [addId,setAddId]=useState('');
  const daily=stops.filter(s=>s.day===selectedDay).sort((a,b)=>a.order-b.order);
  const points=useMemo<[number,number][]>(()=>daily.filter(s=>valid(s.place)).map(s=>[s.place.coordinates.lat,s.place.coordinates.lng]),[stops,selectedDay]);
  const availablePlaces=available.filter(p=>valid(p)&&!stops.some(s=>s.place.id===p.id));
  const updateDay=(nextDay:TripStop[])=>onChange?.([...stops.filter(s=>s.day!==selectedDay),...nextDay.map((s,i)=>({...s,day:selectedDay,order:i+1}))]);
  const move=(index:number,direction:number)=>{const next=[...daily],target=index+direction;if(target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];updateDay(next);};
  const directions=mapDirectionsUrl(daily);
  const audit=auditTripRoute(daily,100);
  return <section className="space-y-4" aria-label={th?'ไทม์ไลน์ทริปและแผนที่':'Trip timeline and map'}>
    <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label={th?'เลือกวัน':'Select day'}>
      {Array.from({length:days},(_,i)=>i+1).map(day=><button key={day} role="tab" aria-selected={selectedDay===day} onClick={()=>setSelectedDay(day)}
       className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition ${selectedDay===day?'border-teal-500 bg-teal-500 text-white':'border-border bg-background hover:border-teal-400'}`}>{th?'วันที่':'Day'} {day}</button>)}
    </div>
    <div className="grid min-w-0 gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="min-w-0 space-y-4">
        {daily.length===0&&<div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">{th?'ยังไม่มีจุดแวะในวันนี้ เพิ่มสถานที่จากรายการด้านล่าง':'No stops for this day. Add one below.'}</div>}
        <ol className="space-y-3">
          {daily.map((stop,i)=><li key={stop.place.id} className="relative flex min-w-0 gap-3 rounded-2xl border bg-card p-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/15 font-bold text-teal-700 dark:text-teal-300">{i+1}</span>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex min-w-0 gap-3">
                {stop.place.images?.[0]?<img src={stop.place.images[0]} alt="" loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" referrerPolicy="no-referrer"/>:<div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-muted"><ImageOff className="h-5 w-5 text-muted-foreground"/></div>}
                <div className="min-w-0"><Link to={`/attraction/${encodeURIComponent(stop.place.id)}`} className="break-words font-semibold hover:underline">{th?stop.place.nameLocal||stop.place.name:stop.place.name}</Link><p className="mt-1 text-xs text-muted-foreground">{stop.place.category} · {stop.place.province}</p><p className="mt-1 text-xs text-amber-600">{th?'เวลาเปิดปิดยังไม่ยืนยัน':'Opening hours unverified'}</p></div>
              </div>
              {i>0&&<p className="text-xs text-muted-foreground">{th?'ระยะเส้นตรงจากจุดก่อนหน้า':'Straight-line from previous'}: {audit.legs[i-1]?.straightLineKm??'–'} km · {th?'เวลาเดินทางยังไม่ยืนยัน':'Travel time unverified'}</p>}
              {onChange&&<div className="flex flex-wrap gap-2"><button aria-label={th?'เลื่อนขึ้น':'Move up'} disabled={i===0} onClick={()=>move(i,-1)} className="rounded-lg border p-2 disabled:opacity-30"><ArrowUp size={16}/></button><button aria-label={th?'เลื่อนลง':'Move down'} disabled={i===daily.length-1} onClick={()=>move(i,1)} className="rounded-lg border p-2 disabled:opacity-30"><ArrowDown size={16}/></button><button onClick={()=>updateDay(daily.filter(s=>s.place.id!==stop.place.id))} className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-600"><Trash2 size={14}/>{th?'นำออก':'Remove'}</button></div>}
            </div>
          </li>)}
        </ol>
        {onChange&&<div className="flex min-w-0 flex-wrap gap-2 rounded-xl border bg-muted/30 p-3"><select aria-label={th?'เพิ่มสถานที่':'Add place'} value={addId} onChange={e=>setAddId(e.target.value)} className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-2 text-sm"><option value="">{th?'เลือกสถานที่จริงเพื่อเพิ่ม':'Choose a verified place'}</option>{availablePlaces.map(p=><option key={p.id} value={p.id}>{p.nameLocal||p.name}</option>)}</select><button disabled={!addId||daily.length>=3} onClick={()=>{const p=availablePlaces.find(x=>x.id===addId);if(p){updateDay([...daily,{place:p,day:selectedDay,order:daily.length+1}]);setAddId('');}}} className="flex h-11 items-center gap-1 rounded-lg bg-teal-500 px-3 text-sm font-semibold text-white disabled:opacity-40"><Plus size={16}/>{th?'เพิ่ม':'Add'}</button><p className="w-full text-xs text-muted-foreground">{th?'ไม่เกิน 3 สถานที่ต่อวัน การแก้ไขจะต้องตรวจเส้นทางและเวลาทำการอีกครั้ง':'Maximum 3 places per day. Edited routes and hours require revalidation.'}</p></div>}
      </div>
      <div className="min-w-0 space-y-3">
        <div className="overflow-hidden rounded-2xl border">
          {points.length>0?<MapContainer key={selectedDay} center={points[0]} zoom={11} scrollWheelZoom={false} className="h-72 w-full sm:h-96" style={{zIndex:0}}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
            <FocusMap points={points}/>
            {points.map((point,i)=><CircleMarker key={i} center={point} radius={9} pathOptions={{color:'#0d9488',fillColor:'#14b8a6',fillOpacity:.9}}><Popup>{daily[i]?.place.nameLocal||daily[i]?.place.name}</Popup></CircleMarker>)}
            {points.length>1&&<Polyline positions={points} pathOptions={{color:'#0d9488',weight:3,dashArray:'6 8'}}/>}
          </MapContainer>:<div className="flex h-72 items-center justify-center gap-2 bg-muted text-sm text-muted-foreground"><MapPinned size={18}/>{th?'เพิ่มสถานที่เพื่อดูแผนที่':'Add places to view map'}</div>}
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{th?'เส้นประบนแผนที่แสดงการเชื่อมจุดตามลำดับ ไม่ใช่เส้นทางถนนที่ยืนยันแล้ว':'Dashed lines connect stops, not verified road routes.'}{verifiedRoad?'':''}</p>
        {directions&&<a href={directions} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 font-semibold text-white"><Navigation size={18}/>{th?'เปิดเส้นทางใน Google Maps':'Open in Google Maps'}</a>}
      </div>
    </div>
  </section>;
}
