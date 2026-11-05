'use strict';

// This is a shared, durable request ceiling for the PaiNaiDee backend, not a
// Google Cloud billing cap. Every allowed attempt is charged against its day
// BEFORE sending data to Google, including requests that later time out.
const QUOTAS = Object.freeze({
  places_search: {variable: 'GOOGLE_PLACES_DAILY_LIMIT', maximum: 5},
  routes_compute: {variable: 'GOOGLE_ROUTES_DAILY_LIMIT', maximum: 25},
  // Independent, deliberately small ceilings for the detail/photo pilot.
  places_detail: {variable: 'GOOGLE_PLACE_DETAIL_DAILY_LIMIT', maximum: 2, defaultLimit: 0},
  places_photo: {variable: 'GOOGLE_PLACE_PHOTO_DAILY_LIMIT', maximum: 2, defaultLimit: 0},
});

function dailyLimit(kind) {
  const policy = QUOTAS[kind];
  if (!policy) return 0;
  const value = process.env[policy.variable];
  if (value === undefined || value === '') return policy.defaultLimit ?? policy.maximum;
  // An invalid or negative value must never silently expand the allowance.
  if (!/^\d+$/.test(value.trim())) return 0;
  return Math.min(Number(value), policy.maximum);
}

async function reserveGoogleDailyQuota(kind, getSql) {
  const limit = dailyLimit(kind);
  if (!limit || typeof getSql !== 'function') return false;

  try {
    const sql = getSql();
    // PostgreSQL resolves the Bangkok day inside the statement so all Railway
    // instances agree, regardless of server timezone or clock skew. The
    // conflicting row is locked while the conditional increment is evaluated.
    const rows = await sql`
      INSERT INTO google_api_daily_usage (usage_day, api_name, request_count)
      VALUES ((NOW() AT TIME ZONE 'Asia/Bangkok')::date, ${kind}, 1)
      ON CONFLICT (usage_day, api_name)
      DO UPDATE SET request_count = google_api_daily_usage.request_count + 1,
                    updated_at = NOW()
      WHERE google_api_daily_usage.request_count < ${limit}
      RETURNING request_count
    `;
    if (rows.length === 1) return true;
    console.warn('google_daily_quota_exhausted', kind);
    return false;
  } catch (error) {
    // Fail closed on database errors: never fall back to process-local quota.
    console.warn('google_daily_quota_unavailable', kind, String(error?.code || 'DB_ERROR').slice(0, 30));
    return false;
  }
}

module.exports = {dailyLimit, reserveGoogleDailyQuota};
