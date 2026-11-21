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
        attractions: [],
        total: 0,
        page: 1,
        limit: 10,
        data: [],
        items: [],
        places: [],
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
  // Expanded assistant has one close control and no duplicate launcher.
  await expect(launcher).toHaveCount(0);
  const nav = await page.locator("nav").last().boundingBox();
  const panelBounds = await panel.boundingBox();
  expect(panelBounds!.y + panelBounds!.height).toBeLessThan(nav!.y);
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
  await expect(
    page.getByRole("textbox", { name: "ข้อความถึง PaiNaiDee AI" })
  ).toBeFocused();
  expect(calls).toBe(0);
  const send = page.getByRole("button", { name: "ส่งข้อความ" });
  await expect(send).toBeEnabled();
  await send.evaluate((button) => {
    const form = (button as HTMLButtonElement).form!;
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect(page.getByRole("region", { name: title })).toHaveCount(0);
  await expect(launcher).toHaveCount(0);
  await expect(page.locator("aside canvas")).toHaveCount(0);
  await expect(send).toBeDisabled();
  release();
  await expect(page.getByText("แผนเที่ยวรายวัน")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByRole("region", { name: title })).toHaveCount(0);
  await expect(launcher).toHaveCount(0);
  await expect(page.locator("aside canvas")).toHaveCount(0);
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
  await expect(page.getByRole("region", { name: title })).toHaveCount(0);
  await expect(page.getByRole("button", { name: title })).toHaveCount(0);
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
  expect(available).toBe(true);
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
  if (page.viewportSize()!.width >= 1024) {
    const speech = await page.locator(".elephant-peek__bubble").boundingBox();
    const character = await page
      .locator(".elephant-peek__trigger")
      .boundingBox();
    expect(Math.abs(character!.x - (speech!.x + speech!.width))).toBeLessThan(
      24
    );
  }
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

for (const target of ["island", "search", "hero", "navigation"] as const) {
  test(`greeting leaves the ${target} target clickable`, async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    await expect(page.locator(".elephant-peek__bubble")).toBeVisible({
      timeout: 12000,
    });
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const control =
      target === "island"
        ? page.getByRole("button", { name: "Search for เกาะ", exact: true })
        : target === "search"
          ? page.getByRole("combobox", { name: "คุณอยากไปเที่ยวที่ไหน?" })
          : target === "hero"
            ? page.getByRole("button", { name: "AI วางแผนเที่ยว", exact: true })
            : page
                .locator("nav")
                .last()
                .getByRole("link", { name: "สำรวจ", exact: true });
    await expect(control).toBeVisible();
    await control.evaluate((element) =>
      element.scrollIntoView({ block: "center" })
    );
    await page.clock.runFor(100);
    await expect(page.locator(".elephant-peek__bubble")).toBeVisible();
    await expect
      .poll(async () => {
        // Scroll events and ResizeObserver are delivered outside the virtual clock.
        // Advance subsequent frames while waiting for the placement to settle.
        await page.clock.runFor(100);
        return await control.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return [0.2, 0.5, 0.8].every((x) =>
            [0.2, 0.5, 0.8].every((y) => {
              const hit = document.elementFromPoint(
                rect.left + rect.width * x,
                rect.top + rect.height * y
              );
              return hit === element || (!!hit && element.contains(hit));
            })
          );
        });
      })
      .toBe(true);
    await expect(page.locator(".elephant-peek__bubble")).toBeVisible();
    await control.click();
    await page.clock.resume();
    if (target === "search") {
      await control.fill("เชียงใหม่");
      await control.press("Enter");
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === "/discover" &&
          url.searchParams.get("q") ===
            (target === "search" ? "เชียงใหม่" : "เกาะ") &&
          url.searchParams.get("mode") === "search"
      );
    } else if (target === "hero")
      await expect(page).toHaveURL(/\/trip-planner$/);
    else if (target === "navigation")
      await expect(page).toHaveURL(/\/discover$/);
    else
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === "/discover" &&
          url.searchParams.get("q") ===
            (target === "search" ? "เชียงใหม่" : "เกาะ") &&
          url.searchParams.get("mode") === "search"
      );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  });
}

