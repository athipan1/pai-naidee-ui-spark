'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {validate,signCandidate,verifyCandidate,discover}=require('./geoapify-place-discovery.cjs');
const SECRET='unit-test-existing-geoapify-api-key';
const ID='51a1f444490668134059dc0a96dfac6c';
const province='ระยอง';
const area={country_code:'th',result_type:'state',state:'Rayong',place_id:ID,name:'Rayong'};
const feature=(props={})=>({
 type:'Feature',geometry:{type:'Point',coordinates:[101.25,12.65]},
 properties:{place_id:ID,name:'หาดแหลมเจริญ',
  name_international:{th:'หาดแหลมเจริญ',en:'Laem Charoen Beach'},
  formatted:'หาดแหลมเจริญ Rayong Thailand',state:'Rayong',country_code:'th',
  categories:['tourism.attraction'],...props}
});
function requestFactory(features=[feature()],geocode=[area]){
 const calls=[];
 return {calls,fetchImpl:async (url,options)=>{
   const u=new URL(url);calls.push({pathname:u.pathname,params:u.searchParams,options});
   if(u.pathname==='/v1/geocode/search')return {ok:true,json:async()=>({results:geocode})};
   if(u.pathname==='/v2/places')return {ok:true,json:async()=>({features})};
   throw Error('Unexpected request: '+u.pathname);
 }};
}
const search=async(api,extra={})=>discover({province,limit:10},{
 env:{GEOAPIFY_API_KEY:SECRET},userId:'admin-1',getSql:()=>assert.fail('No SQL needed for fixture'),
 readExistingImpl:async()=>[],...api,...extra
});
test('validates 77-province selection, limit and missing source',()=>{
 assert.deepEqual(validate({province,limit:10}),{province,limit:10});
 for(const invalid of [{province:'ระยอง ',limit:10},{province,limit:11},{province,limit:0},{province:'invalid',limit:2}])
  assert.equal(validate(invalid),null);
});
test('finds province boundary, queries only Geoapify tourism POIs and proposes reviewable coordinates',async()=>{
 const api=requestFactory();
 const result=await search(api);
 assert.equal(result.status,'ok');
 assert.equal(api.calls.length,2);
 assert.equal(api.calls[0].pathname,'/v1/geocode/search');
 assert.equal(api.calls[0].params.get('type'),'state');
 assert.equal(api.calls[1].pathname,'/v2/places');
 assert.equal(api.calls[1].params.get('filter'),'place:'+ID);
 assert.equal(api.calls[1].params.get('limit'),'40');
 assert.equal(result.candidates.length,1);
 const candidate=result.candidates[0];
 assert.equal(candidate.name,'Laem Charoen Beach');
 assert.equal(candidate.nameLocal,'หาดแหลมเจริญ');
 assert.equal(candidate.source,'geoapify');
 assert.equal(candidate.duplicateStatus,'not_detected');
 assert.equal(candidate.lat,12.65);
 assert.equal(candidate.lng,101.25);
 assert.equal(result.automaticImport,false);
 assert.equal(result.publicationAllowed,false);
 assert.equal(result.candidates[0].candidateToken.includes(SECRET),false);
 const verified=verifyCandidate(candidate.candidateToken,'admin-1',SECRET);
 assert.equal(verified.nameLocal,'หาดแหลมเจริญ');
 assert.equal(verified.province,province);
 assert.equal(verified.lat,12.65);
 assert.equal(verifyCandidate(candidate.candidateToken,'other-admin',SECRET),null);
 assert.equal(verifyCandidate(candidate.candidateToken,'admin-1','wrong-key'),null);
});
test('rejects unconfirmed province boundaries before Places request',async()=>{
 const api=requestFactory([feature()],[{...area,state:'Chon Buri'}]);
 const result=await search(api);
 assert.equal(result.status,'province_unresolved');
 assert.equal(api.calls.length,1);
});
test('strict state validation rejects neighbour province, cross-country and missing coordinates',async()=>{
 const api=requestFactory([
   feature(),
   feature({place_id:'other-source-12345678901234',state:'Chon Buri'}),
   feature({place_id:'another-source-1234567890',country_code:'la'}),
   feature({place_id:'other-name-123456789012345',name:'เมืองระยอง',categories:['populated_place.city']}),
   feature({place_id:'bad-coords-12345678901234',lat:30}),
 ]);
 const result=await search(api);
 assert.equal(result.status,'ok');
 assert.equal(result.candidates.length,1);
 assert.ok(result.excludedOutsideProvince>=3);
});
test('flags published duplicate by name or nearby coordinate and never creates a draft',async()=>{
 const api=requestFactory();
 const result=await search(api,{readExistingImpl:async()=>[{id:'published-1',name:'Laem Charoen Beach',name_local:'หาดแหลมเจริญ',lat:12.65,lng:101.25,aliases:[],external_ids:[]}]});
 assert.equal(result.candidates[0].duplicateStatus,'possible_duplicate');
 assert.equal(result.candidates[0].duplicateMatches[0].placeId,'published-1');
});
test('invalid provider response and outage do not fabricate places',async()=>{
 const api=requestFactory([]);assert.equal((await search(api)).candidates.length,0);
 const failure=await search({fetchImpl:async()=>({ok:false,status:429})});
 assert.equal(failure.status,'provider_quota');
 const disabled=await discover({province,limit:2},{
   env:{},userId:'admin-1',getSql:()=>assert.fail('No SQL'),
   fetchImpl:()=>assert.fail('Provider must not be called when disabled')
 });
 assert.equal(disabled.status,'disabled');
});
test('tampered, expired, overly long and wrong-user tokens are refused',()=>{
 const candidate={id:ID,name:'Rayong Beach',nameLocal:'หาดระยอง',lat:12.65,lng:101.25,province};
 const token=signCandidate(candidate,'admin-1',SECRET,1000);
 assert.ok(verifyCandidate(token,'admin-1',SECRET,1000));
 assert.equal(verifyCandidate(token,'admin-1',SECRET,1000+600001),null);
 assert.equal(verifyCandidate(token,'admin-2',SECRET,1000),null);
 assert.equal(verifyCandidate(token+'x','admin-1',SECRET,1000),null);
 assert.equal(verifyCandidate('x'.repeat(2500),'admin-1',SECRET,1000),null);
});
