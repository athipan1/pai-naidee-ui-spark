const { test } = require('node:test');
const assert = require('node:assert/strict');
const { geocodeCandidates, resolveGeoapifyDraft, isThailandCoordinate, matchesPlaceName, searchNames } = require('./admin-geocode.cjs');

test('geocoding searches existing Railway places without a paid provider', async () => {
  const calls = [];
  const result = await geocodeCandidates({ name: 'ตลาดน้ำอัมพวา', province: 'สมุทรสงคราม',
    listPlaces: async options => {
      calls.push(options);
      return { attractions: [{ nameLocal: 'ตลาดน้ำอัมพวา', province: 'สมุทรสงคราม',
        coordinates: { lat: 13.42479, lng: 99.9556 } }] };
    }, request: () => assert.fail('Must not use an external provider without a key') });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'PaiNaiDee');
  assert.equal(calls[0].province, 'สมุทรสงคราม');
  assert.equal(result.providerConfigured, false);
});

test('geocoding excludes wrong-country and out-of-bounds coordinates', async () => {
  const result = await geocodeCandidates({ name: 'Temple', province: 'มุกดาหาร', apiKey: 'test-key',
    listPlaces: async () => ({ attractions: [] }),
    request: async () => ({ ok: true, json: async () => ({ results: [
      { lat: 16.5, lon: 104.7, country_code: 'th', formatted: 'Thai temple' },
      { lat: 16.5, lon: 104.7, country_code: 'la', formatted: 'Wrong country' },
      { lat: 45, lon: 104.7, country_code: 'th', formatted: 'Outside bounds' },
    ] }) }),
  });
  assert.deepEqual(result.candidates.map(item => item.label), ['Thai temple']);
  assert.equal(isThailandCoordinate(90, 100), false);
});

test('map search accepts a place name without a province and retains candidate selection', async () => {
  const result = await geocodeCandidates({ name: 'ตลาดน้ำอัมพวา',
    listPlaces: async options => {
      assert.equal(options.province, '');
      return { attractions: [{ nameLocal: 'ตลาดน้ำอัมพวา', province: 'สมุทรสงคราม',
        coordinates: { lat: 13.42479, lng: 99.9556 } }] };
    }, request: () => assert.fail('Provider requires an API key'),
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].label, 'ตลาดน้ำอัมพวา · สมุทรสงคราม');
});

test('quality gate rejects a nearby national park and city centroid for Cheow Lan Dam', async () => {
  const result = await geocodeCandidates({ name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', apiKey: 'test-key',
    listPlaces: async () => ({ attractions: [
      { nameLocal: 'อุทยานแห่งชาติเขาสก', province: 'สุราษฎร์ธานี', coordinates: { lat: 8.91493, lng: 98.53017 } },
    ] }),
    request: async () => ({ ok: true, json: async () => ({ results: [
      { lat: 9.14041, lon: 99.32413, country_code: 'th', formatted: 'เทศบาลนครสุราษฎร์ธานี, ประเทศไทย' },
      { lat: 8.98, lon: 98.82, country_code: 'th', name: 'Ratchaprapha Dam', formatted: 'Ratchaprapha Dam, Surat Thani' },
    ] }) }),
  });
  assert.equal(result.candidates.length, 1);
  assert.match(result.candidates[0].label, /Ratchaprapha Dam/);
});

test('quality gate rejects unrecognised place names even if they are in the same province', async () => {
  assert.equal(matchesPlaceName('เขื่อนเชี่ยวหลาน', ['อุทยานแห่งชาติเขาสก']), false);
  assert.equal(matchesPlaceName('เขื่อนเชี่ยวหลาน', ['เขื่อนรัชชประภา']), true);
  assert.equal(matchesPlaceName('เขื่อนเชี่ยวหลาน', ['เทศบาลนครสุราษฎร์ธานี']), false);
  assert.equal(matchesPlaceName('ตลาดน้ำอัมพวา', ['ตลาดน้ำอัมพวา']), true);
});

