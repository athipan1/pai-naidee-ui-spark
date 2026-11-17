'use strict';
// Independent-source enrichment for Google-reference drafts.
// Google preview text is a transient lookup key ONLY. Never cache or persist it.
const {parseCsv,TAT_DATASET_URL}=require('./tat-open-data.cjs');
const {normalizeName}=require('./place-discovery.cjs');
const {isThaiProvince}=require('./thai-provinces.cjs');

const TAT_CSV_URL='https://datacatalog.tat.or.th/dataset/87442079-88ec-42eb-b507-dcf135fc4301/resource/e3774497-a9d4-46f1-a3db-172d0aed5237/download/attraction.csv';
const MAX_BYTES=50_000_000;
const CACHE_MS=6*60*60*1000;
const SOURCE_TIMEOUT_MS=75000;
const LOOKUP_WAIT_MS=4000;
let cached=null, inFlight=null, lastFailure=0;

const canonicalProvince=value=>value==='กรุงเทพฯ'?'กรุงเทพมหานคร':value;
function cleanedName(value,limit=160){
 if(typeof value!=='string')return '';
 return value.replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp);/gi,' ')
  .replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,limit);
}
// Only the names are needed. A TAT row need not have a description,
// category or entrance coordinates to offer its independently sourced names.
function indexRecords(rows){
 const index=new Map();
 for(const row of rows){
  if(!row || typeof row!=='object')continue;
  const provinceRaw=cleanedName(row.PROVINCE_NAME_TH||row.ATT_PROVINCE_NAME_TH||row.PROVINCE_TH||row.province||'');
  const province=canonicalProvince(provinceRaw.replace(/^จังหวัด/,''));
  const sourceId=cleanedName(row.ATT_ID||row.ATTRACTION_ID||'').slice(0,64);
  const nameLocal=cleanedName(row.ATT_NAME_TH||row.NAME_TH||row.nameTH||row.nameLocal||'');
  const nameEn=cleanedName(row.ATT_NAME_EN||row.NAME_EN||row.nameEN||'');
  if(!isThaiProvince(province)||!/[ก-๙]/.test(nameLocal)
     || !/^[A-Za-z0-9_-]{1,64}$/.test(sourceId))continue;
  const englishName=/[A-Za-z]/.test(nameEn) && nameEn!=='-' ? nameEn : '';
  const item={id:'tat-'+sourceId,nameLocal,nameEn:englishName};
  for(const name of [nameLocal,englishName].filter(Boolean)){
   const key=province+'|'+normalizeName(name);
   const list=index.get(key)||[];
   if(!list.some(existing=>existing.id===item.id))list.push(item);
   index.set(key,list);
  }
 }
 return index;
}
async function fetchIndex(fetchImpl=fetch){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),SOURCE_TIMEOUT_MS);
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
 const matches=index.get(province+'|'+normalizeName(candidateName))||[];
 if(!matches.length)return {status:'no_match'};
 if(matches.length!==1)return {status:'ambiguous_match'};
 const place=matches[0];
 return {status:'matched',source:{
  name:'Tourism Authority of Thailand — Open Data',
  url:TAT_DATASET_URL,id:place.id,license:'Open Data Common'
 },fields:{name:place.nameEn||place.nameLocal,nameLocal:place.nameLocal},
 englishNameFound:!!place.nameEn};
}
async function resolveIndependentDraft({province,candidateName,fetchImpl=fetch,load=loadIndex,waitMs=LOOKUP_WAIT_MS}){
 if(!isThaiProvince(province)||typeof candidateName!=='string'||!candidateName.trim()||candidateName.length>160)
  return {status:'invalid_lookup'};
 let timeout;
 const outcome=await Promise.race([
  Promise.resolve().then(()=>load({fetchImpl})).then(index=>({index})).catch(()=>({error:true})),
  new Promise(resolve=>{timeout=setTimeout(()=>resolve({loading:true}),waitMs);})
 ]);
 clearTimeout(timeout);
 if(outcome.loading)return {status:'source_loading'};
 if(outcome.error)return {status:'source_unavailable'};
 return matchIndependentRecord(outcome.index,province,candidateName);
}
// Warm the official source index without delaying API startup or any request.
// Only names are retained in memory; no Google Places content is cached.
function warmNamesIndex(){void loadIndex().catch(()=>{});}
module.exports={TAT_CSV_URL,MAX_BYTES,SOURCE_TIMEOUT_MS,LOOKUP_WAIT_MS,indexRecords,
 matchIndependentRecord,resolveIndependentDraft,fetchIndex,warmNamesIndex};
