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

  it("does not display a local attraction when Railway cannot be reached", async () => {
    vi.mocked(getRailwayAttractionDetail).mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(attractionService.getAttractionDetail("2")).rejects.toThrow('Failed to fetch attraction details');
  });

  it("still surfaces an error for unknown attraction ids", async () => {
    vi.mocked(getRailwayAttractionDetail).mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      attractionService.getAttractionDetail("unknown-id"),
    ).rejects.toThrow("Failed to fetch attraction details");
  });
});
