'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {validateSearch,overpassQuery,toCandidates,discover}=require('./place-discovery.cjs');
const province='ชลบุรี';
const item={type:'node',id:123,lat:13.3,lon:100.9,tags:{tourism:'attraction',name:'สวนตัวอย่าง'}};
const sql={begin:async(_mode,cb)=>cb(async()=>[{id:'existing',name:'สวนตัวอย่าง',name_local:'',lat:13.3,lng:100.9}])};
const okFetch=async()=>({ok:true,headers:{get:()=>null},text:async()=>JSON.stringify({elements:[item]})});
test('province allowlist, source and limit validation',()=>{
 assert.ok(validateSearch({province,sources:['osm'],limit:100}));
 for(const body of [{province:'จังหวัดปลอม',sources:['osm'],limit:1},{province,sources:['tat'],limit:1},{province,sources:['osm'],limit:101},{province,sources:['osm'],limit:'100'}])
  assert.equal(validateSearch(body),null);
});
test('query scoped to Thailand and chosen province',()=>{
 const q=overpassQuery(province,10);
 assert.match(q,/ISO3166-1/);assert.match(q,/admin_level"="4/);assert.ok(q.includes(JSON.stringify(province)));
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
