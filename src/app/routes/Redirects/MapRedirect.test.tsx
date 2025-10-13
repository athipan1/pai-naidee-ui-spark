import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}{location.search}</div>;
}

describe("MapRedirect Component", () => {
  it("should redirect from /map/:id to /discover?mode=map&id=:id", () => {
    // Arrange
    render(
      <MemoryRouter initialEntries={["/map/123"]}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
          <Route path="/discover" element={<LocationDisplay />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?mode=map&id=123", { replace: true });
  });
});