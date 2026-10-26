import { test, expect } from '@playwright/test';

const place = {
  id: 'railway-test-1', name: 'Doi Inthanon', nameLocal: 'ดอยอินทนนท์',
  province: 'เชียงใหม่', category: 'Nature', rating: 4.7, reviewCount: 12,
  description: 'สถานที่ท่องเที่ยวในจังหวัดเชียงใหม่', tags: ['Mountain'],
  image: '', images: [], coordinates: { lat: 18.59, lng: 98.49 },
  source: { name: 'Wikipedia: Doi Inthanon', url: 'https://en.wikipedia.org/wiki/Doi_Inthanon' },
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
  const wikiRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('wikipedia.org/api/rest_v1/page/summary')) wikiRequests.push(request.url());
  });
  await page.goto('/search?search=เชียงใหม่');
  await expect(page).toHaveURL(/\/discover\?.*mode=search/);
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
  await page.goto('/attraction/railway-test-1');
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Wikipedia: Doi Inthanon' })).toBeVisible();
  expect(wikiRequests).toEqual([]);
  await expect(page.getByTitle('Admin Panel')).toHaveCount(0);
});

test('detail page displays Railway photo attribution, license, and sourced additional details', async ({ page }) => {
  await page.unroute('**/api/places**');
  await page.route('**/api/places/railway-test-1', route => route.fulfill({ json: {
    ...place,
    images: ['https://thumb.wikimedia.org/wikipedia/commons/example.jpg'],
    mediaCredits: [{
      url: 'https://thumb.wikimedia.org/wikipedia/commons/example.jpg',
      photographer: 'Test Photographer', licenseName: 'CC BY-SA 4.0',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    }],
    detailedDescription: { text: 'Documented history and geography of the mountain.',
      sourceUrl: 'https://en.wikipedia.org/wiki/Doi_Inthanon' },
  } }));
  await page.goto('/attraction/railway-test-1');
  await expect(page.getByTestId('photo-attribution')).toContainText('Test Photographer');
  await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0');
  await expect(page.getByTestId('verified-place-details')).toContainText('Documented history and geography');
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

test('legacy Explore route navigates to Discover and preserves query', async ({ page }) => {
  await page.goto('/explore?mode=search&q=เชียงใหม่');
  await expect(page).toHaveURL(/\/discover\?.*mode=search.*q=/);
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
});

test('map uses Railway places and requests consent for real near-me search', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 18.59, longitude: 98.49 });
  await page.route('**/api/places/nearby?**', route => route.fulfill({ json: {
    attractions: [{ ...place, distanceKm: 0.02 }],
    center: { lat: 18.59, lng: 98.49 }, radiusKm: 25,
  } }));
  await page.goto('/discover?mode=map');
  await expect(page.getByTestId('real-attractions-map')).toBeVisible();
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
  await page.getByRole('button', { name: /Find near me|ค้นหาใกล้ฉัน/ }).click();
  await expect(page.getByText(/0\.0 km/).first()).toBeVisible();
  await expect(page.getByText('Phi Phi Islands')).toHaveCount(0);
});

test('map, search, and category browse beyond the Railway 50-place page limit', async ({ page }) => {
  const places = Array.from({ length: 125 }, (_, index) => ({
    ...place,
    id: `railway-page-${index + 1}`,
    name: `Destination ${index + 1}`,
    nameLocal: `สถานที่ ${index + 1}`,
    coordinates: { lat: 12 + index * 0.01, lng: 100 + index * 0.01 },
  }));
  const requestedPages: number[] = [];
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => {
    const url = new URL(route.request().url());
    const currentPage = Number(url.searchParams.get('page') || 1);
    requestedPages.push(currentPage);
    const matching = url.searchParams.has('search') && url.searchParams.get('search') !== 'Destination'
      ? [] : places;
    const start = (currentPage - 1) * 50;
    return route.fulfill({ json: {
      attractions: matching.slice(start, start + 50), total: matching.length,
      page: currentPage, limit: 50,
    } });
  });
  await page.goto('/discover?mode=map');
  await expect(page.locator('[data-testid="real-attractions-map"] li')).toHaveCount(125);
  expect(requestedPages).toContain(2);
  expect(requestedPages).toContain(3);
  await page.goto('/discover?mode=search&q=Destination');
  await expect(page.getByText('Destination 125').first()).toBeVisible();
  await page.goto('/discover?mode=category&category=Nature');
  await expect(page.getByText('Destination 125').first()).toBeVisible();
});

test('production page never loads the missing external registerSW.js script', async ({ page }) => {
  const missingRegistrationRequests: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname === '/registerSW.js') {
      missingRegistrationRequests.push(request.url());
    }
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Discover Your Dream Destination/i })).toBeVisible();
  expect(missingRegistrationRequests).toEqual([]);
});

