import { expect, test, type Page } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4174';
const imageBytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD1cAAAAASUVORK5CYII=', 'base64');
const filename = '1a111111-1111-4111-8111-111111111111.png';
const publicImagePath = `/api/media/cms/${filename}`;
const imageUrl = baseURL + publicImagePath;
const models = [{ id: 'test/first:free', label: 'First test model' }, { id: 'test/second:free', label: 'Second test model' }];
const place = { id: 'fixture-place', name: 'CMS fixture', name_local: 'รายการจำลอง', province: 'ชลบุรี' };
const payload = { name: place.name, nameLocal: place.name_local, province: place.province, category: 'Culture',
  description: 'Fixture description', lat: 13.2 as string | number | null | undefined, lng: 100.9 as string | number | null | undefined, imageUrl: '' };
const existing = { id: 'edit-fixture', target_place_id: place.id, status: 'draft', version: '1900000000.000001', payload };
const incomplete = { id: 'legacy-fixture', status: 'draft', version: '1900000000.000002', payload: {
  ...payload, name: 'Legacy fixture', nameLocal: 'ร่างเก่า', lat: null, lng: undefined,
} };

async function mockCms(page: Page) {
  let session = false;
  let failUpload = false;
  let publishCount = 0;
  let reviewState="VERIFIED";
  let selected = { model: models[0].id, structuredOutput: false, source: 'railway' };
  let drafts = [incomplete];
  let aliases: Array<{ id: string; alias_name: string; language: string; status: string }> = [];
  const catalogQueries: string[] = [];
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    if (url.origin !== baseURL) return route.abort();
    if (!pathname.startsWith('/api/')) return route.continue();
    const method = request.method();
    const reply = (status: number, json: object) => route.fulfill({ status, json });
    const body = () => request.postDataJSON();
    if (pathname === '/api/admin/login' && method === 'POST') {
      if (body().password !== 'cms-fixture-password') return reply(401, { error: 'Invalid email or password.' });
      session = true;
      return reply(200, { token: 'browser-test-session', role: 'admin' });
    }
    if (pathname.startsWith('/api/admin/') && (!session || request.headers().authorization !== 'Bearer browser-test-session'))
      return reply(401, { error: 'Session expired or invalid.' });
    if (pathname === '/api/admin/me') return reply(200, { role: 'admin' });
    if (pathname.endsWith('/review-transition')) {reviewState=body().action==='approve'?'APPROVED':'REVIEW_PENDING';return reply(200,{state:reviewState,revision:2});}
    if (/^\/api\/admin\/places\/[^/]+\/review$/.test(pathname)) return reply(200,{state:reviewState,revision:1,evidence:pathname.includes('created-fixture')?{source:{},coordinate:{},media:{},duplicateResolutions:[]}:null,history:[],report:{holds:[],payloadMatches:true,provinceGate:'PASS',duplicate:{matches:[]}}});
    if (pathname === '/api/admin/province-quality') return reply(200,{completenessClaim:null,automaticImport:false,provinces:[{province:'ชลบุรี',existing:{total:71,missing_images:1,missing_details:2,last_verified:null},review:{discovered:3,duplicates:1,license_hold:2,coordinate_hold:1,approved:0,published:0,confirmed_new:0}}]});
    if (pathname === '/api/admin/candidate-queue') return reply(200,{candidates:[],total:0,page:1,limit:30});

    if (pathname.endsWith('/quality-review')) return reply(200, { status:'NEEDS_REVIEW',provinceGate:'NEEDS_REVIEW',coordinateKind:'unknown',
      holds:['province_polygon_unverified'],baselineCount:194,duplicate:{action:'human_review_required',matches:[]},publishAllowed:false });
    if (pathname === '/api/admin/google-verification/status') return reply(200, {enabled:false,reasons:['activation_not_approved'],dailyLimit:0});
    if (pathname === '/api/admin/logout') {
      session = false;
      return reply(200, { success: true });
    }
    if (pathname === '/api/admin/ai/models/validate') return reply(200, { ok: true });
    if (pathname === '/api/admin/ai/health-check') return reply(200, { status: 'ok', usage: { costUsd: 0 } });
    if (pathname === '/api/admin/ai/models') {
      if (method === 'PUT') selected = { ...body(), source: 'postgresql' };
      return reply(200, { options: models, selected });
    }
    if (pathname === '/api/admin/catalog') {
      const pageNumber = Number(url.searchParams.get('page'));
      catalogQueries.push(url.searchParams.get('q') ?? '');
      return reply(200, { places: [pageNumber === 2 ? { ...place, name_local: 'ผลหน้าสอง' } : place], page: pageNumber, total: 31 });
    }
    if (pathname === '/api/admin/geocode') {
      return reply(200, { candidates: [{ lat: 13.25, lng: 100.95, label: 'หมุดจำลอง', source: 'fixture' }], providerConfigured: false });
    }
    if (pathname === `/api/admin/catalog/${place.id}/edit`) {
      drafts = [existing, ...drafts.filter(draft => draft.id !== existing.id)];
      return reply(201, existing);
    }
    if (pathname === `/api/admin/catalog/${place.id}/media`) return reply(200, { images: [] });
    if (pathname === `/api/admin/catalog/${place.id}/aliases`) {
      if (method === 'POST') {
        const alias = { id: `alias-${aliases.length}`, alias_name: body().aliasName, language: body().language, status: 'pending' };
        aliases.push(alias);
        return reply(201, alias);
      }
      return reply(200, { aliases });
    }
    if (/^\/api\/admin\/aliases\/[^/]+\/review$/.test(pathname)) {
      aliases = aliases.map(alias => alias.id === pathname.split('/')[4] ? { ...alias, status: body().status } : alias);
      return reply(200, { status: body().status });
    }
    if (pathname === '/api/admin/media' && method === 'POST') {
      if (failUpload) return reply(503, { error: 'Image currently unavailable.' });
      return reply(201, { imageUrl });
    }
    if (pathname === `/api/admin/media/${filename}`) {
      return route.fulfill({ status: 200, body: imageBytes, contentType: 'image/png' });
    }
    if (pathname === '/api/admin/places') {
      if (method === 'POST') {
        const draft = { ...incomplete, id: 'created-fixture', payload: body() };
        drafts = [draft, ...drafts];
        return reply(201, draft);
      }
      return reply(200, { drafts });
    }
    const draftId = pathname.split('/')[4];
    const draft = drafts.find(item => item.id === draftId);
    if (pathname.endsWith('/publish') && draft) {
      if (body().version !== draft.version) return reply(409, { error: 'Draft changed.' });
      draft.status = 'published';
      publishCount++;
      return reply(200, { placeId: 'published-fixture', published: true });
    }
    if (draft && method === 'PUT') {
      if (body().version !== draft.version) return reply(409, { error: 'Draft changed.' });
      draft.payload = body();
      draft.version = '1900000000.000003';
      return reply(200, draft);
    }
    return reply(404, { error: 'Fixture route not found' });
  });
  return { expire: () => { session = false; }, failNextUpload: () => { failUpload = true; },
    published: () => publishCount, catalogQueries };
}

