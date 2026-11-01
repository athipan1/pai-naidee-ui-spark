const {test}=require('node:test');const assert=require('node:assert/strict');
const {MODEL_OPTIONS,allowedIds,registerAiSettingsRoutes}=require('./ai-model-settings.cjs');
test('all admin selectable models are free and explicitly allowlisted',()=>{
 assert.ok(MODEL_OPTIONS.length>=2);
 assert.ok(MODEL_OPTIONS.every(m=>m.id.endsWith(':free')));
 assert.equal(allowedIds.has('provider/paid-model'),false);
});
test('model management routes require existing admin middleware',()=>{
 const handlers=[];const app={get:(...a)=>handlers.push(a),put:(...a)=>handlers.push(a)};
 const guard=()=>{};registerAiSettingsRoutes(app,{requireAdmin:guard,getSql:()=>{}});
 assert.deepEqual(handlers.map(x=>x[0]),['/api/admin/ai/models','/api/admin/ai/models']);
 assert.ok(handlers.every(x=>x[1]===guard));
});
