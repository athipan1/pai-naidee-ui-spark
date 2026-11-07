const test=require('node:test');
const assert=require('node:assert/strict');
const {adaptWikidata,adaptOsm,stage,distanceMeters}=require('./tourism-source-adapters.cjs');
const W={item:{value:'https://www.wikidata.org/entity/Q3576017'},nameTh:{value:'สวนสัตว์เปิดเขาเขียว'},
 nameEn:{value:'Khao Kheow Open Zoo'},coord:{value:'Point(101.0563889 13.2163889)'}};
const O={type:'way',id:132599367,tags:{name:'สวนสัตว์เปิดเขาเขียว','name:en':'Khao Kheow Open Zoo',
 wikidata:'Q3576017'},center:{lat:13.21358,lon:101.05962}};
test('real Wikidata Q3576017 representation remains review-only',()=>{
 const result=stage([W],adaptWikidata,[]);
 assert.equal(result.candidates.length,1);
 assert.equal(result.approved,0);
 assert.equal(result.candidates[0].sourceId,'Q3576017');
 assert.equal(result.candidates[0].status,'needs_review');
 assert.ok(result.candidates[0].requires.includes('province_polygon_check'));
});
test('same entity linked between Wikidata and OSM is flagged even with different coordinates',()=>{
 const first=adaptWikidata(W);
 assert.deepEqual(stage([O],adaptOsm,[first]).rejected[0].issues,['possible_duplicate']);
});
test('nearby normalized Thai name from Production snapshot is a duplicate',()=>{
 const row={...O,tags:{'name:th':'วัดเขาบ่อกวางทอง',wikidata:''},
 center:{lat:13.28303,lon:101.3188}};
 const existing=[{name_local:'วัดเขาบ่อกวางทอง',lat:13.282924,lng:101.318249}];
 assert.ok(distanceMeters({lat:13.28303,lng:101.3188},{lat:13.282924,lng:101.318249})<100);
 assert.deepEqual(stage([row],adaptOsm,existing).rejected[0].issues,['possible_duplicate']);
});
test('reject out-of-area, missing identifiers and non-Thai local names',()=>{
 const r=stage([{...O,id:null,lat:20,center:undefined,tags:{name:'Zoo'}}],adaptOsm,[]);
 assert.ok(r.rejected[0].issues.includes('missing_provenance'));
 assert.ok(r.rejected[0].issues.includes('outside_chonburi_bbox'));
 assert.ok(r.rejected[0].issues.includes('missing_thai_name'));
});
test('one source duplicate is not offered twice',()=>{
 const r=stage([O,O],adaptOsm,[]);
 assert.equal(r.candidates.length,1);assert.equal(r.rejected.length,1);
});
test('never stage without a provided comparison catalogue',()=>{
 assert.throws(()=>stage([W],adaptWikidata),/Production comparison/);
});
