const test=require('node:test');
const assert=require('node:assert/strict');
const batch=require('./additional-tat-open-data-batch-008.cjs');
const {SEED_PLACES}=require('./postgres-db.cjs');
const {auditPlaceImport}=require('./place-quality.cjs');
const expected=[
'tat-201005182246293423','tat-2010120911214112694','tat-2015120421550718123',
'tat-2015120421550718003','tat-201005182246293252','tat-2010120911214113306',
'tat-2015120421550718063','tat-2011032413454815424','tat-201005182246291963',
'tat-2010120911214113304','tat-201005182246293266','tat-201005182246293232',
'tat-2015120421550718120','tat-2010120911214113305'];
test('Chon Buri batch 008 publishes 14 vetted and distinct source IDs only',()=>{
  assert.deepEqual(batch.map(x=>x.id),expected);
  assert.equal(SEED_PLACES.length,187);
  assert.equal(SEED_PLACES.filter(x=>x.province==='ชลบุรี').length,64);
  assert.equal(new Set(SEED_PLACES.map(x=>x.id)).size,187);
  assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('batch 008 preserves source pins and zero-fabrication policy',()=>{
  for(const p of batch){
    assert.equal(p.province,'ชลบุรี');assert.equal(p.sourceName,'Tourism Authority of Thailand — Open Data');
    assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
    assert.equal(p.rating,0);assert.equal(p.reviewCount,0);assert.equal(p.imageUrl,null);
    assert.equal(p.verifiedAt,null);assert.equal(p.descriptionEn,null);
    assert.deepEqual(p.tags,[]);assert.ok(p.nameLocal && p.description.length>=35);
    assert.ok(p.lat>=12.5&&p.lat<=13.6&&p.lng>=100.6&&p.lng<=101.5);
  }
  for(const [id,lat,lng] of [
    ['tat-201005182246293423',12.6197852,100.9194303],
    ['tat-2010120911214112694',12.6154691,100.9222223],
    ['tat-2015120421550718123',12.6041741,100.9442161],
    ['tat-201005182246293252',13.173935,100.9203128],
    ['tat-201005182246293266',12.942854,100.790758],
  ]) {
    const p=SEED_PLACES.find(x=>x.id===id);
    assert.ok(p,id);assert.equal(p.lat,lat);assert.equal(p.lng,lng);
  }
});
