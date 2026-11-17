'use strict';
// Independent-source enrichment for Google-reference drafts.
// Google preview text is a transient lookup key ONLY. Never cache or persist it.
const {parseCsv,normalizeRecord,TAT_DATASET_URL}=require('./tat-open-data.cjs');
const {normalizeName}=require('./place-discovery.cjs');
const {isThaiProvince}=require('./thai-provinces.cjs');

const TAT_CSV_URL='https://datacatalog.tat.or.th/dataset/87442079-88ec-42eb-b507-dcf135fc4301/resource/e3774497-a9d4-46f1-a3db-172d0aed5237/download/attraction.csv';
const MAX_BYTES=50_000_000;
const CACHE_MS=6*60*60*1000;
let cached=null, inFlight=null, lastFailure=0;

const canonicalProvince=value=>value==='กรุงเทพฯ'?'กรุงเทพมหานคร':value;
function indexRecords(rows){
 const index=new Map();
 for(const row of rows){
  const normalized=normalizeRecord(row);
  if(!normalized.place)continue; // Reuse already-reviewed source quality gates.
  const place=normalized.place;
  const province=canonicalProvince(place.province);
  if(!isThaiProvince(province))continue;
  for(const name of [place.nameLocal,place.name]){
   const key=province+'|'+normalizeName(name);
   if(key.endsWith('|'))continue;
   const list=index.get(key)||[];
   if(!list.some(item=>item.id===place.id))list.push(place);
   index.set(key,list);
  }
 }
 return index;
}
async function fetchIndex(fetchImpl=fetch){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetchImpl(TAT_CSV_URL,{
   signal:controller.signal,headers:{Accept:'text/csv'},
  });
  if(!response.ok)throw Error('TAT CSV unavailable');
  const declared=Number(response.headers?.get?.('content-length')||0);
  if(declared>MAX_BYTES)throw Error('TAT CSV exceeds maximum allowed size');
  const chunks=[];
  let total=0;
  if(response.body && typeof response.body[Symbol.asyncIterator]==='function'){
   for await(const chunk of response.body){
    const data=Buffer.from(chunk);
    total+=data.length;
    if(total>MAX_BYTES)throw Error('TAT CSV exceeds maximum allowed size');
    chunks.push(data);
   }
  }else{
   const data=Buffer.from(await response.arrayBuffer());
   total=data.length;
   if(total>MAX_BYTES)throw Error('TAT CSV exceeds maximum allowed size');
   chunks.push(data);
  }
  const text=Buffer.concat(chunks,total).toString('utf8');
  return indexRecords(parseCsv(text));
 }finally{
  clearTimeout(timeout);
  controller.abort();
 }
}
async function loadIndex({fetchImpl=fetch,now=Date.now}={}){
 if(cached && now()-cached.at<CACHE_MS)return cached.index;
 if(lastFailure && now()-lastFailure<60000)throw Error('TAT source temporarily unavailable');
 if(!inFlight){
  inFlight=fetchIndex(fetchImpl)
   .then(index=>{cached={at:now(),index};lastFailure=0;return index;})
   .catch(error=>{lastFailure=now();throw error;})
   .finally(()=>{inFlight=null;});
 }
 return inFlight;
}
function matchIndependentRecord(index,province,candidateName){
 if(!isThaiProvince(province)||typeof candidateName!=='string'||!candidateName.trim()||candidateName.length>160)
  return {status:'invalid_lookup'};
 const key=province+'|'+normalizeName(candidateName);
 const matches=index.get(key)||[];
 if(matches.length===0)return {status:'no_match'};
 if(matches.length!==1)return {status:'ambiguous_match'};
 const place=matches[0];
 const englishName=place.name===place.nameLocal?'':place.name;
 return {status:'matched',source:{
  name:'Tourism Authority of Thailand — Open Data',
  url:TAT_DATASET_URL,id:place.id,license:'Open Data Common'
 },fields:{
  name:englishName||place.nameLocal,
  nameLocal:place.nameLocal,province,category:place.category,
  categories:[place.category],description:place.description,
  lat:place.lat,lng:place.lng
 },englishNameFound:!!englishName};
}
async function resolveIndependentDraft({province,candidateName,fetchImpl=fetch,load=loadIndex}){
 if(!isThaiProvince(province)||typeof candidateName!=='string'||!candidateName.trim()||candidateName.length>160)
  return {status:'invalid_lookup'};
 try{return matchIndependentRecord(await load({fetchImpl}),province,candidateName);}
 catch{return {status:'source_unavailable'};}
}
module.exports={TAT_CSV_URL,MAX_BYTES,indexRecords,matchIndependentRecord,resolveIndependentDraft,fetchIndex};
