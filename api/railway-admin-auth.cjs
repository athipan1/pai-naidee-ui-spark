const { randomBytes, createHash, scryptSync, timingSafeEqual } = require('node:crypto');

const SESSION_SECONDS = 12 * 60 * 60;
const DUMMY_SALT = 'painaidee-dummy-admin-salt';
const hashToken = token => createHash('sha256').update(token).digest('hex');

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password) > 1024) {
    throw new Error('Password must be at least 12 characters and at most 1024 bytes.');
  }
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password, encoded) {
  const parts = typeof encoded === 'string' ? encoded.split('$') : [];
  const salt = parts[0] === 'scrypt' && /^[a-f0-9]{32}$/.test(parts[1]) ? parts[1] : DUMMY_SALT;
  const actual = scryptSync(String(password || ''), salt, 64);
  const expected = parts.length === 3 && /^[a-f0-9]{128}$/.test(parts[2])
    ? Buffer.from(parts[2], 'hex') : Buffer.alloc(64);
  return timingSafeEqual(actual, expected) && parts[0] === 'scrypt';
}

function authRoutes(app, { getSql, limitLogin }) {
  const protect = async (req, res, next) => {
    const match = /^Bearer ([A-Za-z0-9_-]{40,100})$/.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Admin login required.' });
    try {
      const sql = getSql();
      const rows = await sql`SELECT u.id, u.email, u.role FROM admin_sessions s
        JOIN admin_users u ON u.id = s.user_id
        WHERE s.token_hash = ${hashToken(match[1])} AND s.expires_at > NOW() AND u.disabled = FALSE
        LIMIT 1`;
      if (!rows.length || rows[0].role !== 'admin') return res.status(401).json({ error: 'Session expired or invalid.' });
      req.auth = { user: rows[0], role: rows[0].role };
      next();
    } catch (error) {
      console.error('Railway authentication unavailable:', error?.message);
      res.status(503).json({ error: 'Authentication temporarily unavailable.' });
    }
  };

  app.post('/api/admin/login', limitLogin, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body?.password;
    if (!/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length > 1024) {
      return res.status(400).json({ error: 'Invalid login request.' });
    }
    try {
      const sql = getSql();
      const rows = await sql`SELECT id, email, password_hash, role, disabled FROM admin_users WHERE email = ${email} LIMIT 1`;
      const user = rows[0];
      const valid = verifyPassword(password, user?.password_hash);
      if (!user || !valid || user.disabled || user.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
      const token = randomBytes(32).toString('base64url');
      const sessionId = randomBytes(16).toString('hex');
      await sql`INSERT INTO admin_sessions (id, user_id, token_hash, expires_at)
        VALUES (${sessionId}, ${user.id}, ${hashToken(token)}, NOW() + (${SESSION_SECONDS} * INTERVAL '1 second'))`;
      res.setHeader('Cache-Control', 'no-store');
      res.json({ token, expiresIn: SESSION_SECONDS, email: user.email, role: 'admin' });
    } catch (error) {
      console.error('Railway login unavailable:', error?.message);
      res.status(503).json({ error: 'Login temporarily unavailable.' });
    }
  });

  app.get('/api/admin/me', protect, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json({ email: req.auth.user.email, role: req.auth.role });
  });
  app.post('/api/admin/logout', protect, async (req, res) => {
    try {
      const token = req.headers.authorization.slice(7);
      await getSql()`DELETE FROM admin_sessions WHERE token_hash = ${hashToken(token)}`;
      res.json({ success: true });
    } catch {
      res.status(503).json({ error: 'Could not revoke session.' });
    }
  });
  return protect;
}

module.exports = { authRoutes, hashPassword, verifyPassword, hashToken };
