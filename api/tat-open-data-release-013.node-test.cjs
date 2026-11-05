const test=require('node:test');
const assert=require('node:assert/strict');
const batch=require('./additional-tat-open-data-batch-013.cjs');
const {SEED_PLACES}=require('./postgres-db.cjs');
const {auditPlaceImport}=require('./place-quality.cjs');
const expected=[
 ['tat-201005182246293428','อ่าวดงตาล',12.6554581,100.922451],
 ['tat-2015120421550718119','หาดเทียนทะเล',12.643518498083282,100.92836536539475],
 ['tat-201005182246293336','เมืองพระรถ',13.4669973,101.164865],
];
test('batch 013 publishes only the 3 approved Chon Buri source sites',()=>{
 assert.deepEqual(batch.map(p=>p.id),expected.map(r=>r[0]));
 assert.equal(SEED_PLACES.length,193);
 assert.equal(SEED_PLACES.filter(p=>p.province==='ชลบุรี').length,70);
 assert.equal(new Set(SEED_PLACES.map(p=>p.id)).size,193);
 assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('preserve TAT IDs and documented GPS correction; no invented fields',()=>{
 for(const [id,thai,lat,lng] of expected){
  const p=batch.find(p=>p.id===id);
  assert.ok(p,id);assert.equal(p.nameLocal,thai);
  assert.equal(p.lat,lat);assert.equal(p.lng,lng);assert.equal(p.province,'ชลบุรี');
  assert.equal(p.rating,0);assert.equal(p.reviewCount,0);assert.equal(p.imageUrl,null);
  assert.equal(p.verifiedAt,null);assert.equal(p.descriptionEn,null);
  assert.deepEqual(p.tags,[]);assert.ok(p.description.length>=40);
  assert.ok(!('openingHours' in p)&&!('price' in p));
  assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
 }
});

test('official DMR UTM replacement prevents out-of-area TAT Thian Talay pin',()=>{
 const x=batch.find(p=>p.id==='tat-2015120421550718119');
 // Government source UTM WGS84 zone 47N: E709445 N1398486.
 // EPSG:32647 -> EPSG:4326; reject old TAT latitude 12.8139169.
 assert.ok(Math.abs(x.lat-12.643518498083282)<0.00000001);
 assert.ok(Math.abs(x.lng-100.92836536539475)<0.00000001);
 assert.ok(Math.abs(x.lat-12.8139169)>0.15,'Old source pin points ~19 km north');
});
