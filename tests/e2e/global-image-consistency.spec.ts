import {test,expect} from '@playwright/test';
const primary='https://images.example.test/primary.jpg',old='https://images.example.test/old.jpg';
for (const source of ['Admin CMS','TAT','Wikidata','OSM','legacy']) {
 test(`${source}: primary remains selected on home, discover, explore, search and detail`,async({page})=>{
  const cms = source === 'Admin CMS';
  const primary = cms ? 'https://painaidee-api-production.up.railway.app/api/media/cms/1a111111-1111-8111-8111-111111111111.png' : 'https://images.example.test/primary.jpg';
  if (cms) await page.route(primary + '?*', r => r.fulfill({
    contentType: 'image/svg+xml',
    body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="teal"/></svg>',
  }));
  const p={id:'image-contract-fixture',name:'Image Contract Fixture',nameLocal:'ภาพทดสอบ',province:'เชียงใหม่',category:'Nature',rating:0,reviewCount:0,description:'Published fixture',tags:[],image:primary,images:[primary,old],mediaCredits:[primary,old].map(url=>({url,photographer:'Owner',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://example.test/photo'})),coordinates:{lat:18.5,lng:98.5},source:{name:source,url:'https://example.test/source'}};
  await page.route('https://images.example.test/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="teal"/></svg>'}));
  await page.route('**/api/places**',r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith('/'+p.id)?p:{attractions:[p],total:1,page:1,limit:50}}));
  for(const path of ['/','/discover?mode=feed','/explore','/search?search=fixture','/attraction/'+p.id]){
   await page.goto(path);
   const image = page.locator(`img[src="${primary}"]`).first();
   await expect(image).toBeVisible();
   if (cms) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/\?w=(256|640|1200)$/);
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
   }
  }
 });
}
test('missing rights and failed URLs show fallback without promoting the older photo',async({page})=>{
 const p={id:'image-fail-fixture',name:'Missing Photo',nameLocal:'รูปไม่พร้อม',province:'เชียงใหม่',category:'Nature',rating:0,reviewCount:0,description:'Fixture',tags:[],image:primary,images:[primary,old],mediaCredits:[{url:old,photographer:'Owner',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://example.test/photo'}],coordinates:{lat:18.5,lng:98.5}};
 await page.route('**/api/places**',r=>r.fulfill({json:p}));
 await page.goto('/attraction/'+p.id);
 await expect(page.locator('img[src="/placeholder-attraction.svg"]').first()).toBeVisible();
 await expect(page.getByRole('status').filter({hasText:'รอ Admin ตรวจสอบ'}).first()).toBeVisible();
});

test('planner refreshes published primary instead of keeping the generated-plan snapshot',async({page})=>{
 const p={id:'planner-image-fixture',name:'Published Place',nameLocal:'สถานที่เผยแพร่',province:'เชียงใหม่',category:'Nature',rating:0,reviewCount:0,description:'Fixture',tags:[],image:primary,images:[primary],mediaCredits:[{url:primary,photographer:'Owner',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://example.test/photo'}],coordinates:{lat:18.5,lng:98.5}};
 await page.route('https://images.example.test/**',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>'}));
 await page.route('**/api/places/facets',r=>r.fulfill({json:{provinces:['เชียงใหม่'],categories:['Nature']}}));
 await page.route('**/api/places/'+p.id,r=>r.fulfill({json:p}));
 await page.route('**/api/ai/trip-plan',r=>r.fulfill({json:{province:'เชียงใหม่',days:[{day:1,stops:[{...p,image:old,images:[old]}]}],completeness:{status:'complete',requestedDays:1,plannedDays:1},budget:{estimatedTotal:2000}}}));
 await page.goto('/trip-planner');
 await page.getByRole('textbox',{name:'ข้อความถึง PaiNaiDee AI'}).fill('อยากเที่ยวเชียงใหม่ 1 วัน งบ 2000 บาท');
 await page.getByRole('button',{name:'ส่งข้อความ'}).click();
 await expect(page.locator(`img[src="${primary}"]`).first()).toBeVisible();
 await expect(page.locator(`img[src="${old}"]`)).toHaveCount(0);
});
test('broken published image shows an explicit fallback warning',async({page})=>{
 const p={id:'broken-image-fixture',name:'Broken Photo',nameLocal:'รูปเสีย',province:'เชียงใหม่',category:'Nature',rating:0,reviewCount:0,description:'Fixture',tags:[],image:primary,images:[primary],mediaCredits:[{url:primary,photographer:'Owner',licenseName:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/',sourcePage:'https://example.test/photo'}],coordinates:{lat:18.5,lng:98.5}};
 await page.route('https://images.example.test/**',r=>r.fulfill({status:404,body:'missing'}));
 await page.route('**/api/places**',r=>r.fulfill({json:p}));
 await page.goto('/attraction/'+p.id);
 await expect(page.locator('img[src="/placeholder-attraction.svg"]').first()).toBeVisible();
 await expect(page.getByRole('status').filter({hasText:'รอ Admin ตรวจสอบ'}).first()).toBeVisible();
});
