import { test, expect, type Page } from "@playwright/test";
import { mock, place } from "./fixtures/place-detail";
const near = {
  ...place,
  id: "nearby-place",
  name: "Nearby forest",
  nameLocal: "ป่าใกล้เคียง",
  coordinates: { lat: 18.51, lng: 98.51 },
  distanceKm: 1.5,
};
async function setup(
  page: Page,
  mode: "normal" | "empty" | "error" | "dense" | "race" = "normal"
) {
  await mock(page);
  const requests: number[] = [];
  const forbidden: string[] = [];
  page.on("request", (request) => {
    if (
      /places\.googleapis|routes\.googleapis|google-preview|\/api\/places\?/.test(
        request.url()
      )
    )
      forbidden.push(request.url());
  });
  await page.route("**/api/places/nearby?**", async (route) => {
    const url = new URL(route.request().url());
    const radius = Number(url.searchParams.get("radiusKm"));
    requests.push(radius);
    expect(url.searchParams.get("limit")).toBe("30");
    expect([place.id, near.id]).toContain(url.searchParams.get("excludeId"));
    expect([
      String(place.coordinates.lat),
      String(near.coordinates.lat),
    ]).toContain(url.searchParams.get("lat"));
    if (mode === "error" && requests.length <= 2)
      return route.fulfill({ status: 503, json: { error: "Unavailable" } });
    if (mode === "race" && radius === 3)
      await new Promise((resolve) => setTimeout(resolve, 600));
    const attractions =
      mode === "empty"
        ? []
        : mode === "dense"
          ? Array.from({ length: 30 }, (_, i) => ({
              ...near,
              id: `dense-${i}`,
              coordinates: { lat: 18.5 + i * 0.0001, lng: 98.5 },
              distanceKm: i / 10,
            }))
          : [
              place,
              near,
              {
                ...near,
                id: "bad-coordinates",
                coordinates: { lat: 0, lng: 0 },
              },
              { ...near, id: "outside", distanceKm: 40 },
            ];
    await route
      .fulfill({
        json: {
          attractions:
            mode === "race"
              ? [
                  {
                    ...near,
                    id: `radius-${radius}`,
                    nameLocal: `รัศมี ${radius}`,
                  },
                ]
              : attractions,
          center: place.coordinates,
          radiusKm: radius,
          limit: 30,
          hasMore: mode === "dense",
        },
      })
      .catch((error) => {
        // A canceled response is expected while changing radius; do not mask application errors.
        if (!/closed|disposed|Invalid InterceptionId/i.test(String(error)))
          throw error;
      });
  });
  await page.goto(`/attraction/${place.id}`);
  await page.locator("#location").scrollIntoViewIfNeeded();
  await expect(page.getByTestId("embedded-nearby-map")).toBeVisible();
  return { requests, forbidden };
}

