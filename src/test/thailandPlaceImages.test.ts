import { describe, expect, it } from "vitest";
import {
  getThailandPlaceImage,
  getThailandPlaceImageMeta,
} from "@/shared/data/thailandPlaceImages";

describe("Thailand attraction image catalog", () => {
  it("does not invent imagery for a named place if Railway has no verified photo", () => {
    expect(getThailandPlaceImage("หมู่เกาะพีพี")).toBe('/placeholder-attraction.svg');
    expect(getThailandPlaceImage("Floating Market")).toBe('/placeholder-attraction.svg');
  });

  it("preserves a database image for unknown places", () => {
    const databaseImage = "https://example.com/place.jpg";
    expect(getThailandPlaceImage("Unknown Place", databaseImage)).toBe(
      databaseImage,
    );
  });

  it("always uses a Railway photo over old stock imagery for known places", () => {
    const databaseImage = "https://thumb.wikimedia.org/example.jpg";
    expect(getThailandPlaceImage("Wat Arun", databaseImage)).toBe(databaseImage);
  });

  it("falls back safely when no image is known", () => {
    expect(getThailandPlaceImage("Unknown Place")).toBe(
      "/placeholder-attraction.svg",
    );
  });

  it("keeps source metadata for attribution and audits", () => {
    const metadata = getThailandPlaceImageMeta("Doi Inthanon");
    expect(metadata?.provider).toBe("Unsplash");
    expect(metadata?.sourcePage).toMatch(/^https:\/\/unsplash\.com\//);
    expect(metadata?.photographer.length).toBeGreaterThan(0);
  });
});
