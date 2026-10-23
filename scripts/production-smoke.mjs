#!/usr/bin/env node

// Safe, read-only checks against the actual public production endpoints.
const webUrl = process.env.SMOKE_WEB_URL || 'https://pai-naidee-ui-spark.vercel.app';
const apiUrl = process.env.SMOKE_API_URL || 'https://painaidee-api-production.up.railway.app';

async function check(label, url, validate) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json, text/html' } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    await validate(response);
    console.log(`PASS ${label} (${response.status})`);
  } finally {
    clearTimeout(timeout);
  }
}

try {
  await check('web', webUrl, async (response) => {
    const html = await response.text();
    if (!html.includes('<div id="root"')) throw new Error('React app root missing');
  });
  await check('Railway database readiness', `${apiUrl}/api/health`, async (response) => {
    const health = await response.json();
    if (health.status !== 'ok' || health.database !== 'ok') throw new Error('Database is degraded');
  });
  await check('public attractions', `${apiUrl}/api/places?page=1&limit=2`, async (response) => {
    const data = await response.json();
    if (!Array.isArray(data.attractions) || !Number.isInteger(data.total)) {
      throw new Error('Unexpected attractions response schema');
    }
    if (data.attractions.length === 0) throw new Error('Production has no attractions');
  });
  console.log('Production public-read smoke checks passed. Auth, admin writes and media uploads are NOT verified.');
} catch (error) {
  console.error(`FAIL production smoke: ${error.message}`);
  process.exitCode = 1;
}
