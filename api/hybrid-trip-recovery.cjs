'use strict';
const {roadLeg}=require('./ai-trip-plan.cjs');
const {rankRoadStops}=require('./basic-trip-road.cjs');
function verifiedDay(day,lookup){
 if(!day||!Number.isInteger(day.day)||!Array.isArray(day.stops)||day.stops.length<2||!Array.isArray(day.legs)||day.legs.length!==day.stops.length-1)return false;
 const ids=day.stops.map(p=>String(p.id));
 return new Set(ids).size===ids.length&&ids.every(id=>lookup.has(id))&&day.legs.every((leg,i)=>leg.from===day.stops[i].id&&leg.to===day.stops[i+1].id&&leg.road?.status==='verified_route'&&Number.isFinite(leg.road.durationMinutes));
}
async function recoverIncrementally({days,requestedDays,candidates,lookup,transport,maxRoadMinutes},route=roadLeg){
 const kept=[],reserved=new Set(),sources={};
 for(let day=1;day<=requestedDays;day++){
  const current=days.find(d=>d.day===day);
  if(verifiedDay(current,lookup)&&current.stops.every(s=>!reserved.has(String(s.id)))){
   kept.push(current);for(const s of current.stops)reserved.add(String(s.id));sources[day]='ai';
  }
 }
 const recovered=[],diagnostics=[];
 for(let day=1;day<=requestedDays;day++){
  if(sources[day])continue;
  const original=days.find(d=>d.day===day);
  // Keep individually verified AI stops only when their connecting road legs
  // are verified. No partial/unverified route is silently carried forward.
  const prefix=[];
  if(original?.stops?.length){
   const first=original.stops[0];
   if(lookup.has(String(first.id))&&!reserved.has(String(first.id)))prefix.push(first);
   for(let i=1;i<original.stops.length&&prefix.length;i++){
    const stop=original.stops[i],leg=original.legs?.[i-1];
    if(!lookup.has(String(stop.id))||reserved.has(String(stop.id))||leg?.from!==prefix[prefix.length-1].id||leg?.to!==stop.id||leg?.road?.status!=='verified_route'||leg.road.durationMinutes>maxRoadMinutes)break;
    prefix.push(stop);
   }
  }
  const available=candidates.filter(p=>!reserved.has(String(p.id))&&!prefix.some(s=>String(s.id)===String(p.id)));
  const chosen=[...prefix],legs=(original?.legs||[]).slice(0,Math.max(0,prefix.length-1));
  const localCache=new Map();let calls=0;
  while(chosen.length<3&&available.length){
   const previous=chosen[chosen.length-1];
   if(!previous){
    // Seed a missing day using Smart Planner ranking.
    const seed=available.shift();chosen.push({...seed,openingHours:{status:'unverified'}});continue;
   }
   const shortlist=available.map(p=>({p,d:(p.coordinates.lat-previous.coordinates.lat)**2+(p.coordinates.lng-previous.coordinates.lng)**2})).sort((a,b)=>a.d-b.d).slice(0,3);
   const ranked=[];
   for(const {p} of shortlist){
    if(calls>=12)break;
    const key=previous.id+':'+p.id;
    let road=localCache.get(key);
    if(!road){calls++;road=await route(previous,p,transport);localCache.set(key,road);}
    if(road.status==='verified_route'&&Number.isFinite(road.durationMinutes)&&road.durationMinutes<=maxRoadMinutes&&Number.isFinite(road.distanceKm))ranked.push({p,road});
   }
   ranked.sort((a,b)=>a.road.durationMinutes-b.road.durationMinutes);
   if(!ranked.length)break;
   const {p,road}=ranked[0];chosen.push({...p,openingHours:{status:'unverified'}});legs.push({from:previous.id,to:p.id,road});
   available.splice(available.findIndex(x=>x.id===p.id),1);
  }
  if(chosen.length>=2&&legs.length===chosen.length-1){
   recovered.push({day,stops:chosen,legs});for(const s of chosen)reserved.add(String(s.id));sources[day]=prefix.length?'hybrid':'smart';
  }else{
   if(original?.stops?.length)recovered.push(original);
   diagnostics.push({day,reason:available.length?'ROUTE_UNVERIFIED':'INSUFFICIENT_PLACES'});
   sources[day]='partial';
  }
 }
 const combined=[...kept,...recovered].sort((a,b)=>a.day-b.day);
 const verified=combined.filter(d=>verifiedDay(d,lookup));
 const complete=verified.length===requestedDays&&combined.length===requestedDays&&new Set(combined.flatMap(d=>d.stops.map(s=>String(s.id)))).size===combined.flatMap(d=>d.stops).length;
 return {days:combined,status:complete?'complete':'partial',sources,diagnostics,keptDays:kept.map(d=>d.day),filledDays:recovered.filter(d=>verifiedDay(d,lookup)).map(d=>d.day)};
}
module.exports={recoverIncrementally,verifiedDay};
