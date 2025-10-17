import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { MapRedirect } from "./index";

const mockNavigate = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => mockUseSearchParams(),
  };
});

describe("MapRedirect Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should react to search param changes", () => {
    // Arrange
    const searchParams = new URLSearchParams("utm_source=google");
    mockUseSearchParams.mockReturnValue([searchParams]);

    const { rerender } = render(<MapRedirect />);

    // Assert pre-condition
    expect(mockNavigate).toHaveBeenCalledWith("/discover?utm_source=google&mode=map", { replace: true });

    // Act
    const newSearchParams = new URLSearchParams("utm_source=facebook");
    mockUseSearchParams.mockReturnValue([newSearchParams]);
    rerender(<MapRedirect />);

    // Assert
    expect(mockNavigate).toHaveBeenCalledWith("/discover?utm_source=facebook&mode=map", { replace: true });
  });

  it("should prioritize id from URL parameter over query parameter", () => {
    // Arrange: URL has id in both path and query string
    const initialEntries = ["/map/path-id?id=query-id"];
    const searchParams = new URLSearchParams(initialEntries[0].split("?")[1]);
    mockUseSearchParams.mockReturnValue([searchParams]);

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/map/:id" element={<MapRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert
    // The path id 'path-id' should be used, and the query id 'query-id' should be discarded.
    const correctParams = new URLSearchParams({
      mode: "map",
      id: "path-id",
    });

    expect(mockNavigate).toHaveBeenCalledWith(
      `/discover?${correctParams.toString()}`,
      { replace: true }
    );
  });
});