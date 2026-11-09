import { test, expect, type Page, type BrowserContext } from "@playwright/test";
const primary = "https://images.example.test/primary.jpg";
const photos = [
  primary,
  "https://images.example.test/second.jpg",
  "https://images.example.test/third.jpg",
];
const place = {
  id: "detail-design-fixture",
  name: "Forest Discovery Park",
  nameLocal: "อุทยานธรรมชาติและเส้นทางศึกษาป่า",
  province: "เชียงใหม่",
  provinceEn: "Chiang Mai",
  category: "Nature",
  rating: 0,
  reviewCount: 0,
  description:
    "พื้นที่ธรรมชาติสำหรับเดินชมทิวทัศน์และเรียนรู้ระบบนิเวศ อ่านข้อมูลการเข้าชมและตรวจสอบเส้นทางกับผู้ดูแลสถานที่ก่อนเดินทาง",
  descriptionEn:
    "Explore nature and discover the local landscape. Check visitor information and confirm access before travelling.",
  tags: ["Nature"],
  image: primary,
  images: photos,
  mediaCredits: photos.map((url) => ({
    url,
    photographer: "Fixture owner",
    licenseName: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    sourcePage: "https://example.test/photo",
  })),
  coordinates: { lat: 18.5, lng: 98.5 },
  source: { name: "Fixture source", url: "https://example.test/source" },
};
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#c8ddd1"/><path d="M0 800L400 180 750 800M450 800L850 100 1200 800" fill="#466d58"/><circle cx="180" cy="150" r="70" fill="#f4df9e"/></svg>';
async function mock(page: Page | BrowserContext, sparse = false) {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, route => route.fulfill({ contentType: "text/css", body: "" }));
  await page.route("https://images.example.test/**", (r) =>
    r.fulfill({ contentType: "image/svg+xml", body: svg })
  );
  await page.route("**/*.tile.openstreetmap.org/**", (r) =>
    r.fulfill({ contentType: "image/svg+xml", body: svg })
  );
  await page.route("**/api/places**", (r) => {
    const path = new URL(r.request().url()).pathname;
    if (path.endsWith("/facets"))
      return r.fulfill({
        json: { provinces: ["เชียงใหม่"], categories: ["Nature"] },
      });
    if (path.includes("google-preview"))
      throw Error("Unexpected Google request");
    if (path.endsWith("/nearby"))
      return r.fulfill({
        json: {
          attractions: [
            place,
            {
              ...place,
              id: "nearby-place",
              nameLocal: "สถานที่ใกล้เคียง",
              distanceKm: 1.2,
            },
          ],
          center: place.coordinates,
          radiusKm: 100,
        },
      });
    return r.fulfill({
      json: path.endsWith("/" + place.id)
        ? sparse
          ? {
              ...place,
              coordinates: null,
              image: null,
              images: [],
              mediaCredits: [],
              description: "",
              descriptionEn: "",
              tags: [],
            }
          : place
        : { attractions: [place], total: 1, page: 1, limit: 50 },
    });
  });
}

