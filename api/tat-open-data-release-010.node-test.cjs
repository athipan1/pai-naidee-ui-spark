const test=require('node:test');
const assert=require('node:assert/strict');
const batch=require('./additional-tat-open-data-batch-010.cjs');
const {SEED_PLACES}=require('./postgres-db.cjs');
const {auditPlaceImport}=require('./place-quality.cjs');
const expected=[
['tat-2010120911214113283','ศูนย์ศึกษาธรรมชาติและอนุรักษ์ป่าชายเลนเพื่อการท่องเที่ยวเชิงนิเวศ',13.3421159,100.9427898],
['tat-2010120911214113286','แหลมแท่น',13.3022007,100.897683],
['tat-2010120911214112692','วัดสัตหีบ',12.6636495,100.898163],
['tat-2015120421550718083','วัดตาลล้อม',13.272151,100.9407247],
['tat-2015120421550718078','วัดใต้ต้นลาน',13.4914767,101.1814865],
['tat-20100518224629483','ถ้ำเขาชะอางค์ห้ายอด',13.161556,101.5975857],
['tat-2015120421550718080','วัดชัยมงคล',12.9259664,100.8765398],
['tat-201005182246293395','เขาพระตำหนัก',12.9211051,100.8667178],
];
test('batch 010 releases exactly eight verified Chon Buri TAT source records',()=>{
  assert.deepEqual(batch.map(x=>x.id),expected.map(x=>x[0]));
  assert.equal(SEED_PLACES.length,187);
  assert.equal(SEED_PLACES.filter(x=>x.province==='ชลบุรี').length,64);
  assert.equal(new Set(SEED_PLACES.map(x=>x.id)).size,187);
  assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('batch 010 preserves original names, exact TAT pins and no fabricated data',()=>{
  for (const [id,thai,lat,lng] of expected){
    const p=batch.find(x=>x.id===id);
    assert.ok(p,id);assert.equal(p.nameLocal,thai);assert.equal(p.lat,lat);assert.equal(p.lng,lng);
    assert.equal(p.province,'ชลบุรี');
    assert.equal(p.rating,0);assert.equal(p.reviewCount,0);assert.equal(p.imageUrl,null);
    assert.equal(p.descriptionEn,null);assert.equal(p.verifiedAt,null);
    assert.deepEqual(p.tags,[]);assert.ok(p.description.length>=45);
    assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
    assert.ok(!('openingHours' in p)&&!('price' in p));
  }
});