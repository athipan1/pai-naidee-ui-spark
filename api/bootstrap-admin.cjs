// Run only in an authenticated, interactive Railway service shell.
// Requires DATABASE_URL, creates first admin without echoing the password.
const readline = require('node:readline');
const { randomUUID } = require('node:crypto');
const { hashPassword } = require('./railway-admin-auth.cjs');
const { getSql, closeDatabase } = require('./postgres-db.cjs');

async function hiddenPassword(prompt) {
  const input = process.stdin;
  if (!input.isTTY || !process.stdout.isTTY) throw new Error('Interactive terminal required for password input.');
  process.stdout.write(prompt);
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    function onData(chunk) {
      const char = String(chunk);
      if (char === '\r' || char === '\n') {
        cleanup(); process.stdout.write('\n'); resolve(value);
      } else if (char === '\u0003') { cleanup(); reject(new Error('Cancelled')); }
      else if (char === '\u007f') value = value.slice(0, -1);
      else if (char >= ' ' && char !== '\u007f') value += char;
    }
    function cleanup() { input.off('data', onData); input.setRawMode(false); input.pause(); }
    input.on('data', onData);
  });
}

async function main() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Usage: node bootstrap-admin.cjs admin@example.com');
  const sql = getSql();
  const exists = await sql`SELECT id FROM admin_users WHERE email = ${email} LIMIT 1`;
  if (exists.length) throw new Error('Admin already exists; this command cannot replace passwords.');
  const password = await hiddenPassword('New admin password (hidden; min 12 characters): ');
  const confirmation = await hiddenPassword('Confirm password: ');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  const encoded = hashPassword(password);
  await sql`INSERT INTO admin_users (id, email, password_hash) VALUES (${randomUUID()}, ${email}, ${encoded})`;
  console.log(`Admin account created for ${email}.`);
}

if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => closeDatabase());
