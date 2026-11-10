import { test, expect } from "@playwright/test";

const places = Array.from({ length: 125 }, (_, index) => ({
  id: `explore-${index}`,
  name: `Destination ${index}`,
  nameLocal: `จุดหมาย ${index}`,
  province: index % 2 ? "ชลบุรี" : "เชียงใหม่",
  provinceEn: index % 2 ? "Chon Buri" : "Chiang Mai",
  category: index % 2 ? "Culture" : "Nature",
  rating: 0,
  reviewCount: 0,
  description: "สถานที่สำหรับวันพักผ่อน",
  descriptionEn: "A place for your next trip.",
  image: "/placeholder-attraction.svg",
  images: ["/placeholder-attraction.svg"],
  tags: [],
  coordinates:
    index === 0 ? null : { lat: 13 + index * 0.01, lng: 100 + index * 0.01 },
}));

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, (route) =>
    route.fulfill({ body: "", contentType: "text/css" })
  );
  await page.route("**/api/places**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("/facets"))
      return route.fulfill({
        json: {
          categories: ["Culture", "Nature"],
          provinces: ["ชลบุรี", "เชียงใหม่"],
        },
      });
    if (url.pathname.endsWith("/suggest"))
      return route.fulfill({ json: { suggestions: [] } });
    const detail = places.find((place) =>
      url.pathname.endsWith(`/${place.id}`)
    );
    if (detail) return route.fulfill({ json: detail });
    const search = url.searchParams.get("search") || "";
    const filtered = places.filter(
      (place) =>
        (!search ||
          place.name.includes(search) ||
          place.nameLocal.includes(search)) &&
        (!url.searchParams.get("category") ||
          place.category === url.searchParams.get("category")) &&
        (!url.searchParams.get("province") ||
          place.province === url.searchParams.get("province"))
    );
    const page = Number(url.searchParams.get("page") || 1);
    const limit = Number(url.searchParams.get("limit") || 20);
    return route.fulfill({
      json: {
        attractions: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
      },
    });
  });
  // Map tiles are irrelevant to marker/bounds assertions and never cause test network costs.
  await page.route("**/*.tile.openstreetmap.org/**", (route) =>
    route.fulfill({ status: 204, body: "" })
  );
});

test("visible search, real filters, pagination, history, map and favorite survive navigation", async ({
  page,
}) => {
  const paidCalls: string[] = [];
  page.on("request", (request) => {
    if (/places.googleapis|routes.googleapis/.test(request.url()))
      paidCalls.push(request.url());
  });
  await page.goto("/discover");
  const search = page.getByRole("searchbox", { name: "ค้นหาสถานที่" });
  await expect(search).toBeVisible();
  await expect(page.getByTestId("attraction-card")).toHaveCount(20);
  await page.getByRole("button", { name: "เพิ่มในรายการโปรด" }).first().click();
  await page.getByRole("button", { name: "ถัดไป" }).click();
  await expect(
    page.getByRole("heading", { name: "จุดหมาย 20", exact: true })
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "จุดหมาย 0", exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ลบออกจากรายการโปรด" })
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "มุมมองแผนที่", exact: true }).click();
  await expect(page.locator("[data-marker-count]")).toHaveAttribute(
    "data-marker-count",
    "19"
  );
  await page.locator(".leaflet-marker-icon").first().click();
  await expect(
    page.locator(".leaflet-popup").getByRole("link", { name: "ดูรายละเอียด" })
  ).toBeVisible();
  await page.getByRole("button", { name: "มุมมองตาราง" }).click();
  await page.getByRole("button", { name: "ตัวกรอง", exact: true }).click();
  await page.getByLabel("กรองจังหวัด").selectOption("ชลบุรี");
  await expect(page).toHaveURL(/prov=/);
  await expect(
    page.getByRole("heading", { name: /พบ 62 สถานที่/ })
  ).toBeVisible();
  await search.fill("จุดหมาย 1");
  await search.press("Enter");
  await expect(page).toHaveURL(/q=/);
  await expect(search).toHaveValue("จุดหมาย 1");
  await page.getByRole("button", { name: "ล้างทั้งหมด" }).click();
  await expect(search).toHaveValue("");
  const firstCard = page.getByTestId("attraction-card").first();
  const image = await firstCard.locator("img").getAttribute("src");
  await firstCard
    .getByRole("button", { name: "ดูรายละเอียด", exact: true })
    .click();
  await expect(page).toHaveURL(/attraction\/explore-0/);
  await expect(
    page.getByRole("heading", { name: "จุดหมาย 0", exact: true })
  ).toBeVisible();
  await expect(page.locator("img").first()).toHaveAttribute("src", image!);
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "ลบออกจากรายการโปรด" })
  ).toBeVisible();
  expect(paidCalls).toEqual([]);
});

