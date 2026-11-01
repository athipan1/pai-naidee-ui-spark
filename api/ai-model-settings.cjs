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
  const rows=await sql`SELECT model_id,structured_output FROM ai_planner_settings WHERE id=1`;
  const saved=rows[0];
  if(saved && allowedIds.has(saved.model_id)) return {model:saved.model_id,structuredOutput:saved.structured_output===true,source:'admin'};
  return {model:process.env.OPENROUTER_MODEL,structuredOutput:process.env.AI_STRUCTURED_OUTPUT==='true',source:'railway'};
}
async function getActiveAiConfig(getSql) {
  const settings=await getAiSettings(getSql);
  return resolveModelConfig({...process.env,OPENROUTER_MODEL:settings.model,AI_STRUCTURED_OUTPUT:String(settings.structuredOutput)});
}
function registerAiSettingsRoutes(app,{requireAdmin,getSql}) {
  app.get('/api/admin/ai/models',requireAdmin,async(_req,res)=>{
    res.set('Cache-Control','no-store');
    try {res.json({options:MODEL_OPTIONS,selected:await getAiSettings(getSql),paidModelsAllowed:false});}
    catch {res.status(503).json({error:'Cannot load AI model settings.'});}
  });
  app.put('/api/admin/ai/models',requireAdmin,async(req,res)=>{
    res.set('Cache-Control','no-store');
    const {model,structuredOutput}=req.body||{};
    if(!allowedIds.has(model)||typeof structuredOutput!=='boolean') return res.status(400).json({error:'Only approved free models and boolean structured-output flags are allowed.'});
    try {
      const config=resolveModelConfig({...process.env,OPENROUTER_MODEL:model,AI_STRUCTURED_OUTPUT:String(structuredOutput)});
      if(config.paidEnabled) return res.status(403).json({error:'Paid models cannot be selected here.'});
      const sql=getSql();
      await sql`INSERT INTO ai_planner_settings(id,model_id,structured_output,updated_at)
      VALUES (1,${model},${structuredOutput},NOW())
      ON CONFLICT(id) DO UPDATE SET model_id=EXCLUDED.model_id,structured_output=EXCLUDED.structured_output,updated_at=NOW()`;
      res.json({selected:{model,structuredOutput,source:'admin'},requiresHealthCheck:true});
    } catch {res.status(503).json({error:'Could not save AI model settings.'});}
  });
}
module.exports={MODEL_OPTIONS,allowedIds,ensureAiSettings,getAiSettings,getActiveAiConfig,registerAiSettingsRoutes};