test('fallback name search resolves Cheow Lan through the Ratchaprapha alternate name', async () => {
  const requested = [];
  const result = await geocodeCandidates({ name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', apiKey: 'test-key',
    listPlaces: async options => ({ attractions: options.search === 'เขื่อนรัชชประภา' ? [
      { nameLocal: 'เขื่อนรัชชประภา', province: 'สุราษฎร์ธานี', coordinates: { lat: 8.99, lng: 98.81 } },
    ] : [] }),
    request: async url => {
      const text = new URL(url).searchParams.get('text');
      requested.push(text);
      return { ok: true, json: async () => ({ results: text.startsWith('เขื่อนรัชชประภา') ? [
        { lat: 8.99, lon: 98.81, country_code: 'th', formatted: 'เขื่อนรัชชประภา, ประเทศไทย' },
      ] : [{ lat: 9.14, lon: 99.32, country_code: 'th', formatted: 'เทศบาลนครสุราษฎร์ธานี' }] }) };
    },
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'PaiNaiDee');
  assert.equal(requested.length, 1); // Already verified from Railway, no unnecessary alias requests.
});

test('Geoapify retries alternate names after an unrelated first response', async () => {
  const queried = [];
  const result = await geocodeCandidates({ name: 'เขื่อนเชี่ยวหลาน', province: 'สุราษฎร์ธานี', apiKey: 'test-key',
    listPlaces: async () => ({ attractions: [] }),
    request: async url => {
      const text = new URL(url).searchParams.get('text');
      queried.push(text);
      return { ok: true, json: async () => ({ results: text.startsWith('เขื่อนรัชชประภา') ? [
        { lat: 8.99, lon: 98.81, country_code: 'th', name: 'เขื่อนรัชชประภา', formatted: 'เขื่อนรัชชประภา, สุราษฎร์ธานี' },
      ] : [{ lat: 9.14, lon: 99.32, country_code: 'th', formatted: 'เทศบาลนครสุราษฎร์ธานี' }] }) };
    },
  });
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].source, 'Geoapify');
  assert.equal(queried.length, 2);
  assert.deepEqual(searchNames('ตลาดน้ำอัมพวา'), ['ตลาดน้ำอัมพวา']);
});


test('Geoapify-only suggestions require selected province, exclude centroids and low confidence, and do not query Railway places', async () => {
  let calls=0;
  const result=await geocodeCandidates({
    name:'หาดแหลมเจริญ', province:'ระยอง', apiKey:'test-only', geoapifyOnly:true,
    listPlaces:()=>assert.fail('automatic suggestions must not reuse catalog matches'),
    resolveNames:()=>assert.fail('do not request alias lookups for automatic suggestions'),
    request:async url=>{
      calls++;
      const params=new URL(url).searchParams;
      assert.equal(params.get('text'),'หาดแหลมเจริญ, ระยอง, Thailand');
      assert.equal(params.get('limit'),'5');
      return {ok:true,json:async()=>({results:[
        {lat:12.65,lon:101.25,country_code:'th',state:'Rayong',name:'หาดแหลมเจริญ',formatted:'หาดแหลมเจริญ, Rayong, Thailand',result_type:'amenity',rank:{confidence:0.92}},
        {lat:12.7,lon:101.3,country_code:'th',state:'Chon Buri',name:'หาดแหลมเจริญ',formatted:'หาดแหลมเจริญ, Chon Buri, Thailand',rank:{confidence:0.94}},
        {lat:12.6,lon:101.4,country_code:'th',state:'ระยอง',name:'เมืองระยอง',formatted:'Rayong Thailand',result_type:'city',rank:{confidence:0.98}},
        {lat:12.68,lon:101.21,country_code:'th',state:'ระยอง',name:'หาดแหลมเจริญ',formatted:'หาดแหลมเจริญ ระยอง',rank:{confidence:0.2}},
        {lat:12.68,lon:101.2,country_code:'la',state:'ระยอง',name:'หาดแหลมเจริญ',formatted:'หาดแหลมเจริญ ระยอง'},
      ]})};
    }
  });
  assert.equal(calls,1,'single Geoapify call for one TAT-verified name');
  assert.equal(result.candidates.length,1);
  assert.equal(result.candidates[0].source,'Geoapify');
  assert.equal(result.candidates[0].confidence,0.92);
  assert.equal(result.candidates[0].lat,12.65);
});
test('Geoapify-only requires a real province; manual geocoding remains backward compatible', async () => {
  const invalid=await geocodeCandidates({
    name:'หาดแหลมเจริญ',province:'invalid',apiKey:'test-only',geoapifyOnly:true,
    listPlaces:()=>assert.fail('no catalog queries'),
    request:()=>assert.fail('no paid requests on invalid province')
  });
  assert.match(invalid.error,/จังหวัด/);
  const noKey=await geocodeCandidates({
    name:'หาดแหลมเจริญ',province:'ระยอง',geoapifyOnly:true,
    listPlaces:()=>assert.fail('no catalog queries'),
    request:()=>assert.fail('provider requires API key')
  });
  assert.equal(noKey.providerConfigured,false);
  assert.deepEqual(noKey.candidates,[]);
});

