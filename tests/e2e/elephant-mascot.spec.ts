import { existsSync } from "node:fs";
import { test, expect } from "@playwright/test";

const title = "ช้างผู้ช่วยเที่ยว";
// Asset-dependent browser cases must also run in an authorized private CI
// when the real rigged GLB is provisioned. Public CI without assets still skips.
const hasAsset = existsSync("src/components/mascot/assets/elephant.glb");
const plan = {
  province: "เชียงใหม่",
  provider: "ai",
  completeness: { status: "complete", requestedDays: 3, plannedDays: 3 },
  days: [
    {
      day: 1,
      stops: [
        {
          id: "fixture-nature",
          name: "Fixture",
          nameLocal: "สถานที่ทดสอบ",
          coordinates: { lat: 18.8, lng: 98.9 },
        },
      ],
    },
    { day: 2, stops: [] },
    { day: 3, stops: [] },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.route("**/api/**", (route) => {
    if (route.request().method() !== "GET") return route.abort();
    return route.fulfill({
      json: {
        attractions: [], total: 0, page: 1, limit: 10,
        data: [], items: [], places: [],
      },
    });
  });
  await page.route("**/api/places/facets", (route) =>
    route.fulfill({
      json: {
        provinces: ["เชียงใหม่", "ชลบุรี", "กรุงเทพฯ"],
        categories: ["Nature"],
      },
    })
  );
});

test("the shared assistant can be minimized, hidden, restored and localized", async ({
  page,
}) => {
  await page.goto("/");
  const launcher = page.getByRole("button", { name: title });
  await launcher.click();
  const panel = page.getByRole("region", { name: title });
  await expect(panel).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ย่อผู้ช่วยเที่ยว" })
  ).toBeFocused();
  const nav = await page.locator("nav").last().boundingBox();
  const toggle = await launcher.boundingBox();
  expect(toggle!.y + toggle!.height).toBeLessThan(nav!.y);
  if (page.viewportSize()!.width >= 1024) {
    const planner = await page
      .getByRole("button", { name: "AI วางแผนเที่ยว", exact: true })
      .boundingBox();
    expect(planner!.x + planner!.width).toBeLessThan(toggle!.x);
  }
  await page.mouse.click(8, 130);
  await expect(panel).toBeHidden();
  await launcher.click();
  await page.keyboard.press("Escape");
  await expect(launcher).toBeFocused();
  await launcher.click();
  await panel.getByRole("link", { name: "ค้นหาที่เที่ยว" }).click();
  await expect(page).toHaveURL(/\/discover\?mode=search$/);
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  await launcher.click();
  await page.getByRole("button", { name: "ซ่อนผู้ช่วยเที่ยว" }).click();
  const restore = page.getByRole("button", { name: "แสดงผู้ช่วยเที่ยว" });
  await expect(restore).toBeVisible();
  await page.reload();
  await restore.click();
  await expect(launcher).toBeVisible();
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(
    page.getByRole("button", { name: "Elephant travel assistant" })
  ).toBeVisible();
});

