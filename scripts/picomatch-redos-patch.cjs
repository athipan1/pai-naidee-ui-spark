'use strict';
// Temporary defense-in-depth for CVE-2026-112366, not a substitute for an
// upstream fixed release. This file never suppresses or weakens npm audit.
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const MARKER = 'PAINAIDEE_CVE_2026_112366_REPEATED_EXTGLOB_GUARD';
const ANCHOR = 'const analyzeRepeatedExtglob = (body, options) => {';
const GUARD = `// ${MARKER}
// For repeated +(...) and *(...), reject a body containing a bare '*' (including
// single-branch patterns). An unbounded wildcard inside a repeated extglob can
// generate catastrophic backtracking. Fail closed rather than making a regex.
const hasUnboundedStarInRepeatedExtglob = body => {
  let escaped = false;
  let inCharacterClass = false;
  for (const ch of body) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\\\') { escaped = true; continue; }
    if (ch === '[') { inCharacterClass = true; continue; }
    if (ch === ']' && inCharacterClass) { inCharacterClass = false; continue; }
    if (ch === '*' && !inCharacterClass) return true;
  }
  return false;
};

`;
const INSERTION = `${ANCHOR}
  // Reject unsafe extglobs even if the caller opts out of recursion guards.
  if (hasUnboundedStarInRepeatedExtglob(body)) return { risky: true };`;
const SUPPORTED = new Set(['2.3.2', '4.0.7']);
function patchSource(source) {
  if (!source.includes(ANCHOR)) throw new Error('picomatch parser layout changed; refuse blind patch');
  if (source.includes(MARKER)) {
    if (!source.includes(INSERTION)) throw new Error('Unexpected partial patch marker');
    return source;
  }
  return source.replace(ANCHOR, INSERTION).replace(INSERTION, GUARD + INSERTION);
}
function installedCopies(dir) {
  const lock = JSON.parse(fs.readFileSync(path.join(dir, 'package-lock.json'), 'utf8'));
  return Object.entries(lock.packages || {})
    .filter(([name]) => name === 'node_modules/picomatch' || name.endsWith('/node_modules/picomatch'))
    .map(([name, meta]) => ({ directory: path.join(dir, name), version: meta.version }));
}
function perform(target = 'root', verifyOnly = false) {
  if (!['root', 'api'].includes(target)) throw new Error('Expected root or api installation target');
  const dir = target === 'api' ? path.join(ROOT, 'api') : ROOT;
  let count = 0;
  for (const pkg of installedCopies(dir)) {
    if (!fs.existsSync(path.join(pkg.directory, 'package.json'))) continue; // omit=dev install
    const info = JSON.parse(fs.readFileSync(path.join(pkg.directory, 'package.json'), 'utf8'));
    if (info.version !== pkg.version || !SUPPORTED.has(info.version)) {
      throw new Error(`Unreviewed picomatch version at ${pkg.directory}: ${info.version}; refusing to proceed`);
    }
    const targetFile = path.join(pkg.directory, 'lib', 'parse.js');
    const original = fs.readFileSync(targetFile, 'utf8');
    const updated = patchSource(original);
    if (verifyOnly && updated !== original) throw new Error(`Unpatched picomatch ${pkg.directory}`);
    if (!verifyOnly && updated !== original) fs.writeFileSync(targetFile, updated);
    count++;
  }
  if (target === 'root' && count === 0) throw new Error('Expected to find picomatch copies in frontend dependencies');
  console.log(`picomatch CVE-2026-112366 guard: verified ${count} ${target} installation(s)`);
  return count;
}
if (require.main === module) perform(process.argv[2] || 'root', process.argv.includes('--verify'));
module.exports = {patchSource, installedCopies, perform, MARKER};
