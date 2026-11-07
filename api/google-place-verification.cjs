'use strict';
// Fresh human-facing identity evidence only. No Google content is persisted,
// included in quality reports, used in polygon calculations, or logged.
const {reserveGoogleDailyQuota,dailyLimit}=require('./google-daily-usage.cjs');
const {createRateLimiter}=require('./security.cjs');
const FIELD_MASK='places.id,places.displayName,places.formattedAddress,places.types,places.googleMapsUri,places.attributions';
function verificationAvailability(env=process.env,now=Date.now()) {
  const expiry=Date.parse(env.GOOGLE_PLACE_VERIFICATION_EXPIRES_AT || '');
  const reasons=[];
  if(env.GOOGLE_PLACE_VERIFICATION_ENABLED!=='true') reasons.push('activation_not_approved');
  if(!env.GOOGLE_PLACES_API_KEY) reasons.push('credentials_unavailable');
  if(!Number.isFinite(expiry)||expiry<=now) reasons.push('approval_missing_or_expired');
  if(env.GOOGLE_CLOUD_QUOTAS_CONFIRMED!=='true') reasons.push('cloud_quota_unconfirmed');
  if(env.GOOGLE_BILLING_ALERTS_CONFIRMED!=='true') reasons.push('billing_alerts_unconfirmed');
  return {enabled:reasons.length===0,reasons};
}
function safeGoogleUrl(value) {
  try { const u=new URL(value);return u.protocol==='https:' && !u.username && !u.password &&
    (u.hostname==='google.com'||u.hostname.endsWith('.google.com'))?u.href:null; } catch { return null; }
}
function attributionUrl(value) {
  try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null;} catch {return null;}
}
async function verifyGoogleIdentity(input,{getSql,fetchImpl=fetch,reserve=reserveGoogleDailyQuota,env=process.env}={}) {
  const available=verificationAvailability(env);
  if(!available.enabled) return {status:'disabled',...available};
  // Share the existing detail ledger, never expand the overall request budget.
  if(!await reserve('places_detail',getSql)) return {status:'quota_exhausted'};
  try {
    const response=await fetchImpl('https://places.googleapis.com/v1/places:searchText',{
      method:'POST',signal:AbortSignal.timeout(7000),
      headers:{'Content-Type':'application/json','X-Goog-Api-Key':env.GOOGLE_PLACES_API_KEY,'X-Goog-FieldMask':FIELD_MASK},
      body:JSON.stringify({textQuery:input.name+' '+input.province+' ประเทศไทย',languageCode:input.language,regionCode:'TH',pageSize:3}),
    });
    if(!response.ok) return {status:'unavailable'};
    const data=await response.json();
    return {status:'ok',source:'Google Maps',liveOnly:true,automaticMatch:false,
      results:(Array.isArray(data.places)?data.places:[]).slice(0,3).map(p=>({
        placeId:typeof p.id==='string'?p.id.slice(0,255):'',
        name:String(p.displayName?.text||'').slice(0,300),address:String(p.formattedAddress||'').slice(0,1000),
        types:(Array.isArray(p.types)?p.types:[]).filter(t=>typeof t==='string').slice(0,20),
        mapsUrl:safeGoogleUrl(p.googleMapsUri),
        attributions:(Array.isArray(p.attributions)?p.attributions:[]).slice(0,20).map(a=>({name:String(a.provider||'').slice(0,200),url:attributionUrl(a.providerUri)})),
      }))};
  } catch {return {status:'unavailable'};}
}
function registerGoogleVerification(app,{requireAdmin,getSql,fetchImpl}) {
  app.get('/api/admin/google-verification/status',requireAdmin,(_req,res)=>{
    res.set('Cache-Control','no-store');
    res.json({...verificationAvailability(),dailyLimit:dailyLimit('places_detail'),budgetNotice:'Billing alerts do not stop charges.'});
  });
  app.post('/api/admin/google-verification',requireAdmin,createRateLimiter({windowMs:60_000,max:3,keyPrefix:'google-verify'}),async(req,res)=>{
    res.set('Cache-Control','no-store');
    const {name,province,language='th'}=req.body || {};
    if(typeof name!=='string'||name.trim().length<2||name.length>150||typeof province!=='string'||province.trim().length<2||province.length>100||!['th','en'].includes(language))
      return res.status(400).json({error:'Invalid verification query.'});
    const result=await verifyGoogleIdentity({name:name.trim(),province:province.trim(),language},{getSql,fetchImpl});
    res.status(result.status==='disabled'?503:result.status==='quota_exhausted'?429:result.status==='unavailable'?502:200).json(result);
  });
}
module.exports={FIELD_MASK,verificationAvailability,verifyGoogleIdentity,registerGoogleVerification};
