import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate, useLocation } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { useDiscoveryState } from "@/app/routes/Discover/hooks/useDiscoveryState";

function Harness() {
  const { state, setQuery, setSearchFilters } = useDiscoveryState();
  const navigate = useNavigate();
  const { search } = useLocation();
  return (
    <>
      <output data-testid="state">{JSON.stringify(state)}</output>
      <output data-testid="url">{search}</output>
      <button onClick={() => setQuery("ภูมโนรมย์")}>Search</button>
      <button
        onClick={() =>
          setSearchFilters({ category: "Culture", province: "มุกดาหาร" })
        }
      >
        Filter
      </button>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
    </>
  );
}

describe("discovery URL is the source of truth", () => {
  it("preserves unrelated params and view, resets page for filters, and follows history", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={[
          "/discover?mode=search&q=old&page=3&view=map&utm_source=test",
        ]}
      >
        <Harness />
      </MemoryRouter>
    );
    await user.click(screen.getByText("Filter"));
    expect(screen.getByTestId("state")).toHaveTextContent("มุกดาหาร");
    expect(screen.getByTestId("url")).not.toHaveTextContent("page=");
    expect(screen.getByTestId("url")).toHaveTextContent("view=map");
    expect(screen.getByTestId("url")).toHaveTextContent("utm_source=test");
    await user.click(screen.getByText("Search"));
    expect(screen.getByTestId("state")).toHaveTextContent("ภูมโนรมย์");
    expect(screen.getByTestId("state")).toHaveTextContent("Culture");
    await user.click(screen.getByText("Back"));
    expect(screen.getByTestId("state")).toHaveTextContent('"query":"old"');
    await user.click(screen.getByText("Back"));
    expect(screen.getByTestId("url")).toHaveTextContent("page=3");
    expect(screen.getByTestId("state")).toHaveTextContent('"province":""');
    await user.click(screen.getByText("Forward"));
    expect(screen.getByTestId("state")).toHaveTextContent("มุกดาหาร");
  });
  it("defaults invalid mode to searchable discovery", () => {
    render(
      <MemoryRouter initialEntries={["/discover?mode=invalid"]}>
        <Harness />
      </MemoryRouter>
    );
    expect(screen.getByTestId("state")).toHaveTextContent('"mode":"search"');
  });
});
