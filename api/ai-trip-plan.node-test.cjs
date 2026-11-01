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
