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

test('classifies invalid JSON envelope without logging response content',async()=>{
 const request=async()=>({ok:true,status:200,headers:{get:key=>key==='content-type'?'text/html':key==='content-length'?'87':null},json:async()=>{throw new SyntaxError('private upstream body');}});
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request),err=>{
  assert.equal(err.details.providerErrorType,'invalid_json_envelope');
  assert.equal(err.details.contentType,'text');
  assert.equal(err.details.responseBytes,87);
  assert.ok(!JSON.stringify(err.details).includes('private upstream body'));
  return true;
 });
});
test('classifies upstream stream-read failure',async()=>{
 const request=async()=>({ok:true,status:200,headers:{get:()=>null},json:async()=>{throw new TypeError('private response stream');}});
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request),err=>err.details.providerErrorType==='response_stream_failure');
});

test('distinguishes header abort from network failure',async()=>{
 const request=async()=>{const e=new Error('private');e.name='AbortError';throw e;};
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request),e=>e.details.providerErrorType==='headers_aborted'&&Number.isInteger(e.details.headersMs));
});
test('distinguishes interrupted response body from malformed JSON',async()=>{
 const request=async()=>({ok:true,status:200,headers:{get:k=>k==='content-type'?'application/json':null},json:async()=>{const e=new Error('private body');e.name='AbortError';throw e;}});
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request),e=>e.details.providerErrorType==='body_aborted'&&Number.isInteger(e.details.bodyMs)&&Number.isInteger(e.details.headersMs)&&!JSON.stringify(e.details).includes('private body'));
});
test('diagnoses body stream truncation separately',async()=>{
 const request=async()=>({ok:true,status:200,headers:{get:()=>null},json:async()=>{throw new TypeError('stream truncated');}});
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},100,request),e=>e.details.providerErrorType==='response_stream_failure'&&e.details.bodyMs>=0);
});
test('detects timeout while waiting for headers',async()=>{
 const request=async(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));
 await assert.rejects(fetchOpenRouter('https://openrouter.ai/api/v1/chat/completions',{},10,request),e=>e.details.providerErrorType==='headers_timeout');
});
