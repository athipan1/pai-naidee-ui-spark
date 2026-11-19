'use strict';
// Geoapify Discovery reuses the existing Admin/Railway stack. Provider response
// is read-only until a signed, short-lived selection is confirmed by Admin.
const {createHmac,timingSafeEqual}=require('node:crypto');
const {isThaiProvince,addressMatchesProvince}=require('./thai-provinces.cjs');
const {isThailandCoordinate}=require('./admin-geocode.cjs');
const {normalizeName}=require('./place-discovery.cjs');
const {readExisting,classifyCandidates}=require('./google-place-discovery.cjs');
const {createRateLimiter}=require('./security.cjs');
const {PROVINCE_EN}=require('./place-localizations.cjs');
const GEO='https://api.geoapify.com';
const PURPOSE='painaidee-geoapify-discovery-v1:';
const MAX_RESULTS=10;
const MAX_SCAN=40;
function clean(value,max=160){
 return typeof value==='string'?value.replace(/<[^>]*>/g,' ')
  .replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';
}
function validate(body){
 if(!body||!isThaiProvince(body.province)||!Number.isInteger(body.limit)||
    body.limit<1||body.limit>MAX_RESULTS)return null;
 return {province:body.province,limit:body.limit};
}
function validProviderId(value){return typeof value==='string'&&/^[A-Za-z0-9_-]{20,256}$/.test(value);}
function provinceEnglish(province){return PROVINCE_EN[province==='กรุงเทพมหานคร'?'กรุงเทพฯ':province]||province;}
function placeProperties(feature){
 const p=feature?.properties||{};
 const pair=Array.isArray(feature?.geometry?.coordinates)?feature.geometry.coordinates:[];
 const lat=Number(p.lat??pair[1]),lng=Number(p.lon??pair[0]);
 if(!validProviderId(p.place_id)||!isThailandCoordinate(lat,lng)||
    String(p.country_code||'').toLowerCase()!=='th'||
    !p.state||!addressMatchesProvince(String(p.state),feature._province||''))return null;
 const categories=Array.isArray(p.categories)?p.categories:[];
 if(categories.length&&!categories.some(x=>typeof x==='string'&&x.startsWith('tourism.')))return null;
 const rawName=clean(p.name);
 const international=p.name_international&&typeof p.name_international==='object'?p.name_international:{};
 const thai=clean(international.th)||(/[\u0e01-\u0e5b]/.test(rawName)?rawName:'');
 const english=clean(international.en)||(/[a-z]/i.test(rawName)&&!/[\u0e01-\u0e5b]/.test(rawName)?rawName:'');
 const name=english||thai||rawName;
 if(name.length<2||/^(?:rayong|province|attraction|tourism)$/i.test(name))return null;
 return {id:p.place_id,name,nameLocal:thai,lat,lng,formatted:clean(p.formatted,260)||name,
   province:feature._province,source:'geoapify'};
}
function signCandidate(candidate,userId,key,now=Date.now()){
 if(typeof key!=='string'||key.length<12||!userId)throw Error('Cannot sign Geoapify selection');
 const payload={v:1,userId:String(userId),province:candidate.province,id:candidate.id,
  name:candidate.name,nameLocal:candidate.nameLocal,lat:candidate.lat,lng:candidate.lng,
  exp:now+10*60*1000};
 const encoded=Buffer.from(JSON.stringify(payload)).toString('base64url');
 const signature=createHmac('sha256',key).update(PURPOSE+encoded).digest('base64url');
 return encoded+'.'+signature;
}
function verifyCandidate(token,userId,key,now=Date.now()){
 if(typeof token!=='string'||token.length>1800||!key||!userId)return null;
 const parts=token.split('.');
 if(parts.length!==2||!parts.every(p=>/^[A-Za-z0-9_-]+$/.test(p)))return null;
 const signature=createHmac('sha256',key).update(PURPOSE+parts[0]).digest();
 const supplied=Buffer.from(parts[1],'base64url');
 if(supplied.length!==signature.length||!timingSafeEqual(signature,supplied))return null;
 let data;
 try{data=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));}catch{return null;}
 if(data.v!==1||data.userId!==String(userId)||!isThaiProvince(data.province)||
    !validProviderId(data.id)||typeof data.exp!=='number'||now>data.exp||
    data.exp>now+10*60*1000||!clean(data.name)||
    clean(data.name)!==data.name||clean(data.nameLocal)!==data.nameLocal||
    !isThailandCoordinate(Number(data.lat),Number(data.lng)))return null;
 return data;
}
async function getJson(fetchImpl,url){
 const response=await fetchImpl(url,{signal:AbortSignal.timeout(7000),headers:{Accept:'application/json'}});
 if(!response.ok){const error=new Error('Geoapify provider unavailable');error.status=response.status;throw error;}
 return response.json();
}
async function discover(input,{getSql,fetchImpl=fetch,env=process.env,userId,readExistingImpl=readExisting}={}){
 const valid=validate(input);
 if(!valid)return {status:'invalid',candidates:[]};
 const key=env.GEOAPIFY_API_KEY;
 if(typeof key!=='string'||key.length<12)return {status:'disabled',candidates:[]};
 const {province,limit}=valid;
 const names=[provinceEnglish(province), 'Thailand'];
 // Resolve the actual province boundary instead of guessing a centre/radius.
 const geoParams=new URLSearchParams({text:names.join(', '),type:'state',
  filter:'countrycode:th',lang:'en',limit:'5',format:'json',apiKey:key});
 let area;
 try{
  const geocoded=await getJson(fetchImpl,GEO+'/v1/geocode/search?'+geoParams);
  area=(Array.isArray(geocoded.results)?geocoded.results:[]).find(p=>
   String(p.country_code||'').toLowerCase()==='th'&&
   (p.result_type==='state'||p.type==='state')&&
   validProviderId(p.place_id)&&
   addressMatchesProvince(String(p.state||p.name||''),province));
  if(!area)return {status:'province_unresolved',candidates:[]};
 }catch(error){return {status:error.status===429?'provider_quota':'unavailable',candidates:[]};}
 const params=new URLSearchParams({categories:'tourism.attraction,tourism.sights',
  filter:'place:'+area.place_id,lang:'th',limit:String(MAX_SCAN),apiKey:key});
 let result;
 try{result=await getJson(fetchImpl,GEO+'/v2/places?'+params);}
 catch(error){return {status:error.status===429?'provider_quota':'unavailable',candidates:[]};}
 const seen=new Set(), candidates=[];
 let excludedOutsideProvince=0;
 for(const feature of Array.isArray(result.features)?result.features:[]){
  // No geometry or cross-province matches are trusted. "place" is an additional
  // provider-side boundary filter, not the only validation.
  const item=placeProperties({...feature,_province:province});
  if(!item){excludedOutsideProvince++;continue;}
  if(seen.has(item.id))continue;
  seen.add(item.id);
  candidates.push({
   source:'geoapify',sourceId:'geoapify:'+item.id,geoapifyId:item.id,
   name:item.name,nameLocal:item.nameLocal,province,lat:item.lat,lng:item.lng,
   address:item.formatted,holds:['MANUAL_REVIEW'],liveOnly:true,
   candidateToken:signCandidate(item,userId,key),
  });
  if(candidates.length>=limit)break;
 }
 let existing;
 try{existing=await readExistingImpl(getSql,province);}
 catch{return {status:'catalog_unavailable',candidates:[]};}
 return {status:'ok',source:'geoapify',province,automaticImport:false,publicationAllowed:false,
  candidates:classifyCandidates(candidates,existing),excludedOutsideProvince,
  warning:'Geoapify / © OpenStreetMap contributors. Admin must confirm the place and map pin before saving.'};
}
function registerGeoapifyDiscovery(app,{requireAdmin,getSql,fetchImpl}){
 app.post('/api/admin/geoapify-place-discovery/search',requireAdmin,
  createRateLimiter({windowMs:60000,max:2,keyPrefix:'geoapify-manual-discovery'}),
  async(req,res)=>{
   res.set('Cache-Control','no-store');
   const input=validate(req.body);
   if(!input)return res.status(400).json({error:'Choose a valid Thai province and 1–10 places.'});
   const result=await discover(input,{getSql,fetchImpl,userId:req.auth.user.id});
   return res.status(result.status==='disabled'?503:
     result.status==='provider_quota'?429:
     ['unavailable','catalog_unavailable'].includes(result.status)?502:
     result.status==='province_unresolved'?422:200).json(result);
  });
}
module.exports={validate,placeProperties,signCandidate,verifyCandidate,discover,registerGeoapifyDiscovery};
