import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OptimizedImage from "@/components/common/OptimizedImage";

afterEach(() => vi.restoreAllMocks());

describe("OptimizedImage cached completion", () => {
  it("shows an image already loaded before its mount effect runs", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(
      true
    );
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(
      960
    );
    render(<OptimizedImage src="/cached.jpg" alt="Cached destination" />);
    expect(screen.getByRole("img", { name: "Cached destination" })).toHaveClass(
      "opacity-100"
    );
  });

  it("does not mark a replacement source loaded using the previous cached image", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockImplementation(
      function (this: HTMLImageElement) {
        return this.getAttribute("src") === "/cached.jpg";
      }
    );
    vi.spyOn(
      HTMLImageElement.prototype,
      "naturalWidth",
      "get"
    ).mockImplementation(function (this: HTMLImageElement) {
      return this.getAttribute("src") === "/cached.jpg" ? 960 : 0;
    });
    const view = render(<OptimizedImage src="/cached.jpg" alt="Destination" />);
    view.rerender(<OptimizedImage src="/pending.jpg" alt="Destination" />);
    const image = screen.getByRole("img", { name: "Destination" });
    expect(image).toHaveAttribute("src", "/pending.jpg");
    expect(image).toHaveClass("opacity-0");
    fireEvent.load(image);
    expect(image).toHaveClass("opacity-100");
  });
});
