const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizePlace } = require('./postgres-db.cjs');
const { serializePlaceDetail } = require('./railway-server.cjs');
const { rankRoadStops } = require('./basic-trip-road.cjs');
const { FALLBACK } = require('./published-place-images.cjs');
const photo = (url, id='licensed') => ({id,url,creatorName:'Author',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://example.org/photo'});
for (const source of ['Admin CMS','TAT','Wikidata','OSM','legacy']) {
 test(`${source}: selected published primary wins across list, detail and road planner`,async()=>{
  const url='https://example.org/new.jpg',old='https://example.org/old.jpg';
  const row={id:source,name:source,source_name:source,lat:13,lng:100,image_url:url,media:[photo(old),photo(url)]};
  const original=JSON.stringify(row);
  const p=normalizePlace(row),detail=serializePlaceDetail(p);
  assert.equal(p.image,url);assert.equal(detail.image,url);assert.equal(detail.images[0],url);
  const trip=await rankRoadStops([p],{days:1});
  assert.equal(trip.stops[0].place.images[0],url);
  assert.deepEqual(trip.stops[0].place.mediaCredits,p.mediaCredits);
  assert.equal(JSON.stringify(row),original,'normalization must not mutate database inputs');
 });
}
test('uncredited selected primary is fallback, never an older credited gallery image',()=>{
 const p=normalizePlace({id:'x',image_url:'https://example.org/new.jpg',media:[photo('https://example.org/old.jpg')]});
 assert.equal(p.image,FALLBACK);assert.equal(p.images[0],FALLBACK);
 assert.equal(p.images[1],'https://example.org/old.jpg');
 assert.ok(p.imageIssues.includes('primary_not_in_gallery'));
});
test('spoofed CMS and user-provided IDs do not grant external image rights',()=>{
 for(const id of ['cms-media:forged','painaidee-provided:forged']){
 const url='https://attacker.example/api/media/cms/00000000-0000-0000-0000-000000000000.jpg';
 const p=normalizePlace({id:'x',image_url:url,media:[{id,url}]});
 assert.equal(p.image,FALLBACK);assert.deepEqual(p.mediaCredits,[]);
 }
});
test('own CMS uploaded media retains uploader provenance and duplicate URLs are reported',()=>{
 const url='https://painaidee-api-production.up.railway.app/api/media/cms/00000000-0000-0000-0000-000000000000.jpg';
 const media={id:'cms-media:fixture',url};
 const p=normalizePlace({id:'x',image_url:url,media:[media,media]});
 assert.equal(p.image,url);assert.equal(p.mediaCredits[0].kind,'user-provided');
 assert.equal(p.mediaCredits[0].licenseUrl,'');assert.equal(p.images.length,1);
 assert.ok(p.imageIssues.includes('duplicate_gallery_url'));
});
test('no images and unsupported licence are explicit review holds',()=>{
 assert.equal(normalizePlace({id:'x'}).image,FALLBACK);
 const url='https://example.org/a.jpg';
 assert.equal(normalizePlace({id:'x',image_url:url,media:[{...photo(url),licenseName:'all rights reserved'}]}).image,FALLBACK);
});
