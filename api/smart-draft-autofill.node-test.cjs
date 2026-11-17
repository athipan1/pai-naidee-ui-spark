'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {TAT_CSV_URL,MAX_BYTES,indexRecords,matchIndependentRecord,resolveIndependentDraft,fetchIndex}=require('./smart-draft-autofill.cjs');

function record(override={}){
 return {ATT_ID:'12345678901234567',ATT_NAME_TH:'หาดแหลมเจริญ',ATT_NAME_EN:'Laem Charoen Beach',
  ATT_DETAIL_TH:'ชายหาดสาธารณะในจังหวัดระยอง มีพื้นที่พักผ่อนและบรรยากาศริมทะเล',
  PROVINCE_NAME_TH:'ระยอง',ATT_CATEGORY:'1',ATT_TYPE:'19',ATT_LOCATION:'12.65, 101.27',...override};
}
test('exact TAT place+province match fills independently sourced fields with attribution',()=>{
 const index=indexRecords([record()]);
 const matched=matchIndependentRecord(index,'ระยอง','หาดแหลมเจริญ');
 assert.equal(matched.status,'matched');
 assert.deepEqual(matched.fields,{name:'Laem Charoen Beach',nameLocal:'หาดแหลมเจริญ'});
 assert.equal(matched.fields.lat,undefined);
 assert.equal(matched.fields.lng,undefined);
 assert.equal(matched.fields.description,undefined);
 assert.equal(matched.fields.category,undefined);
 assert.equal(matched.source.id,'tat-12345678901234567');
 assert.equal(matched.source.license,'Open Data Common');
 assert.equal(matched.englishNameFound,true);
 assert.equal(matchIndependentRecord(index,'ชลบุรี','หาดแหลมเจริญ').status,'no_match');
 assert.equal(matchIndependentRecord(index,'ระยอง','หาดอื่น').status,'no_match');
});
test('reject ambiguous matches; never guess a place or fabricate English translation',()=>{
 const index=indexRecords([
  record({ATT_ID:'source1',ATT_NAME_EN:'-'}),
  record({ATT_ID:'source2',ATT_NAME_EN:'Laem Charoen Beach'}),
 ]);
 assert.equal(matchIndependentRecord(index,'ระยอง','หาดแหลมเจริญ').status,'ambiguous_match');
 const unique=matchIndependentRecord(indexRecords([record({ATT_NAME_EN:'-'})]),'ระยอง','หาดแหลมเจริญ');
 assert.equal(unique.status,'matched');
 assert.equal(unique.fields.name,unique.fields.nameLocal);
 assert.equal(unique.englishNameFound,false);
});
test('names-only matching accepts incomplete TAT rows but requires ID, Thai name and province',()=>{
 for(const missing of [
  {ATT_DETAIL_TH:'-'},{ATT_CATEGORY:'3',ATT_TYPE:'99'},
  {ATT_LOCATION:''},{ATT_LOCATION:'100.1, 12.6'},
 ]){
  const result=matchIndependentRecord(indexRecords([record(missing)]),'ระยอง','หาดแหลมเจริญ');
  assert.equal(result.status,'matched','other fields do not block finding a name');
  assert.deepEqual(Object.keys(result.fields).sort(),['name','nameLocal']);
 }
 for(const invalid of [{PROVINCE_NAME_TH:'จังหวัดที่ไม่มีจริง'},{ATT_NAME_TH:'-'},{ATT_ID:'invalid id'}]){
  assert.equal(matchIndependentRecord(indexRecords([record(invalid)]),'ระยอง','หาดแหลมเจริญ').status,'no_match');
 }
});
test('uses a fixed official TAT URL and size cap, not user-supplied URLs or Google calls',async()=>{
 const header='ATT_ID,ATT_NAME_TH,ATT_NAME_EN,ATT_DETAIL_TH,PROVINCE_NAME_TH,ATT_CATEGORY,ATT_TYPE,ATT_LOCATION\n';
 const row='"12345678901234567","หาดแหลมเจริญ","Laem Charoen Beach","ชายหาดสาธารณะในจังหวัดระยอง มีพื้นที่พักผ่อนและบรรยากาศริมทะเล","ระยอง","1","19","12.65, 101.27"\n';
 let called=0;
 const index=await fetchIndex(async(url,options)=>{
  called++;
  assert.equal(url,TAT_CSV_URL);
  assert.equal(options.headers.Accept,'text/csv');
  return {ok:true,headers:{get:()=>String(Buffer.byteLength(header+row))},
   arrayBuffer:async()=>Buffer.from(header+row,'utf8')};
 });
 assert.equal(called,1);
 assert.equal(matchIndependentRecord(index,'ระยอง','หาดแหลมเจริญ').status,'matched');
 await assert.rejects(fetchIndex(async()=>({
  ok:true,headers:{get:()=>String(MAX_BYTES+1)},arrayBuffer:async()=>Buffer.from('')
 })),/size/);
});
test('source outage falls back safely without writing Google preview data',async()=>{
 const result=await resolveIndependentDraft({province:'ระยอง',candidateName:'หาดแหลมเจริญ',load:async()=>{throw Error('unavailable')}});
 assert.deepEqual(result,{status:'source_unavailable'});
 assert.equal((await resolveIndependentDraft({province:'invalid',candidateName:'beach',load:async()=>{throw Error('must not call')}})).status,'invalid_lookup');
});
test('name lookup is bounded while the source downloads in the background',async()=>{
 const never=new Promise(()=>{});
 const pending=await resolveIndependentDraft({province:'ระยอง',candidateName:'หาดแหลมเจริญ',load:()=>never,waitMs:2});
 assert.deepEqual(pending,{status:'source_loading'});
});
