import { test, expect } from '@playwright/test';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const userProvidedMedia = JSON.parse(readFileSync(
  join(process.cwd(), 'api', 'user-provided-place-media.json'), 'utf8',
)) as { url: string; filename: string }[];

const place = {
  id: 'railway-test-1', name: 'Doi Inthanon', nameLocal: 'ดอยอินทนนท์',
  province: 'เชียงใหม่', provinceEn: 'Chiang Mai', category: 'Nature', rating: 4.7, reviewCount: 12,
  description: 'สถานที่ท่องเที่ยวในจังหวัดเชียงใหม่',
  descriptionEn: 'A scenic mountain destination in Chiang Mai province.',
  tags: ['Mountain'],
  image: '', images: [], coordinates: { lat: 18.59, lng: 98.49 },
  source: { name: 'Wikipedia: Doi Inthanon', url: 'https://en.wikipedia.org/wiki/Doi_Inthanon' },
};

test.beforeEach(async ({ page }, testInfo) => {
  // Historical discovery assertions cover the English UI. Simulate a user
  // who explicitly selected English; the language test below covers a new
  // visitor without that preference, ensuring Thai remains the default.
  if (!testInfo.title.startsWith('language choice')) {
    await page.addInitScript(() => window.localStorage.setItem('painaidee.language', 'en'));
  }
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

test('language choice translates the Railway feed and details and persists across navigation and reload', async ({ page }) => {
  await page.goto('/discover?mode=feed');
  await expect(page.getByText('สถานที่ท่องเที่ยวในจังหวัดเชียงใหม่').first()).toBeVisible();
  await expect(page.getByText('เชียงใหม่').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Switch to English' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'th');
  await page.goto('/attraction/railway-test-1');
  await expect(page.getByRole('heading', { name: 'ดอยอินทนนท์', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'เกี่ยวกับสถานที่นี้' })).toBeVisible();
  await expect(page.getByText('สถานที่ท่องเที่ยวในจังหวัดเชียงใหม่').first()).toBeVisible();
  await expect(page.getByText('เชียงใหม่').first()).toBeVisible();
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.getByRole('heading', { name: 'About this place' })).toBeVisible();
  await expect(page.getByText('A scenic mountain destination in Chiang Mai province.').first()).toBeVisible();
  await expect(page.getByText('Chiang Mai').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Switch to ไทย' })).toBeVisible();
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
  await page.getByTestId('attribution-details').locator('summary').click();
  await expect(page.getByRole('link', { name: 'Wikipedia: Doi Inthanon' })).toBeVisible();
  expect(wikiRequests).toEqual([]);
  await expect(page.getByTitle('Admin Panel')).toHaveCount(0);
});

test('mobile search keeps filters and view controls accessible in a compact disclosure', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/discover?mode=search&q=%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88');
  const filters = page.getByRole('button', { name: 'Filters' });
  await expect(filters).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
  await expect(page.getByLabel('Filter province')).toBeHidden();
  await filters.click();
  await expect(filters).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByLabel('Filter province')).toBeVisible();
  await expect(page.getByLabel('Filter place type')).toBeVisible();
  await page.getByRole('button', { name: 'List view' }).click();
  await filters.click();
  await expect(filters).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText('Doi Inthanon').first()).toBeVisible();
});

