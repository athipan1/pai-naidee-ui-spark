const {test}=require('node:test');
const assert=require('node:assert/strict');
const {dimensions,probeMedia,mediaLicenseHolds}=require('./place-media-quality.cjs');
const {cleanEvidence,evidenceHolds,payloadHash}=require('./place-review-evidence.cjs');
const {fixturePng}=require('./test-fixtures/image.cjs');
const media={url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/Test.png',photographer:'Fixture photographer',
  sourcePage:'https://commons.wikimedia.org/wiki/File:Test.png',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'};
test('media requires independent URLs, per-image licence and photographer; Google cannot enter persistent media',()=>{
  assert.deepEqual(mediaLicenseHolds(media),[]);
  assert.ok(mediaLicenseHolds({...media,photographer:''}).includes('image_credit_missing'));
  assert.ok(mediaLicenseHolds({...media,licenseName:'all rights reserved'}).includes('image_license_unverified'));
  assert.ok(mediaLicenseHolds({...media,url:'https://lh3.googleusercontent.com/x'}).includes('image_url_invalid'));
});
test('image probe rejects arbitrary network targets before fetching and never follows redirects',async()=>{
  let calls=0;
  assert.equal((await probeMedia({...media,url:'https://example.org/p.png'},{fetchImpl:()=>{calls++;}})).ok,false);
  assert.equal(calls,0);
  const result=await probeMedia(media,{fetchImpl:async(_url,options)=>{calls++;assert.equal(options.redirect,'error');return {ok:false};}});
  assert.equal(result.ok,false);assert.equal(calls,1);
});
test('image probe measures actual bytes, rejects small images and detects oversized streams',async()=>{
  let bytes=fixturePng();
  assert.deepEqual(dimensions(bytes),{width:800,height:450,mime:'image/png'});
  const response=()=>({ok:true,headers:new Headers({'content-type':'image/png'}),body:[bytes]});
  const good=await probeMedia(media,{fetchImpl:async()=>response()});
  assert.equal(good.ok,true);assert.equal(good.sha256.length,64);
  bytes=fixturePng(60,10,450);
  assert.ok((await probeMedia(media,{fetchImpl:async()=>response()})).holds.includes('image_dimensions_unsuitable'));
  assert.equal((await probeMedia(media,{fetchImpl:async()=>({ok:true,headers:new Headers(),body:[Buffer.alloc(6*1024*1024)]})})).ok,false);
  assert.throws(()=>dimensions(Buffer.from('<svg/>')));
});
test('persistent evidence rejects Google content, coordinates, probe claims and unknown namespaces',()=>{
  for(const input of [{googleContent:{name:'x'}},{coordinate:{lat:13,lng:101}},{media:{sha256:'claimed'}},{source:{namespace:'google_places'}}])
    assert.ok(cleanEvidence(input).error);
  assert.ok(cleanEvidence({googlePlaceId:'ChIJfixture'}).value);
});
test('media licence/probe expiry and description sources cannot be bypassed with payload booleans',()=>{
  const e=cleanEvidence({media}).value;
  assert.ok(evidenceHolds({description:'Description',imageUrl:media.url},e,{ok:true,url:media.url,checkedAt:'2001-01-01'}).includes('image_probe_required'));
  assert.ok(evidenceHolds({description:'Description',imageUrl:''},e,null).includes('description_source_unverified'));
  assert.notEqual(payloadHash({name:'a'}),payloadHash({name:'b'}));
});
