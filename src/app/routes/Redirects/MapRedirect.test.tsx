import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { MapRedirect } from "./index";

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
    expect(mockNavigate).toHaveBeenCalledWith("/discover?mode=map&id=123", { replace: true });
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
});