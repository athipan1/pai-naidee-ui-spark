function aliasKey(name) {
  return String(name || '').normalize('NFKC').toLocaleLowerCase()
    .replace(/[\s\u200B-\u200D\uFEFF\p{P}\p{S}]+/gu, '');
}

function validateAlias(input) {
  const name = typeof input?.aliasName === 'string' ? input.aliasName.trim() : '';
  const language = input?.language || 'th';
  if (name.length < 2 || name.length > 150 || !aliasKey(name)) return { error: 'Alias must contain 2–150 characters.' };
  if (!['th', 'en', 'other'].includes(language)) return { error: 'Invalid language.' };
  return { name, key: aliasKey(name), language };
}

module.exports = { aliasKey, validateAlias };
