'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');
const {recoverIncrementally}=require('./hybrid-trip-recovery.cjs');
const places=Array.from({length:18},(_,i)=>({id:'p'+i,name:'Place '+i,province:'กาญจนบุรี',coordinates:{lat:14+i*.001,lng:99+i*.001}}));
const lookup=new Map(places.map(p=>[p.id,p]));
const road={status:'verified_route',distanceKm:5,durationMinutes:12};
const aiDay={day:1,stops:[places[0],places[1]],legs:[{from:'p0',to:'p1',road}]};
for(const days of [2,3,4,5]){
 test('keeps verified AI day and fills only missing days for '+days+' days',async()=>{
  let calls=0;const r=await recoverIncrementally({days:[aiDay],requestedDays:days,candidates:places,lookup,transport:'car',maxRoadMinutes:90},async()=>{calls++;return road;});
  assert.equal(r.status,'complete');assert.deepEqual(r.keptDays,[1]);assert.equal(r.days.length,days);assert.strictEqual(r.days[0],aiDay);assert.equal(r.sources[1],'ai');assert.ok(r.filledDays.every(d=>d>1));
  assert.equal(new Set(r.days.flatMap(d=>d.stops.map(s=>s.id))).size,r.days.flatMap(d=>d.stops).length);
  assert.ok(calls<=12*(days-1));
 });
 test('never fabricates routes for '+days+' days',async()=>{
  const r=await recoverIncrementally({days:[aiDay],requestedDays:days,candidates:places,lookup,transport:'car',maxRoadMinutes:45},async()=>({status:'unverified'}));
  assert.equal(r.status,'partial');assert.strictEqual(r.days[0],aiDay);assert.equal(r.keptDays.length,1);
  assert.ok(r.diagnostics.length>0);
 });
}
test('preserves verified AI prefix and adds missing stop without duplicating',async()=>{
 const partial={day:2,stops:[places[2]],legs:[]};
 const r=await recoverIncrementally({days:[aiDay,partial],requestedDays:2,candidates:places,lookup,transport:'car',maxRoadMinutes:90},async()=>road);
 assert.equal(r.status,'complete');assert.equal(r.days[1].stops[0].id,'p2');assert.equal(r.sources[2],'hybrid');
});
