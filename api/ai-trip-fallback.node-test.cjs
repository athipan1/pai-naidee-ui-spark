'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registerAiTripRoutes}=require('./ai-trip-plan.cjs');

const local=Array.from({length:7},(_,i)=>({id:'local-'+i,name:'Local '+i,nameLocal:'Local '+i,province:'เชียงใหม่',category:'Nature',tags:[],rating:4,coordinates:{lat:18.75+i*.002,lng:98.95+i*.002}}));
const ok=body=>({ok:true,status:200,headers:{get:()=>null},json:async()=>body});
async function run({places,googleEnabled,aiInvalid,days,province,dbError=false}){
  const names=['OPENROUTER_API_KEY','OPENROUTER_MODEL','GEOAPIFY_API_KEY','AI_MAX_OUTPUT_TOKENS','GOOGLE_PLACES_API_KEY','GOOGLE_PLACES_ENABLED','GOOGLE_PLACES_PILOT_EXPIRES_AT'];
  const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));
  const oldFetch=global.fetch,calls=[];
  try {
    Object.assign(process.env,{OPENROUTER_API_KEY:'stub',OPENROUTER_MODEL:'nvidia/nemotron-3.5-lightning:free',GEOAPIFY_API_KEY:'stub',AI_MAX_OUTPUT_TOKENS:'2400',GOOGLE_PLACES_API_KEY:'stub',GOOGLE_PLACES_ENABLED:String(googleEnabled),GOOGLE_PLACES_PILOT_EXPIRES_AT:'2099-01-01T00:00:00+07:00'});
    let handler;
    registerAiTripRoutes({post:(_path,_limiter,callback)=>{handler=callback;}},{listPlaces:async()=>{
      if(dbError)throw Error('DATABASE_UNAVAILABLE');
      return {attractions:places};
    },getSql:()=>async()=>[{model_id:'nvidia/nemotron-3.5-lightning:free',structured_output:false,updated_at:new Date()}],reserveGoogleQuota:async()=>!dbError});
    global.fetch=async(url,options={})=>{
      const target=String(url);calls.push(target);
      if(target.includes('openrouter.ai')){
        assert.equal(JSON.stringify(options.body).includes('google:'),false,'never pass Google results to OpenRouter');
        return ok({choices:[{finish_reason:'stop',message:{content:aiInvalid?'not JSON':'{"days":[{"day":1,"placeIds":["local-0","local-1"]}]}'}}]});
      }
      if(target.includes('places.googleapis.com'))return ok({places:Array.from({length:9},(_,i)=>({id:'ChIJstubPlaces'+i,displayName:{text:'ทดสอบ '+i},formattedAddress:province+' ประเทศไทย',location:{latitude:19.80+i*.003,longitude:99.85+i*.003},googleMapsUri:'https://maps.google.com/?cid='+i}))});
      if(target.includes('routes.googleapis.com'))return ok({routes:[{distanceMeters:1200,duration:'350s'}]});
      if(target.includes('geoapify.com/v1/routing'))return ok({features:[{properties:{distance:1400,time:550}}]});
      return ok({});
    };
    const req={body:{message:'อยากเที่ยว'+province+' '+days+' วัน งบ 6000 บาท',province,days,people:1,budget:6000,transport:'car'},ip:'127.0.0.1',headers:{}};
    const res={statusCode:200,set(){},status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
    await handler(req,res);
    return {res,calls};
  } finally {
    global.fetch=oldFetch;
    for(const name of names)if(previous[name]===undefined)delete process.env[name];else process.env[name]=previous[name];
  }
}

test('AI returning malformed JSON falls back to verified local Smart Planner for Chiang Mai 3 days',async()=>{
  const {res,calls}=await run({places:local,googleEnabled:false,aiInvalid:true,days:3,province:'เชียงใหม่'});
  assert.equal(res.statusCode,200,JSON.stringify(res.body));
  assert.equal(res.body.provider,'smart_fallback');
  assert.equal(res.body.status,'complete');
  assert.equal(res.body.days.length,3);
  assert.ok(res.body.days.every(d=>d.stops.length>=2));
  assert.ok(!calls.some(c=>c.includes('googleapis.com')));
});

test('empty local catalog recovers Chiang Rai 4 days with opt-in Google Places and Routes',async()=>{
  const {res,calls}=await run({places:[],googleEnabled:true,days:4,province:'เชียงราย'});
  assert.equal(res.statusCode,200,JSON.stringify(res.body));
  assert.equal(res.body.provider,'smart_fallback');
  assert.equal(res.body.status,'complete');
  assert.equal(res.body.days.length,4);
  assert.ok(res.body.days.every(d=>d.stops.length>=2));
  assert.ok(calls.some(c=>c.includes('places.googleapis.com')));
  assert.ok(calls.some(c=>c.includes('routes.googleapis.com')));
  assert.ok(!calls.some(c=>c.includes('openrouter.ai')));
});

test('database unavailable must not bypass shared quota even with opt-in Google',async()=>{
  const {res,calls}=await run({places:[],googleEnabled:true,days:3,province:'เชียงราย',dbError:true});
  assert.equal(res.statusCode,422,JSON.stringify(res.body));
  assert.equal(res.body.code,'NO_VERIFIED_ITINERARY');
  assert.ok(!calls.some(c=>c.includes('googleapis.com')));
});

test('empty catalog with Google disabled responds safely without inventing stops or using a billable API',async()=>{
  const {res,calls}=await run({places:[],googleEnabled:false,days:4,province:'เชียงราย'});
  assert.equal(res.statusCode,422);
  assert.equal(res.body.code,'NO_VERIFIED_ITINERARY');
  assert.equal(res.body.plannedDays,0);
  assert.ok(!calls.some(c=>c.includes('googleapis.com')));
});
