import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PlaceCard from "@/components/discover/PlaceCard";

const mockPlace = {
  id: "1",
  name: "Test Place",
  province: "Test Province",
  category: "Test Category",
  rating: 4,
  reviewCount: 12345,
  image: "https://via.placeholder.com/150",
  description: "A test description.",
};

describe("PlaceCard Component", () => {
  it("should format an integer rating to one decimal place", () => {
    // Arrange
    render(<PlaceCard {...mockPlace} currentLanguage="en" />);

    // Assert
    // The component should display "4.0" for a rating of 4.
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });
});