for (const width of [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440]) {
  test(`nearby responsive map ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const { requests, forbidden } = await setup(page);
    const map = page.getByTestId("embedded-nearby-map");
    await expect(map).toHaveAttribute("data-marker-count", "2");
    await expect(map).toHaveAttribute("inert", "");
    await expect(
      page.getByRole("button", { name: "5 กม.", exact: true })
    ).toHaveAttribute("aria-pressed", "true");
    await expect(map.locator(".leaflet-control-attribution")).toContainText(
      "OpenStreetMap"
    );
    expect((await map.boundingBox())!.height).toBe(width < 640 ? 300 : 360);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    const list = page.getByTestId("real-nearby-places");
    await expect(
      list.getByRole("link", { name: `ดูรายละเอียด: ${near.nameLocal}` })
    ).toHaveCount(1);
    await expect(list.getByText("ห่างประมาณ 1.5 กม. (เส้นตรง)")).toBeVisible();
    for (const button of await page
      .locator("#location fieldset")
      .getByRole("button")
      .all())
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    if ([390, 1440].includes(width)) {
      await page
        .locator("#location")
        .evaluate((el) =>
          el.scrollIntoView({ block: "start", behavior: "instant" })
        );
      await page.screenshot({
        path: `reports/nearby-map/after-${info.project.name}-${width}.png`,
        fullPage: false,
      });
    }
    expect(requests).toEqual([5]);
    expect(forbidden).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("radius, popup keyboard, navigation and cleanup during zoom", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const { requests, forbidden } = await setup(page);
  for (const radius of [3, 5, 10, 20]) {
    await page
      .getByRole("button", { name: `${radius} กม.`, exact: true })
      .click();
    await expect(page.getByTestId("real-nearby-places")).toContainText(
      `ภายใน ${radius} กม.`
    );
    await expect(page.getByTestId("embedded-nearby-map")).toHaveAttribute(
      "data-marker-count",
      "2"
    );
  }
  await page.getByRole("button", { name: "แตะเพื่อใช้แผนที่" }).click();
  const marker = page.locator(
    `.leaflet-marker-icon[title="${near.nameLocal}"]`
  );
  await marker.focus();
  await page.keyboard.press("Enter");
  const popup = page.locator(".leaflet-popup");
  await expect(popup).toBeVisible();
  await expect(popup.locator("img")).toHaveAttribute("src", place.image);
  await expect(popup.getByText("ห่างประมาณ 1.5 กม. (เส้นตรง)")).toBeVisible();
  await expect(
    popup.getByRole("link", { name: "นำทาง", exact: true })
  ).toHaveAttribute("href", /\/maps\/search\/.*query=/);
  await page.keyboard.press("Escape");
  await expect(popup).toHaveCount(0);
  await expect(marker).toBeFocused();
  // Closing a popup must restore both pins inside the map before a user taps again.
  const mapBox = (await page.getByTestId("embedded-nearby-map").boundingBox())!;
  const primaryMarker = page.locator(
    '.leaflet-marker-icon[title^="สถานที่นี้:"]'
  );
  const primaryBox = (await primaryMarker.boundingBox())!;
  expect(primaryBox.y).toBeGreaterThanOrEqual(mapBox.y);
  expect(primaryBox.y + primaryBox.height).toBeLessThanOrEqual(
    mapBox.y + mapBox.height
  );

  await page.locator('.leaflet-marker-icon[title^="สถานที่นี้:"]').click();
  await expect(
    page.locator(".leaflet-popup").getByRole("link", { name: /ดูรายละเอียด/ })
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  const count = requests.length;
  await page.locator(".leaflet-control-zoom-in").click();
  await page.locator(".leaflet-control-zoom-out").click();
  expect(requests.length).toBe(count);
  const list = page.getByTestId("real-nearby-places");
  await list.getByRole("link", { name: /^ดูรายละเอียด:/ }).click();
  await expect(page).toHaveURL(/nearby-place/);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(place.id));
  await page.locator("#location").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "5 กม.", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  expect(forbidden).toEqual([]);
  expect(errors).toEqual([]);
});

test("rapid radius changes never expose stale results", async ({ page }) => {
  await setup(page, "race");
  await page.getByRole("button", { name: "3 กม.", exact: true }).click();
  await page.getByRole("button", { name: "20 กม.", exact: true }).click();
  const list = page.getByTestId("real-nearby-places");
  await expect(
    list.getByRole("link", { name: "ดูรายละเอียด: รัศมี 20", exact: true })
  ).toBeVisible();
  await page.waitForTimeout(700); // Deliberately release the older response after the current response.
  await expect(
    list.getByRole("link", { name: "ดูรายละเอียด: รัศมี 20", exact: true })
  ).toBeVisible();
  await expect(list.getByText("รัศมี 3", { exact: true })).toHaveCount(0);
});

for (const mode of ["empty", "error", "dense"] as const) {
  test(`nearby ${mode} keeps current map available`, async ({ page }) => {
    await setup(page, mode);
    if (mode === "empty") {
      await expect(page.getByTestId("real-nearby-places")).toContainText(
        "ยังไม่พบสถานที่ท่องเที่ยวใน PaiNaiDee"
      );
      await expect(page.getByTestId("embedded-nearby-map")).toHaveAttribute(
        "data-marker-count",
        "1"
      );
    } else if (mode === "error") {
      await expect(page.getByRole("alert")).toContainText(
        "ยังโหลดสถานที่ใกล้เคียงไม่ได้"
      );
      await expect(page.getByTestId("embedded-nearby-map")).toHaveAttribute(
        "data-marker-count",
        "1"
      );
      await page
        .getByRole("button", { name: "ลองอีกครั้ง", exact: true })
        .click();
      await expect(page.getByTestId("embedded-nearby-map")).toHaveAttribute(
        "data-marker-count",
        "2"
      );
    } else {
      await expect(page.getByTestId("embedded-nearby-map")).toHaveAttribute(
        "data-marker-count",
        "31"
      );
      await expect(
        page
          .getByTestId("real-nearby-places")
          .getByRole("link", { name: /^ดูรายละเอียด:/ })
      ).toHaveCount(30);
      await expect(page.getByTestId("real-nearby-places")).toContainText(
        "ยังมีสถานที่อื่นในรัศมีนี้"
      );
    }
  });
}

test("missing coordinates skips Nearby and English and dark theme stay consistent", async ({
  page,
}) => {
  let nearby = 0;
  await mock(page, true);
  page.on("request", (r) => {
    if (r.url().includes("/nearby?")) nearby++;
  });
  await page.goto(`/attraction/${place.id}`);
  await page.locator("#location").scrollIntoViewIfNeeded();
  await expect(
    page.getByText("ยังไม่มีพิกัดที่ใช้แสดงแผนที่ได้")
  ).toBeVisible();
  await expect(page.getByTestId("embedded-nearby-map")).toHaveCount(0);
  expect(nearby).toBe(0);
  await page.getByRole("button", { name: /Switch to English/ }).click();
  await expect(
    page.getByText("Map coordinates are unavailable.")
  ).toBeVisible();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});

test("English map and dark popup keep accessible names and equivalent list", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.getByRole("button", { name: /Switch to English/ }).click();
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.locator("#location").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Activate map", exact: true }).click();
  await page.locator(`.leaflet-marker-icon[title="${near.name}"]`).click();
  const popup = page.locator(".leaflet-popup");
  await expect(popup.getByText("Approx. 1.5 km (straight line)")).toBeVisible();
  await expect(
    popup.getByRole("link", {
      name: "View details: Nearby forest",
      exact: true,
    })
  ).toBeVisible();
  expect(await page.getByTestId("real-nearby-places").innerText()).not.toMatch(
    /[\u0e00-\u0e7f]/
  );
  const popupColor = await page
    .locator(".leaflet-popup-content-wrapper")
    .evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(popupColor).not.toBe("rgb(255, 255, 255)");
  const mapBox = (await page.getByTestId("embedded-nearby-map").boundingBox())!;
  const popupBox = (await popup.boundingBox())!;
  expect(popupBox.x).toBeGreaterThanOrEqual(mapBox.x);
  expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(
    mapBox.x + mapBox.width
  );
  const nav = page.getByRole("navigation", { name: "Quick actions" });
  expect((await nav.boundingBox())!.y).toBeGreaterThan(
    mapBox.y + mapBox.height
  );
  await page.screenshot({
    path: `reports/nearby-map/dark-popup-${info.project.name}.png`,
    fullPage: false,
  });
  await page
    .getByRole("button", { name: "Pause map to scroll page", exact: true })
    .click();
  await expect(page.getByTestId("embedded-nearby-map")).toHaveAttribute(
    "inert",
    ""
  );
  await expect(popup).toHaveCount(0);
});
