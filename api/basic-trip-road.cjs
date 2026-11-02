'use strict';
const { createRateLimiter } = require('./security.cjs');
const { roadLeg } = require('./ai-trip-plan.cjs');
const valid = p => p && typeof p.id === 'string' && p.id.length < 120 && Number.isFinite(p.coordinates?.lat) && Number.isFinite(p.coordinates?.lng) && p.coordinates.lat >= 5 && p.coordinates.lat <= 21 && p.coordinates.lng >= 97 && p.coordinates.lng <= 106;
async function rankRoadStops(places, {days, maxRoadMinutes=90, mode='car'}, route=roadLeg) {
  const pool=places.filter(valid).slice(0,18);
  const used=new Set(), output=[], legs=[], rejected=[];
  let calls=0;
  for(let day=1;day<=days;day++){
    let prev=null;
    for(let order=1;order<=3;order++){
      const available=pool.filter(p=>!used.has(p.id));
      if(!available.length) break;
      if(!prev){const first=available[0];output.push({id:first.id,day,order});used.add(first.id);prev=first;continue;}
      const evaluated=[];
      for(const candidate of available.slice(0,8)){
        if(calls>=48) break;
        calls++;
        const road=await route(prev,candidate,mode);
        if(road.status==='verified_route' && Number.isFinite(road.durationMinutes) && road.durationMinutes<=maxRoadMinutes && Number.isFinite(road.distanceKm)){
          evaluated.push({candidate,road});
        } else rejected.push({day,reason:road.status==='verified_route'?'LONG_DRIVE':'ROUTE_UNVERIFIED'});
      }
      evaluated.sort((a,b)=>a.road.durationMinutes-b.road.durationMinutes || String(a.candidate.id).localeCompare(String(b.candidate.id)));
      if(!evaluated.length) break;
      const best=evaluated[0];output.push({id:best.candidate.id,day,order});legs.push({day,from:prev.id,to:best.candidate.id,...best.road});used.add(best.candidate.id);prev=best.candidate;
    }
  }
  const complete=Array.from({length:days},(_,i)=>output.filter(p=>p.day===i+1).length>=2).every(Boolean) && output.length>0 && legs.length===output.length-days;
  return {status:complete?'complete':'partial',stops:output,legs,rejectedCounts:{LONG_DRIVE:rejected.filter(r=>r.reason==='LONG_DRIVE').length,ROUTE_UNVERIFIED:rejected.filter(r=>r.reason==='ROUTE_UNVERIFIED').length},routingCalls:calls};
}
function registerBasicTripRoadRoutes(app,{listPlaces,route=roadLeg}){
 const limiter=createRateLimiter({windowMs:60_000,max:5,keyPrefix:'basic-road-trip'});
 app.post('/api/trips/basic-road-plan',limiter,async(req,res)=>{
  const {province,days,transport,maxRoadMinutes}=req.body||{};
  if(typeof province!=='string'||!province.trim()||province.length>80||!Number.isInteger(days)||days<1||days>5||!['car','public'].includes(transport)||!Number.isFinite(maxRoadMinutes)||maxRoadMinutes<15||maxRoadMinutes>240) return res.status(400).json({code:'INVALID_REQUEST'});
  try{
   const pages=[];
   for(let page=1;page<=3;page++){const r=await listPlaces({province,limit:50,page});const batch=Array.isArray(r.attractions)?r.attractions:[];pages.push(...batch);if(batch.length<50)break;}
   const candidates=[...new Map(pages.filter(valid).map(p=>[p.id,p])).values()];
   if(!candidates.length)return res.status(422).json({code:'NO_PLACES'});
   const result=await rankRoadStops(candidates,{days,maxRoadMinutes,mode:transport},route);
   return res.json(result);
  }catch{ return res.status(503).json({code:'ROUTE_SERVICE_UNAVAILABLE'}); }
 });
}
module.exports={registerBasicTripRoadRoutes,rankRoadStops};
