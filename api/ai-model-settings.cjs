'use strict';
const { resolveModelConfig } = require('./ai-model-gateway.cjs');
// Explicit free-only curated options. Never allow model IDs supplied by public visitors.
const MODEL_OPTIONS = Object.freeze([
  {id:'qwen/qwen3.8-27b:free',label:'Qwen 3.8 27B (Free)'},
  {id:'nvidia/nemotron-3.5-lightning:free',label:'NVIDIA Nemotron 3.5 Lightning (Free)'},
]);
const allowedIds = new Set(MODEL_OPTIONS.map(m=>m.id));
async function ensureAiSettings(getSql) {
  const sql=getSql();
  await sql`CREATE TABLE IF NOT EXISTS ai_planner_settings (
    id INTEGER PRIMARY KEY CHECK(id=1),
    model_id TEXT NOT NULL,
    structured_output BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
}
async function getAiSettings(getSql) {
  const sql=getSql();
  const rows=await sql`SELECT model_id,structured_output,updated_at FROM ai_planner_settings WHERE id=1`;
  const saved=rows[0];
  if(saved && allowedIds.has(saved.model_id)) return {model:saved.model_id,structuredOutput:saved.structured_output===true,source:'postgresql',updatedAt:saved.updated_at instanceof Date?saved.updated_at.toISOString():saved.updated_at||null};
  return {model:process.env.OPENROUTER_MODEL,structuredOutput:process.env.AI_STRUCTURED_OUTPUT==='true',source:'railway',updatedAt:null};
}
async function getActiveAiConfig(getSql) {
  const settings=await getAiSettings(getSql);
  return resolveModelConfig({...process.env,OPENROUTER_MODEL:settings.model,AI_STRUCTURED_OUTPUT:String(settings.structuredOutput)});
}

async function checkOpenRouterModel(model,structuredOutput,request=fetch) {
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),6500);
  try {
    const response=await request('https://openrouter.ai/api/v1/models',{signal:controller.signal,headers:{Accept:'application/json'}});
    if(!response.ok) return {ok:false,reason:'CATALOG_UNAVAILABLE'};
    const data=await response.json();
    const found=Array.isArray(data?.data)?data.data.find(item=>item?.id===model):null;
    if(!found) return {ok:false,reason:'MODEL_NOT_FOUND'};
    const supported=Array.isArray(found.supported_parameters)?found.supported_parameters:[];
    if(structuredOutput && !supported.includes('structured_outputs') && !supported.includes('response_format'))
      return {ok:false,reason:'STRUCTURED_OUTPUT_NOT_ADVERTISED'};
    return {ok:true,reason:'CATALOG_MATCHED',model:found.id,structuredOutputAdvertised:supported.includes('structured_outputs')||supported.includes('response_format')};
  } catch {return {ok:false,reason:'CATALOG_UNAVAILABLE'};}
  finally {clearTimeout(timer);}
}

function registerAiSettingsRoutes(app,{requireAdmin,getSql}) {
  app.get('/api/admin/ai/models',requireAdmin,async(_req,res)=>{
    res.set('Cache-Control','no-store');
    try {res.json({options:MODEL_OPTIONS,selected:await getAiSettings(getSql),paidModelsAllowed:false,backendCommit:process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0,12)||null});}
    catch {res.status(503).json({error:'Cannot load AI model settings.'});}
  });
  app.get('/api/admin/ai/models/validate',requireAdmin,async(req,res)=>{
    res.set('Cache-Control','no-store');
    const model=String(req.query.model||''),structuredOutput=req.query.structuredOutput==='true';
    if(!allowedIds.has(model))return res.status(400).json({ok:false,reason:'MODEL_NOT_ALLOWED'});
    const result=await checkOpenRouterModel(model,structuredOutput);
    return res.status(result.ok?200:422).json(result);
  });
  app.put('/api/admin/ai/models',requireAdmin,async(req,res)=>{
    res.set('Cache-Control','no-store');
    const {model,structuredOutput}=req.body||{};
    if(!allowedIds.has(model)||typeof structuredOutput!=='boolean') return res.status(400).json({error:'Only approved free models and boolean structured-output flags are allowed.'});
    try {
      const validation=await checkOpenRouterModel(model,structuredOutput);
      if(!validation.ok)return res.status(422).json({error:'Model validation failed: '+validation.reason,reason:validation.reason});
      const config=resolveModelConfig({...process.env,OPENROUTER_MODEL:model,AI_STRUCTURED_OUTPUT:String(structuredOutput)});
      if(config.paidEnabled) return res.status(403).json({error:'Paid models cannot be selected here.'});
      const sql=getSql();
      await sql`INSERT INTO ai_planner_settings(id,model_id,structured_output,updated_at)
      VALUES (1,${model},${structuredOutput},NOW())
      ON CONFLICT(id) DO UPDATE SET model_id=EXCLUDED.model_id,structured_output=EXCLUDED.structured_output,updated_at=NOW()`;
      res.json({selected:await getAiSettings(getSql),requiresHealthCheck:true});
    } catch {res.status(503).json({error:'Could not save AI model settings.'});}
  });
}
module.exports={MODEL_OPTIONS,allowedIds,ensureAiSettings,getAiSettings,getActiveAiConfig,registerAiSettingsRoutes,checkOpenRouterModel};
