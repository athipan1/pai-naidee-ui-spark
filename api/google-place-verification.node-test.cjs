const {test}=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const {once}=require('node:events');
const {FIELD_MASK,verificationAvailability,verifyGoogleIdentity,registerGoogleVerification}=require('./google-place-verification.cjs');
const env={GOOGLE_PLACE_VERIFICATION_ENABLED:'true',GOOGLE_PLACE_VERIFICATION_EXPIRES_AT:'2099-01-01',
  GOOGLE_PLACES_API_KEY:'fixture-only',GOOGLE_CLOUD_QUOTAS_CONFIRMED:'true',GOOGLE_BILLING_ALERTS_CONFIRMED:'true'};
const input={name:'วัดใหม่',province:'ชลบุรี',language:'th'};
test('activation is default off; credentials, expiry, Cloud quota and billing evidence all required',()=>{
  assert.equal(verificationAvailability({}).enabled,false);
  assert.equal(verificationAvailability(env).enabled,true);
  for(const key of Object.keys(env))assert.equal(verificationAvailability({...env,[key]:''}).enabled,false,key);
  assert.equal(verificationAvailability({...env,GOOGLE_PLACE_VERIFICATION_EXPIRES_AT:'2020-01-01'}).enabled,false);
});
test('disabled verification makes zero calls and reserves zero quota',async()=>{
  const fail=()=>{throw Error('must not be called');};
  assert.equal((await verifyGoogleIdentity(input,{env:{},fetchImpl:fail,reserve:fail})).status,'disabled');
});
test('quota exhausted/database reservation failure makes no Google request',async()=>{
  assert.equal((await verifyGoogleIdentity(input,{env,reserve:async()=>false,fetchImpl:()=>{throw Error('must not fetch');}})).status,'quota_exhausted');
});
test('quota is reserved before attempted request; request is minimal and strips coordinates/photos/reviews',async()=>{
  const calls=[];
  const result=await verifyGoogleIdentity(input,{env,reserve:async kind=>{calls.push(kind);return true;},fetchImpl:async(url,opts)=>{
    calls.push('fetch');assert.equal(calls[0],'places_detail');assert.equal(url,'https://places.googleapis.com/v1/places:searchText');
    assert.equal(opts.headers['X-Goog-FieldMask'],FIELD_MASK);assert.equal(JSON.parse(opts.body).pageSize,3);
    assert.ok(!/location|photos|reviews|rating|opening/i.test(FIELD_MASK));
    return {ok:true,json:async()=>({places:[{id:'id',displayName:{text:'Place'},formattedAddress:'Address',types:['museum'],
      location:{latitude:13},photos:['no'],rating:5,googleMapsUri:'https://google.com/maps?cid=1',attributions:[{provider:'Source',providerUri:'https://google.com/maps'}]}]})};
  }});
  assert.deepEqual(calls,['places_detail','fetch']);assert.equal(result.liveOnly,true);assert.equal(result.automaticMatch,false);
  assert.equal(result.results[0].placeId,'id');assert.equal(result.results[0].location,undefined);assert.equal(result.results[0].rating,undefined);
});
test('upstream status and exception cannot leak API credentials or upstream body',async()=>{
  for(const fetchImpl of [async()=>({ok:false}),async()=>{throw Error('fixture-only sensitive upstream URL');}])
    assert.deepEqual(await verifyGoogleIdentity(input,{env,reserve:async()=>true,fetchImpl}),{status:'unavailable'});
});
test('all verification routes authenticate before validating or fetching',async t=>{
  const app=express();app.use(express.json());
  registerGoogleVerification(app,{getSql:()=>{throw Error('no database access');},requireAdmin:(_req,res)=>res.sendStatus(401),fetchImpl:()=>{throw Error('no fetch');}});
  const server=app.listen(0,'127.0.0.1');await once(server,'listening');
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url=`http://127.0.0.1:${server.address().port}/api/admin/google-verification`;
  assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  assert.equal((await fetch(url+'/status')).status,401);
});
