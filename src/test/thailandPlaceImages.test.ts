import { describe, expect, it } from "vitest";
import {
  getThailandPlaceImage,
  getThailandPlaceImageMeta,
  thailandPlaceImages,
} from "@/shared/data/thailandPlaceImages";

describe("Thailand attraction image catalog", () => {
  it("maps English and Thai aliases to the same real image", () => {
    expect(getThailandPlaceImage("Phi Phi Islands")).toBe(
      thailandPlaceImages.phiPhiIslands.url,
    );
    expect(getThailandPlaceImage("หมู่เกาะพีพี")).toBe(
      thailandPlaceImages.phiPhiIslands.url,
    );
  });

  it("maps named Bangkok attractions to place-specific photos", () => {
    expect(getThailandPlaceImage("Wat Phra Kaew")).toBe(
      thailandPlaceImages.watPhraKaew.url,
    );
    expect(getThailandPlaceImage("Wat Arun")).toBe(
      thailandPlaceImages.watArun.url,
    );
    expect(getThailandPlaceImage("Floating Market")).toBe(
      thailandPlaceImages.floatingMarket.url,
    );
  });

  it("preserves a database image for unknown places", () => {
    const databaseImage = "https://example.com/place.jpg";
    expect(getThailandPlaceImage("Unknown Place", databaseImage)).toBe(
      databaseImage,
    );
  });

  it("falls back safely when no image is known", () => {
    expect(getThailandPlaceImage("Unknown Place")).toBe(
      "/placeholder-attraction.jpg",
    );
  });

  it("keeps source metadata for attribution and audits", () => {
    const metadata = getThailandPlaceImageMeta("Doi Inthanon");
    expect(metadata?.provider).toBe("Unsplash");
    expect(metadata?.sourcePage).toMatch(/^https:\/\/unsplash\.com\//);
    expect(metadata?.photographer.length).toBeGreaterThan(0);
  });
});
