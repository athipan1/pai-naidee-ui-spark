import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { MapRedirect, SearchRedirect, ProfileRedirect, CategoryRedirect } from "./index";

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
});