test("hands off a draft and reuses the existing planner request only after explicit send", async ({
  page,
}) => {
  const prompt = "อยากเที่ยวเชียงใหม่ 3 วัน งบ 6,000 บาท";
  let calls = 0;
  let release!: () => void;
  const response = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/ai/trip-plan", async (route) => {
    calls += 1;
    expect(route.request().postDataJSON()).toMatchObject({
      province: "เชียงใหม่",
      days: 3,
      budget: 6000,
    });
    await response;
    await route.fulfill({ json: plan });
  });
  await page.goto("/");
  const launcher = page.getByRole("button", { name: title });
  await launcher.click();
  await page.getByRole("textbox", { name: "บอกทริปที่อยากไป" }).fill(prompt);
  await page.getByRole("button", { name: "เปิดใน AI วางแผนเที่ยว" }).click();
  await expect(
    page.getByRole("textbox", { name: "ข้อความถึง PaiNaiDee AI" })
  ).toHaveValue(prompt);
  expect(calls).toBe(0);
  const send = page.getByRole("button", { name: "ส่งข้อความ" });
  await expect(send).toBeEnabled();
  await send.evaluate((button) => {
    const form = (button as HTMLButtonElement).form!;
    form.requestSubmit();
    form.requestSubmit();
  });
  await launcher.click();
  await expect(
    page.getByText("AI กำลังจัดทริป", { exact: true })
  ).toBeVisible();
  const activeCanvas = page.locator("aside canvas");
  if (hasAsset) {
    await expect(activeCanvas).toHaveAttribute("data-motion", "Thinking");
  }
  release();
  if (hasAsset) {
    await expect(activeCanvas).toHaveAttribute("data-motion", "Happy");
    await expect(activeCanvas).toHaveAttribute("data-motion", "Idle");
  }
  await expect(
    page.getByText("แผนเที่ยวพร้อมแล้ว", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("แผนเที่ยวรายวัน")).toBeAttached();
  expect(calls).toBe(1);
});

for (const { prompt, clarification } of [
  {
    prompt: "แนะนำสถานที่เที่ยวเชียงใหม่",
    clarification: "อยากเที่ยวกี่วันครับ? (1–5 วัน)",
  },
  {
    prompt: "อยากเที่ยวทะเลใกล้กรุงเทพ",
    clarification: "อยากไปเที่ยวจังหวัดไหนครับ?",
  },
  {
    prompt: "ช่วยวางแผนเที่ยวชลบุรี 2 วัน",
    clarification: "ตั้งงบประมาณรวมไว้กี่บาทครับ?",
  },
]) {
  test(`hands off “${prompt}” and asks for missing information without a request`, async ({
    page,
  }) => {
    let calls = 0;
    await page.route("**/api/ai/trip-plan", (route) => {
      calls += 1;
      return route.abort();
    });
    await page.goto("/");
    await page.getByRole("button", { name: title }).click();
    await page.getByRole("textbox", { name: "บอกทริปที่อยากไป" }).fill(prompt);
    await page.getByRole("button", { name: "เปิดใน AI วางแผนเที่ยว" }).click();
    await expect(
      page.getByRole("textbox", { name: "ข้อความถึง PaiNaiDee AI" })
    ).toHaveValue(prompt);
    await page.getByRole("button", { name: "ส่งข้อความ" }).click();
    await expect(page.getByText(clarification, { exact: true })).toBeVisible();
    expect(calls).toBe(0);
  });
}

test("accepts an English draft and sends the canonical province code", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("painaidee.language", "en")
  );
  const prompt = "Plan a trip to Chiang Mai for 3 days, budget 6000 baht";
  await page.route("**/api/ai/trip-plan", (route) => {
    expect(route.request().postDataJSON()).toMatchObject({
      message: prompt,
      province: "เชียงใหม่",
      days: 3,
      budget: 6000,
    });
    return route.fulfill({ json: plan });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Elephant travel assistant" }).click();
  await page.getByRole("textbox", { name: "Describe your trip" }).fill(prompt);
  await page.getByRole("button", { name: "Open AI Trip Planner" }).click();
  await expect(
    page.getByRole("textbox", { name: "Message PaiNaiDee AI" })
  ).toHaveValue(prompt);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText("Day-by-day itinerary")).toBeVisible();
});

