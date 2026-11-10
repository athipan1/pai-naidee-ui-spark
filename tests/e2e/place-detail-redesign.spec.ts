import { test, expect } from "@playwright/test";
import { mock, place, photos, primary } from "./fixtures/place-detail";
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
      page.getByTestId("real-nearby-places").getByRole("link", { name: /^ดูรายละเอียด:/ })
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
  await expect(page.getByRole("status").filter({ hasText: "คัดลอกลิงก์แล้ว" })).toHaveText("คัดลอกลิงก์แล้ว");
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied)
  ).toContain("/attraction/" + place.id);
  await page.getByRole("button", { name: "ดูแผนที่", exact: true }).click();
  await expect(page.getByTestId("embedded-nearby-map")).toBeVisible();
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(2);
  await page.evaluate(() => {
    window.open = (url?: string | URL) => {
      (
        window as unknown as { detailNavigationUrl: string }
      ).detailNavigationUrl = String(url);
      return null;
    };
  });
  await page.locator("#location").getByRole("button", { name: "ค้นสถานที่บน Google Maps" }).click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { detailNavigationUrl: string })
          .detailNavigationUrl
    )
  ).toContain("https://www.google.com/maps/search/?api=1&query=");
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
  await page.getByTestId("real-nearby-places").getByRole("link", { name: /^ดูรายละเอียด:/ }).click();
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
