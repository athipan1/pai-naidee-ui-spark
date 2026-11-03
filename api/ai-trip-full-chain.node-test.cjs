'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registerAiTripRoutes}=require('./ai-trip-plan.cjs');
const originalFetch=global.fetch;
const originals={OPENROUTER_API_KEY:process.env.OPENROUTER_API_KEY,OPENROUTER_MODEL:process.env.OPENROUTER_MODEL,GEOAPIFY_API_KEY:process.env.GEOAPIFY_API_KEY,AI_MAX_OUTPUT_TOKENS:process.env.AI_MAX_OUTPUT_TOKENS};
const json=(data,status=200)=>({ok:status>=200&&status<300,status,headers:{get:()=>null},json:async()=>data});
function fakePlaces(){
 return Array.from({length:6},(_,i)=>({id:'nature-'+(i+1),name:'Nature '+(i+1),nameLocal:'Nature '+(i+1),province:'เชียงใหม่',category:'Nature',tags:['Nature'],rating:5-i*.1,coordinates:{lat:18.80+i*.002,lng:98.90+i*.002}}));
}
async function invoke(modelOutput){
 let handler;
 registerAiTripRoutes({post:(path,_limiter,h)=>{assert.equal(path,'/api/ai/trip-plan');handler=h;}},{
  listPlaces:async()=>({attractions:fakePlaces()}),
  getSql:()=>async()=>[{model_id:'nvidia/nemotron-3.5-lightning:free',structured_output:false,updated_at:new Date()}],
 });
 const calls=[];
 global.fetch=async(url,options={})=>{
  calls.push(String(url));
  if(String(url).includes('openrouter.ai')) {
   const payload=JSON.parse(options.body);
   assert.equal(payload.model,'nvidia/nemotron-3.5-lightning:free');
   assert.equal(payload.max_tokens,2400);
   assert.equal(payload.provider.allow_fallbacks,false);
   return json({model:payload.model,choices:[{finish_reason:'stop',message:{content:modelOutput}}],usage:{prompt_tokens:100,completion_tokens:200,total_tokens:300,cost:0}});
  }
  if(String(url).includes('geoapify.com/v1/routing'))return json({features:[{properties:{distance:1200,time:600}}]});
  return json({});
 };
 const req={body:{message:'เที่ยวเชียงใหม่ 3 วัน งบ 10000 ชอบธรรมชาติ ไม่อยากขับรถไกล',province:'เชียงใหม่',days:3,people:1,budget:10000,transport:'car'},ip:'127.0.0.1',headers:{}};
 const res={statusCode:200,status(n){this.statusCode=n;return this;},json(v){this.body=v;return this;}};
 await handler(req,res);
 return {res,calls};
}
test('full backend integration: selected free model -> JSON -> places -> road -> budget',async()=>{
 process.env.OPENROUTER_API_KEY='stub-not-real';process.env.OPENROUTER_MODEL='nvidia/nemotron-3.5-lightning:free';process.env.AI_MAX_OUTPUT_TOKENS='2400';process.env.GEOAPIFY_API_KEY='stub-not-real';
 try {
  const output='Here is your itinerary:\n'+String.fromCharCode(96).repeat(3)+'json\n'+JSON.stringify({days:[1,2,3].map(day=>({day,placeIds:['nature-'+(day*2-1),'nature-'+day*2]}))})+'\n'+String.fromCharCode(96).repeat(3);
  const {res,calls}=await invoke(output);
  assert.equal(res.statusCode,200,JSON.stringify(res.body));
  assert.equal(res.body.status,'complete');
  assert.equal(res.body.completeness.status,'complete');
  assert.equal(res.body.days.length,3);
  assert.ok(res.body.days.every(day=>day.stops.length===2));
  assert.ok(res.body.days.every(day=>day.legs.length===1&&day.legs[0].road.status==='verified_route'));
  assert.equal(res.body.budget.estimatedTotal,10000);
  assert.equal(res.body.budget.verifiedPrices,false);
  assert.ok(calls.some(url=>url.includes('openrouter.ai')));
  assert.ok(calls.some(url=>url.includes('geoapify.com/v1/routing')));
 } finally {global.fetch=originalFetch;for(const [key,value] of Object.entries(originals))value===undefined?delete process.env[key]:process.env[key]=value;}
});
test('full backend rejects hallucinated IDs and recovers with verified Smart Planner places',async()=>{
 process.env.OPENROUTER_API_KEY='stub-not-real';process.env.OPENROUTER_MODEL='nvidia/nemotron-3.5-lightning:free';process.env.AI_MAX_OUTPUT_TOKENS='2400';process.env.GEOAPIFY_API_KEY='stub-not-real';
 try {
  const {res}=await invoke(JSON.stringify({days:[{day:1,placeIds:['invented-id']}]}));
  assert.equal(res.statusCode,200,JSON.stringify(res.body));
  assert.equal(res.body.provider,'smart_fallback');
  assert.equal(res.body.status,'complete');
  assert.equal(res.body.days.length,3);
  assert.ok(res.body.days.every(day=>day.stops.every(stop=>stop.id!=='invented-id')));
 } finally {global.fetch=originalFetch;for(const [key,value] of Object.entries(originals))value===undefined?delete process.env[key]:process.env[key]=value;}
});