test('mobile search shows one Wat Phu Manorom result for alternate Thai place names', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const temple = {
    ...place,
    id: 'curated-wat-phu-manorom',
    name: 'Wat Roi Phra Phutthabat Phu Manorom',
    nameLocal: 'วัดรอยพระพุทธบาทภูมโนรมย์',
    province: 'มุกดาหาร',
    category: 'Culture',
  };
  const queries = ['วัดภูมโนรมย์', 'ภูมโนรมย์', 'วัดพระพุทธบาท ภูมโนรมย์'];

  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get('search');
    const matched = query !== null && queries.includes(query);
    return route.fulfill({ json: {
      attractions: matched ? [temple] : [], total: matched ? 1 : 0, page: 1, limit: 50,
    } });
  });

  for (const query of queries) {
    await page.goto(`/search?search=${encodeURIComponent(query)}`);
    await expect(page).toHaveURL(/\/discover\?.*mode=search/);
    await expect(page.getByTestId('attraction-card')).toHaveCount(1);
    await expect(page.getByText(/1 results|พบ 1 รายการ/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test('mobile homepage offers Railway place suggestions and opens selected search', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const temple = { ...place, id: 'curated-wat-phu-manorom', name: 'Wat Roi Phra Phutthabat Phu Manorom',
    nameLocal: 'วัดรอยพระพุทธบาทภูมโนรมย์', province: 'มุกดาหาร', category: 'Culture' };
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/suggest')) {
      return route.fulfill({ json: { suggestions: [{ id: temple.id, name: temple.name,
        nameLocal: temple.nameLocal, province: temple.province, category: temple.category }] } });
    }
    return route.fulfill({ json: { attractions: [temple], total: 1, page: 1, limit: 10 } });
  });
  await page.goto('/');
  await page.getByRole('textbox', { name: /คุณอยากไปเที่ยวที่ไหน|Where do you want to go/ }).fill('ภูมโน');
  await expect(page.getByRole('button', { name: /Wat Roi Phra Phutthabat Phu Manorom|วัดรอยพระพุทธบาทภูมโนรมย์/ })).toBeVisible();
  await page.getByRole('button', { name: /Wat Roi Phra Phutthabat Phu Manorom|วัดรอยพระพุทธบาทภูมโนรมย์/ }).click();
  await expect(page).toHaveURL(/mode=search/);
  await expect(page.getByTestId('attraction-card')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('mobile search filters Railway results by province and category and keeps shareable URL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const temple = { ...place, id: 'temple-1', name: 'Wat Example', nameLocal: 'วัดตัวอย่าง',
    province: 'มุกดาหาร', category: 'Culture' };
  const locations = [temple, place];
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/facets')) return route.fulfill({ json: {
      provinces: ['เชียงใหม่', 'มุกดาหาร'], categories: ['Culture', 'Nature'],
    } });
    const province = url.searchParams.get('province');
    const category = url.searchParams.get('category');
    const matches = locations.filter(item => (!province || item.province === province) &&
      (!category || item.category === category));
    return route.fulfill({ json: { attractions: matches, total: matches.length, page: 1, limit: 50 } });
  });
  await page.goto('/discover?mode=search&q=วัด');
  await page.getByRole('combobox', { name: 'Filter province' }).selectOption('มุกดาหาร');
  await page.getByRole('combobox', { name: 'Filter place type' }).selectOption('Culture');
  await expect(page).toHaveURL(/prov=%E0%B8%A1%E0%B8%B8%E0%B8%81%E0%B8%94%E0%B8%B2%E0%B8%AB%E0%B8%B2%E0%B8%A3/);
  await expect(page).toHaveURL(/cat=Culture/);
  await expect(page.getByTestId('attraction-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Wat Example' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('search requests only one page at a time and navigates the catalogue without duplication', async ({ page }) => {
  const requestedPages: number[] = [];
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/facets')) return route.fulfill({ json: { provinces: ['เชียงใหม่'], categories: ['Nature'] } });
    const pageNumber = Number(url.searchParams.get('page') || 1);
    requestedPages.push(pageNumber);
    const start = (pageNumber - 1) * 20;
    const locations = Array.from({ length: Math.min(20, 45 - start) }, (_, index) => ({
      ...place, id: `item-${start + index}`, name: `Place ${start + index}`,
      nameLocal: `สถานที่ ${start + index}`,
    }));
    return route.fulfill({ json: { attractions: locations, total: 45, page: pageNumber, limit: 20 } });
  });
  await page.goto('/discover?mode=search&q=เชียงใหม่');
  await expect(page.getByTestId('attraction-card')).toHaveCount(20);
  await expect(page.getByRole('navigation', { name: 'Search result pages' })).toContainText('Page 1 of 3');
  expect(requestedPages).toEqual([1]);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByRole('heading', { name: 'Place 20' })).toBeVisible();
  await expect(page.getByTestId('attraction-card')).toHaveCount(20);
  expect(requestedPages).toEqual([1, 2]);
});

