const { test }=require('node:test');
const assert=require('node:assert/strict');
const {validateRequest,validCoord,haversine}=require('./ai-trip-plan.cjs');
test('validates trip input bounds',()=>{
 assert.equal(validateRequest({message:'ไปเชียงใหม่สามวัน',province:'เชียงใหม่',days:3,people:2,budget:6000}).days,3);
 assert.equal(validateRequest({message:'hello',province:'เชียงใหม่',days:3,people:2,budget:6000}),null);
 assert.equal(validateRequest({message:'ไปเชียงใหม่สามวัน',province:'เชียงใหม่',days:6,people:2,budget:6000}),null);
});
test('rejects invalid coordinates and validates distance',()=>{
 const a={coordinates:{lat:18.8,lng:98.9}},b={coordinates:{lat:18.9,lng:99}};
 assert.equal(validCoord(a),true);assert.equal(validCoord({coordinates:{lat:99,lng:99}}),false);
 assert.ok(haversine(a,b)>0);
});

test('accepts fenced and embedded JSON but rejects malformed JSON',()=>{
 const {parseAiJson}=require('./ai-trip-plan.cjs');
 assert.deepEqual(parseAiJson('Here is JSON: {"days":[{"day":1,"placeIds":["a"]}]}'),{days:[{day:1,placeIds:['a']}]});
 assert.deepEqual(parseAiJson('\x60\x60\x60json\n{"days":[]}\n\x60\x60\x60'),{days:[]});
 assert.throws(()=>parseAiJson('invalid'),{code:'INVALID_JSON'});
});
test('checks finish reason, schema, candidate IDs and model usage',()=>{
 const {parseOpenRouterResponse}=require('./ai-trip-plan.cjs');
 const ctx={days:2,places:[{id:'a'},{id:'b'}],model:'configured-model'};
 const make=(content,finish_reason='stop')=>({model:'selected-model',choices:[{finish_reason,message:{content}}],usage:{prompt_tokens:10,completion_tokens:20,total_tokens:30,cost:0.001}});
 const success=parseOpenRouterResponse(make('{"days":[{"day":1,"placeIds":["a"]}]}'),ctx);
 assert.equal(success.meta.usage.totalTokens,30);
 assert.equal(success.meta.model,'selected-model');
 assert.throws(()=>parseOpenRouterResponse(make('{"days":[]}', 'length'),ctx),{code:'INCOMPLETE_RESPONSE'});
 assert.throws(()=>parseOpenRouterResponse(make('{"days":[{"day":1,"placeIds":["wrong"]}]}'),ctx),{code:'INVALID_PLACE_IDS'});
 assert.throws(()=>parseOpenRouterResponse(make('{"days":[]}'),ctx),{code:'INVALID_SCHEMA'});
 assert.throws(()=>parseOpenRouterResponse(make(null),ctx),{code:'EMPTY_CONTENT'});
});

test('enforces nature-only stops and verified road travel limits',async()=>{
 const {requestPreferences,matchesStyle,enforceTripConstraints}=require('./ai-trip-plan.cjs');
 const prefs=requestPreferences('เที่ยวธรรมชาติ ไม่อยากขับรถไกล');
 const mk=(id,category)=>({id,name:id,nameLocal:id,category,tags:[category],coordinates:{lat:18.8,lng:98.9}});
 const a=mk('nature-a','Nature'),b=mk('temple','Culture'),c=mk('nature-b','Nature');
 assert.equal(matchesStyle(b,prefs),false);
 const input={days:1,transport:'car'};
 const prepared=[{day:1,stops:[a,b,c],legs:[]}];
 const checked=await enforceTripConstraints(prepared,new Map([a,b,c].map(p=>[p.id,p])),input,prefs,{
  route:async()=>({status:'verified_route',distanceKm:18,durationMinutes:50}),
  hours:async()=>({status:'unverified'})
 });
 assert.deepEqual(checked.days[0].stops.map(p=>p.id),['nature-a']);
 assert.ok(checked.warnings.some(w=>w.includes('road-travel')));
 assert.ok(checked.warnings.some(w=>w.includes('style')));
});
test('allows documented hours only for named source matches and respects route limit',async()=>{
 const {placeNameMatches,enforceTripConstraints,requestPreferences}=require('./ai-trip-plan.cjs');
 assert.equal(placeNameMatches('Wat Phra Singh','Wat Phra Singh'),true);
 assert.equal(placeNameMatches('Doi Inthanon','Wat Phra Singh'),false);
 const a={id:'one',name:'Nature One',category:'Nature',tags:[],coordinates:{lat:18.8,lng:98.9}};
 const b={id:'two',name:'Nature Two',category:'Nature',tags:[],coordinates:{lat:18.81,lng:98.91}};
 const data=await enforceTripConstraints([{day:1,stops:[a,b]}],new Map([a,b].map(p=>[p.id,p])),{days:1,transport:'car'},requestPreferences('ธรรมชาติ ไม่ขับรถไกล'),{
 route:async()=>({status:'verified_route',distanceKm:10,durationMinutes:20}),
 hours:async()=>({status:'sourced',value:'Mo-Fr 09:00-17:00',source:'Geoapify Place Details'})
 });
 assert.equal(data.days[0].stops.length,2);
 assert.equal(data.days[0].stops[0].openingHours.status,'sourced');
});

test('trip provider timeout remains 45 seconds independently from health probe',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const trip=fs.readFileSync(path.join(__dirname,'ai-trip-plan.cjs'),'utf8');
 const health=fs.readFileSync(path.join(__dirname,'ai-health-check.cjs'),'utf8');
 assert.match(trip,/\},45000\); \}/);
 assert.match(health,/\},12000\);/);
});

test('trip completeness gate rejects missing days, insufficient stops and unverified roads',()=>{
 const {evaluateTripCompleteness}=require('./ai-trip-plan.cjs');
 const lookup=new Map(['a','b','c','d','e','f'].map(id=>[id,{id}]));
 const day=(n,ids,route='verified_route')=>({day:n,stops:ids.map(id=>({id})),legs:ids.slice(1).map((id,i)=>({from:ids[i],to:id,road:{status:route}}))});
 const complete=evaluateTripCompleteness([day(1,['a','b']),day(2,['c','d']),day(3,['e','f'])],3,lookup);
 assert.equal(complete.status,'complete');assert.equal(complete.verifiedPlaces,6);
 const partial=evaluateTripCompleteness([day(1,['a']),day(2,['c','d'],'unverified')],3,lookup);
 assert.equal(partial.status,'partial');assert.ok(partial.reasons.includes('MISSING_DAYS'));assert.ok(partial.reasons.includes('INSUFFICIENT_STOPS'));assert.ok(partial.reasons.includes('UNVERIFIED_ROUTES'));
 assert.ok(evaluateTripCompleteness([day(1,['a','unknown'])],1,lookup).reasons.includes('UNVERIFIED_PLACES'));
});
