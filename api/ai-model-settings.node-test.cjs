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
 assert.deepEqual(handlers.map(x=>x[0]),['/api/admin/ai/models','/api/admin/ai/models/validate','/api/admin/ai/models']);
 assert.ok(handlers.every(x=>x[1]===guard));
});

test('model catalog check rejects unknown IDs and unsupported structured outputs',async()=>{
 const {checkOpenRouterModel}=require('./ai-model-settings.cjs');
 const fake=async()=>({ok:true,json:async()=>({data:[{id:'nvidia/nemotron-3.5-lightning:free',supported_parameters:[]}]})});
 assert.deepEqual((await checkOpenRouterModel('qwen/qwen3.8-27b:free',false,fake)).reason,'MODEL_NOT_FOUND');
 assert.equal((await checkOpenRouterModel('nvidia/nemotron-3.5-lightning:free',true,fake)).reason,'STRUCTURED_OUTPUT_NOT_ADVERTISED');
 assert.equal((await checkOpenRouterModel('nvidia/nemotron-3.5-lightning:free',false,fake)).ok,true);
});
