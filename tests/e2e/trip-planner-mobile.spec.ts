import { test, expect } from '@playwright/test';

const chiangMaiPlan = {
  province: 'เชียงใหม่',
  provider: 'ai',
  completeness: { status: 'complete', requestedDays: 3, plannedDays: 3 },
  budget: { estimatedTotal: 6000 },
  days: [
    { day: 1, stops: [
      { id: 'doi-suthep', name: 'Wat Phra That Doi Suthep', nameLocal: 'วัดพระธาตุดอยสุเทพ', coordinates: { lat: 18.804, lng: 98.922 }, province: 'เชียงใหม่' },
      { id: 'doi-pui', name: 'Doi Pui', nameLocal: 'ดอยปุย', coordinates: { lat: 18.82, lng: 98.91 }, province: 'เชียงใหม่' },
    ] },
    { day: 2, stops: [
      { id: 'doi-inthanon', name: 'Doi Inthanon', nameLocal: 'ดอยอินทนนท์', coordinates: { lat: 18.59, lng: 98.49 }, province: 'เชียงใหม่' },
    ] },
    { day: 3, stops: [
      { id: 'mae-kampong', name: 'Mae Kampong', nameLocal: 'แม่กำปอง', coordinates: { lat: 18.865, lng: 99.35 }, province: 'เชียงใหม่' },
    ] },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('painaidee.language', 'th'));
  await page.route('**/api/places/facets', route => route.fulfill({ json: {
    provinces: ['เชียงใหม่'], categories: ['Nature', 'Culture'],
  } }));
  await page.route('**/api/ai/trip-plan', route => route.fulfill({ json: chiangMaiPlan }));
});

test('complete Chiang Mai prompt renders three-day itinerary and expandable map without crashing', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  let requestBody: Record<string, unknown> | undefined;
  await page.route('**/api/ai/trip-plan', route => {
    requestBody = route.request().postDataJSON();
    return route.fulfill({ json: chiangMaiPlan });
  });

  await page.goto('/trip-planner');
  const textbox = page.getByRole('textbox', { name: 'ข้อความถึง PaiNaiDee AI' });
  await expect(textbox).toBeVisible();
  await textbox.fill('อยากเที่ยวเชียงใหม่ 3 วัน งบ 6,000 บาท');
  await expect(page.getByRole('button', { name: 'ส่งข้อความ' })).toBeEnabled();
  await page.getByRole('button', { name: 'ส่งข้อความ' }).click();

  await expect(page.getByText('แผนเที่ยวรายวัน')).toBeVisible();
  await expect(page.getByRole('tab', { name: 'วันที่ 1' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'วันที่ 2' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'วันที่ 3' })).toBeVisible();
  expect(requestBody).toMatchObject({ province: 'เชียงใหม่', days: 3, budget: 6000 });

  const mapToggle = page.getByRole('button', { name: 'แผนที่เส้นทาง' });
  await expect(mapToggle).toHaveAttribute('aria-expanded', 'false');
  await mapToggle.click();
  await expect(mapToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.leaflet-container')).toBeVisible();
  expect(browserErrors).toEqual([]);

  await page.getByRole('tab', { name: 'วันที่ 2' }).click();
  await expect(page.getByText('ดอยอินทนนท์').first()).toBeVisible();
  expect(browserErrors).toEqual([]);
  await mapToggle.click();
  await expect(mapToggle).toHaveAttribute('aria-expanded', 'false');

  expect(browserErrors).toEqual([]);
  await expect(page.getByText('Oops! Something went wrong')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('missing budget is requested in chat instead of crashing the page', async ({ page }) => {
  await page.goto('/trip-planner');
  const textbox = page.getByRole('textbox', { name: 'ข้อความถึง PaiNaiDee AI' });
  await textbox.fill('อยากเที่ยวเชียงใหม่ 3 วัน');
  await expect(page.getByRole('button', { name: 'ส่งข้อความ' })).toBeEnabled();
  await page.getByRole('button', { name: 'ส่งข้อความ' }).click();

  await expect(page.getByText('ตั้งงบประมาณรวมไว้กี่บาทครับ?')).toBeVisible();
  await expect(page.getByText('Oops! Something went wrong')).toHaveCount(0);
});

test('real-shaped partial hybrid AI response renders safely with incomplete days', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.route('**/api/ai/trip-plan', route => route.fulfill({ json: {
    status: 'partial',
    provider: 'hybrid_ai_smart',
    province: 'เชียงใหม่',
    completeness: { status: 'partial', requestedDays: 3, plannedDays: 3, verifiedPlaces: 4, reasons: ['INSUFFICIENT_STOPS'] },
    recovery: { status: 'incremental_partial', keptDays: [1], filledDays: [], sources: { '1': 'ai', '2': 'partial', '3': 'partial' } },
    days: [
      { day: 1, stops: [
        { id: 'curated-wat-phra-singh', name: 'วัดพระสิงห์วรมหาวิหาร', province: 'เชียงใหม่', coordinates: { lat: 18.78875, lng: 98.981214 }, openingHours: { status: 'unverified' } },
        { id: 'curated-wat-phra-that-doi-suthep', name: 'วัดพระธาตุดอยสุเทพราชวรวิหาร', province: 'เชียงใหม่', coordinates: { lat: 18.8052, lng: 98.9216 }, openingHours: { status: 'sourced', value: 'Mo-Su 06:00-20:00' } },
      ], legs: [{ from: 'curated-wat-phra-singh', to: 'curated-wat-phra-that-doi-suthep', road: { status: 'verified_route', distanceKm: 16.4, durationMinutes: 23 } }] },
      { day: 2, stops: [{ id: 'curated-bua-tong-waterfall', name: 'น้ำตกบัวตอง (น้ำตกเหนียว)', province: 'เชียงใหม่', coordinates: { lat: 19.0692, lng: 99.07949 }, openingHours: { status: 'unverified' } }], legs: [] },
      { day: 3, stops: [{ id: '3', name: 'ดอยอินทนนท์', province: 'เชียงใหม่', coordinates: { lat: 18.5888, lng: 98.487 }, openingHours: { status: 'unverified' } }], legs: [] },
    ],
    budget: { requested: 6000, estimatedTotal: 6000, verifiedPrices: false },
  } }));

  await page.goto('/trip-planner');
  await page.getByRole('textbox', { name: 'ข้อความถึง PaiNaiDee AI' }).fill('อยากเที่ยวเชียงใหม่ 3 วัน งบ 6000 บาท');
  await page.getByRole('button', { name: 'ส่งข้อความ' }).click();
  await expect(page.getByText('แผนเที่ยวรายวัน')).toBeVisible();
  await expect(page.getByText(/แผนบางส่วน/)).toBeVisible();
  await expect(page.getByRole('tab', { name: 'วันที่ 3' })).toBeVisible();
  expect(browserErrors).toEqual([]);
  await expect(page.getByText('Oops! Something went wrong')).toHaveCount(0);
});