test('detail page recommends only real nearby places and never itself', async ({ page }) => {
  const neighbor = { ...place, id: 'nearby-2', name: 'Nearby Scenic Place',
    nameLocal: 'สถานที่ใกล้เคียง', distanceKm: 12.4 };
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/nearby')) return route.fulfill({ json: {
      attractions: [{ ...place, distanceKm: 0 }, neighbor], center: { lat: 18.59, lng: 98.49 }, radiusKm: 100,
    } });
    return route.fulfill({ json: place });
  });
  await page.goto('/attraction/railway-test-1');
  const section = page.getByTestId('real-nearby-places');
  await expect(section.getByRole('link', { name: /Nearby Scenic Place/ })).toHaveCount(1);
  await expect(section).toContainText('12.4 km');
  await expect(section.getByRole('link', { name: /Doi Inthanon/ })).toHaveCount(0);
});

test('feed shows each destination only once across recommendations and more places', async ({ page }) => {
  const destinations = Array.from({ length: 12 }, (_, index) => ({
    ...place,
    id: `destination-${index}`,
    name: index === 1 ? 'Amphawa Floating Market' : `Destination ${index}`,
    nameLocal: index === 1 ? 'ตลาดน้ำอัมพวา' : `Destination ${index}`,
  }));
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => route.fulfill({ json: {
    attractions: [...destinations, destinations[1]],
    total: 13, page: 1, limit: 20,
  } }));

  await page.goto('/discover?mode=feed');
  await expect(page.getByRole('heading', { name: /Recommended Places|สถานที่แนะนำ/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: /More Destinations|สถานที่อื่น ๆ/ })).toBeVisible();
  await expect(page.locator('img[alt="Amphawa Floating Market"]')).toHaveCount(1);
  for (const destination of destinations) {
    await expect(page.getByRole('heading', { name: destination.name, exact: true })).toHaveCount(1);
  }
});