test("a planner rate-limit response keeps the draft available for an explicit retry", async ({
  page,
}) => {
  const prompt = "อยากเที่ยวเชียงใหม่ 3 วัน งบ 6,000 บาท";
  let calls = 0;
  await page.route("**/api/ai/trip-plan", (route) => {
    calls += 1;
    return calls === 1
      ? route.fulfill({ status: 429, json: { error: "rate_limited" } })
      : route.fulfill({ json: plan });
  });
  await page.goto("/trip-planner");
  const message = page.getByRole("textbox", {
    name: "ข้อความถึง PaiNaiDee AI",
  });
  await message.fill(prompt);
  const send = page.getByRole("button", { name: "ส่งข้อความ" });
  await send.click();
  await expect(page.getByText(/มีคำขอมากเกินไป/)).toBeVisible();
  await expect(message).toHaveValue(prompt);
  await page.getByRole("button", { name: title }).click();
  await expect(
    page.getByText("จัดทริปไม่สำเร็จ ลองอีกครั้งในหน้าแผนเที่ยว")
  ).toBeVisible();
  await page.getByRole("button", { name: "ย่อผู้ช่วยเที่ยว" }).click();
  expect(calls).toBe(1);
  await send.click();
  await expect(page.getByText("แผนเที่ยวรายวัน")).toBeVisible();
  expect(calls).toBe(2);
});

test("WebGL-disabled clients can use the planner and see the portrait fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...options: unknown[]
    ) {
      if (type.startsWith("webgl")) return null;
      return Reflect.apply(original, this, [type, ...options]);
    } as typeof original;
  });
  await page.goto("/");
  await page.getByRole("button", { name: title }).click();
  if (hasAsset) await expect(page.getByText("แสดงช้างแบบ 2D")).toBeVisible();
  await expect(
    page.getByRole("region", { name: title }).locator("canvas")
  ).toHaveCount(0);
  await page.getByRole("button", { name: "เปิดใน AI วางแผนเที่ยว" }).click();
  await expect(page).toHaveURL(/\/trip-planner$/);
});

test("loads the real elephant on demand, cleans up its canvas and reuses its bytes", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    !hasAsset,
    "The asset must be installed locally or cleared for distribution in this repository."
  );
  const urls: string[] = [];
  const errors: string[] = [];
  page.on("request", (request) => urls.push(new URL(request.url()).pathname));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const launcher = page.getByRole("button", { name: title });
  await expect(launcher).toBeVisible();
  expect(
    urls.filter((url) => /\.glb$|ElephantRenderer-|\/three-/.test(url))
  ).toEqual([]);
  const available = await page.evaluate(
    () => !!document.createElement("canvas").getContext("webgl2")
  );
  if (!available && browserName === "webkit") {
    await launcher.click();
    await expect(page.getByText("แสดงช้างแบบ 2D")).toBeVisible();
    return;
  }
  await launcher.click();
  const panel = page.getByRole("region", { name: title });
  const canvas = panel.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute("data-motion", "Greeting");
  const countPaintedPixels = async () =>
    page.evaluate(
      async (base64) => {
        const source = new Image();
        source.src = `data:image/png;base64,${base64}`;
        await source.decode();
        const sampler = document.createElement("canvas");
        sampler.width = source.naturalWidth;
        sampler.height = source.naturalHeight;
        const context = sampler.getContext("2d")!;
        context.drawImage(source, 0, 0);
        const pixels = context.getImageData(
          0,
          0,
          sampler.width,
          sampler.height
        ).data;
        let count = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          // Distinguish the shaded blue elephant from the pale mint stage.
          if (pixels[i + 1] < 200 && pixels[i + 2] - pixels[i] > 18) count++;
        }
        return count;
      },
      (await canvas.screenshot()).toString("base64")
    );
  await expect.poll(countPaintedPixels).toBeGreaterThan(100);
  const greeting = await canvas.screenshot();
  await expect
    .poll(async () => (await canvas.screenshot()).equals(greeting), {
      timeout: 10_000,
    })
    .toBe(false);
  await expect(canvas).toHaveAttribute("data-motion", "Idle");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-motion", "Rest");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const walk = page.getByRole("button", { name: "ดูช้างเดิน" });
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-bones")))
    .toBeGreaterThan(20);
  await walk.click();
  await expect(canvas).toHaveAttribute("data-motion", "Walking");
  await expect(canvas).toHaveAttribute("data-motion", "Idle", {
    timeout: 8000,
  });
  await walk.click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-motion", "Rest");
  await expect(walk).toBeDisabled();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await panel.screenshot({
    path: testInfo.outputPath("elephant-3d.png"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: "ย่อผู้ช่วยเที่ยว" }).click();
  await expect(panel.locator("canvas")).toHaveCount(0);
  await launcher.click();
  await expect(panel.locator("canvas")).toBeVisible();
  await panel.getByRole("link", { name: "ค้นหาที่เที่ยว" }).click();
  await expect(page).toHaveURL(/\/discover\?mode=search$/);
  await expect(panel.locator("canvas")).toHaveCount(0);
  await launcher.click();
  await expect(panel.locator("canvas")).toBeVisible();
  expect(urls.filter((url) => url.endsWith(".glb"))).toHaveLength(1);
  expect(errors).toEqual([]);
});

