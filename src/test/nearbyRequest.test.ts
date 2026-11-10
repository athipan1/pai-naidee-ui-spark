import { afterEach, expect, it, vi } from "vitest";
import { getRailwayNearbyAttractions } from "@/services/railway-api.service";
afterEach(() => vi.unstubAllGlobals());
it("propagates query cancellation to fetch and keeps canonical exclusion URL encoded", async () => {
  let requestSignal: AbortSignal | null = null;
  let requested = "";
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, options: RequestInit) => {
      requested = url;
      requestSignal = options.signal as AbortSignal;
      return new Promise((_resolve, reject) =>
        requestSignal!.addEventListener("abort", () =>
          reject(new DOMException("Canceled", "AbortError"))
        )
      );
    })
  );
  const controller = new AbortController();
  const request = getRailwayNearbyAttractions({
    lat: 18,
    lng: 99,
    radiusKm: 5,
    excludeId: "cms:canonical&place",
    signal: controller.signal,
  });
  controller.abort();
  await expect(request).rejects.toMatchObject({ name: "AbortError" });
  expect(requestSignal!.aborted).toBe(true);
  expect(new URL(requested).searchParams.get("excludeId")).toBe(
    "cms:canonical&place"
  );
});