async function login(page: Page, password = 'cms-fixture-password') {
  await page.goto('/login');
  await page.getByLabel('อีเมล').fill('admin@example.test');
  await page.getByLabel('รหัสผ่าน').fill(password);
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();
}

test('candidate review is read-only and Google stays disabled without activation', async ({page}) => {
  await mockCms(page);
  let googleCalls=0;
  page.on('request', request => {if(new URL(request.url()).pathname==='/api/admin/google-verification')googleCalls++;});
  await login(page);
  await page.getByRole('button', {name:/ฉบับร่าง \(/}).click();
  await page.getByRole('button', {name:'ตรวจคุณภาพแบบอ่านอย่างเดียว'}).click();
  await expect(page.getByText(/เทียบฐานข้อมูล 194/)).toBeVisible();
  await expect(page.getByText('รายงานนี้ยังไม่อนุมัติให้เผยแพร่')).toBeVisible();
  await expect(page.getByRole('button', {name:'ตรวจ Google (th)'})).toBeDisabled();
  await expect(page.getByRole('button', {name:'ตรวจ Google (en)'})).toBeDisabled();
  expect(googleCalls).toBe(0);
});

test('login, failed credentials, logout, and an expired session during a request', async ({ page }) => {
  const fixture = await mockCms(page);
  await page.goto('/admin');
  await expect(page.getByRole('link', { name: 'เข้าสู่ระบบแอดมิน' })).toBeVisible();
  await login(page, 'wrong-password');
  await expect(page.getByRole('alert')).toHaveText('Invalid email or password.');
  await login(page);
  await expect(page.getByRole('heading', { name: 'จัดการสถานที่ท่องเที่ยว' })).toBeVisible();
  await page.getByRole('button', { name: 'ออกจากระบบ' }).click();
  await expect(page.getByRole('link', { name: 'เข้าสู่ระบบแอดมิน' })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('painaidee.admin.token'))).toBeNull();
  await login(page);
  await expect(page.getByRole('heading', { name: 'จัดการสถานที่ท่องเที่ยว' })).toBeVisible();
  fixture.expire();
  await page.getByRole('button', { name: 'ค้นหาสถานที่', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('เซสชันหมดอายุ');
});

test('catalog pagination, aliases, numeric and empty coordinates, and saving an edit draft', async ({ page }) => {
  const fixture = await mockCms(page);
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await login(page);
  await page.getByRole('button', { name: 'ค้นหาสถานที่', exact: true }).click();
  const search = page.getByRole('textbox', { name: 'ค้นหาสถานที่เดิม' });
  await search.fill('รายการจำลอง');
  await page.getByRole('button', { name: 'ค้นหา', exact: true }).click();
  await expect(page.getByText('(ตามคำค้นล่าสุด)')).toBeVisible();
  await search.fill('คำที่ยังไม่ส่ง');
  await page.getByRole('button', { name: 'ถัดไป' }).click();
  await expect(page.getByText('ผลหน้าสอง')).toBeVisible();
  expect(fixture.catalogQueries.at(-1)).toBe('รายการจำลอง');
  await page.getByRole('button', { name: 'ก่อนหน้า' }).click();

  await page.getByRole('button', { name: 'ชื่อเรียกอื่น' }).click();
  for (const [name, action, result] of [['ชื่อจำลองหนึ่ง', 'อนุมัติ', 'อนุมัติแล้ว'], ['ชื่อจำลองสอง', 'ปฏิเสธ', 'ปฏิเสธแล้ว']]) {
    await page.getByRole('textbox', { name: 'เพิ่มชื่อเรียกสถานที่' }).fill(name);
    await page.getByRole('button', { name: 'เพิ่มชื่อ' }).click();
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(page.getByText(new RegExp(result))).toBeVisible();
  }

  await page.getByRole('button', { name: 'แก้ไขสถานที่' }).click();
  await expect(page.getByLabel(/ละติจูด/)).toHaveValue('13.2');
  await expect(page.getByLabel(/ลองจิจูด/)).toHaveValue('100.9');
  await page.getByRole('searchbox', { name: 'ค้นหาชื่อสถานที่บนแผนที่' }).fill('ตำแหน่งทดสอบ');
  await page.getByRole('button', { name: 'ค้นหาบนแผนที่' }).click();
  await page.getByRole('button', { name: /หมุดจำลอง/ }).click();
  await page.getByRole('button', { name: 'ยืนยันใช้พิกัดนี้' }).click();
  await expect(page.getByLabel(/ละติจูด/)).toHaveValue('13.250000');
  await page.getByRole('button', { name: 'บันทึกการแก้ไขเป็นฉบับร่าง' }).click();
  await expect(page.getByText(/บันทึกฉบับร่างสำเร็จ/)).toBeVisible();
  await page.locator('article').filter({ hasText: place.name_local }).getByRole('button', { name: 'แก้ไขร่าง' }).click();
  await expect(page.getByLabel(/ละติจูด/)).toHaveValue('13.250000');
  await page.getByRole('button', { name: /ฉบับร่าง \(/ }).click();
  const legacy = page.locator('article').filter({ hasText: 'ร่างเก่า' });
  await legacy.getByRole('button', { name: 'แก้ไขร่าง' }).click();
  await expect(page.getByLabel(/ละติจูด/)).toHaveValue('');
  await expect(page.getByLabel(/ลองจิจูด/)).toHaveValue('');
  expect(pageErrors).toEqual([]);
});

test('image preview and failure, create and publish, AI settings, and responsive layout', async ({ page }, testInfo) => {
  const fixture = await mockCms(page);
  page.on('dialog', dialog => dialog.accept());
  await login(page);
  await page.getByLabel('โมเดล AI', { exact: true }).selectOption(models[1].id);
  await page.getByRole('button', { name: 'ตรวจ Model ID' }).click();
  await page.getByRole('button', { name: 'บันทึกโมเดล' }).click();
  await expect(page.getByText(/บันทึกโมเดลสำเร็จ/)).toBeVisible();
  await page.getByRole('button', { name: 'ทดสอบ AI', exact: true }).click();
  await expect(page.getByText('ทดสอบ AI สำเร็จ')).toBeVisible();

  const image = { name: 'fixture.png', mimeType: 'image/png', buffer: imageBytes };
  await page.locator('input[type=file]').setInputFiles(image);
  const preview = page.getByRole('img', { name: 'ตัวอย่างภาพสถานที่' });
  await expect(preview).toHaveJSProperty('naturalWidth', 1);
  fixture.failNextUpload();
  await page.locator('input[type=file]').setInputFiles(image);
  await expect(page.getByText('Image currently unavailable.')).toBeVisible();
  await expect(preview).toHaveJSProperty('naturalWidth', 1);

  await page.getByLabel(/ชื่อสถานที่ \(หลัก\)/).fill('Draft fixture');
  await page.getByLabel(/จังหวัด \*/).fill('ชลบุรี');
  await page.getByLabel(/ละติจูด/).fill('13.2');
  await page.getByLabel(/ลองจิจูด/).fill('100.9');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  await page.screenshot({ path: testInfo.outputPath('admin-cms.png'), fullPage: true });
  await page.getByRole('button', { name: 'บันทึกสถานที่เป็นฉบับร่าง' }).click();
  await expect(page.getByText(/บันทึกฉบับร่างสำเร็จ/)).toBeVisible();
  const draft = page.locator('article').filter({ hasText: 'Draft fixture' });
  await expect(draft.getByRole('button', {name:'ตรวจหลักฐานและคุณภาพอัตโนมัติ'})).toHaveCount(0);
  await expect(draft.getByRole('button', { name: 'เผยแพร่', exact: true })).toBeEnabled();
  await draft.getByRole('button', { name: 'เผยแพร่', exact: true }).click();
  await expect(draft.getByText('เผยแพร่แล้ว')).toBeVisible();
  expect(fixture.published()).toBe(1);
});


test('province dashboard shows counted data without a completeness claim or automatic import',async({page})=>{
  await mockCms(page);await login(page);
  await page.getByRole('button',{name:'คุณภาพรายจังหวัด',exact:true}).click();
  await page.getByRole('button',{name:'โหลดคิวและสถิติจังหวัด'}).click();
  await expect(page.getByText('มีในฐานข้อมูล',{exact:true})).toBeVisible();
  await expect(page.getByText('71',{exact:true})).toBeVisible();
  await expect(page.getByText(/ไม่ใช่จำนวนสถานที่ทั้งหมดที่ควรมี/)).toBeVisible();
});
