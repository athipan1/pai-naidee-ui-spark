'use strict';
// Admin-only, ephemeral Google Places discovery. Never persist Google content.
const {reserveGoogleDailyQuota}=require('./google-daily-usage.cjs');
const {createRateLimiter}=require('./security.cjs');
const {PROVINCE_EN}=require('./place-localizations.cjs');
const {normalizeName}=require('./place-discovery.cjs');
const ENDPOINT='https://places.googleapis.com/v1/places:searchText';
const MASK='places.id,places.displayName,places.location,places.formattedAddress,places.googleMapsUri';
function availability(env=process.env,now=Date.now()){
 const expiry=Date.parse(env.GOOGLE_DISCOVERY_EXPIRES_AT||'');
 const reasons=[];
 if(env.GOOGLE_DISCOVERY_ENABLED!=='true')reasons.push('disabled');
 if(!env.GOOGLE_PLACES_API_KEY)reasons.push('missing_key');
 if(!Number.isFinite(expiry)||expiry<=now)reasons.push('expired');
 if(env.GOOGLE_CLOUD_QUOTAS_CONFIRMED!=='true')reasons.push('quota_unconfirmed');
 if(env.GOOGLE_BILLING_ALERTS_CONFIRMED!=='true')reasons.push('billing_unconfirmed');
 return {enabled:reasons.length===0,reasons};
}
function validate(body){
 if(!body||body.province!=='ชลบุรี'||!Object.hasOwn(PROVINCE_EN,body.province)||!Number.isInteger(body.limit)||body.limit<1||body.limit>10||!Array.isArray(body.sources)||body.sources.length!==1||body.sources[0]!=='google')return null;
 return {province:body.province,limit:body.limit};
}

function distanceMeters(a,b){
 const rad=Math.PI/180,dLat=(a.lat-b.lat)*rad,dLng=(a.lng-b.lng)*rad;
 const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2;
 return 12742000*Math.asin(Math.min(1,Math.sqrt(h)));
}
function classifyCandidates(candidates,existing){
 return candidates.map(c=>{
  const matches=[];
  for(const p of existing){
   const ids=Array.isArray(p.external_ids)?p.external_ids:[];
   const byId=ids.some(x=>x.source==='google_places'&&x.id===c.placeId);
   const names=[p.name,p.name_local,...(Array.isArray(p.aliases)?p.aliases:[])].map(normalizeName).filter(Boolean);
   const byName=names.includes(normalizeName(c.name));
   const lat=Number(p.lat),lng=Number(p.lng);
   const meters=c.lat!==null&&c.lng!==null&&Number.isFinite(lat)&&Number.isFinite(lng)?distanceMeters({lat:c.lat,lng:c.lng},{lat,lng}):Infinity;
   if(byId||byName||meters<=100)matches.push({placeId:String(p.id),name:String(p.name_local||p.name||''),reason:byId?'google_place_id':byName?'name':'nearby_coordinates',distanceMeters:Number.isFinite(meters)?Math.round(meters):null});
  }
  const exact=matches.some(m=>m.reason==='google_place_id');
  return {...c,duplicateStatus:exact?'existing_place':matches.length?'possible_duplicate':'not_detected',duplicateMatches:matches.slice(0,5),holds:[...c.holds,...(matches.length?['POSSIBLE_DUPLICATE']:[])]};
 });
}
async function readExisting(getSql,province){
 return getSql().begin('ISOLATION LEVEL REPEATABLE READ READ ONLY',async tx=>{
  await tx`SET LOCAL statement_timeout = '5000ms'`;
  const rows=await tx`SELECT p.id,p.name,p.name_local,p.lat,p.lng,
   COALESCE((SELECT json_agg(json_build_object('source',e.namespace,'id',e.external_id)) FROM place_external_ids e WHERE e.place_id=p.id),'[]'::json) AS external_ids,
   COALESCE((SELECT json_agg(a.alias_name) FROM place_aliases a WHERE a.place_id=p.id AND a.status='approved'),'[]'::json) AS aliases
   FROM places p WHERE p.province=${province} ORDER BY p.id LIMIT 20001`;
  if(rows.length>20000)throw Error('Catalogue limit exceeded');
  return rows;
 });
}

async function discoverGoogle(input,{getSql,fetchImpl=fetch,reserve=reserveGoogleDailyQuota,env=process.env}){
 const gate=availability(env);
 if(!gate.enabled)return {status:'disabled',reasons:gate.reasons,candidates:[]};
 // Reuse existing durable search ledger. A search consumes quota even on HTTP failure.
 if(!await reserve('places_search',getSql))return {status:'quota_exhausted',candidates:[]};
 try{
  const response=await fetchImpl(ENDPOINT,{method:'POST',signal:AbortSignal.timeout(7000),headers:{'Content-Type':'application/json','X-Goog-Api-Key':env.GOOGLE_PLACES_API_KEY,'X-Goog-FieldMask':MASK},body:JSON.stringify({textQuery:'สถานที่ท่องเที่ยว จังหวัดชลบุรี ประเทศไทย',languageCode:'th',regionCode:'TH',pageSize:input.limit,locationBias:{rectangle:{low:{latitude:12.45,longitude:100.65},high:{latitude:13.65,longitude:101.55}}}})});
  if(!response.ok)return {status:'unavailable',candidates:[]};
  const payload=await response.json();
  const seen=new Set(),candidates=[];
  for(const p of Array.isArray(payload.places)?payload.places:[]){
   const id=typeof p.id==='string'?p.id:'',name=String(p.displayName?.text||'');
   if(!id||!name||seen.has(id))continue;
   seen.add(id);
   const lat=p.location?.latitude,lng=p.location?.longitude;
   // Google data is displayed only during this request. No database lookup, logs or writes.
   candidates.push({source:'google',sourceId:'google:'+id,placeId:id,name,province:input.province,lat:Number.isFinite(lat)?lat:null,lng:Number.isFinite(lng)?lng:null,address:String(p.formattedAddress||''),mapsUrl:typeof p.googleMapsUri==='string'&&/^https:\/\/([\w-]+\.)?google\.com\//.test(p.googleMapsUri)?p.googleMapsUri:null,duplicateStatus:'not_checked',holds:['MANUAL_REVIEW','GOOGLE_CONTENT_NOT_FOR_IMPORT'],liveOnly:true});
  }
  const existing=await readExisting(getSql,input.province);
  return {status:'ok',province:input.province,sources:[{source:'google',status:'ok'}],candidates:classifyCandidates(candidates,existing),automaticImport:false,publicationAllowed:false,liveOnly:true,warning:'Preview only. Google content must not be imported or stored; independently verify place and rights.'};
 }catch{return {status:'unavailable',candidates:[],error:'Google search or duplicate verification unavailable; no results can be trusted.'};}
}
function registerGoogleDiscovery(app,{requireAdmin,getSql,fetchImpl}){
 app.post('/api/admin/google-place-discovery/search',requireAdmin,createRateLimiter({windowMs:60000,max:2,keyPrefix:'google-manual-discovery'}),async(req,res)=>{
  res.set('Cache-Control','no-store');
  const input=validate(req.body);
  if(!input)return res.status(400).json({error:'Chonburi Google discovery pilot accepts 1–10 places only.'});
  const result=await discoverGoogle(input,{getSql,fetchImpl});
  return res.status(result.status==='disabled'?503:result.status==='quota_exhausted'?429:result.status==='unavailable'?502:200).json(result);
 });
}
module.exports={availability,validate,discoverGoogle,registerGoogleDiscovery,MASK,classifyCandidates,readExisting};
