'use strict';
const { createRateLimiter } = require('./security.cjs');
const { roadLeg } = require('./ai-trip-plan.cjs');
const valid = p => p && typeof p.id === 'string' && p.id.length < 120 && Number.isFinite(p.coordinates?.lat) && Number.isFinite(p.coordinates?.lng) && p.coordinates.lat >= 5 && p.coordinates.lat <= 21 && p.coordinates.lng >= 97 && p.coordinates.lng <= 106;
const identity = p => ({id:p.id,name:p.name,nameLocal:p.nameLocal,province:p.province,category:p.category,rating:p.rating,reviewCount:p.reviewCount,images:Array.isArray(p.images)?p.images:[],tags:Array.isArray(p.tags)?p.tags:[],coordinates:{lat:p.coordinates.lat,lng:p.coordinates.lng}});
async function rankRoadStops(places,{days,maxRoadMinutes=90,mode='car'},route=roadLeg){
  const pool=[...new Map(places.filter(valid).map(p=>[p.id,p])).values()].slice(0,40);
  const used=new Set(),output=[],legs=[],rejectedCounts={LONG_DRIVE:0,ROUTE_UNVERIFIED:0};
  const cache=new Map();let calls=0;
  const lookup=async(a,b)=>{
    const key=mode+':'+a.id+':'+b.id;
    if(cache.has(key))return cache.get(key);
    if(calls>=36)return {status:'unverified',reason:'routing_budget_exhausted'};
    calls++;
    const road=await route(a,b,mode);
    cache.set(key,road);
    return road;
  };
  for(let day=1;day<=days;day++){
    let prev=null;
    for(let order=1;order<=3;order++){
      const available=pool.filter(p=>!used.has(p.id));
      if(!available.length)break;
      if(!prev){const first=available[0];output.push({id:first.id,day,order,place:identity(first)});used.add(first.id);prev=first;continue;}
      const evaluated=[];
      // Bound provider calls: nearest geographic candidates are only a shortlist,
      // never evidence of road distance or time.
      const shortlist=available.map(p=>({p,d:(p.coordinates.lat-prev.coordinates.lat)**2+(p.coordinates.lng-prev.coordinates.lng)**2})).sort((a,b)=>a.d-b.d||a.p.id.localeCompare(b.p.id)).slice(0,3);
      for(const {p:candidate} of shortlist){
        const road=await lookup(prev,candidate);
        if(road.status==='verified_route'&&Number.isFinite(road.durationMinutes)&&road.durationMinutes>=0&&road.durationMinutes<=maxRoadMinutes&&Number.isFinite(road.distanceKm)&&road.distanceKm>=0)evaluated.push({candidate,road});
        else rejectedCounts[road.status==='verified_route'?'LONG_DRIVE':'ROUTE_UNVERIFIED']++;
      }
      evaluated.sort((a,b)=>a.road.durationMinutes-b.road.durationMinutes||a.candidate.id.localeCompare(b.candidate.id));
      if(!evaluated.length)break;
      const best=evaluated[0];
      output.push({id:best.candidate.id,day,order,place:identity(best.candidate)});
      legs.push({day,from:prev.id,to:best.candidate.id,...best.road});
      used.add(best.candidate.id);prev=best.candidate;
    }
  }
  const complete=Array.from({length:days},(_,i)=>output.filter(p=>p.day===i+1).length>=2).every(Boolean)
    && legs.length===output.length-days;
  return {status:complete?'complete':'partial',stops:output,legs,rejectedCounts,routingCalls:calls,roadVerified:true};
}
function registerBasicTripRoadRoutes(app,{listPlaces,route=roadLeg}){
 const limiter=createRateLimiter({windowMs:60_000,max:5,keyPrefix:'basic-road-trip'});
 app.post('/api/trips/basic-road-plan',limiter,async(req,res)=>{
  const {province,days,transport,maxRoadMinutes}=req.body||{};
  if(typeof province!=='string'||!province.trim()||province.length>80||!Number.isInteger(days)||days<1||days>5||!['car','public'].includes(transport)||!Number.isFinite(maxRoadMinutes)||maxRoadMinutes<15||maxRoadMinutes>240)return res.status(400).json({code:'INVALID_REQUEST'});
  try{
   const pages=[];
   for(let page=1;page<=3;page++){const r=await listPlaces({province,limit:50,page});const batch=Array.isArray(r.attractions)?r.attractions:[];pages.push(...batch);if(batch.length<50)break;}
   const candidates=[...new Map(pages.filter(valid).map(p=>[p.id,p])).values()];
   if(!candidates.length)return res.status(422).json({code:'NO_PLACES'});
   const result=await rankRoadStops(candidates,{days,maxRoadMinutes,mode:transport},route);
   return res.json(result);
  }catch(error){console.error('Basic road planner failed:',error?.message);return res.status(503).json({code:'ROUTE_SERVICE_UNAVAILABLE'});}
 });
}
module.exports={registerBasicTripRoadRoutes,rankRoadStops};
