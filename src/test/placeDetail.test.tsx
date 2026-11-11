import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AttractionDetail from "@/app/pages/AttractionDetail";
import OptimizedImage from "@/components/common/OptimizedImage";
import ImageGallery from "@/components/attraction/ImageGallery";
import {
  placeNavigationUrl,
  readSavedPlaceIds,
  validPlaceCoordinates,
} from "@/shared/utils/placeDetail";
import type { AttractionDetail as Place } from "@/shared/types/attraction";

const state = vi.hoisted(() => ({
  data: undefined as Place | undefined,
  isLoading: false,
  error: null as Error | null,
  refetch: vi.fn(),
}));
vi.mock("@/shared/hooks/useAttractionQueries", () => ({
  useAttractionDetail: () => state,
  useNearbyAttractions: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock("@/components/attraction/GooglePlacePreview", () => ({
  default: () => null,
}));
const primary = "https://example.test/main.jpg";
const fixture: Place = {
  id: "fixture",
  name: "Park",
  nameLocal: "สวนทดสอบ",
  province: "เชียงใหม่",
  category: "Nature",
  rating: 0,
  reviewCount: 0,
  description: "คำอธิบาย".repeat(80),
  descriptionEn: "A real description.",
  images: [primary],
  image: primary,
  mediaCredits: [
    {
      url: primary,
      photographer: "Owner",
      licenseName: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      sourcePage: "https://example.test/source",
    },
  ],
  coordinates: { lat: 18, lng: 99 },
  tags: [],
  source: { name: "Owner", url: "https://example.test" },
};
function page(language: "th" | "en" = "th") {
  return render(
    <MemoryRouter initialEntries={["/attraction/fixture"]}>
      <Routes>
        <Route
          path="/attraction/:id"
          element={
            <AttractionDetail
              currentLanguage={language}
              onLanguageChange={vi.fn()}
              onBack={vi.fn()}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
beforeEach(() => {
  vi.restoreAllMocks();
  state.data = structuredClone(fixture);
  state.isLoading = false;
  state.error = null;
  localStorage.clear();
});
afterEach(cleanup);

describe("Place detail data and actions", () => {
  it("uses published primary, real name and description without fabricated reviews", () => {
    page();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "สวนทดสอบ"
    );
    expect(screen.getByText(fixture.description)).toBeVisible();
    expect(screen.getAllByRole("img", { name: /สวนทดสอบ/ })[0]).toHaveAttribute(
      "src",
      primary
    );
    expect(screen.queryByText(/No verified reviews/)).not.toBeInTheDocument();
  });
  it("saves persistently on the device and removes the same ID", () => {
    page();
    fireEvent.click(screen.getAllByRole("button", { name: "บันทึก" })[0]);
    expect(readSavedPlaceIds()).toEqual(["fixture"]);
    fireEvent.click(screen.getAllByRole("button", { name: "ยกเลิกบันทึก" })[0]);
    expect(readSavedPlaceIds()).toEqual([]);
  });
  it("does not claim a successful save when storage rejects the write", () => {
    const storage = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("denied");
      });
    page();
    fireEvent.click(screen.getAllByRole("button", { name: "บันทึก" })[0]);
    expect(screen.getByText(/บันทึกไม่ได้/)).toBeVisible();
    storage.mockRestore();
  });
  it("handles missing coordinates, fields and images without a zero-coordinate map", () => {
    state.data = {
      ...fixture,
      coordinates: { lat: NaN, lng: 0 },
      images: [],
      image: undefined,
      mediaCredits: [],
    };
    page();
    expect(screen.getByRole("button", { name: "ดูแผนที่" })).toBeDisabled();
    expect(screen.getByText("ยังไม่มีพิกัดที่ใช้แสดงแผนที่ได้")).toBeVisible();
    expect(
      screen.getAllByText("ยังไม่มีข้อมูลปัจจุบันที่ยืนยันได้")
    ).toHaveLength(2);
    expect(screen.getByRole("img", { name: /สวนทดสอบ/ })).toHaveAttribute(
      "src",
      "/placeholder-attraction.svg"
    );
  });
  it("does not promote an older photo if the primary lacks rights", () => {
    state.data = { ...fixture, image: "https://example.test/unlicensed.jpg" };
    page();
    expect(screen.getAllByRole("img", { name: /สวนทดสอบ/ })[0]).toHaveAttribute(
      "src",
      "/placeholder-attraction.svg"
    );
  });
  it("supports English and read more disclosure", () => {
    const view = page();
    fireEvent.click(screen.getByRole("button", { name: "อ่านเพิ่มเติม" }));
    expect(screen.getByRole("button", { name: "อ่านน้อยลง" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    view.unmount();
    page("en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Park");
    expect(screen.getByText("A real description.")).toBeVisible();
  });
  it("copies the canonical URL and opens a new planner tab with an ID reference", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    page();
    fireEvent.click(screen.getByRole("button", { name: "แชร์สถานที่" }));
    expect(writeText).toHaveBeenCalledWith(
      `${location.origin}/attraction/fixture`
    );
    const planner = screen.getByRole("link", { name: "วางแผนเที่ยวด้วย AI" });
    expect(planner).toHaveAttribute("href", "/trip-planner?place=fixture");
    expect(planner).toHaveAttribute("target", "_blank");
    expect(await screen.findByText("คัดลอกลิงก์แล้ว")).toBeVisible();
  });
  it("provides retry and loading states", () => {
    state.isLoading = true;
    const view = page();
    expect(screen.getByRole("status")).toHaveAccessibleName("กำลังโหลดสถานที่");
    view.unmount();
    state.isLoading = false;
    state.error = new Error("Unavailable");
    page();
    fireEvent.click(screen.getByRole("button", { name: "ลองใหม่" }));
    expect(state.refetch).toHaveBeenCalled();
  });
});

describe("Map access and saved data guards", () => {
  it("checks finite coordinates and ranges", () => {
    for (const point of [
      null,
      undefined,
      { lat: 0, lng: 0 },
      { lat: 91, lng: 99 },
      { lat: 18, lng: 181 },
      { lat: NaN, lng: 0 },
    ])
      expect(validPlaceCoordinates(point)).toBe(false);
    expect(validPlaceCoordinates(fixture.coordinates)).toBe(true);
  });
  it("only routes to a verified valid access point, otherwise searches by venue name", () => {
    expect(placeNavigationUrl(fixture)).toContain("/maps/search/");
    expect(
      placeNavigationUrl({
        ...fixture,
        navigation: {
          lat: 18.1,
          lng: 99.2,
          kind: "parking",
          sourceUrl: "https://example.test",
          verifiedAt: "2026-11-09",
        },
      })
    ).toContain("destination=18.1,99.2");
    expect(
      placeNavigationUrl({
        ...fixture,
        navigation: {
          lat: 999,
          lng: 99.2,
          kind: "parking",
          sourceUrl: "https://example.test",
          verifiedAt: "2026-11-09",
        },
      })
    ).toContain("/maps/search/");
  });
  it("tolerates corrupted storage and deduplicates valid IDs", () => {
    localStorage.setItem("painaidee_favorites", "{");
    expect(readSavedPlaceIds()).toEqual([]);
    localStorage.setItem("painaidee_favorites", '["one","one",1]');
    expect(readSavedPlaceIds()).toEqual(["one"]);
  });
});

it("shows an accessible empty gallery", () => {
  render(<ImageGallery images={[]} alt="Place" language="en" />);
  expect(screen.getByRole("status")).toHaveTextContent("No photos available");
});
it("replaces a broken gallery image with the shared fallback", () => {
  render(<ImageGallery images={[primary]} alt="Place" language="en" />);
  const img = screen.getByRole("img", { name: "Place · Photo 1" });
  fireEvent.error(img);
  expect(img).toHaveAttribute("src", "/placeholder-attraction.svg");
});

it("keeps a loaded image visible when only its translated alt text changes", () => {
  const view = render(<OptimizedImage src={primary} alt="รูปสถานที่" />);
  fireEvent.load(screen.getByRole("img"));
  expect(screen.getByRole("img")).toHaveClass("opacity-100");
  view.rerender(<OptimizedImage src={primary} alt="Destination photo" />);
  expect(screen.getByRole("img", { name: "Destination photo" })).toHaveClass(
    "opacity-100"
  );
});
