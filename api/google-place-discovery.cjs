'use strict';
// Admin-only, ephemeral Google Places discovery. Never persist Google content.
const {reserveGoogleDailyQuota}=require('./google-daily-usage.cjs');
const {createRateLimiter}=require('./security.cjs');
const {PROVINCE_EN}=require('./place-localizations.cjs');
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
  return {status:'ok',province:input.province,sources:[{source:'google',status:'ok'}],candidates,automaticImport:false,publicationAllowed:false,liveOnly:true,warning:'Preview only. Google content must not be imported or stored; independently verify place and rights.'};
 }catch{return {status:'unavailable',candidates:[]};}
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
module.exports={availability,validate,discoverGoogle,registerGoogleDiscovery,MASK};
