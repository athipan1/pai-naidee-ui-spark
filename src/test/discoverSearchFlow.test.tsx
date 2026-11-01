import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import DiscoverLayout from '@/app/routes/Discover/DiscoverLayout';

vi.mock('@/shared/hooks/useAttractionQueries', () => ({
  useAllAttractions: () => ({ data: { attractions: [] } }),
}));
vi.mock('@/components/common/CategoryFilter', () => ({ default: () => null }));
vi.mock('@/components/common/EnhancedLanguageToggle', () => ({ default: () => null }));
vi.mock('@/app/routes/Discover/FeedView', () => ({ default: () => <p>Feed</p> }));
vi.mock('@/app/routes/Discover/SearchView', () => ({
  default: ({ query }: { query: string }) => <p>Search query: {query}</p>,
}));
vi.mock('@/app/routes/Discover/CategoryView', () => ({ default: () => null }));
vi.mock('@/app/routes/Discover/MapView', () => ({ default: () => null }));

function CurrentUrl() {
  const location = useLocation();
  return <output data-testid="location">{location.search}</output>;
}

describe('Discover search flow', () => {
  it('restores a deep-linked search query without requiring the feed hero', () => {
    render(
      <MemoryRouter initialEntries={['/discover?mode=search&q=%E0%B8%AD%E0%B8%B1%E0%B8%A1%E0%B8%9E%E0%B8%A7%E0%B8%B2']}>
        <DiscoverLayout currentLanguage="th" onLanguageChange={vi.fn()} />
        <CurrentUrl />
      </MemoryRouter>,
    );

    expect(screen.getByText('Search query: อัมพวา')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('mode=search');
    expect(screen.getByTestId('location')).toHaveTextContent('q=%E0%B8%AD%E0%B8%B1%E0%B8%A1%E0%B8%9E%E0%B8%A7%E0%B8%B2');
  });
});