for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
  test(`place detail layout ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1100 });
    await mock(page);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/attraction/" + place.id);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      place.nameLocal
    );
    const hero = page
      .getByRole("img", { name: `${place.nameLocal} · ภาพ 1`, exact: true })
      .first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveAttribute("src", primary);
    await expect
      .poll(() =>
        hero.evaluate((image) => (image as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    const size = await hero.boundingBox();
    expect(size!.height).toBeGreaterThan(width < 768 ? 200 : 300);
    if (width < 768) {
      const nav = page.getByRole("navigation", { name: "การทำงานด่วน" });
      await expect(nav).toBeVisible();
      for (const button of await nav.getByRole("button").all())
        expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await expect(
      page.getByTestId("real-nearby-places").getByRole("link")
    ).toHaveCount(1);
    if ([390, 1440].includes(width))
      await page.screenshot({
        path: `reports/place-detail-redesign/after-${info.project.name}-${width}.png`,
        fullPage: true,
      });
    expect(errors).toEqual([]);
  });
}

test("gallery keyboard, zoom, focus return, save, share, map, planner and history", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mock(context);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined });
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (value: string) => {
          (window as unknown as { copied: string }).copied = value;
        },
      },
    });
  });
  await page.goto("/attraction/" + place.id);
  await page.getByRole("button", { name: "เลือกภาพ 2", exact: true }).click();
  await page.getByRole("button", { name: "ดูรูปทั้งหมด" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img[alt]")).toHaveAttribute("src", photos[1]);
  await page.keyboard.press("ArrowRight");
  await expect(dialog.locator("img[alt]")).toHaveAttribute("src", photos[2]);
  await dialog.getByRole("button", { name: "ขยายภาพ" }).click();
  await expect(dialog.getByRole("button", { name: "ย่อภาพ" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page
      .getByRole("button", { name: `${place.nameLocal} · ภาพ 3`, exact: true })
      .first()
  ).toBeFocused();
  await page.getByRole("button", { name: "บันทึก", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "ยกเลิกบันทึก" })
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "แชร์สถานที่" }).click();
  await expect(page.getByRole("status")).toHaveText("คัดลอกลิงก์แล้ว");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied)
  ).toContain("/attraction/" + place.id);
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".leaflet-marker-icon")).toBeVisible();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("button", { name: "ค้นสถานที่บน Google Maps" })
  ).toBeVisible();
  await page.evaluate(() => {
    window.open = (url?: string | URL) => {
      (
        window as unknown as { detailNavigationUrl: string }
      ).detailNavigationUrl = String(url);
      return null;
    };
  });
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "ค้นสถานที่บน Google Maps" })
    .click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { detailNavigationUrl: string })
          .detailNavigationUrl
    )
  ).toContain("https://www.google.com/maps/search/?api=1&query=");
  await page.keyboard.press("Escape");
  const newTab = context.waitForEvent("page");
  await page.getByRole("link", { name: "วางแผนเที่ยวด้วย AI" }).click();
  const planner = await newTab;
  await expect(
    planner.getByRole("textbox", { name: "ข้อความถึง PaiNaiDee AI" })
  ).toHaveValue(/อุทยานธรรมชาติ/);
  await expect(
    planner.getByText("สถานที่ที่สนใจ", { exact: true })
  ).toBeVisible();
  await planner.close();
  await page.getByTestId("real-nearby-places").getByRole("link").click();
  await expect(page).toHaveURL(/nearby-place/);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(place.id));
  await page.goForward();
  await expect(page).toHaveURL(/nearby-place/);
});

test("missing fields, coordinates and image; switch language without changing image identity", async ({
  page,
}) => {
  await mock(page, true);
  await page.goto("/attraction/" + place.id);
  await expect(
    page.getByRole("button", { name: "ดูแผนที่", exact: true })
  ).toBeDisabled();
  await expect(
    page.getByText("ยังไม่มีพิกัดที่ใช้แสดงแผนที่ได้")
  ).toBeVisible();
  await expect(
    page.locator('img[src="/placeholder-attraction.svg"]').first()
  ).toBeVisible();
  await page
    .getByRole("button", { name: /English|EN|เปลี่ยนภาษา/ })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(place.name);
  await expect(
    page.locator('img[src="/placeholder-attraction.svg"]').first()
  ).toHaveCSS("opacity", "1");
  await expect(
    page.locator('img[src="/placeholder-attraction.svg"]').first()
  ).toBeVisible();
});

test("touch fullscreen swipe and focus trap", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
  });
  const page = await context.newPage();
  await mock(page);
  await page.goto("http://127.0.0.1:4173/attraction/" + place.id);
  await page.getByRole("button", { name: "ดูรูปทั้งหมด" }).tap();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const viewport = dialog.locator(".overflow-auto");
  await viewport.dispatchEvent("touchstart", {
    touches: [{ identifier: 1, clientX: 300, clientY: 300 }],
  });
  await viewport.dispatchEvent("touchend", {
    changedTouches: [{ identifier: 1, clientX: 100, clientY: 300 }],
  });
  await expect(dialog.locator("img[alt]")).toHaveAttribute("src", photos[1]);
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((el) => el.contains(document.activeElement))
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Close", exact: true }).tap();
  await expect(dialog).toHaveCount(0);
  await context.close();
});