test("zero results, clearing, language toggle, loading and retry remain usable", async ({
  page,
}) => {
  await page.goto("/discover?mode=search&q=missing");
  await expect(
    page.getByRole("heading", { name: "ไม่พบผลการค้นหา" })
  ).toBeVisible();
  await expect(page.getByRole("searchbox")).toBeVisible();
  await page.getByRole("button", { name: "ล้างคำค้นหา" }).click();
  await expect(page.getByTestId("attraction-card")).toHaveCount(20);
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(
    page.getByRole("searchbox", { name: "Search places" })
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  let fail = true;
  await page.route("**/api/places?**", async (route) => {
    if (fail)
      return route.fulfill({ status: 503, json: { error: "unavailable" } });
    return route.fulfill({
      json: { attractions: [places[1]], total: 1, page: 1, limit: 20 },
    });
  });
  await page.getByRole("searchbox").fill("retry");
  await page.getByRole("searchbox").press("Enter");
  await expect(
    page.getByRole("heading", { name: "Could not load places" })
  ).toBeVisible({ timeout: 15000 });
  fail = false;
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByTestId("attraction-card")).toHaveCount(1);
});

test("query responses cannot overwrite newer query and typing does not fetch each keystroke", async ({
  page,
}) => {
  await page.goto("/discover?mode=search");
  await expect(page.getByTestId("attraction-card")).toHaveCount(20);
  const requests: string[] = [];
  await page.route("**/api/places?**", async (route) => {
    const query =
      new URL(route.request().url()).searchParams.get("search") || "";
    requests.push(query);
    if (query === "old")
      await new Promise((resolve) => setTimeout(resolve, 800));
    return route.fulfill({
      json: {
        attractions: [{ ...places[1], nameLocal: query }],
        total: 1,
        page: 1,
        limit: 20,
      },
    });
  });
  const input = page.getByRole("searchbox");
  await input.fill("old");
  expect(requests).toEqual([]);
  await input.press("Enter");
  await expect.poll(() => requests.includes("old")).toBe(true);
  await input.fill("new");
  await input.press("Enter");
  await expect(
    page.getByRole("heading", { name: "new", exact: true })
  ).toBeVisible();
  await page.waitForTimeout(1000);
  await expect(
    page.getByRole("heading", { name: "old", exact: true })
  ).toHaveCount(0);
});

test("viewport matrix has no overflow and captures desktop and mobile evidence", async ({
  page,
}, testInfo) => {
  await page.goto("/discover");
  await expect(page.getByTestId("attraction-card")).toHaveCount(20);
  const sizes = [
    [320, 568],
    [360, 800],
    [375, 812],
    [390, 844],
    [430, 932],
    [412, 915],
    [768, 1024],
    [1024, 768],
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("searchbox")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1
      )
    ).toBe(true);
  }
  await page.setViewportSize(
    testInfo.project.use.viewport || { width: 390, height: 844 }
  );
  await page.screenshot({
    path: testInfo.outputPath("explore.png"),
    fullPage: false,
  });
  // Native buttons are separate siblings, never nested inside a card-wide button.
  expect(
    await page
      .getByTestId("attraction-card")
      .first()
      .locator("button button, a button, button a")
      .count()
  ).toBe(0);
});

test("out-of-range deep-linked page recovers to the last available page", async ({
  page,
}) => {
  await page.goto("/discover?mode=search&page=9999");
  await expect(page.getByTestId("attraction-card")).toHaveCount(5);
  await expect(page).toHaveURL(/page=7/);
  await page.getByRole("button", { name: "ก่อนหน้า" }).click();
  await expect(page.getByTestId("attraction-card")).toHaveCount(20);
});

test("leaving a map during zoom never accesses a removed Leaflet pane", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/discover?view=map");
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(19);
  // Finish initial bounds positioning, then deliberately leave mid-transition.
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "มุมมองตาราง", exact: true }).click();
  await expect(page.getByTestId("attraction-card")).toHaveCount(20);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test("cached destination images remain visible after map and grid remounts", async ({
  page,
}) => {
  await page.goto("/discover");
  const firstImage = page.getByTestId("attraction-card").first().locator("img");
  await expect(firstImage).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      firstImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  for (let cycle = 0; cycle < 3; cycle++) {
    await page
      .getByRole("button", { name: "มุมมองแผนที่", exact: true })
      .click();
    await expect(page.locator(".leaflet-marker-icon")).toHaveCount(19);
    await page
      .getByRole("button", { name: "มุมมองตาราง", exact: true })
      .click();
    await expect(firstImage).toHaveCSS("opacity", "1");
    await expect
      .poll(() =>
        firstImage.evaluate((image) => (image as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0);
  }
});
