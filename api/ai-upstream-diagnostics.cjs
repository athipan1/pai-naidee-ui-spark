'use strict';
class ProviderError extends Error {
  constructor(details) { super('OPENROUTER_UPSTREAM'); this.code='UPSTREAM_FAILURE'; this.details=details; }
}
const safeString=(value,max=96)=>typeof value==='string' && /^[a-zA-Z0-9_.:\/-]+$/.test(value)?value.slice(0,max):null;
function safeDetails(status,body,headers) {
  return {
    upstreamStatus:Number.isInteger(status)?status:null,
    providerErrorCode:Number.isInteger(body?.error?.code)?String(body.error.code):safeString(body?.error?.metadata?.provider_code),
    providerErrorType:safeString(body?.error?.metadata?.error_type),
    requestId:safeString(headers?.get?.('x-request-id') || body?.id || body?.request_id),
  };
}
async function fetchOpenRouter(url, options, timeout=20000, request=fetch) {
  let response;
  try { response=await request(url,{...options,signal:AbortSignal.timeout(timeout)}); }
  catch (err) {throw new ProviderError({upstreamStatus:null,providerErrorType:err?.name==='TimeoutError'?'timeout':'network',providerErrorCode:null,requestId:null});}
  let body;
  try { body=await response.json(); }
  catch {throw new ProviderError({upstreamStatus:response.status,providerErrorType:'invalid_json_envelope',providerErrorCode:null,requestId:safeString(response.headers?.get?.('x-request-id'))});}
  if (!response.ok || body?.error) throw new ProviderError(safeDetails(response.status,body,response.headers));
  return body;
}
function logProviderError(err,model) {
  const d=err?.details || {};
  // Never log provider text, prompts, content, tokens, credentials or user identifiers.
  console.warn('ai_trip_upstream', JSON.stringify({
    model:safeString(model,160),httpStatus:d.upstreamStatus ?? null,
    providerErrorCode:d.providerErrorCode ?? null,providerErrorType:d.providerErrorType ?? null,
    requestId:d.requestId ?? null,
  }));
}
module.exports={ProviderError,safeDetails,fetchOpenRouter,logProviderError};
