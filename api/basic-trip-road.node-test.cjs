'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {rankRoadStops}=require('./basic-trip-road.cjs');
const places=['a','b','c','d'].map((id,i)=>({id,coordinates:{lat:13+i*.01,lng:100+i*.01}}));
test('chooses fastest verified road leg, not input ordering',async()=>{const route=async(a,b)=>({status:'verified_route',distanceKm:b.id==='c'?2:10,durationMinutes:b.id==='c'?8:35});const r=await rankRoadStops(places,{days:1,maxRoadMinutes:45,mode:'car'},route);assert.equal(r.stops[1].id,'c');assert.equal(r.legs[0].durationMinutes,8);});
test('rejects unknown and long routes without fallback',async()=>{const r=await rankRoadStops(places,{days:1,maxRoadMinutes:45,mode:'car'},async()=>({status:'unverified'}));assert.equal(r.status,'partial');assert.equal(r.stops.length,1);assert.equal(r.legs.length,0);});
test('never calls routing for unsupported coordinates',async()=>{let calls=0;const r=await rankRoadStops([{id:'bad',coordinates:{lat:99,lng:100}}],{days:2,mode:'car'},async()=>{calls++;return {status:'verified_route'}});assert.equal(calls,0);assert.equal(r.status,'partial');});

for(const days of [2,3,4,5]){
 test('multi-day '+days+' uses bounded routes and canonical IDs',async()=>{
  const many=Array.from({length:18},(_,i)=>({id:'p'+String(i).padStart(2,'0'),name:'Place '+i,nameLocal:'ที่ '+i,province:'กาญจนบุรี',category:'nature',rating:4,images:[],tags:[],coordinates:{lat:13+i*.002,lng:100+i*.002}}));
  let calls=0;
  const result=await rankRoadStops(many,{days,maxRoadMinutes:90,mode:'car'},async()=>{calls++;return {status:'verified_route',distanceKm:8,durationMinutes:12};});
  assert.equal(result.status,'complete');
  assert.equal(result.stops.length,days*3);
  assert.equal(result.legs.length,days*2);
  assert.ok(calls<=36);
  assert.equal(result.routingCalls,calls);
  assert.ok(result.stops.every(stop=>stop.id===stop.place.id&&stop.place.nameLocal));
  assert.equal(new Set(result.stops.map(stop=>stop.id)).size,result.stops.length);
 });
 test('multi-day '+days+' fails closed on unavailable roads',async()=>{
  const many=Array.from({length:days*3},(_,i)=>({id:'p'+i,coordinates:{lat:13+i*.002,lng:100+i*.002}}));
  const result=await rankRoadStops(many,{days,maxRoadMinutes:90,mode:'car'},async()=>({status:'unverified'}));
  assert.equal(result.status,'partial');assert.equal(result.legs.length,0);
 });
}
