const {test}=require('node:test');
const assert=require('node:assert/strict');
const {registerAiHealthRoutes,probeRequest,usageOf}=require('./ai-health-check.cjs');

test('health check payload is minimal and does not accept user prompts',()=>{
 const cfg={model:'test/example:free',maxOutputTokens:1200,structuredOutput:true};
 const payload=probeRequest(cfg);
 assert.equal(payload.model,'test/example:free');
 assert.equal(payload.max_tokens,1200);
 assert.equal(payload.response_format.type,'json_schema');
 assert.equal(payload.provider.allow_fallbacks,false);
 assert.ok(JSON.stringify(payload).includes('test-place'));
});
test('usage redacts unsupported values',()=>{
 assert.deepEqual(usageOf({prompt_tokens:7,completion_tokens:3,total_tokens:10,cost:0}),
 {promptTokens:7,completionTokens:3,totalTokens:10,costUsd:0});
 assert.equal(usageOf({total_tokens:'private'}).totalTokens,null);
});
test('health endpoint requires admin guard and does not mount publicly',()=>{
 const registered=[];
 const app={post:(...args)=>registered.push(args)};
 const guard=(_req,res)=>res.status(401).json({error:'unauthorized'});
 registerAiHealthRoutes(app,{requireAdmin:guard,request:async()=>{throw Error('must not call')}});
 assert.equal(registered.length,1);
 assert.equal(registered[0][0],'/api/admin/ai/health-check');
 assert.equal(registered[0][1],guard);
});
