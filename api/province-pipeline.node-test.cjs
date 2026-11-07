const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validateProvinceBatch}=require('./province-review-pipeline.cjs');
const {PROVINCE_EN}=require('./place-localizations.cjs');
const candidate={payload:{name:'Fixture',nameLocal:'รายการทดสอบ',province:'ชลบุรี',category:'Culture',lat:13,lng:101},evidence:{source:{namespace:'operator',url:'https://example.org/source'}}};
test('existing registry covers 77 provinces and batches are bounded, explicit and single-province',()=>{
  assert.equal(Object.keys(PROVINCE_EN).length,77);
  const input={province:'ชลบุรี',requestKey:'fixture-request-1',candidates:[candidate]};
  assert.equal(validateProvinceBatch(input).value.candidates.length,1);
  assert.ok(validateProvinceBatch({...input,candidates:Array(21).fill(candidate)}).error);
  assert.ok(validateProvinceBatch({...input,candidates:[{...candidate,payload:{...candidate.payload,province:'เชียงใหม่'}}]}).error);
  assert.ok(validateProvinceBatch({...input,province:'Unknown'}).error);
  assert.ok(validateProvinceBatch({...input,requestKey:''}).error);
});
test('discovery never accepts Google content as a source, or caller-supplied approval/probe fields',()=>{
  const input={province:'ชลบุรี',requestKey:'fixture-request-1',candidates:[{...candidate,evidence:{source:{url:'https://maps.google.com/maps'}}}]};
  assert.ok(validateProvinceBatch(input).error);
  input.candidates[0].evidence={approved:true};assert.ok(validateProvinceBatch(input).error);
});
