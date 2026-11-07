const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boundaryPlan}=require('./import-province-boundary.cjs');
const ring=[{lat:12.5,lon:100.5},{lat:13.6,lon:100.5},{lat:13.6,lon:101.5},{lat:12.5,lon:101.5},{lat:12.5,lon:100.5}];
const fixture={type:'relation',id:123,tags:{'name:th':'ชลบุรี','ISO3166-2':'TH-20',boundary:'administrative',admin_level:'4'},members:[{type:'way',role:'outer',geometry:ring}]};
test('boundary plan binds full independent geometry and source to an offline approval digest',()=>{
  const p=boundaryPlan(fixture,'ชลบุรี');
  assert.equal(p.mode,'plan_only');assert.equal(p.databaseAccessed,false);assert.equal(p.licenseApprovalRequired,true);
  assert.equal(p.sha256.length,64);assert.equal(p.vertices,5);
  const changed=structuredClone(fixture);changed.members[0].geometry[1].lat=13.5;
  assert.notEqual(boundaryPlan(changed,'ชลบุรี').sha256,p.sha256);
});
test('boundary plan rejects mismatched identities, Google payloads, missing geometry, incomplete rings and source timeouts',()=>{
  assert.throws(()=>boundaryPlan(fixture,'เชียงใหม่'));
  assert.throws(()=>boundaryPlan({location:{latitude:13,longitude:101}},'ชลบุรี'));
  assert.throws(()=>boundaryPlan({elements:[fixture],remark:'timeout'},'ชลบุรี'));
  const incomplete=structuredClone(fixture);incomplete.members[0].geometry.pop();
  assert.throws(()=>boundaryPlan(incomplete,'ชลบุรี'));
  assert.throws(()=>boundaryPlan({...fixture,members:[{type:'way',role:'outer'}]},'ชลบุรี'));
  assert.throws(()=>boundaryPlan({elements:[fixture,fixture]},'ชลบุรี'));
});
