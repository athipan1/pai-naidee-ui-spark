# AI model gateway (PaiNaiDee Railway backend)

The AI trip planner uses the server-side OpenRouter key. No model ID or price is accepted from visitors. To upgrade models, change Railway service variables and redeploy **only the Railway backend**. The Vercel frontend does not need to change.

Environment variables:

- `OPENROUTER_MODEL`: concrete OpenRouter model identifier (recommended to pin a model rather than `openrouter/free`).
- `AI_MAX_OUTPUT_TOKENS`: 300–4000, default 1200.
- `AI_STRUCTURED_OUTPUT`: `false` (default). Enable `true` **only after testing** the chosen model's strict JSON Schema support. When on, requests require providers supporting the parameters.
- `AI_MODEL_FALLBACK_ENABLED`: `false`. Any attempt to set `true` fails closed until explicit, tested fallback support is implemented.
- `AI_ALLOW_PAID_MODELS`: `false` by default. Non-`:free` models are blocked unless enabled.
- `AI_MAX_COST_PER_REQUEST_USD`: maximum estimated per-request cost, required for paid models.
- `AI_INPUT_USD_PER_M_TOKENS`, `AI_OUTPUT_USD_PER_M_TOKENS`: explicit published rates for the **selected** model, required for paid models.
- `AI_MAX_PROMPT_TOKENS`: conservative prompt token ceiling used by the preflight estimate (default 4000).

The paid-cost check is a **preflight estimate**, not a billing guarantee. Actual usage may depend on reasoning tokens, routing fees, or provider pricing. Set a spending limit at the provider/account level as an additional hard limit. The backend does not use a paid fallback and does not automatically retry a failed model call.

The AI's proposed place IDs must still pass the Postgres candidate, JSON schema, nature preference, routing and opening-hours validation gates. A model upgrade never overrides those checks.

Rollout checklist: test a pinned free model first, review JSON schema support and sample trip results, compare request tokens, failure rates and real provider costs, then enable another model only after explicit approval. Never place OpenRouter credentials in the browser bundle.
