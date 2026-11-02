'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {rankRoadStops}=require('./basic-trip-road.cjs');
const places=['a','b','c','d'].map((id,i)=>({id,coordinates:{lat:13+i*.01,lng:100+i*.01}}));
test('chooses fastest verified road leg, not input ordering',async()=>{const route=async(a,b)=>({status:'verified_route',distanceKm:b.id==='c'?2:10,durationMinutes:b.id==='c'?8:35});const r=await rankRoadStops(places,{days:1,maxRoadMinutes:45,mode:'car'},route);assert.equal(r.stops[1].id,'c');assert.equal(r.legs[0].durationMinutes,8);});
test('rejects unknown and long routes without fallback',async()=>{const r=await rankRoadStops(places,{days:1,maxRoadMinutes:45,mode:'car'},async()=>({status:'unverified'}));assert.equal(r.status,'partial');assert.equal(r.stops.length,1);assert.equal(r.legs.length,0);});
test('never calls routing for unsupported coordinates',async()=>{let calls=0;const r=await rankRoadStops([{id:'bad',coordinates:{lat:99,lng:100}}],{days:2,mode:'car'},async()=>{calls++;return {status:'verified_route'}});assert.equal(calls,0);assert.equal(r.status,'partial');});
