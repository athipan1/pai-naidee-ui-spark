const {test}=require('node:test');
const assert=require('node:assert/strict');
const {safeDetails,fetchOpenRouter}=require('./ai-upstream-diagnostics.cjs');
test('collects safe OpenRouter status typed error and request ID',()=>{
 const d=safeDetails(503,{error:{code:503,metadata:{error_type:'provider_unavailable',provider_code:'no_endpoint'}}},
 {get:()=> 'req-safe-123'});
 assert.equal(d.upstreamStatus,503);
 assert.equal(d.providerErrorType,'provider_unavailable');
 assert.equal(d.providerErrorCode,'503');
 assert.equal(d.requestId,'req-safe-123');
});
test('rejects 200 error envelopes without reporting false success',async()=>{
 const request=async()=>({ok:true,status:200,headers:{get:()=>null},json:async()=>({id:'gen-123',error:{code:502,metadata:{error_type:'provider_unavailable'}}})});
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request),
  err=>err.code==='UPSTREAM_FAILURE'&&err.details.upstreamStatus===200&&err.details.providerErrorType==='provider_unavailable');
});
test('does not log malicious error text or identifiers',()=>{
 const d=safeDetails(429,{error:{message:'secret',metadata:{provider_code:'token=SECRET',error_type:'rate_limit_exceeded'}}},{get:()=> 'key secret value'});
 assert.equal(d.providerErrorCode,null);assert.equal(d.requestId,null);
});
test('accepts valid non-error responses',async()=>{
 const request=async()=>({ok:true,status:200,headers:{get:()=>null},json:async()=>({choices:[{message:{content:'{}'}}]})});
 const result=await fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request);
 assert.equal(result.choices[0].message.content,'{}');
});
