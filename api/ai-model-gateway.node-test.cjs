const {test}=require('node:test');
const assert=require('node:assert/strict');
const {resolveModelConfig,buildModelPayload}=require('./ai-model-gateway.cjs');

test('free model can be pinned and switched through environment',()=>{
 const cfg=resolveModelConfig({OPENROUTER_MODEL:'provider/quality-model:free'});
 assert.equal(cfg.model,'provider/quality-model:free');
 assert.equal(cfg.fallbackEnabled,false);
 assert.equal(buildModelPayload(cfg,[]).provider.allow_fallbacks,false);
});
test('unapproved paid model and automatic fallback fail closed',()=>{
 assert.throws(()=>resolveModelConfig({OPENROUTER_MODEL:'provider/paid-model'}),/PAID_MODEL_NOT_ENABLED/);
 assert.throws(()=>resolveModelConfig({OPENROUTER_MODEL:'openrouter/free',AI_MODEL_FALLBACK_ENABLED:'true'}),/FALLBACK_NOT_IMPLEMENTED/);
});
test('structured output schema is opt-in and provider must support it',()=>{
 const config=resolveModelConfig({OPENROUTER_MODEL:'provider/model:free',AI_STRUCTURED_OUTPUT:'true'});
 const p=buildModelPayload(config,[]);
 assert.equal(p.response_format.type,'json_schema');
 assert.equal(p.response_format.json_schema.strict,true);
 assert.equal(p.provider.require_parameters,true);
 assert.equal(p.response_format.json_schema.schema.additionalProperties,false);
});
test('paid model requires explicit approval, pricing, and a conservative cost ceiling',()=>{
 const env={OPENROUTER_MODEL:'provider/premium',AI_ALLOW_PAID_MODELS:'true'};
 assert.throws(()=>resolveModelConfig(env),/PAID_MODEL_PRICING_REQUIRED/);
 assert.throws(()=>resolveModelConfig({...env,AI_INPUT_USD_PER_M_TOKENS:'10',AI_OUTPUT_USD_PER_M_TOKENS:'50',AI_MAX_COST_PER_REQUEST_USD:'0.01'}),/AI_COST_CAP_EXCEEDED/);
 assert.equal(resolveModelConfig({...env,AI_INPUT_USD_PER_M_TOKENS:'0.5',AI_OUTPUT_USD_PER_M_TOKENS:'1',AI_MAX_COST_PER_REQUEST_USD:'0.01'}).paidEnabled,true);
});
test('rejects bad model IDs and token limits',()=>{
 assert.throws(()=>resolveModelConfig({OPENROUTER_MODEL:'invalid model'}),/INVALID_AI_MODEL/);
 assert.throws(()=>resolveModelConfig({OPENROUTER_MODEL:'openrouter/free',AI_MAX_OUTPUT_TOKENS:'100000'}),/INVALID_AI_TOKEN_LIMIT/);
});

test('trip planning uses 2400 tokens by default while health check remains 1200',()=>{
 const config=resolveModelConfig({OPENROUTER_MODEL:'provider/model:free'});
 assert.equal(config.maxOutputTokens,2400);
 assert.equal(buildModelPayload(config,[]).max_tokens,2400);
});
