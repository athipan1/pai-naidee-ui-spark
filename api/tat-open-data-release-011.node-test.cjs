const test=require('node:test');
const assert=require('node:assert/strict');
const batch=require('./additional-tat-open-data-batch-011.cjs');
const {SEED_PLACES}=require('./postgres-db.cjs');
const {auditPlaceImport}=require('./place-quality.cjs');
const expected=[
['tat-2015120421550718297','ชมรมส่งเสริมการท่องเที่ยวโดยชุมชนบ้านชากแง้ว',12.8322221,100.9662213],
['tat-2015120421550717971','วัดพระใหญ่',12.9143312,100.8685384],
['tat-2012080610583316342','พิพิธภัณฑ์ภาพวาด 3 มิติ',12.9291169,100.9218676],
['tat-20100518224629568','ถ้ำเขาชะอางค์โอน',13.2088719,101.6516234],
['tat-201005182246293332','เมืองจำลอง',12.9551857,100.9088535],
];
test('Chon Buri batch 011 releases exactly five selected distinct TAT source records',()=>{
 assert.deepEqual(batch.map(p=>p.id),expected.map(x=>x[0]));
 assert.equal(SEED_PLACES.length,194);
 assert.equal(SEED_PLACES.filter(p=>p.province==='ชลบุรี').length,71);
 assert.equal(new Set(SEED_PLACES.map(p=>p.id)).size,194);
 assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('source records preserve original TAT coordinates and zero-fabrication requirements',()=>{
 for(const [id,name,lat,lng] of expected){
 const p=batch.find(x=>x.id===id);assert.ok(p,id);
 assert.equal(p.nameLocal,name);assert.equal(p.lat,lat);assert.equal(p.lng,lng);
 assert.equal(p.province,'ชลบุรี');assert.equal(p.rating,0);assert.equal(p.reviewCount,0);
 assert.equal(p.imageUrl,null);assert.equal(p.verifiedAt,null);assert.equal(p.descriptionEn,null);
 assert.deepEqual(p.tags,[]);assert.ok(p.description.length>=45);
 assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
 assert.ok(!('openingHours' in p)&&!('price' in p));
 }
});