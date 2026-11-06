const test=require('node:test');
const assert=require('node:assert/strict');
const batch=require('./additional-tat-open-data-batch-009.cjs');
const {SEED_PLACES}=require('./postgres-db.cjs');
const {auditPlaceImport}=require('./place-quality.cjs');
const ids=[
'tat-2015120421550718125','tat-2015120421550718124','tat-2015120421550718121',
'tat-201005182246291737','tat-201005182246293007','tat-20100518224629991',
'tat-2015120421550718067','tat-20100518224629350','tat-2015120421550718079',
'tat-201005182246293417'];
test('Chon Buri 009 releases exactly ten chosen TAT records',()=>{
  assert.deepEqual(batch.map(p=>p.id),ids);
  assert.equal(SEED_PLACES.length,194);
  assert.equal(SEED_PLACES.filter(p=>p.province==='ชลบุรี').length,71);
  assert.equal(new Set(SEED_PLACES.map(p=>p.id)).size,194);
  assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('no invented photos, user ratings, hours, translations or timestamps',()=>{
 for(const p of batch){
 assert.equal(p.province,'ชลบุรี');assert.equal(p.rating,0);assert.equal(p.reviewCount,0);
 assert.equal(p.imageUrl,null);assert.equal(p.verifiedAt,null);assert.equal(p.descriptionEn,null);
 assert.deepEqual(p.tags,[]);assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
 assert.equal(p.sourceName,'Tourism Authority of Thailand — Open Data');
 assert.ok(p.description.length>=35&&p.nameLocal);assert.ok(p.lat>=12&&p.lat<=14&&p.lng>=100&&p.lng<=102);
 assert.ok(!('openingHours' in p)&&!('price' in p));
 }
});
test('preserves exact source IDs and source coordinates',()=>{
  for(const [id,lat,lng] of [
   ['tat-2015120421550718125',12.9592572,100.8846511],
   ['tat-2015120421550718121',12.7420875,100.8408871],
   ['tat-201005182246291737',13.3927964,100.9885299],
   ['tat-201005182246293007',13.4517979,101.1769884],
   ['tat-2015120421550718067',13.1690831,100.8054641],
   ['tat-201005182246293417',13.208179,100.9750484]
  ]){
    const p=SEED_PLACES.find(v=>v.id===id);assert.ok(p,id);assert.equal(p.lat,lat);assert.equal(p.lng,lng);
  }
});