test('TAT fallback safely proposes bilingual names and coordinates sourced exclusively from Geoapify',async()=>{
 const calls=[];
 const response=await resolveGeoapifyDraft({
   candidateName:'หาดแหลมเจริญ',province:'ระยอง',apiKey:'existing-railway-key',
   request:async url=>{
     const u=new URL(url),lang=u.searchParams.get('lang');calls.push(lang);
     assert.equal(u.hostname,'api.geoapify.com');
     assert.equal(u.searchParams.get('filter'),'countrycode:th');
     assert.equal(u.searchParams.get('limit'),'5');
     assert.equal(u.searchParams.get('text'),'หาดแหลมเจริญ, ระยอง, Thailand');
     return {ok:true,json:async()=>({results:[{
       lat:12.65,lon:101.25,place_id:'geo-rayong-beach',
       state:'Rayong',country_code:'th',result_type:'amenity',rank:{confidence:0.95},
       name:lang==='th'?'หาดแหลมเจริญ':'Laem Charoen Beach',
       formatted:lang==='th'?'หาดแหลมเจริญ, ระยอง':'Laem Charoen Beach, Rayong'
     }]})};
   }
 });
 assert.deepEqual(calls.sort(),['en','th']);
 assert.equal(response.status,'geoapify_matched');
 assert.deepEqual(response.fields,{name:'Laem Charoen Beach',nameLocal:'หาดแหลมเจริญ'});
 assert.equal(response.suggestion.lat,12.65);
 assert.equal(response.suggestion.lng,101.25);
 assert.equal(response.suggestion.source,'Geoapify');
 assert.equal(response.source.id,'geoapify-geo-rayong-beach');
 assert.equal(response.source.attribution,'© OpenStreetMap contributors');
 assert.equal(response.fields.lat,undefined);
 assert.equal(response.fields.description,undefined);
 assert.equal(response.fields.category,undefined);
});
test('Geoapify fallback rejects city centroids, wrong province and mismatched names',async()=>{
 for(const change of [
   {state:'Chon Buri',formatted:'Rayong Beach, Chon Buri'},
   {result_type:'city'},
   {name:'เทศบาลเมืองระยอง'},
   {rank:{confidence:0.4}},
   {country_code:'la'},
   {lat:30},
 ]){
   const r=await resolveGeoapifyDraft({
     province:'ระยอง',candidateName:'หาดแหลมเจริญ',apiKey:'key',
     request:async()=>({ok:true,json:async()=>({results:[{
       lat:12.65,lon:101.25,place_id:'geo-test',
       name:'หาดแหลมเจริญ',state:'Rayong',formatted:'หาดแหลมเจริญ ระยอง',
       country_code:'th',result_type:'amenity',rank:{confidence:0.95},
       ...change,
     }]})})
   });
   assert.equal(r.status,'geoapify_no_match',JSON.stringify(change));
 }
});
test('Geoapify fallback rejects two independently matching locations',async()=>{
 const r=await resolveGeoapifyDraft({
   province:'ระยอง',candidateName:'หาดแหลมเจริญ',apiKey:'key',
   request:async()=>({ok:true,json:async()=>({results:[
     {lat:12.65,lon:101.25,place_id:'geo-one',name:'หาดแหลมเจริญ',state:'Rayong',formatted:'หาดแหลมเจริญ ระยอง',country_code:'th',result_type:'amenity',rank:{confidence:0.9}},
     {lat:12.9,lon:101.3,place_id:'geo-two',name:'หาดแหลมเจริญ',state:'Rayong',formatted:'หาดแหลมเจริญ ระยอง',country_code:'th',result_type:'amenity',rank:{confidence:0.92}},
   ]})})
 });
 assert.equal(r.status,'geoapify_ambiguous');
});
test('Geoapify fallback leaves absent language blank without inventing a translation',async()=>{
 const r=await resolveGeoapifyDraft({
   province:'ระยอง',candidateName:'หาดแหลมเจริญ',apiKey:'key',
   request:async()=>({ok:true,json:async()=>({results:[
     {lat:12.65,lon:101.25,name:'หาดแหลมเจริญ',state:'Rayong',formatted:'หาดแหลมเจริญ ระยอง',
       country_code:'th',result_type:'amenity',rank:{confidence:0.95}}
   ]})})
 });
 assert.equal(r.status,'geoapify_matched');
 assert.deepEqual(r.fields,{name:'หาดแหลมเจริญ',nameLocal:'หาดแหลมเจริญ'});
 assert.equal(r.englishNameFound,false);
});
test('Geoapify fallback does not call provider without key or valid province, and tolerates network failures',async()=>{
 const invalid=await resolveGeoapifyDraft({province:'invalid',candidateName:'หาดแหลมเจริญ',
   apiKey:'key',request:()=>assert.fail('invalid lookup must not use provider')});
 assert.equal(invalid.status,'geoapify_invalid_lookup');
 const missing=await resolveGeoapifyDraft({province:'ระยอง',candidateName:'หาดแหลมเจริญ',
   request:()=>assert.fail('no key must not use provider')});
 assert.equal(missing.status,'geoapify_unavailable');
 const outage=await resolveGeoapifyDraft({province:'ระยอง',candidateName:'หาดแหลมเจริญ',
   apiKey:'key',request:()=>{throw Error('network unavailable')}});
 assert.equal(outage.status,'geoapify_no_match');
});
