const test=require('node:test');
const assert=require('node:assert/strict');
const batch=require('./additional-tat-open-data-batch-012.cjs');
const {SEED_PLACES}=require('./postgres-db.cjs');
const {auditPlaceImport}=require('./place-quality.cjs');
const expected=[
 ['tat-201005182246293051','หอพระพุทธสิหิงค์มิ่งมงคลสิรินาถ',13.3685335,100.9868746],
 ['tat-201005182246293199','อเนกกุศลศาลา',12.78782568844963,100.95535709942023],
 ['tat-2015120421550718116','พิพิธภัณฑ์เรือนไทย',13.4377257,101.0526614],
];
test('batch 012 adds exactly three corroborated Chon Buri attractions',()=>{
 assert.deepEqual(batch.map(p=>p.id),expected.map(x=>x[0]));
 assert.equal(SEED_PLACES.length,190);
 assert.equal(SEED_PLACES.filter(p=>p.province==='ชลบุรี').length,67);
 assert.equal(new Set(SEED_PLACES.map(p=>p.id)).size,190);
 assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
 assert.equal(SEED_PLACES.filter(p=>p.id==='tat-2015120421550718071').length,0,
    'the Viharn Sien duplicate must never be separately published');
});
test('retain exact TAT source pins and no invented images, ratings or opening hours',()=>{
 for(const [id,thai,lat,lng] of expected){
  const p=batch.find(x=>x.id===id);assert.ok(p,id);
  assert.equal(p.nameLocal,thai);assert.equal(p.lat,lat);assert.equal(p.lng,lng);
  assert.equal(p.province,'ชลบุรี');assert.equal(p.category,'Culture');
  assert.equal(p.rating,0);assert.equal(p.reviewCount,0);assert.equal(p.imageUrl,null);
  assert.equal(p.verifiedAt,null);assert.equal(p.descriptionEn,null);assert.deepEqual(p.tags,[]);
  assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
  assert.ok(p.description.length>=45);
  assert.ok(!('openingHours' in p)&&!('price' in p));
 }
});