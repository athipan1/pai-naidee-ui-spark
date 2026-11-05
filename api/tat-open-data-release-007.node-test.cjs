const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('./additional-tat-open-data-batch-007.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');
const {auditPlaceImport} = require('./place-quality.cjs');
const ids = [
  'tat-201005182246291174','tat-2015120421550717997','tat-20100518224629120',
  'tat-20100518224629631','tat-201005182246293377','tat-201005182246293101',
  'tat-201005182246293148','tat-201005182246293316','tat-2010120911214114470',
  'tat-2010120911214112695','tat-2010120911214112696','tat-2015120421550718047',
  'tat-2010120911214113308','tat-201005182246292827','tat-201005182246291103',
  'tat-2010120911214113284','tat-201005182246291544'
];

test('Chon Buri batch 007 contains only the 17 separately selected and corroborated TAT IDs',()=>{
  assert.deepEqual(batch.map(p=>p.id),ids);
  assert.equal(SEED_PLACES.length,193);
  assert.equal(new Set(SEED_PLACES.map(p=>p.id)).size,193);
  assert.equal(SEED_PLACES.filter(p=>p.province==='ชลบุรี').length,70);
  assert.equal(new Set(SEED_PLACES.map(p=>p.province)).size,77);
  assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('strict zero-fabrication provenance and source pins for every selected record',()=>{
  for(const p of batch){
    assert.equal(p.province,'ชลบุรี');
    assert.equal(p.sourceName,'Tourism Authority of Thailand — Open Data');
    assert.equal(p.sourceUrl,'https://datacatalog.tat.or.th/dataset/tourist-attraction');
    assert.equal(p.rating,0);assert.equal(p.reviewCount,0);assert.equal(p.imageUrl,null);
    assert.equal(p.verifiedAt,null);assert.equal(p.descriptionEn,null);
    assert.deepEqual(p.tags,[]);
    assert.ok(p.nameLocal && p.description.length>=35);
    assert.ok(p.lat>=12.5 && p.lat<=13.6 && p.lng>=100.6 && p.lng<=101.5);
    assert.ok(!('openingHours' in p) && !('price' in p));
  }
});
test('distinct Chon Buri places keep exact official source IDs and select coordinates',()=>{
  for(const [id,lat,lng] of [
    ['tat-201005182246291174',13.1484592,100.8176024],
    ['tat-2010120911214112695',12.6259684,100.9137149],
    ['tat-2010120911214112696',12.6368819,100.9261747],
    ['tat-201005182246293101',12.8901483,100.8745],
    ['tat-201005182246293316',13.3046183,100.9025866],
    ['tat-201005182246291103',12.7646977,100.9560315],
  ]) {
    const place=SEED_PLACES.find(p=>p.id===id);
    assert.ok(place,id);assert.equal(place.lat,lat);assert.equal(place.lng,lng);
  }
});
