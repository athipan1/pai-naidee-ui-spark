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
