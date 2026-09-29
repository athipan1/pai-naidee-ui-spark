import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const findings = [];

const isForbiddenEnvFile = (file) =>
  /(^|\/)\.env(?:\..+)?$/.test(file) &&
  !/(^|\/)\.env\.(example|template|sample)$/.test(file);

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
};

for (const file of tracked) {
  if (isForbiddenEnvFile(file)) {
    findings.push(`${file}: tracked environment file`);
  }

  let content;
  try {
    content = readFileSync(file);
  } catch {
    continue;
  }

  if (content.includes(0)) continue;
  const text = content.toString('utf8');

  if (/\bsb_secret_[A-Za-z0-9_-]{16,}\b/.test(text)) {
    findings.push(`${file}: Supabase secret key pattern`);
  }

  const jwtCandidates = text.match(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g) ?? [];
  for (const token of jwtCandidates) {
    try {
      const payload = JSON.parse(decodeBase64Url(token.split('.')[1]));
      if (payload?.role === 'service_role') {
        findings.push(`${file}: legacy Supabase service_role JWT`);
        break;
      }
    } catch {
      // Ignore strings that merely resemble JWTs.
    }
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets detected:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('Secret guard passed.');
