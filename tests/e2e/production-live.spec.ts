import { test, expect } from '@playwright/test';

// These exercises use the actual Production frontend + Railway backend.
// Only the browser geolocation is fixed for a reproducible Bangkok search.
test('visitor searches and opens a published place without mock APIs', async ({ page }) => {
  await page.goto('/discover?mode=search&q=Wat');
  await expect(page.getByText('Wat Arun').first()).toBeVisible({ timeout: 20_000 });
  await page.goto('/attraction/curated-wat-arun');
  await expect(page.getByText('Wat Arun').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wikipedia: Wat Arun' })).toBeVisible();
  await expect(page.getByText(/Error: ไม่พบข้อมูล/)).toHaveCount(0);
});

test('real map and geolocation search return places from Railway', async ({ browser }) => {
  const context = await browser.newContext({
    geolocation: { latitude: 13.74361, longitude: 100.48889 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  const responses: number[] = [];
  page.on('response', response => {
    if (response.url().includes('/api/places/nearby')) responses.push(response.status());
  });
  try {
    await page.goto('/discover?mode=map');
    await expect(page.getByTestId('real-attractions-map')).toBeVisible();
    await page.getByRole('button', { name: /Find near me|ค้นหาใกล้ฉัน/ }).click();
    await expect(page.getByText('Wat Arun').first()).toBeVisible({ timeout: 20_000 });
    expect(responses).toContain(200);
  } finally {
    await context.close();
  }
});
