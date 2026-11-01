'use strict';
const { buildModelPayload } = require('./ai-model-gateway.cjs');
const { getActiveAiConfig } = require('./ai-model-settings.cjs');
const { fetchOpenRouter, ProviderError } = require('./ai-upstream-diagnostics.cjs');
const { parseAiJson, validateAiPlan } = require('./ai-trip-plan.cjs');

const PROBE_COOLDOWN_MS = 5 * 60_000;
let lastProbe = 0;
let inFlight = false;
const clean = value => typeof value === 'string' && /^[a-zA-Z0-9_.:\/-]{1,150}$/.test(value) ? value : null;
const usageOf = value => {
  const u = value && typeof value === 'object' ? value : {};
  return {
    promptTokens: Number.isSafeInteger(u.prompt_tokens) && u.prompt_tokens >= 0 ? u.prompt_tokens : null,
    completionTokens: Number.isSafeInteger(u.completion_tokens) && u.completion_tokens >= 0 ? u.completion_tokens : null,
    totalTokens: Number.isSafeInteger(u.total_tokens) && u.total_tokens >= 0 ? u.total_tokens : null,
    costUsd: Number.isFinite(u.cost) && u.cost >= 0 ? u.cost : null,
  };
};
function probeRequest(config) {
  const base = buildModelPayload({...config,maxOutputTokens: 1200}, [
    {role:'system',content:'Return only the required JSON object. No prose, no Markdown.'},
    {role:'user',content:'Test structured output: return days containing day 1 and placeIds ["test-place"].'},
  ]);
  // Never test a paid model or enable fallback for diagnostics.
  return base;
}
function registerAiHealthRoutes(app,{requireAdmin,getSql,request=fetchOpenRouter,now=Date.now}) {
  app.post('/api/admin/ai/health-check',requireAdmin,async(req,res)=>{
    res.set('Cache-Control','no-store');
    if(inFlight) return res.status(429).json({status:'busy',error:'An AI diagnostic is already running.'});
    if(now()-lastProbe<PROBE_COOLDOWN_MS) return res.status(429).json({status:'cooldown',retryAfterSeconds:Math.ceil((PROBE_COOLDOWN_MS-(now()-lastProbe))/1000)});
    let config;
    try {
      config=await getActiveAiConfig(getSql);
      if(config.paidEnabled) return res.status(403).json({status:'blocked',error:'Health checks for paid models are disabled.'});
      if(!process.env.OPENROUTER_API_KEY) return res.status(503).json({status:'not_configured'});
    } catch {
      return res.status(503).json({status:'invalid_configuration'});
    }
    lastProbe=now(); inFlight=true;
    const endpoint=process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    if(!/^https:\/\/openrouter\.ai\/api\/v1\/?$/.test(endpoint)) {
      inFlight=false;return res.status(503).json({status:'invalid_configuration'});
    }
    try {
      const body=await request(endpoint.replace(/\/$/,'')+'/chat/completions',{
        method:'POST',
        headers:{Authorization:'Bearer '+process.env.OPENROUTER_API_KEY,'Content-Type':'application/json',
          'HTTP-Referer':'https://pai-naidee-ui-spark.vercel.app','X-Title':'PaiNaiDee Health Check'},
        body:JSON.stringify(probeRequest(config)),
      },12000);
      const choice=body?.choices?.[0];
      console.info('ai_health_probe',JSON.stringify({status:'response',model:clean(body?.model)||config.model,finishReason:clean(choice?.finish_reason),usage:usageOf(body?.usage)}));
      if(!choice?.message || !['stop','end_turn'].includes(choice.finish_reason)) {
        return res.status(502).json({status:'model_incomplete',model:clean(body?.model)||config.model,finishReason:clean(choice?.finish_reason),usage:usageOf(body?.usage)});
      }
      const content=choice.message.content;
      const raw=Array.isArray(content)?content.filter(p=>p?.type==='text'&&typeof p.text==='string').map(p=>p.text).join('\n'):content;
      let code='ok';
      try {
        const parsed=parseAiJson(raw);
        validateAiPlan(parsed,1,[{id:'test-place'}]);
        if(parsed.days.length!==1||parsed.days[0].placeIds.length!==1||parsed.days[0].placeIds[0]!=='test-place')code='INVALID_SCHEMA';
      } catch(error) {
        code=['INVALID_JSON','INVALID_SCHEMA','INVALID_PLACE_IDS','EMPTY_CONTENT','OUTPUT_TOO_LARGE'].includes(error?.code)?error.code:'INVALID_SCHEMA';
      }
      console.info('ai_health_validation',JSON.stringify({type:code,model:clean(body?.model)||config.model,finishReason:clean(choice.finish_reason),usage:usageOf(body?.usage)}));
      return res.status(code==='ok'?200:502).json({
        status:code==='ok'?'ok':'validation_failed',errorCode:code==='ok'?null:code,upstreamHttpStatus:200,
        model:clean(body?.model)||config.model,finishReason:clean(choice.finish_reason),usage:usageOf(body?.usage),
        structuredOutputEnabled:config.structuredOutput,
      });
    } catch(err) {
      const d=err instanceof ProviderError?err.details:{};
      console.warn('ai_health_probe',JSON.stringify({status:'upstream_failure',upstreamHttpStatus:Number.isInteger(d.upstreamStatus)?d.upstreamStatus:null,providerErrorCode:clean(d.providerErrorCode),providerErrorType:clean(d.providerErrorType),requestId:clean(d.requestId),model:config.model}));
      return res.status(502).json({
        status:'upstream_failure',upstreamHttpStatus:Number.isInteger(d.upstreamStatus)?d.upstreamStatus:null,
        providerErrorCode:clean(d.providerErrorCode),providerErrorType:clean(d.providerErrorType),
        requestId:clean(d.requestId),model:config.model,usage:usageOf(null),
      });
    } finally {inFlight=false;}
  });
}
module.exports={registerAiHealthRoutes,probeRequest,usageOf};
