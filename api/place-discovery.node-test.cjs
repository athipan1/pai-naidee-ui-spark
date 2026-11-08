'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateSearch,overpassQuery,toCandidates,discover,requestOverpass,fetchWithLimitedRetry,OSM_USER_AGENT}=require('./place-discovery.cjs');
const province='ชลบุรี';
const item={type:'node',id:123,lat:13.3,lon:100.9,tags:{tourism:'attraction',name:'สวนตัวอย่าง'}};
const sql={begin:async(_mode,cb)=>cb(async()=>[{id:'existing',name:'สวนตัวอย่าง',name_local:'',lat:13.3,lng:100.9}])};
const okFetch=async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify({elements:[item]})});
test('province allowlist, source and limit validation',()=>{
 assert.ok(validateSearch({province,sources:['osm'],limit:100}));
 for(const body of [{province:'จังหวัดปลอม',sources:['osm'],limit:1},{province,sources:['tat'],limit:1},{province,sources:['osm'],limit:101},{province,sources:['osm'],limit:'100'}])
  assert.equal(validateSearch(body),null);
});
test('query scoped to selected administrative province',()=>{
 const q=overpassQuery(province,10);
 assert.match(q,/boundary"="administrative/);assert.match(q,/admin_level"="4/);assert.ok(q.includes(JSON.stringify(province)));
 assert.doesNotMatch(q,/out center 100;/);
});
test('duplicate detection and attribution',()=>{
 const found=toCandidates([item,item],province,[{name:'สวนตัวอย่าง',name_local:'',lat:13.3,lng:100.9}],100);
 assert.equal(found.length,1);assert.equal(found[0].duplicateStatus,'possible_duplicate');
 assert.equal(found[0].license,'ODbL 1.0');assert.match(found[0].evidence.url,/openstreetmap.org/);
});
test('successful discovery is read only and never creates drafts',async()=>{
 const result=await discover({province,limit:10,getSql:()=>sql,fetchImpl:okFetch});
 assert.equal(result.candidates.length,1);assert.equal(result.automaticImport,false);
 assert.equal(result.publicationAllowed,false);
});
test('no matches returns empty array, not an error',async()=>{
 const result=await discover({province,limit:10,getSql:()=>sql,fetchImpl:async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify({elements:[]})})});
 assert.deepEqual(result.candidates,[]);
});
test('upstream failure throws, not mistaken for zero matches',async()=>{
 await assert.rejects(discover({province,limit:10,getSql:()=>sql,fetchImpl:async()=>({ok:false,status:429})}),/429/);
});

test('timeout is classified and never retried',async()=>{
 let calls=0;
 const fetchImpl=async(_url,{signal})=>{calls++;return new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('aborted')),{once:true}));};
 await assert.rejects(fetchWithLimitedRetry({province,limit:10,fetchImpl,endpoint:'https://example.test',timeoutMs:5}),error=>error.code==='timeout');
 assert.equal(calls,1);
});
test('rate limited upstream is never retried',async()=>{
 let calls=0;
 const fetchImpl=async()=>{calls++;return {ok:false,status:429};};
 await assert.rejects(fetchWithLimitedRetry({province,limit:10,fetchImpl,endpoint:'https://example.test',timeoutMs:100}),error=>error.code==='rate_limited');
 assert.equal(calls,1);
});
test('non-rate-limited failures do not retry',async()=>{
 let calls=0;
 const fetchImpl=async()=>{calls++;return {ok:false,status:503};};
 await assert.rejects(fetchWithLimitedRetry({province,limit:10,fetchImpl,endpoint:'https://example.test'}),error=>error.code==='upstream_http');
 assert.equal(calls,1);
});
test('invalid upstream response is not confused with empty results',async()=>{
 await assert.rejects(requestOverpass({province,limit:10,fetchImpl:async()=>({ok:true,headers:{get:()=>null},text:async()=>'<html>failure</html>'}),endpoint:'https://example.test'}),error=>error.code==='unavailable');
});

test('User-Agent identifies application and real GitHub issue contact',async()=>{
 let headers;
 await requestOverpass({province,limit:1,endpoint:'https://example.test',fetchImpl:async(_url,opts)=>{headers=opts.headers;return okFetch();}});
 assert.equal(headers['User-Agent'],OSM_USER_AGENT);
 assert.match(OSM_USER_AGENT,/PaiNaiDee.*github.com\/athipan1\/pai-naidee-ui-spark\/issues/);
});
test('HTTP 406 distinguishes gateway rejection and never retries',async()=>{
 let calls=0;
 const fetchImpl=async()=>{calls++;return {ok:false,status:406,text:async()=>'<html><h1>406 Not Acceptable</h1><center>nginx</center></html>'};};
 await assert.rejects(fetchWithLimitedRetry({province,limit:1,endpoint:'https://example.test',fetchImpl}),e=>e.code==='blocked'&&/rejected_by_gateway/.test(e.message));
 assert.equal(calls,1);
});
