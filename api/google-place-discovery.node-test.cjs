'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {availability,validate,discoverGoogle,MASK,classifyCandidates}=require('./google-place-discovery.cjs');
const env={GOOGLE_DISCOVERY_ENABLED:'true',GOOGLE_DISCOVERY_EXPIRES_AT:'2099-01-01',GOOGLE_PLACES_API_KEY:'stub',GOOGLE_CLOUD_QUOTAS_CONFIRMED:'true',GOOGLE_BILLING_ALERTS_CONFIRMED:'true'};
const input={province:'ชลบุรี',sources:['google'],limit:10};
test('pilot is disabled by default and requires billing confirmations',()=>{
 assert.equal(availability({}).enabled,false);
 assert.equal(availability(env).enabled,true);
 assert.equal(availability({...env,GOOGLE_BILLING_ALERTS_CONFIRMED:'false'}).enabled,false);
});
test('only manual Chonburi searches allowed',()=>{
 assert.deepEqual(validate(input),{province:'ชลบุรี',limit:10});
 assert.equal(validate({...input,province:'เชียงใหม่'}),null);
 assert.equal(validate({...input,limit:100}),null);
 assert.equal(validate({...input,sources:['osm']}),null);
});
test('disabled gate never reserves quota or sends request',async()=>{
 let calls=0;
 const r=await discoverGoogle({province:'ชลบุรี',limit:10},{env:{},reserve:async()=>{calls++;return true},fetchImpl:async()=>{calls++;throw Error('unexpected')}});
 assert.equal(r.status,'disabled');assert.equal(calls,0);
});
test('quota exhausted never calls Google',async()=>{
 const r=await discoverGoogle({province:'ชลบุรี',limit:10},{env,reserve:async kind=>{assert.equal(kind,'places_search');return false},fetchImpl:async()=>{throw Error('unexpected')}});
 assert.equal(r.status,'quota_exhausted');
});
test('search results are ephemeral, without import or DB writes',async()=>{
 let count=0;
 const r=await discoverGoogle({province:'ชลบุรี',limit:10},{env,reserve:async()=>true,fetchImpl:async(_url,opts)=>{
 count++;assert.equal(opts.headers['X-Goog-FieldMask'],MASK);
 assert.ok(!MASK.includes('photos'));assert.equal(JSON.parse(opts.body).pageSize,10);
 return {ok:true,json:async()=>({places:[{id:'abc',displayName:{text:'วัดตัวอย่าง'},location:{latitude:13.1,longitude:100.9},formattedAddress:'ชลบุรี',googleMapsUri:'https://www.google.com/maps/place/test'}]})};
 }});
 assert.equal(count,1);assert.equal(r.status,'ok');assert.equal(r.candidates.length,1);
 assert.equal(r.candidates[0].liveOnly,true);assert.equal(r.automaticImport,false);
 assert.equal(r.publicationAllowed,false);assert.equal(r.candidates[0].duplicateStatus,'not_checked');
});
test('upstream failure does not masquerade as no places',async()=>{
 const r=await discoverGoogle({province:'ชลบุรี',limit:1},{env,reserve:async()=>true,fetchImpl:async()=>({ok:false,status:429})});
 assert.equal(r.status,'unavailable');
});

test('duplicate matching by Google ID, name and coordinates',()=>{
 const candidate=(id,name,lat,lng)=>({placeId:id,name,lat,lng,holds:['MANUAL_REVIEW']});
 const existing=[{id:'p1',name:'น้ำตกชันตาเถร',name_local:'',lat:13.24,lng:101.04,aliases:[],external_ids:[{source:'google_places',id:'id1'}]}];
 const rows=classifyCandidates([candidate('id1','other',12,100),candidate('id2','น้ำตกชันตาเถร',12,100),candidate('id3','other',13.2401,101.04),candidate('id4','other',12,100)],existing);
 assert.deepEqual(rows.map(x=>x.duplicateStatus),['existing_place','possible_duplicate','possible_duplicate','not_detected']);
 assert.equal(rows[0].duplicateMatches[0].reason,'google_place_id');
});
