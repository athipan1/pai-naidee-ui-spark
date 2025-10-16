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
});