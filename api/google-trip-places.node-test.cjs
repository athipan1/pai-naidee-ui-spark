'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  normalizeGooglePlace, searchGoogleTripPlaces, googleRoadLeg, mergeTripCandidates,
}=require('./google-trip-places.cjs');

const restore=(key,value)=>{if(value===undefined)delete process.env[key];else process.env[key]=value;};
const response=(body,status=200)=>({ok:status>=200&&status<300,status,json:async()=>body});
const place=(n,province='เชียงราย')=>({id:'ChIJgooglePlace'+n,displayName:{text:'วัดทดสอบ '+n},formattedAddress:`อำเภอเมือง ${province} ประเทศไทย`,location:{latitude:19.90+n*.002,longitude:99.80+n*.002},googleMapsUri:'https://maps.google.com/?cid='+n});

test('Google Places search requires an explicit flag and never queries without it',async()=>{
  const before=process.env.GOOGLE_PLACES_ENABLED,key=process.env.GOOGLE_PLACES_API_KEY,expiry=process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT;
  try{
    process.env.GOOGLE_PLACES_ENABLED='false';process.env.GOOGLE_PLACES_API_KEY='stub';
    let called=false;
    assert.deepEqual(await searchGoogleTripPlaces({province:'เชียงราย',nature:false},async()=>{called=true;}),[]);
    assert.equal(called,false);
  }finally{restore('GOOGLE_PLACES_ENABLED',before);restore('GOOGLE_PLACES_API_KEY',key);restore('GOOGLE_PLACES_PILOT_EXPIRES_AT',expiry);}
});

test('Google Places filters province, coordinates, URL and duplicate IDs',async()=>{
  const before=process.env.GOOGLE_PLACES_ENABLED,key=process.env.GOOGLE_PLACES_API_KEY,expiry=process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT;
  try{
    process.env.GOOGLE_PLACES_ENABLED='true';process.env.GOOGLE_PLACES_API_KEY='stub';process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT='2099-01-01T00:00:00+07:00';
    let calls=0;
    const results=await searchGoogleTripPlaces({province:'เชียงราย',nature:true},async(url,options)=>{
      calls++;
      assert.equal(url,'https://places.googleapis.com/v1/places:searchText');
      assert.equal(options.headers['X-Goog-Api-Key'],'stub');
      assert.ok(options.headers['X-Goog-FieldMask'].includes('places.googleMapsUri'));
      assert.match(JSON.parse(options.body).textQuery,/ธรรมชาติ/);
      return response({places:[place(1),place(1),place(2,'เชียงใหม่'),{...place(3),googleMapsUri:'https://evil.example'}]});
    },async()=>true);
    assert.equal(calls,1);
    assert.equal(results.length,2);
    assert.equal(results[0].source,'google_places');
    assert.equal(results[1].googleMapsUri,'');
    assert.deepEqual(mergeTripCandidates([{id:'local',name:'วัดทดสอบ 1',nameLocal:'วัดทดสอบ 1',coordinates:{lat:19.902,lng:99.802}}],results).map(x=>x.id),['local','google:ChIJgooglePlace3']);
    assert.equal(normalizeGooglePlace({...place(9),location:{latitude:0,longitude:0}},'เชียงราย'),null);
  }finally{restore('GOOGLE_PLACES_ENABLED',before);restore('GOOGLE_PLACES_API_KEY',key);restore('GOOGLE_PLACES_PILOT_EXPIRES_AT',expiry);}
});

test('Google Routes only reports verified roads when duration and distance are returned',async()=>{
  const before=process.env.GOOGLE_PLACES_ENABLED,key=process.env.GOOGLE_PLACES_API_KEY,expiry=process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT;
  try{
    process.env.GOOGLE_PLACES_ENABLED='true';process.env.GOOGLE_PLACES_API_KEY='stub';process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT='2099-01-01T00:00:00+07:00';
    const a={coordinates:{lat:19.9,lng:99.8}},b={coordinates:{lat:19.91,lng:99.81}};
    const leg=await googleRoadLeg(a,b,'car',async(url,options)=>{
      assert.match(url,/routes.googleapis.com/);
      assert.equal(options.headers['X-Goog-FieldMask'],'routes.duration,routes.distanceMeters');
      return response({routes:[{duration:'600s',distanceMeters:1200}]});
    },async()=>true);
    assert.equal(leg.status,'verified_route');assert.equal(leg.durationMinutes,10);
    assert.equal((await googleRoadLeg(a,b,'car',async()=>response({},403),async()=>true)).status,'unverified');
  }finally{restore('GOOGLE_PLACES_ENABLED',before);restore('GOOGLE_PLACES_API_KEY',key);restore('GOOGLE_PLACES_PILOT_EXPIRES_AT',expiry);}
});

test('Google requests fail closed before fetch when daily quota is exhausted',async()=>{
  const before=process.env.GOOGLE_PLACES_ENABLED,key=process.env.GOOGLE_PLACES_API_KEY,expiry=process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT;
  try {
    process.env.GOOGLE_PLACES_ENABLED='true';process.env.GOOGLE_PLACES_API_KEY='stub';process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT='2099-01-01T00:00:00+07:00';
    let calls=0,reservations=0;
    const fetchImpl=async()=>{calls++;return response({});};
    const reserve=async()=>{reservations++;return false;};
    assert.deepEqual(await searchGoogleTripPlaces({province:'เชียงราย',nature:false},fetchImpl,reserve),[]);
    const road=await googleRoadLeg({coordinates:{lat:19.9,lng:99.8}},{coordinates:{lat:19.91,lng:99.81}},'car',fetchImpl,reserve);
    assert.equal(road.reason,'google_routes_daily_limit');
    assert.equal(calls,0);
    assert.equal(reservations,2);
  } finally {restore('GOOGLE_PLACES_ENABLED',before);restore('GOOGLE_PLACES_API_KEY',key);restore('GOOGLE_PLACES_PILOT_EXPIRES_AT',expiry);}
});

test('Google Pilot expires closed when expiry is absent, invalid or in the past',async()=>{
  const names=['GOOGLE_PLACES_ENABLED','GOOGLE_PLACES_API_KEY','GOOGLE_PLACES_PILOT_EXPIRES_AT'];
  const before=Object.fromEntries(names.map(k=>[k,process.env[k]]));
  try {
    process.env.GOOGLE_PLACES_ENABLED='true';process.env.GOOGLE_PLACES_API_KEY='stub';
    for(const expiry of ['', 'garbage', '2020-01-01T00:00:00+07:00']){
      process.env.GOOGLE_PLACES_PILOT_EXPIRES_AT=expiry;
      let calls=0;
      assert.deepEqual(await searchGoogleTripPlaces({province:'เชียงราย',nature:false},async()=>{calls++;return response({});},async()=>true),[]);
      assert.equal(calls,0);
    }
  }finally{for(const k of names)restore(k,before[k]);}
});