test('detail page displays Railway photo attribution, license, and sourced additional details', async ({ page }) => {
  const photoUrl = 'https://images.painaidee.test/test-photo.png';
  await page.route('**/test-photo.png', route => route.fulfill({
    status: 200, contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRLcAAAAASUVORK5CYII=', 'base64'),
  }));
  await page.unroute('**/api/places**');
  await page.route('**/api/places/railway-test-1', route => route.fulfill({ json: {
    ...place,
    images: [photoUrl],
    mediaCredits: [{
      url: photoUrl,
      photographer: 'Test Photographer', licenseName: 'CC BY-SA 4.0',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    }],
    detailedDescription: { text: 'Documented history and geography of the mountain.',
      sourceUrl: 'https://en.wikipedia.org/wiki/Doi_Inthanon' },
  } }));
  await page.goto('/attraction/railway-test-1');
  await page.getByTestId('attribution-details').locator('summary').click();
  await expect(page.getByTestId('photo-attribution')).toContainText('Test Photographer');
  await expect(page.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0');
  await expect(page.getByTestId('verified-place-details')).toContainText('Documented history and geography');
  await expect.poll(() => page.getByAltText('Doi Inthanon - image 1').evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});

test('incorrect Ko Chang photo is corrected with matching Wikimedia attribution', async ({ page }) => {
  const wrongPhoto = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2%2C_Thailand.jpg/960px-Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2%2C_Thailand.jpg';
  await page.unroute('**/api/places**');
  await page.route('**/api/places/curated-ko-chang', route => route.fulfill({ json: {
    ...place, id: 'curated-ko-chang', name: 'Ko Chang', nameLocal: 'เกาะช้าง',
    image: wrongPhoto, images: [wrongPhoto],
    mediaCredits: [{ url: wrongPhoto, photographer: 'Incorrect location', licenseName: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0', sourcePage: 'https://example.org/wrong' }],
  } }));
  await page.goto('/attraction/curated-ko-chang');
  await page.getByTestId('attribution-details').locator('summary').click();
  await expect(page.getByTestId('photo-attribution')).toContainText('Nina R');
  await expect(page.getByTestId('photo-attribution')).not.toContainText('Incorrect location');
  await expect(page.getByTestId('photo-attribution').getByRole('link', { name: 'Nina R' }))
    .toHaveAttribute('href', 'https://commons.wikimedia.org/wiki/File:Ko_Chang,_Thailand.jpg');
});

test('admin routes require authentication and public upload routes remain closed', async ({ page }) => {
  for (const path of ['/upload', '/community/instagram']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/discover$/);
  }
  await page.goto('/admin');
  await expect(page.getByRole('link', { name: 'เข้าสู่ระบบแอดมิน' })).toBeVisible();
  await expect(page.getByText('บันทึกสถานที่เป็นฉบับร่าง')).toHaveCount(0);
});

test('API failure never substitutes sample places', async ({ page }) => {
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => route.fulfill({ status: 503, json: { error: 'unavailable' } }));
  await page.goto('/');
  await expect(page.getByText('Phi Phi Islands')).toHaveCount(0);
  await expect(page.getByText('Floating Market')).toHaveCount(0);
});

test('mobile homepage renders loaded photos and honest missing-review and missing-photo states', async ({ page }) => {
  const photoUrl = 'https://images.painaidee.test/actual-place.png';
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/actual-place.png', route => route.fulfill({
    status: 200, contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRLcAAAAASUVORK5CYII=', 'base64'),
  }));
  await page.unroute('**/api/places**');
  await page.route('**/api/places**', route => route.fulfill({ json: {
    attractions: [
      { ...place, id: 'real-photo', image: photoUrl, nameLocal: 'ดอยอินทนนท์', rating: 0, reviewCount: 0 },
      { ...place, id: 'no-photo', name: 'No Photo Place', nameLocal: 'สถานที่ยังไม่มีรูป', image: null, rating: 0, reviewCount: 0 },
    ],
    total: 2, page: 1, limit: 10,
  } }));
  await page.goto('/');
  // With only two destinations, both belong in the Featured section and should
  // not be repeated in Recommended cards.
  const featuredCards = page.locator('section[aria-label="Places to explore"] article');
  await expect(featuredCards).toHaveCount(2);
  await expect(page.getByTestId('attraction-card')).toHaveCount(0);
  const actualImage = featuredCards.first().getByRole('img', { name: /Doi Inthanon|ดอยอินทนนท์/ });
  await actualImage.scrollIntoViewIfNeeded();
  await expect.poll(() => actualImage.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(featuredCards.nth(1).locator('img[src="/placeholder-attraction.svg"]')).toHaveCount(1);
  await expect(page.getByText(/ยังไม่มีคะแนนรีวิวที่ยืนยันได้|No verified reviews yet/).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('mobile Phra That Na Dun gallery loads all three submitted photos without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.unroute('**/api/places**');
  await page.route('**/api/places/curated-phra-that-na-dun', route => route.fulfill({ json: {
    ...place, id: 'curated-phra-that-na-dun', name: 'Phra That Na Dun',
    nameLocal: 'พระธาตุนาดูน', province: 'มหาสารคาม', images: [], image: null,
    mediaCredits: [],
  } }));
  await page.route('https://pai-naidee-ui-spark.vercel.app/place-photos/*.jpg', route => {
    const filename = new URL(route.request().url()).pathname.split('/').at(-1)!;
    return route.fulfill({ status: 200, contentType: 'image/jpeg',
      path: join(process.cwd(), 'public', 'place-photos', filename) });
  });

  await page.goto('/attraction/curated-phra-that-na-dun');
  await expect(page.getByRole('heading', { name: 'Phra That Na Dun', exact: true })).toBeVisible();
  await expect(page.getByTestId('photo-attribution')).toContainText('PaiNaiDee user');
  await expect(page.getByTestId('photo-attribution').getByRole('link')).toHaveCount(0);
  const gallery = page.locator('img[alt^="Phra That Na Dun - image"]');
  await expect(gallery).toHaveCount(3);
  const photos = userProvidedMedia.filter((photo: { placeId: string }) => photo.placeId === 'curated-phra-that-na-dun');
  for (let index = 0; index < photos.length; index++) {
    await expect(gallery.nth(index)).toHaveAttribute('src', photos[index].url);
    await expect.poll(() => gallery.nth(index).evaluate(image =>
      (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
    if (index < photos.length - 1) {
      await page.getByRole('button', { name: 'Next slide' }).click();
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('mobile Wat Phu Manorom gallery loads all three confirmed user photos without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.unroute('**/api/places**');
  await page.route('**/api/places/curated-wat-phu-manorom', route => route.fulfill({ json: {
    ...place, id: 'curated-wat-phu-manorom', name: 'Wat Roi Phra Phutthabat Phu Manorom',
    nameLocal: 'วัดรอยพระพุทธบาทภูมโนรมย์', province: 'มุกดาหาร', images: [], image: null,
    mediaCredits: [],
  } }));
  await page.route('https://pai-naidee-ui-spark.vercel.app/place-photos/*.jpg', route => {
    const filename = new URL(route.request().url()).pathname.split('/').at(-1)!;
    return route.fulfill({ status: 200, contentType: 'image/jpeg',
      path: join(process.cwd(), 'public', 'place-photos', filename) });
  });

  await page.goto('/attraction/curated-wat-phu-manorom');
  await expect(page.getByRole('heading', { name: 'Wat Roi Phra Phutthabat Phu Manorom', exact: true })).toBeVisible();
  await expect(page.getByTestId('photo-attribution')).toContainText('PaiNaiDee user');
  const gallery = page.locator('img[alt^="Wat Roi Phra Phutthabat Phu Manorom - image"]');
  const photos = userProvidedMedia.filter((photo: { placeId: string }) => photo.placeId === 'curated-wat-phu-manorom');
  await expect(gallery).toHaveCount(3);
  for (let index = 0; index < photos.length; index++) {
    await expect(gallery.nth(index)).toHaveAttribute('src', photos[index].url);
    await expect.poll(() => gallery.nth(index).evaluate(image =>
      (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
    if (index < photos.length - 1) await page.getByRole('button', { name: 'Next slide' }).click();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
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

test('map and category load all pages while search uses explicit pagination', async ({ page }) => {
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
    const requestedLimit = Number(url.searchParams.get('limit') || 50);
    requestedPages.push(currentPage);
    const matching = url.searchParams.has('search') && url.searchParams.get('search') !== 'Destination'
      ? [] : places;
    const start = (currentPage - 1) * requestedLimit;
    return route.fulfill({ json: {
      attractions: matching.slice(start, start + requestedLimit), total: matching.length,
      page: currentPage, limit: requestedLimit,
    } });
  });
  await page.goto('/discover?mode=map');
  await expect(page.locator('[data-testid="real-attractions-map"] li')).toHaveCount(125);
  expect(requestedPages).toContain(2);
  expect(requestedPages).toContain(3);
  await page.goto('/discover?mode=search&q=Destination');
  await expect(page.getByTestId('attraction-card')).toHaveCount(20);
  for (let index = 0; index < 6; index++) await page.getByRole('button', { name: 'Next' }).click();
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

