const DEFAULT_ORIGINS = [
  'https://pai-naidee-ui-spark.vercel.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

const ROLE_SET = new Set(['admin', 'editor', 'moderator', 'viewer']);

function parseAllowedOrigins(value = '') {
  const configured = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([...DEFAULT_ORIGINS, ...configured]);
}

function buildCorsOptions(env = process.env) {
  const allowedOrigins = parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS);

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS policy'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400,
  };
}

function createRateLimiter({
  windowMs = 60_000,
  max = 120,
  keyPrefix = 'api',
  now = () => Date.now(),
} = {}) {
  const buckets = new Map();

  return (req, res, next) => {
    const key = `${keyPrefix}:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
    const current = now();
    const existing = buckets.get(key);

    if (!existing || current >= existing.resetAt) {
      buckets.set(key, { count: 1, resetAt: current + windowMs });
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, max - 1)));
      next();
      return;
    }

    existing.count += 1;
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - existing.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(existing.resetAt / 1000)));

    if (existing.count > max) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    next();
  };
}

function getBearerToken(req) {
  const header = req.headers?.authorization;
  if (typeof header !== 'string') return null;

  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}

function createRoleGuard(supabase, allowedRoles) {
  const allowed = new Set(allowedRoles);

  return async (req, res, next) => {
    if (!supabase) {
      res.status(503).json({ error: 'Authentication service is unavailable.' });
      return;
    }

    const token = getBearerToken(req);
    if (!token) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired access token.' });
      return;
    }

    const role = user.app_metadata?.role;
    if (typeof role !== 'string' || !ROLE_SET.has(role) || !allowed.has(role)) {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }

    req.auth = { user, role };
    next();
  };
}

function isNonEmptyString(value, maxLength = 500) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

function isValidCoordinates(value) {
  if (!value || typeof value !== 'object') return false;

  const lat = Number(value.lat);
  const lng = Number(value.lng);

  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function validateCreatePlacePayload(value) {
  const errors = [];

  if (!value || typeof value !== 'object') {
    return { ok: false, errors: ['placeData must be an object'] };
  }

  if (!isNonEmptyString(value.placeName, 200)) errors.push('placeName is required and must be <= 200 characters');
  if (!isNonEmptyString(value.province, 120)) errors.push('province is required and must be <= 120 characters');
  if (!isNonEmptyString(value.category, 120)) errors.push('category is required and must be <= 120 characters');
  if (value.placeNameLocal != null && typeof value.placeNameLocal !== 'string') errors.push('placeNameLocal must be a string');
  if (value.description != null && (typeof value.description !== 'string' || value.description.length > 10_000)) {
    errors.push('description must be <= 10000 characters');
  }
  if (!isValidCoordinates(value.coordinates)) errors.push('coordinates must contain valid lat/lng values');

  return { ok: errors.length === 0, errors };
}

function validateUpdatePlacePayload(value) {
  const errors = [];

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, errors: ['request body must be an object'] };
  }

  const allowed = ['name', 'name_local', 'province', 'category', 'description', 'coordinates'];
  const present = allowed.filter((key) => value[key] !== undefined);

  if (present.length === 0) errors.push('at least one editable field is required');
  if (value.name !== undefined && !isNonEmptyString(value.name, 200)) errors.push('name must be a non-empty string <= 200 characters');
  if (value.name_local !== undefined && typeof value.name_local !== 'string') errors.push('name_local must be a string');
  if (value.province !== undefined && !isNonEmptyString(value.province, 120)) errors.push('province must be a non-empty string <= 120 characters');
  if (value.category !== undefined && !isNonEmptyString(value.category, 120)) errors.push('category must be a non-empty string <= 120 characters');
  if (value.description !== undefined && (typeof value.description !== 'string' || value.description.length > 10_000)) {
    errors.push('description must be <= 10000 characters');
  }
  if (value.coordinates !== undefined && !isValidCoordinates(value.coordinates)) errors.push('coordinates must contain valid lat/lng values');

  return { ok: errors.length === 0, errors };
}

function validateTalkPayload(value) {
  const errors = [];

  if (!value || typeof value !== 'object') {
    return { ok: false, errors: ['request body must be an object'] };
  }

  if (!isNonEmptyString(value.message, 2000)) errors.push('message is required and must be <= 2000 characters');
  if (value.session_id !== undefined && (typeof value.session_id !== 'string' || value.session_id.length > 128)) {
    errors.push('session_id must be a string <= 128 characters');
  }
  if (value.language !== undefined && !['auto', 'th', 'en'].includes(value.language)) {
    errors.push('language must be one of auto, th, en');
  }

  return { ok: errors.length === 0, errors };
}

function isUuid(value) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

module.exports = {
  buildCorsOptions,
  createRateLimiter,
  createRoleGuard,
  getBearerToken,
  isUuid,
  validateCreatePlacePayload,
  validateTalkPayload,
  validateUpdatePlacePayload,
};