test("first painted ready frame, resize and reopen keep the animated skin inside the canvas", async ({
  page,
}, testInfo) => {
  test.skip(!hasAsset, "Requires the owner's private rigged GLB.");
  await page.addInitScript(() => {
    sessionStorage.setItem("painaidee.elephant.peek-greeted", "true");
    const frames: {
      width: number;
      height: number;
      count: number;
      margin: number;
    }[] = [];
    Object.assign(window, { mascotFrames: frames });
    const sampled = new WeakMap<HTMLCanvasElement, string>();
    const original = WebGL2RenderingContext.prototype.drawElements;
    WebGL2RenderingContext.prototype.drawElements = function (...args) {
      Reflect.apply(original, this, args);
      const canvas = this.canvas;
      if (
        !(canvas instanceof HTMLCanvasElement) ||
        !canvas.closest("aside") ||
        this.getParameter(this.FRAMEBUFFER_BINDING)
      )
        return;
      const width = this.drawingBufferWidth,
        height = this.drawingBufferHeight;
      const size = `${width}x${height}`;
      if (sampled.get(canvas) === size) return;
      const pixels = new Uint8Array(width * height * 4);
      this.readPixels(
        0,
        0,
        width,
        height,
        this.RGBA,
        this.UNSIGNED_BYTE,
        pixels
      );
      let count = 0,
        margin = Math.min(width, height);
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          if (pixels[(y * width + x) * 4 + 3] > 32) {
            count++;
            margin = Math.min(margin, x, y, width - x - 1, height - y - 1);
          }
        }
      if (count) {
        sampled.set(canvas, size);
        frames.push({ width, height, count, margin });
      }
    };
  });
  await page.goto("/");
  const launcher = page.getByRole("button", { name: title, exact: true });
  await launcher.click();
  const canvas = page.locator("aside canvas[data-ready='true']");
  await expect(canvas).toBeVisible({ timeout: 18_000 });
  const frames = () =>
    page.evaluate(
      () =>
        (
          window as unknown as {
            mascotFrames: {
              width: number;
              height: number;
              count: number;
              margin: number;
            }[];
          }
        ).mascotFrames
    );
  await expect.poll(async () => (await frames()).length).toBe(1);
  await page.setViewportSize({ width: 640, height: 360 });
  await canvas.evaluate((element) => {
    const host = element.parentElement!;
    host.style.width = "96px";
    host.style.height = "96px";
  });
  await expect(canvas).toBeVisible();
  const resizedPixels = await page.evaluate(() =>
    Math.floor(96 * Math.min(devicePixelRatio || 1, 1.25))
  );
  await expect(canvas).toHaveAttribute("width", String(resizedPixels));
  await expect(canvas).toHaveAttribute("height", String(resizedPixels));
  const resized = await canvas.evaluate((element) => ({
    width: (element as HTMLCanvasElement).width,
    height: (element as HTMLCanvasElement).height,
  }));
  await expect
    .poll(async () =>
      (await frames()).some(
        (frame) =>
          frame.width === resized.width && frame.height === resized.height
      )
    )
    .toBe(true);
  const beforeReopen = (await frames()).length;
  await page.getByRole("button", { name: "ย่อผู้ช่วยเที่ยว" }).click();
  await launcher.click();
  await expect(canvas).toBeVisible();
  await expect
    .poll(async () => (await frames()).length)
    .toBeGreaterThan(beforeReopen);
  for (const frame of await frames()) {
    expect(frame.count).toBeGreaterThan(100);
    expect(frame.margin).toBeGreaterThan(2);
  }
  await testInfo.attach("first-ready-frame-bounds", {
    body: JSON.stringify(await frames()),
    contentType: "application/json",
  });
});

test("the loading portrait stays fitted while the real GLB is delayed", async ({
  page,
}, testInfo) => {
  test.skip(!hasAsset, "Requires the private candidate and its portrait.");
  await page.addInitScript(() =>
    sessionStorage.setItem("painaidee.elephant.peek-greeted", "true")
  );
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*.glb", async (route) => {
    await pending;
    await route.continue();
  });
  await page.goto("/");
  await page.getByRole("button", { name: title, exact: true }).click();
  const stage = page.locator("[data-mascot-stage]");
  const portrait = stage.locator("img[data-mascot-portrait]");
  try {
    await expect(portrait).toBeVisible();
    await expect
      .poll(() =>
        portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth)
      )
      .toBe(256);
    const frame = (await stage.boundingBox())!;
    const image = (await portrait.boundingBox())!;
    expect(image.y - frame.y).toBeGreaterThan(16);
    expect(frame.y + frame.height - image.y - image.height).toBeGreaterThan(16);
    expect(image.x).toBeGreaterThanOrEqual(frame.x);
    expect(image.x + image.width).toBeLessThanOrEqual(frame.x + frame.width);
    const pixels = await page.evaluate(
      async (base64) => {
        const source = new Image();
        source.src = `data:image/png;base64,${base64}`;
        await source.decode();
        const sample = document.createElement("canvas");
        sample.width = source.naturalWidth;
        sample.height = source.naturalHeight;
        const context = sample.getContext("2d")!;
        context.drawImage(source, 0, 0);
        const data = context.getImageData(
          0,
          0,
          sample.width,
          sample.height
        ).data;
        let count = 0,
          margin = Math.min(sample.width, sample.height);
        for (let y = 0; y < sample.height; y++)
          for (let x = 0; x < sample.width; x++) {
            const i = (y * sample.width + x) * 4;
            if (data[i + 1] < 200 && data[i + 2] - data[i] > 18) {
              count++;
              margin = Math.min(
                margin,
                x,
                y,
                sample.width - x - 1,
                sample.height - y - 1
              );
            }
          }
        return { count, margin };
      },
      (
        await stage.screenshot({
          path: testInfo.outputPath("loading-portrait.png"),
        })
      ).toString("base64")
    );
    expect(pixels.count).toBeGreaterThan(100);
    expect(pixels.margin).toBeGreaterThan(2);
  } finally {
    release();
  }
  await expect(stage.locator("canvas[data-ready='true']")).toBeVisible({
    timeout: 18000,
  });
  await expect(portrait).toHaveCount(0);
  await expect(stage.locator("canvas")).toHaveAttribute("data-bones", "29");
});