test("peeks above navigation, retracts after the greeting and does not greet again", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") requests.push(request.url());
  });
  await page.addInitScript(() => {
    const phases = new Set<string>();
    const observe = (element: Element | null) => {
      const phase = element?.getAttribute("data-peek");
      if (phase) phases.add(phase);
      document.documentElement.dataset.observedPeek = [...phases].join(" ");
    };
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          if (mutation.oldValue) phases.add(mutation.oldValue);
          observe(mutation.target as Element);
        } else if (mutation.addedNodes.length)
          observe(document.querySelector("[data-peek]"));
      }
    }).observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-peek"],
      attributeOldValue: true,
    });
  });
  await page.goto("/");
  const peek = page.locator("[data-peek]");
  const bubble = page.getByRole("button", {
    name: "สวัสดี! อยากไปเที่ยวที่ไหนกันดี?",
  });
  await expect(bubble).toBeVisible({ timeout: 12_000 });
  await expect(page.locator("html")).toHaveAttribute(
    "data-observed-peek",
    /entering/
  );
  const nav = await page.locator("nav").last().boundingBox();
  const bounds = await bubble.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThan(nav!.y);
  const primaryAction = await page
    .getByRole("button", { name: "AI วางแผนเที่ยว", exact: true })
    .boundingBox();
  const disjoint =
    bounds!.y + bounds!.height <= primaryAction!.y ||
    primaryAction!.y + primaryAction!.height <= bounds!.y ||
    bounds!.x + bounds!.width <= primaryAction!.x ||
    primaryAction!.x + primaryAction!.width <= bounds!.x;
  expect(disjoint).toBe(true);
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(page.viewportSize()!.width);
  await expect(page.locator("html")).toHaveAttribute(
    "data-observed-peek",
    /exiting/,
    { timeout: 10_000 }
  );
  await expect(bubble).toBeHidden();
  await expect(peek).toHaveAttribute("data-peek", "idle");
  await expect(peek.locator("canvas")).toHaveCount(0);
  await page.reload();
  await expect(peek).toHaveAttribute("data-peek", "idle");
  expect(requests.filter((url) => url.endsWith("/api/ai/trip-plan"))).toEqual(
    []
  );
});

test("opens the existing assistant from the greeting and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const bubble = page.getByRole("button", {
    name: "สวัสดี! อยากไปเที่ยวที่ไหนกันดี?",
  });
  await expect(bubble).toBeVisible({ timeout: 12_000 });
  await bubble.click();
  await expect(page.getByRole("region", { name: title })).toBeVisible();
  await page.getByRole("button", { name: "ย่อผู้ช่วยเที่ยว" }).click();
  await expect(page.locator("[data-peek]")).toHaveAttribute(
    "data-peek",
    "idle"
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() =>
    sessionStorage.removeItem("painaidee.elephant.peek-greeted")
  );
  await page.reload();
  // Advance past the introductory delay without slowing the browser suite.
  await page.clock.install();
  await page.clock.runFor(4000);
  await expect(bubble).toBeHidden();
  await expect(page.locator("[data-peek]")).toHaveAttribute(
    "data-peek",
    "idle"
  );
  await page.getByRole("button", { name: title }).click();
  await expect(page.getByRole("region", { name: title })).toBeVisible();
});
