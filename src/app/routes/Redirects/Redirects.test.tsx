import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ExploreRedirect, MapRedirect, SearchRedirect, ProfileRedirect, CategoryRedirect } from "./index";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// This component is used to verify the destination of the redirect.
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}{location.search}</div>;
}

describe("MapRedirect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect from /map/:id to /discover?mode=map&id=:id", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/map/456"]}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
          <Route path="/discover" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?mode=map&id=456", { replace: true });
  });

  it("should forward the id from query params when redirecting from /map?id=:id", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/map?id=123"]}>
        <Routes>
          <Route path="/map" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    const [redirectUrl] = mockNavigate.mock.calls[0];
    const url = new URL(redirectUrl, "http://localhost");
    expect(url.pathname).toBe("/discover");
    expect(url.searchParams.get("mode")).toBe("map");
    expect(url.searchParams.get("id")).toBe("123");
  });

  it("should redirect to /discover?mode=map when no id is present", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/map"]}>
        <Routes>
          <Route path="/map" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?mode=map", { replace: true });
  });

  it("should not include the id in the redirect if the id is the string 'null'", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/map/null"]}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?mode=map", { replace: true });
  });

  it("should preserve extra query parameters", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/map/123?utm_source=google"]}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?utm_source=google&mode=map&id=123", { replace: true });
  });

  it("should only call navigate once", () => {
    // Arrange
    const { rerender } = render(
      <MemoryRouter initialEntries={["/map/123"]}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Act
    rerender(
      <MemoryRouter initialEntries={["/map/123"]}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });
});

describe("SearchRedirect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect from /search?search=test to /discover?mode=search&q=test", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/search?search=test"]}>
        <Routes>
          <Route path="/search" element={<SearchRedirect />} />
          <Route path="/discover" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    const [redirectUrl] = mockNavigate.mock.calls[0];
    const url = new URL(redirectUrl, "http://localhost");
    expect(url.pathname).toBe("/discover");
    expect(url.searchParams.get("mode")).toBe("search");
    expect(url.searchParams.get("q")).toBe("test");
  });

  it("should preserve extra query parameters", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/search?q=test&utm_source=facebook"]}>
        <Routes>
          <Route path="/search" element={<SearchRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?q=test&utm_source=facebook&mode=search", { replace: true });
  });

  it("should remove legacy 'search' and 'category' parameters from the final URL", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/search?search=legacy-query&category=legacy-cat"]}>
        <Routes>
          <Route path="/search" element={<SearchRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    const [redirectUrl] = mockNavigate.mock.calls[0];
    const url = new URL(redirectUrl, "http://localhost");
    expect(url.searchParams.has("search")).toBe(false);
    expect(url.searchParams.has("category")).toBe(false);
    expect(url.searchParams.get("q")).toBe("legacy-query");
    expect(url.searchParams.get("cat")).toBe("legacy-cat");
  });

  it("should remove empty 'q' parameter from the final URL", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/search?q="]}>
        <Routes>
          <Route path="/search" element={<SearchRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    const [redirectUrl] = mockNavigate.mock.calls[0];
    const url = new URL(redirectUrl, "http://localhost");
    expect(url.searchParams.has("q")).toBe(false);
  });
});

describe("ProfileRedirect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect from /profile to /me", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route path="/profile" element={<ProfileRedirect />} />
          <Route path="/me" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/me", { replace: true });
  });
});

describe("CategoryRedirect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect from /category/:categoryName to /discover?cat=:categoryName", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/category/temples"]}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryRedirect />} />
          <Route path="/discover" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?cat=temples", { replace: true });
  });

  it("should preserve extra query parameters", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/category/temples?utm_source=google"]}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?utm_source=google&cat=temples", { replace: true });
  });

  it("should redirect to /discover without a trailing '?' even if categoryName is missing and there are no other params", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/category-legacy"]}>
        <Routes>
          {/* Test the component directly, not just the App's routing */}
          <Route path="/category-legacy" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    // The buggy implementation would redirect to "/discover?", but we want "/discover"
    expect(mockNavigate).toHaveBeenCalledWith("/discover", { replace: true });
  });

  it("should handle legacy 'search' parameter", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/category/temples?search=ancient"]}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    const [redirectUrl] = mockNavigate.mock.calls[0];
    const url = new URL(redirectUrl, "http://localhost");
    expect(url.pathname).toBe("/discover");
    expect(url.searchParams.get("cat")).toBe("temples");
    expect(url.searchParams.get("q")).toBe("ancient");
    expect(url.searchParams.get("mode")).toBe("search");
    expect(url.searchParams.has("search")).toBe(false);
  });

  it("should remove legacy 'category' parameter from the final URL", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/category/temples?category=museums"]}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    const [redirectUrl] = mockNavigate.mock.calls[0];
    const url = new URL(redirectUrl, "http://localhost");
    expect(url.searchParams.has("category")).toBe(false);
    expect(url.searchParams.get("cat")).toBe("temples");
  });
});

describe("ExploreRedirect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect from /explore to /discover", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/explore"]}>
        <Routes>
          <Route path="/explore" element={<ExploreRedirect />} />
          <Route path="/discover" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover", { replace: true });
  });

  it("should preserve query parameters when redirecting", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/explore?q=test&utm_source=email"]}>
        <Routes>
          <Route path="/explore" element={<ExploreRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?q=test&utm_source=email", { replace: true });
  });
});