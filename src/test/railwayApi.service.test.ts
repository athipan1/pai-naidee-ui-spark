import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getApiBaseUrl,
  getRailwayAttractionDetail,
  getRailwayAttractions,
} from "@/services/railway-api.service";

describe("Railway attraction API client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses the Railway production API by default", () => {
    expect(getApiBaseUrl()).toBe(
      "https://painaidee-api-production.up.railway.app",
    );
  });

  it("uses VITE_API_BASE_URL when configured", () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://example.test/");
    expect(getApiBaseUrl()).toBe("https://example.test");
  });

  it("fetches attraction details from the backend API", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://example.test");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "2",
          name: "Wat Phra Kaew",
          nameLocal: "วัดพระแก้ว",
          province: "กรุงเทพฯ",
          category: "Culture",
          rating: 4.9,
          reviewCount: 5243,
          images: ["https://example.test/wat.jpg"],
          description: "Temple",
          tags: ["Temple"],
          coordinates: { lat: 13.7515, lng: 100.4925 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await getRailwayAttractionDetail("2");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.test/api/places/2",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result.name).toBe("Wat Phra Kaew");
  });

  it("passes list filters to Railway", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://example.test");
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ attractions: [], total: 0, page: 2, limit: 5 }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await getRailwayAttractions({
      page: 2,
      limit: 5,
      category: "Nature",
      search: "doi",
    });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/places?");
    expect(url).toContain("page=2");
    expect(url).toContain("limit=5");
    expect(url).toContain("category=Nature");
    expect(url).toContain("search=doi");
  });
});
