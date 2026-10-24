import { test, expect } from '@playwright/test';

const place = {
  id: 'railway-test-1', name: 'Doi Inthanon', nameLocal: 'ดอยอินทนนท์',
  province: 'เชียงใหม่', category: 'Nature', rating: 4.7, reviewCount: 12,
  description: 'สถานที่ท่องเที่ยวในจังหวัดเชียงใหม่', tags: ['Mountain'],
  image: '', images: [], coordinates: { lat: 18.59, lng: 98.49 },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/places**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/railway-test-1')) {
      await route.fulfill({ json: place });
    } else {
      const match = !url.searchParams.get('search') || 'เชียงใหม่'.includes(url.searchParams.get('search')!);
      await route.fulfill({ json: { attractions: match ? [place] : [], total: match ? 1 : 0, page: 1, limit: 100 } });
    }
  });
});

test('search redirects and opens a Railway-backed place', async ({ page }) => {
  await page.goto('/search?search=เชียงใหม่');
  await expect(page).toHaveURL(/\/discover\?.*mode=search/);
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
  await page.goto('/attraction/railway-test-1');
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
  await expect(page.getByTitle('Admin Panel')).toHaveCount(0);
});

test('private and upload routes cannot mount in browse-only mode', async ({ page }) => {
  for (const path of ['/login', '/admin/dashboard', '/admin/media', '/upload', '/community/instagram']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/discover$/);
  }
});

test('API failure never substitutes sample places', async ({ page }) => {
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => route.fulfill({ status: 503, json: { error: 'unavailable' } }));
  await page.goto('/');
  await expect(page.getByText('Phi Phi Islands')).toHaveCount(0);
  await expect(page.getByText('Floating Market')).toHaveCount(0);
});
