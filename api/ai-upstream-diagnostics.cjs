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
const errorKind=err=>err?.name==='TimeoutError'?'timeout':err?.name==='AbortError'?'aborted':err?.name==='SyntaxError'?'invalid_json_envelope':'response_read_failure';
const elapsed=start=>Math.max(0,Math.round(performance.now()-start));
async function fetchOpenRouter(url,options,timeout=20000,request=fetch) {
  const start=performance.now();
  const timeoutSignal=AbortSignal.timeout(timeout);
  const signal=options?.signal?AbortSignal.any([timeoutSignal,options.signal]):timeoutSignal;
  let response,headersMs=null;
  try {response=await request(url,{...options,signal});headersMs=elapsed(start);}
  catch(err) {
    const providerErrorType=timeoutSignal.aborted?'headers_timeout':errorKind(err)==='aborted'?'headers_aborted':'headers_network_failure';
    throw new ProviderError({upstreamStatus:null,providerErrorType,providerErrorCode:null,requestId:null,headersMs:elapsed(start),bodyMs:null});
  }
  const bodyStart=performance.now();
  let body;
  try {body=await response.json();}
  catch(err) {
    const ct=(response.headers?.get?.('content-type')||'').toLowerCase();
    const declaredLength=response.headers?.get?.('content-length');
    const bytes=declaredLength===null||declaredLength===undefined?null:Number(declaredLength);
    const kind=timeoutSignal.aborted?'body_timeout':errorKind(err)==='aborted'?'body_aborted':errorKind(err)==='invalid_json_envelope'?'invalid_json_envelope':'response_stream_failure';
    throw new ProviderError({upstreamStatus:response.status,providerErrorType:kind,providerErrorCode:null,
      requestId:safeString(response.headers?.get?.('x-request-id')),
      contentType:ct.includes('json')?'json':ct.startsWith('text/')?'text':'other_or_missing',
      responseBytes:Number.isSafeInteger(bytes)&&bytes>=0?bytes:null,
      headersMs,bodyMs:elapsed(bodyStart)});
  }
  if(!response.ok||body?.error)throw new ProviderError({...safeDetails(response.status,body,response.headers),headersMs,bodyMs:elapsed(bodyStart)});
  return body;
}
function logProviderError(err,model) {
  const d=err?.details || {};
  // Never log provider text, prompts, content, tokens, credentials or user identifiers.
  console.warn('ai_trip_upstream', JSON.stringify({
    model:safeString(model,160),httpStatus:d.upstreamStatus ?? null,
    providerErrorCode:d.providerErrorCode ?? null,providerErrorType:d.providerErrorType ?? null,
    requestId:d.requestId ?? null,contentType:d.contentType??null,responseBytes:d.responseBytes??null,headersMs:d.headersMs??null,bodyMs:d.bodyMs??null,
  }));
}
module.exports={ProviderError,safeDetails,fetchOpenRouter,logProviderError};
