// Read-only live Railway Production census for Chon Buri. No credentials or writes.
// Run: node scripts/verify-chonburi-production.mjs
const base = (process.env.PAINAIDEE_API_URL || 'https://painaidee-api-production.up.railway.app').replace(/\/+$/, '');
const province = 'ชลบุรี';
const templeId = 'tat-2015120421550718075';
const templeName = 'วัดเขาบ่อกวางทอง';
const limit = 50;
const expectedMin = 71;
const nameKey = value => String(value || '').normalize('NFKC').toLocaleLowerCase('th')
  .replace(/[\s\u200b._\-()[\]]+/g, '');
const required = (ok, message) => { if (!ok) throw new Error(message); };
const get = async (path) => {
  const response = await fetch(base + path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20000),
    redirect: 'error',
  });
  const body = await response.text();
  required(response.ok, `GET ${path} failed HTTP ${response.status}: ${body.slice(0,180)}`);
  try { return JSON.parse(body); }
  catch { throw new Error(`GET ${path} did not return JSON`); }
};
const main = async () => {
  const all = [];
  const encoded = encodeURIComponent(province);
  let total = null;
  let pages = 0;
  for (let page = 1; page <= 40; page++) {
    const response = await get(`/api/places?province=${encoded}&page=${page}&limit=${limit}`);
    required(Array.isArray(response.attractions), 'Missing attractions array on page ' + page);
    required(Number.isInteger(response.total) && response.total >= 0, 'Invalid total on page ' + page);
    required(response.page === page && response.limit === limit, 'Pagination metadata mismatch on page ' + page);
    if (total === null) total = response.total;
    required(total === response.total, 'Total changed during pagination (inconsistent snapshot)');
    required(response.attractions.length <= limit, 'Excess page size on page ' + page);
    required(response.attractions.every(p => p.province === province), 'Foreign province record on page ' + page);
    all.push(...response.attractions);
    pages++;
    console.log(JSON.stringify({page, count: response.attractions.length, total: response.total}));
    if (all.length >= total) break;
    required(response.attractions.length > 0, 'Unexpected empty page ' + page);
  }
  required(total !== null && all.length === total, `Pagination incomplete: fetched ${all.length} of ${total}`);
  const ids = new Set(all.map(p => p.id));
  required(ids.size === all.length, 'Duplicate IDs across pages');
  required(total >= expectedMin, `Expected at least ${expectedMin} Chon Buri places after merged batch 014; got ${total}`);
  const byId = all.filter(p => p.id === templeId);
  const byName = all.filter(p => nameKey(p.nameLocal || p.name) === nameKey(templeName));
  required(byId.length === 1, `Temple ID occurs ${byId.length} times, expected exactly once`);
  required(byName.length === 1, `Temple Thai name occurs ${byName.length} times, expected exactly once`);
  required(byId[0].id === byName[0].id, 'Temple ID and normalized Thai name point to different records');
  required(Number.isFinite(byId[0].coordinates?.lat) && Number.isFinite(byId[0].coordinates?.lng),
    'Temple public API does not return numeric coordinates');
  const detail = await get('/api/places/' + encodeURIComponent(templeId));
  required(detail.id === templeId && nameKey(detail.nameLocal) === nameKey(templeName),
    'Temple detail does not match catalogue');
  required(detail.province === province, 'Temple detail province mismatch');
  const result = {status:'PASS',source:base,province,total,pages,uniqueIds:ids.size,
    temple:{id:templeId,name:detail.nameLocal,coordinates:detail.coordinates,
      countById:byId.length,countByNormalizedName:byName.length}};
  console.log('CHONBURI_PRODUCTION_AUDIT ' + JSON.stringify(result));
};
main().catch(error => { console.error('CHONBURI_PRODUCTION_AUDIT_FAIL ' + error.message);process.exitCode=1; });
