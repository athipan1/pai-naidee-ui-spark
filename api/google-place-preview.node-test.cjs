'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {enabled,chooseMatch,livePlacePreview}=require('./google-place-preview.cjs');
const {dailyLimit}=require('./google-daily-usage.cjs');
const place={id:'tat-test',province:'ชลบุรี',nameLocal:'เกาะสีชัง',coordinates:{lat:13.1619,lng:100.8105}};
const candidate={id:'ChIJ00000abc',displayName:{text:'เกาะสีชัง'},
  location:{latitude:13.162,longitude:100.811},
  formattedAddress:'ชลบุรี ประเทศไทย',rating:4.7,userRatingCount:123,
  googleMapsUri:'https://www.google.com/maps/place/test',
  photos:[{name:'places/ChIJ00000abc/photos/Aa00bb',authorAttributions:[{displayName:'Photographer',uri:'https://www.google.com/maps/contrib/123'}]}]};
function withEnv(run) {
  const names=['GOOGLE_PLACES_API_KEY','GOOGLE_PLACE_DETAIL_ENABLED','GOOGLE_PLACE_DETAIL_PILOT_EXPIRES_AT','GOOGLE_PLACE_DETAIL_DAILY_LIMIT','GOOGLE_PLACE_PHOTO_DAILY_LIMIT'];
  const old=Object.fromEntries(names.map(n=>[n,process.env[n]]));
  process.env.GOOGLE_PLACES_API_KEY='test-key';
  process.env.GOOGLE_PLACE_DETAIL_ENABLED='true';
  process.env.GOOGLE_PLACE_DETAIL_PILOT_EXPIRES_AT='2099-01-01T00:00:00+07:00';
  return Promise.resolve().then(run).finally(()=>{for(const n of names)if(old[n]===undefined)delete process.env[n];else process.env[n]=old[n];});
}
test('preview pilot defaults closed and expiration closes it',async()=>{
  await withEnv(async()=>{process.env.GOOGLE_PLACE_DETAIL_ENABLED='false';assert.equal(enabled(),false);process.env.GOOGLE_PLACE_DETAIL_ENABLED='true';process.env.GOOGLE_PLACE_DETAIL_PILOT_EXPIRES_AT='2020-01-01';assert.equal(enabled(),false);});
});
test('two independent bounded daily quotas default to zero until explicitly configured',async()=>{
  await withEnv(async()=>{
    delete process.env.GOOGLE_PLACE_DETAIL_DAILY_LIMIT;delete process.env.GOOGLE_PLACE_PHOTO_DAILY_LIMIT;
    assert.equal(dailyLimit('places_detail'),0);assert.equal(dailyLimit('places_photo'),0);
    process.env.GOOGLE_PLACE_DETAIL_DAILY_LIMIT='999';
    assert.equal(dailyLimit('places_detail'),2);
  });
});
test('wrong name, wrong pin and unavailable inputs never match',()=>{
  assert.equal(chooseMatch([{...candidate,displayName:{text:'โรงแรมอื่น'}}],place),null);
  assert.equal(chooseMatch([{...candidate,location:{latitude:14,longitude:100}}],place),null);
  assert.equal(chooseMatch([candidate],place).id,candidate.id);
});
test('local mode calls neither quota nor Google',async()=>{
  const result=await livePlacePreview(place,null,()=>{throw Error('fetch called');},()=>{throw Error('quota called');});
  assert.equal(result.status,'disabled');
});
test('quota denied never sends Google request',async()=>{
  await withEnv(async()=>{const result=await livePlacePreview(place,null,()=>{throw Error('fetch called');},async()=>false);assert.equal(result.status,'quota_exhausted');});
});
test('good match retrieves photo exactly once, returns attribution and omits keys',async()=>{
  await withEnv(async()=>{
    let search=0,photos=0;const reserved=[];
    const fetchImpl=async(url,opts)=>{
      if(url.includes(':searchText')){search++;assert.equal(opts.headers['X-Goog-FieldMask'].includes('places.photos'),true);return {ok:true,json:async()=>({places:[candidate]})};}
      photos++;assert.match(url,/skipHttpRedirect=true/);
      return {ok:true,json:async()=>({photoUri:'https://lh3.googleusercontent.com/example=s960'})};
    };
    const result=await livePlacePreview(place,null,fetchImpl,async kind=>{reserved.push(kind);return true;});
    assert.equal(result.status,'ok');assert.equal(result.name,'เกาะสีชัง');
    assert.equal(result.photoUrl,'https://lh3.googleusercontent.com/example=s960');
    assert.equal(result.attributions[0].name,'Photographer');
    assert.deepEqual(reserved,['places_detail','places_photo']);
    assert.equal(search,1);assert.equal(photos,1);
    assert.ok(!JSON.stringify(result).includes('test-key'));
  });
});
test('photo quota exhausts independently and original details remain available',async()=>{
  await withEnv(async()=>{
    let calls=0;const result=await livePlacePreview(place,null,async()=>{calls++;return {ok:true,json:async()=>({places:[candidate]})};},async kind=>kind==='places_detail');
    assert.equal(calls,1);assert.equal(result.status,'ok');assert.equal(result.photoUrl,null);
  });
});
