'use strict';

// Centralized model configuration. No keys, model names or prices originate from the client.
const MODEL_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:/+-]{2,150}$/;
const intEnv = (name, fallback, min, max) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) throw new Error('INVALID_AI_CONFIG');
  return n;
};
function resolveModelConfig(env = process.env) {
  const model = env.OPENROUTER_MODEL;
  if (typeof model !== 'string' || !MODEL_ID.test(model)) throw new Error('INVALID_AI_MODEL');
  // Explicitly block paid models by default. openrouter/free is permitted but discouraged
  // because automatic free routing cannot guarantee a stable output schema.
  const paidEnabled = env.AI_ALLOW_PAID_MODELS === 'true';
  if (!paidEnabled && model !== 'openrouter/free' && !model.endsWith(':free'))
    throw new Error('PAID_MODEL_NOT_ENABLED');
  const maxOutputTokens = Number(env.AI_MAX_OUTPUT_TOKENS || 1200);
  if (!Number.isInteger(maxOutputTokens) || maxOutputTokens < 300 || maxOutputTokens > 4000)
    throw new Error('INVALID_AI_TOKEN_LIMIT');
  const structuredOutput = env.AI_STRUCTURED_OUTPUT === 'true';
  const fallbackEnabled = env.AI_MODEL_FALLBACK_ENABLED === 'true';
  if (fallbackEnabled) throw new Error('FALLBACK_NOT_IMPLEMENTED');
  const cap = Number(env.AI_MAX_COST_PER_REQUEST_USD || 0);
  if (!Number.isFinite(cap) || cap < 0 || cap > 10) throw new Error('INVALID_AI_COST_CAP');
  if (paidEnabled) {
    // Conservative preflight ceiling, based on explicit pricing in USD / million tokens.
    // Block paid calls when billing data is not configured: costs must never be guessed.
    const promptPrice = Number(env.AI_INPUT_USD_PER_M_TOKENS);
    const outputPrice = Number(env.AI_OUTPUT_USD_PER_M_TOKENS);
    const maxInput = Number(env.AI_MAX_PROMPT_TOKENS || 4000);
    if (!(promptPrice >= 0) || !(outputPrice >= 0) || !Number.isFinite(promptPrice)
      || !Number.isFinite(outputPrice) || !Number.isInteger(maxInput) || maxInput < 1 || maxInput > 100000 || !cap)
      throw new Error('PAID_MODEL_PRICING_REQUIRED');
    if ((maxInput * promptPrice + maxOutputTokens * outputPrice) / 1000000 > cap)
      throw new Error('AI_COST_CAP_EXCEEDED');
  }
  return {model, maxOutputTokens, structuredOutput, paidEnabled, fallbackEnabled:false};
}
function responseFormat() {
  return {
    type:'json_schema',
    json_schema:{
      name:'trip_itinerary',
      strict:true,
      schema:{
        type:'object',additionalProperties:false,required:['days'],
        properties:{days:{type:'array',minItems:1,maxItems:5,
          items:{type:'object',additionalProperties:false,required:['day','placeIds'],
            properties:{day:{type:'integer',minimum:1,maximum:5},
              placeIds:{type:'array',minItems:1,maxItems:3,items:{type:'string'}}}}}}
      }
    }
  };
}
function buildModelPayload(config,messages) {
  const payload={model:config.model,temperature:0.2,max_tokens:config.maxOutputTokens,
    messages,provider:{allow_fallbacks:false}};
  if(config.structuredOutput) {
    payload.response_format=responseFormat();
    payload.provider.require_parameters=true;
  }
  return payload;
}
module.exports={resolveModelConfig,buildModelPayload,responseFormat};
