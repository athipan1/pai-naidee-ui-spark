const test = require('node:test');
const assert = require('node:assert/strict');
const batch = require('./additional-tat-open-data-batch-014.cjs');
const { SEED_PLACES } = require('./postgres-db.cjs');
const { auditPlaceImport } = require('./place-quality.cjs');
const place = batch[0];
function distanceMeters(a,b){
 const rad=x=>x*Math.PI/180, dlat=rad(a[0]-b[0]),dlng=rad(a[1]-b[1]);
 const s=Math.sin(dlat/2)**2+Math.cos(rad(a[0]))*Math.cos(rad(b[0]))*Math.sin(dlng/2)**2;
 return 6371000*2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
test('batch 014 proposes only the independently corroborated Wat Khao Bo Kwang Thong',()=>{
 assert.equal(batch.length,1);
 assert.equal(place.id,'tat-2015120421550718075');
 assert.equal(place.nameLocal,'วัดเขาบ่อกวางทอง');
 assert.equal(place.lat,13.283030);assert.equal(place.lng,101.318800);
 assert.equal(place.province,'ชลบุรี');assert.equal(place.rating,0);
 assert.equal(place.reviewCount,0);assert.equal(place.imageUrl,null);
 assert.equal(place.verifiedAt,null);assert.equal(place.descriptionEn,null);
 assert.deepEqual(place.tags,[]);
 assert.ok(!('openingHours' in place)&&!('price' in place));
 assert.equal(SEED_PLACES.length,194);
 assert.equal(SEED_PLACES.filter(p=>p.province==='ชลบุรี').length,71);
 assert.equal(new Set(SEED_PLACES.map(p=>p.id)).size,194);
 assert.deepEqual(auditPlaceImport({places:SEED_PLACES}).errors,[]);
});
test('reject displaced official TAT coordinate and preserve independently sourced temple site',()=>{
 assert.ok(distanceMeters([place.lat,place.lng],[13.282924,101.318249])<100,'Municipality and BUU site points agree within 100m');
 assert.ok(distanceMeters([place.lat,place.lng],[13.3242485,101.3090737])>4000,'Original TAT point was wrong');
});
test('museum subvenue without building pin is not silently imported',()=>{
 assert.ok(!SEED_PLACES.some(p=>p.id==='tat-2015120421550718062'));
});
