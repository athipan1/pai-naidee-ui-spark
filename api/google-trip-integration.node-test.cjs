'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registerAiTripRoutes}=require('./ai-trip-plan.cjs');

test('incomplete local trip adds ephemeral Google stops only after the LLM step, with verified Google routes',async()=>{
  const keys=['OPENROUTER_API_KEY','OPENROUTER_MODEL','GEOAPIFY_API_KEY','AI_MAX_OUTPUT_TOKENS','GOOGLE_PLACES_API_KEY','GOOGLE_PLACES_ENABLED'];
  const previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  const originalFetch=global.fetch;
  try {
    Object.assign(process.env,{OPENROUTER_API_KEY:'stub',OPENROUTER_MODEL:'nvidia/nemotron-3.5-lightning:free',GEOAPIFY_API_KEY:'stub',GOOGLE_PLACES_API_KEY:'stub',GOOGLE_PLACES_ENABLED:'true',AI_MAX_OUTPUT_TOKENS:'2400'});
    const local=[1,2].map(i=>({id:'local-'+i,name:'Local '+i,nameLocal:'Local '+i,province:'เชียงราย',category:'Nature',tags:['Nature'],rating:4,coordinates:{lat:19.90+i*.001,lng:99.80+i*.001}}));
    let route;
    registerAiTripRoutes({post:(_path,_limiter,handler)=>{route=handler;}},{listPlaces:async()=>({attractions:local}),getSql:()=>async()=>[{model_id:'nvidia/nemotron-3.5-lightning:free',structured_output:false,updated_at:new Date()}]});
    const calls=[];
    const ok=data=>({ok:true,status:200,headers:{get:()=>null},json:async()=>data});
    global.fetch=async(url,options={})=>{
      const target=String(url);calls.push(target);
      if(target.includes('openrouter.ai')){
        const payload=JSON.parse(options.body);
        assert.equal(payload.messages[1].content.includes('Google'),false,'Google Places content must not enter the LLM prompt');
        return ok({choices:[{finish_reason:'stop',message:{content:JSON.stringify({days:[{day:1,placeIds:['local-1','local-2']}]})}}]});
      }
      if(target.includes('places.googleapis.com'))return ok({places:Array.from({length:8},(_,j)=>({id:'ChIJtestChiangRai'+(j+1),displayName:{text:'ทดสอบ '+(j+1)},formattedAddress:'จังหวัดเชียงราย ประเทศไทย',location:{latitude:19.91+j*.004,longitude:99.81+j*.004},googleMapsUri:'https://maps.google.com/?cid='+(j+1)}))});
      if(target.includes('routes.googleapis.com'))return ok({routes:[{distanceMeters:1900,duration:'400s'}]});
      if(target.includes('geoapify.com/v1/routing'))return ok({features:[{properties:{distance:1300,time:480}}]});
      return ok({});
    };
    const req={body:{message:'เที่ยวเชียงราย 4 วัน งบ 5000 บาท',province:'เชียงราย',days:4,people:1,budget:5000,transport:'car'},ip:'127.0.0.1',headers:{}};
    const res={statusCode:200,headers:{},set(key,value){this.headers[key]=value;},status(code){this.statusCode=code;return this;},json(data){this.body=data;return this;}};
    await route(req,res);
    assert.equal(res.statusCode,200,JSON.stringify(res.body));
    assert.equal(res.headers['Cache-Control'],'no-store');
    assert.ok(calls.some(url=>url.includes('places.googleapis.com')));
    assert.ok(calls.some(url=>url.includes('routes.googleapis.com')));
    assert.equal(res.body.status,'complete',JSON.stringify(res.body.completeness));
    assert.equal(res.body.days.length,4);
    assert.ok(res.body.days.every(day=>day.stops.length>=2));
    assert.equal(res.body.days[0].stops[0].source,undefined);
    assert.ok(res.body.days.some(day=>day.stops.some(stop=>stop.source==='google_places')));
    assert.ok(res.body.recovery.googlePlacesUsed>=4);
  }finally{
    global.fetch=originalFetch;
    for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}
  }
});
