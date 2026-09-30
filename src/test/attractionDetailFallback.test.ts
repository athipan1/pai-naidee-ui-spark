import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/railway-api.service", () => ({
  getRailwayAttractionDetail: vi.fn(),
  getRailwayAttractions: vi.fn(),
}));

import { getRailwayAttractionDetail } from "@/services/railway-api.service";
import { attractionService } from "@/services/attraction.service";

describe("attraction detail offline fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a local attraction when the Railway API cannot be reached", async () => {
    vi.mocked(getRailwayAttractionDetail).mockRejectedValue(new TypeError("Failed to fetch"));

    const attraction = await attractionService.getAttractionDetail("2");

    expect(attraction.id).toBe("2");
    expect(attraction.name).toBe("Wat Phra Kaew");
    expect(attraction.nameLocal).toBe("วัดพระแก้ว");
    expect(attraction.images[0]).toContain("unsplash");
  });

  it("still surfaces an error for unknown attraction ids", async () => {
    vi.mocked(getRailwayAttractionDetail).mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      attractionService.getAttractionDetail("unknown-id"),
    ).rejects.toThrow("Failed to fetch attraction details");
  });
});
