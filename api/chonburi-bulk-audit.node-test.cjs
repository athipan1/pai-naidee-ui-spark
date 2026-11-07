const test=require('node:test'),assert=require('node:assert/strict');
const {polygonBoundary,inProvince,review}=require('./chonburi-bulk-audit.cjs');
const ring=[{lat:12.5,lon:100.5},{lat:13.6,lon:100.5},{lat:13.6,lon:101.5},
 {lat:12.5,lon:101.5},{lat:12.5,lon:100.5}];
const inner=[{lat:13.1,lon:101.1},{lat:13.2,lon:101.1},{lat:13.2,lon:101.2},
 {lat:13.1,lon:101.2},{lat:13.1,lon:101.1}];
const polygon={type:'relation',id:123,tags:{'ISO3166-2':'TH-20',admin_level:'4',
 boundary:'administrative'},members:[{type:'way',role:'outer',geometry:ring.slice(0,3)},
 {type:'way',role:'outer',geometry:ring.slice(2)},
 {type:'way',role:'inner',geometry:inner}]};
const existing=[{nameLocal:'วัดเขาบ่อกวางทอง',coordinates:{lat:13.28303,lng:101.3188}}];
test('joins relation way fragments and respects holes',()=>{
 const boundary=polygonBoundary(polygon);
 assert.equal(inProvince({lat:13.28,lng:101.32},boundary),true);
 assert.equal(inProvince({lat:13.15,lng:101.15},boundary),false);
 assert.equal(inProvince({lat:14,lng:101},boundary),false);
});
test('rejects missing or invalid province relation and incomplete outer ring',()=>{
 assert.throws(()=>polygonBoundary({...polygon,tags:{...polygon.tags,'ISO3166-2':'TH-21'}}));
 assert.throws(()=>polygonBoundary({...polygon,members:[polygon.members[0]]}),/Incomplete/);
});
test('reports production duplicates and ODbL hold, never approves entries',()=>{
 const wd=[{item:{value:'https://www.wikidata.org/entity/Q88888'},
 nameTh:{value:'วัดเขาบ่อกวางทอง'},coord:{value:'Point(101.3188 13.28303)'}}];
 const osm=[{type:'node',id:88,tags:{name:'อุทยานตัวอย่าง',wikidata:'Q88888'},
 lat:13.28304,lon:101.31881}];
 const r=review({wdRows:wd,osmRows:osm,existing,boundary:polygonBoundary(polygon)});
 assert.equal(r.approved,0);assert.equal(r.rows.length,2);
 assert.ok(r.rows[0].blockers.includes('possible_duplicate'));
 assert.ok(r.rows[1].blockers.includes('odbl_legal_review'));
 assert.ok(r.rows[1].blockers.includes('possible_duplicate'));
});
test('hard blocks outside polygon rather than using bounding box',()=>{
 const wd=[{item:{value:'https://www.wikidata.org/entity/Q88888'},
 nameTh:{value:'น้ำตกทดลอง'},coord:{value:'Point(101.15 13.15)'}}];
 const r=review({wdRows:wd,osmRows:[],existing,boundary:polygonBoundary(polygon)});
 assert.equal(r.rows[0].status,'rejected');
 assert.ok(r.rows[0].blockers.includes('outside_province_polygon'));
});
test('requires live baseline and caps input size',()=>{
 assert.throws(()=>review({wdRows:[],osmRows:[],existing:[],boundary:polygonBoundary(polygon)}));
 assert.throws(()=>review({wdRows:Array(601).fill({}),osmRows:[],existing,
  boundary:polygonBoundary(polygon)}),/safety cap/);
});
