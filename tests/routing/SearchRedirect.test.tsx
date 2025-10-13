import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import { AppContent } from "@/app/App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the DiscoverLayout to isolate the test
vi.mock("@/app/routes/Discover/DiscoverLayout", () => ({
  default: () => <div>Discover Page</div>,
}));

// Mock ContextualSearchResults to see if it renders
vi.mock("@/app/pages/ContextualSearchResults", () => ({
    default: () => <div>Contextual Search Results Page</div>,
}));

// Mock UIProvider to avoid errors
vi.mock("@/shared/contexts/UIContext", () => ({
  useUIContext: () => ({
    isCreatePostModalOpen: false,
    closeCreatePostModal: vi.fn(),
  }),
  UIProvider: ({ children }) => <div>{children}</div>,
}));

const queryClient = new QueryClient();

describe("Legacy Search Redirect", () => {
  it("should redirect from /search to /discover with correct parameters", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search?q=test&category=temple"]}>
          <AppContent />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // After the redirect, the URL should have changed to /discover
    // and the "Discover Page" text from the mock component should be visible.
    await waitFor(() => {
      expect(screen.getByText("Discover Page")).toBeInTheDocument();
    });

    expect(screen.queryByText("Contextual Search Results Page")).not.toBeInTheDocument();
  });

  it("should redirect from /search to /discover with the new search parameter", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/search?search=new_search"]}>
          <AppContent />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Discover Page")).toBeInTheDocument();
    });
  });
});