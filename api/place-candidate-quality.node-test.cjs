const {test}=require('node:test');
const assert=require('node:assert/strict');
const {duplicateDecision,reviewCandidate,independentUrl,reviewCsv}=require('./place-candidate-quality.cjs');
const c={name:'Wat New',nameLocal:'วัดใหม่',province:'ชลบุรี',lat:13.2,lng:101,
  provenance:{sourceId:'official:1',sourceUrl:'https://example.org/place',license:'operator permission',coordinateSourceUrl:'https://example.org/entrance',coordinateLicense:'operator permission'},
  access:{kind:'vehicle_entrance',sourceUrl:'https://example.org/visit'}};
const boundary={outer:[[{lat:13,lon:100},{lat:14,lon:100},{lat:14,lon:102},{lat:13,lon:102},{lat:13,lon:100}]],inner:[]};
test('exact source, Google and explicit existing IDs require existing-place update',()=>{
  for(const [candidate,existing] of [
    [{...c,source:'tat',sourceId:'tat-1'},[{id:'tat-1',source_name:'Tourism Authority of Thailand — Open Data'}]],
    [{...c,googlePlaceId:'ChIJtest'},[{id:'old',google_place_id:'ChIJtest'}]],
    [{...c,existingPlaceId:'old'},[{id:'old'}]],
  ]) {const r=duplicateDecision(candidate,existing);assert.equal(r.status,'EXISTING_PLACE');assert.equal(r.action,'update_existing_only');}
});
test('source IDs are namespaced; empty names never match',()=>{
  assert.equal(duplicateDecision({source:'a',sourceId:'1'},[{source:'b',sourceId:'1'}]).status,'NEW_CANDIDATE');
  assert.equal(duplicateDecision({},[{}]).status,'NEW_CANDIDATE');
});
test('Thai/English normalization and approved aliases catch duplicates without coordinates',()=>{
  for(const item of [{id:'a',name:'WAT - NEW',province:'ชลบุรี'}, {id:'a',aliases:['วัด\u200b ใหม่'],province:'ชลบุรี'}])
    assert.equal(duplicateDecision(c,[item]).status,'PROBABLE_DUPLICATE');
});
test('same names in different provinces do not create false definitive matches',()=>{
  assert.equal(duplicateDecision(c,[{name:'Wat New',province:'ตรัง'}]).status,'NEW_CANDIDATE');
});
test('nearby mismatched names require human resolution; no coordinate coercion of null/blank',()=>{
  assert.equal(duplicateDecision(c,[{id:'a',name:'Other',lat:13.2001,lng:101}]).status,'PROBABLE_DUPLICATE');
  assert.equal(duplicateDecision(c,[{id:'a',name:'Other',lat:13.202,lng:101}]).status,'NEEDS_REVIEW');
  assert.equal(duplicateDecision({lat:null,lng:''},[{lat:0,lng:0}]).status,'NEW_CANDIDATE');
});
test('candidate cannot approve itself with booleans; missing trusted polygon fails closed',()=>{
  const r=reviewCandidate({...c,insideProvince:true,approved:true,publishAllowed:true},[]);
  assert.equal(r.status,'NEEDS_REVIEW');assert.equal(r.provinceGate,'NEEDS_REVIEW');assert.equal(r.publishAllowed,false);
});
test('independent polygon gate passes geometry but still requires human approval',()=>{
  const r=reviewCandidate(c,[],{boundary,province:'ชลบุรี'});
  assert.equal(r.provinceGate,'PASS');assert.equal(r.status,'NEW_CANDIDATE');assert.equal(r.publishAllowed,false);
});
test('polygon rejects outside province, excludes holes, and rejects mismatched province metadata',()=>{
  assert.equal(reviewCandidate({...c,lat:12},[],{boundary,province:'ชลบุรี'}).status,'REJECTED');
  const hole={...boundary,inner:[[{lat:13.1,lon:100.9},{lat:13.3,lon:100.9},{lat:13.3,lon:101.1},{lat:13.1,lon:101.1},{lat:13.1,lon:100.9}]]};
  assert.equal(reviewCandidate(c,[],{boundary:hole,province:'ชลบุรี'}).status,'REJECTED');
  assert.equal(reviewCandidate(c,[],{boundary,province:'ตรัง'}).provinceGate,'NEEDS_REVIEW');
});
test('Google coordinate evidence is never passed to province polygon calculation',()=>{
  const r=reviewCandidate({...c,provenance:{...c.provenance,coordinateSourceUrl:'https://maps.google.com/?q=13,101'}},[],{boundary,province:'ชลบุรี'});
  assert.equal(r.provinceGate,'NEEDS_REVIEW');assert.ok(r.holds.includes('independent_coordinate_evidence_required'));
});
test('site centres and restricted access cannot be silently promoted to public entrances',()=>{
  assert.ok(reviewCandidate({...c,access:{kind:'site_center'}},[]).holds.includes('entrance_not_verified'));
  assert.ok(reviewCandidate({...c,access:{...c.access,restricted:true}},[]).holds.includes('restricted_access_not_authorized'));
});
test('independent evidence URLs reject credentials, Google hosts, localhost and private endpoints',()=>{
  for(const u of ['http://example.org','https://a:b@example.org','https://localhost/a','https://127.0.0.1/a','https://[::1]/','https://service.internal/','https://places.googleapis.com/v1','https://lh3.googleusercontent.com/a'])assert.equal(independentUrl(u),null);
  assert.equal(independentUrl('https://www.wikidata.org/wiki/Q1'),'https://www.wikidata.org/wiki/Q1');
});
test('CSV export quotes newlines and disarms spreadsheet formula injection; excludes Google payloads',()=>{
  const csv=reviewCsv([{candidateId:'x',name:'=HYPERLINK("evil")',holds:['a','b'],google:{address:'sensitive Google content'},publishAllowed:false}]);
  assert.ok(csv.includes("'="));assert.ok(csv.includes('"a|b"'));assert.ok(!csv.includes('sensitive Google'));
});
test('incomplete polygon rings are never accepted as province proof',()=>{
  const incomplete={...boundary,outer:[boundary.outer[0].slice(0,-1)]};
  assert.equal(reviewCandidate(c,[],{boundary:incomplete,province:'ชลบุรี'}).provinceGate,'NEEDS_REVIEW');
});
test('offline batch detects cross-source duplicates within the same batch and rejects incomplete catalogue snapshots',()=>{
  const {buildReport}=require('./review-place-candidates.cjs');
  const baseline={total:0,places:[]};
  const report=buildReport([{...c,candidateId:'a'},{...c,candidateId:'b',source:'wikidata'}],baseline);
  assert.equal(report.rows[1].status,'PROBABLE_DUPLICATE');assert.equal(report.approved,0);assert.equal(report.published,0);
  assert.throws(()=>buildReport([],{total:10,places:[]}));
  assert.throws(()=>buildReport(new Array(51).fill(c),baseline));
});
