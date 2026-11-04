import { test, expect } from '@playwright/test';

// These exercises use the actual Production frontend + Railway backend.
// Only the browser geolocation is fixed for a reproducible Bangkok search.
test('visitor searches and opens a published place without mock APIs', async ({ page }) => {
  // The public site starts in Thai for new visitors. Verify the localized label,
  // not an English alias that is present in the database but not displayed.
  await page.addInitScript(() => localStorage.setItem('painaidee.language', 'th'));
  await page.goto('/discover?mode=search&q=Wat');
  await expect(page.getByRole('button', { name: /วัดอรุณราชวราราม/ }).first()).toBeVisible({ timeout: 20_000 });
  await page.goto('/attraction/curated-wat-arun');
  await expect(page.getByRole('heading', { level: 1, name: 'วัดอรุณราชวราราม' })).toBeVisible();
  await expect(page.getByText('เครดิตภาพและแหล่งข้อมูล')).toBeVisible();
  await expect(page.getByText(/Error: ไม่พบข้อมูล/)).toHaveCount(0);
});

test('real map and geolocation search return places from Railway', async ({ browser }) => {
  const context = await browser.newContext({
    geolocation: { latitude: 13.74361, longitude: 100.48889 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem('painaidee.language', 'th'));
  const responses: number[] = [];
  page.on('response', response => {
    if (response.url().includes('/api/places/nearby')) responses.push(response.status());
  });
  try {
    await page.goto('/discover?mode=map');
    await expect(page.getByTestId('real-attractions-map')).toBeVisible();
    await page.getByRole('button', { name: /Find near me|ค้นหาใกล้ฉัน/ }).click();
    await expect(page.locator('[data-testid="real-attractions-map"] ul li a').first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/พบ [1-9]\d* สถานที่ในฐานข้อมูลภายใน 25 กม\./)).toBeVisible();
    expect(responses).toContain(200);
  } finally {
    await context.close();
  }
});

test('mobile visitor can browse without horizontal overflow and see a loaded destination photo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('main')).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(392);

  const firstPlacePhoto = page.locator('main img[alt]').first();
  await firstPlacePhoto.scrollIntoViewIfNeeded();
  await expect.poll(() => firstPlacePhoto.evaluate(img =>
    (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0,
  )).toBe(true);

  await page.goto('/discover');
  await expect(page.getByRole('tab', { name: /Map|แผนที่/ })).toBeVisible();
});