test("collapsed crop shows 60–70% of the current portrait silhouette", async ({
  page,
}, testInfo) => {
  test.skip(
    !hasAsset,
    "Requires the approved silhouette from the private build."
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const portrait = page.locator(".elephant-peek__character img");
  await expect(portrait).toBeVisible();
  const visible = await portrait.evaluate(async (image: HTMLImageElement) => {
    await image.decode();
    const { naturalWidth: width, naturalHeight: height } = image;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, width, height).data;
    const clip = image.closest(".elephant-peek__crop")!.getBoundingClientRect();
    const rect = image.getBoundingClientRect();
    let silhouette = 0;
    let shown = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (pixels[(y * width + x) * 4 + 3] <= 32) continue;
        silhouette++;
        const pageX = rect.left + ((x + 0.5) * rect.width) / width;
        const pageY = rect.top + ((y + 0.5) * rect.height) / height;
        if (
          pageX >= clip.left &&
          pageX < clip.right &&
          pageY >= clip.top &&
          pageY < clip.bottom
        )
          shown++;
      }
    }
    return shown / silhouette;
  });
  await testInfo.attach("visible portrait alpha fraction", {
    body: String(visible),
    contentType: "text/plain",
  });
  expect(visible).toBeGreaterThanOrEqual(0.6);
  expect(visible).toBeLessThanOrEqual(0.7);
  const launcher = page.getByRole("button", { name: title, exact: true });
  const rect = (await launcher.boundingBox())!;
  expect(rect.width).toBeGreaterThanOrEqual(44);
  expect(rect.height).toBeGreaterThanOrEqual(44);
  await launcher.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: title })).toBeVisible();
});

test("the live side-peek plays its rig and animates eyelid closure before the panel opens", async ({
  page,
}) => {
  test.skip(!hasAsset, "Requires the approved private rig.");
  await page.addInitScript(() => {
    const locations = new WeakSet<WebGLUniformLocation>();
    const state = { peak: 0 };
    Object.assign(window, { mascotEyelidTest: state });
    const proto = WebGL2RenderingContext.prototype;
    const locate = proto.getUniformLocation;
    const upload = proto.uniform1f;
    proto.getUniformLocation = function (program, name) {
      const location = locate.call(this, program, name);
      if (name === "mascotEyelid" && location) locations.add(location);
      return location;
    };
    proto.uniform1f = function (location, value) {
      if (location && locations.has(location)) {
        state.peak = Math.max(state.peak, value);
      }
      upload.call(this, location, value);
    };
  });
  await page.goto("/");
  const peek = page.locator('[data-peek="greeting"]');
  const canvas = peek.locator("canvas");
  await expect(canvas).toHaveAttribute("data-motion", "PeekGreeting", {
    timeout: 20_000,
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { mascotEyelidTest: { peak: number } })
            .mascotEyelidTest.peak
      )
    )
    .toBeGreaterThan(0.8);
  const launcher = peek.getByRole("button", { name: title, exact: true });
  if (test.info().project.use.hasTouch) await launcher.tap();
  else await launcher.click();
  await expect(page.getByRole("region", { name: title })).toBeVisible();
});

test("a crowded edge uses a 44 px launcher without taking focus from a dialog", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() => {
    const blocker = document.createElement("button");
    blocker.textContent = "Edge control";
    Object.assign(blocker.style, {
      position: "fixed",
      right: "64px",
      top: "0",
      height: "100vh",
      width: "90px",
      zIndex: "38",
    });
    document.body.append(blocker);
  });
  const peek = page.locator("[data-peek]");
  const launcher = peek.getByRole("button", { name: title, exact: true });
  await expect(peek).toHaveAttribute("data-compact", "true");
  expect((await launcher.boundingBox())?.width).toBe(44);
  expect((await launcher.boundingBox())?.height).toBe(44);
  await page.evaluate(() => {
    const dialog = document.createElement("dialog");
    dialog.innerHTML = "<button autofocus>Close dialog</button>";
    document.body.append(dialog);
    dialog.showModal();
  });
  await expect(launcher).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Close dialog" })
  ).toBeFocused();
  await page
    .locator("dialog")
    .evaluate((dialog: HTMLDialogElement) => dialog.close());
  await expect(launcher).toBeVisible();
  await launcher.click();
  await expect(page.getByRole("region", { name: title })).toBeVisible();
});

test("the opened panel leaves the Home planner action clickable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: title, exact: true }).click();
  const composer = page.getByRole("textbox", { name: "บอกทริปที่อยากไป" });
  await expect(composer).toBeInViewport({ ratio: 1 });
  const action = page.getByRole("button", {
    name: "AI วางแผนเที่ยว",
    exact: true,
  });
  await expect(action).toBeVisible();
  await action.click();
  await expect(page).toHaveURL(/\/trip-planner$/);
});
