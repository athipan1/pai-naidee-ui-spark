import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoryView from './CategoryView';
import * as AttractionService from '@/services/attraction.service';

// Mock the attractionService specifically, providing a mock implementation
vi.mock('@/services/attraction.service', () => ({
  attractionService: {
    getAttractions: vi.fn(),
  },
}));

// Mock child components
vi.mock('@/components/common/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/common/AttractionCard', () => ({
  default: ({ name, nameLocal, currentLanguage, onCardClick, id }: any) => (
    <div data-testid="attraction-card" onClick={() => onCardClick(id)}>
      {currentLanguage === 'th' ? nameLocal : name}
    </div>
  ),
}));

const mockAttractionsResponse = {
  attractions: [
    {
      id: '1',
      name: 'Phi Phi Islands',
      nameLocal: 'หมู่เกาะพีพี',
      province: 'Krabi',
      category: 'Beach',
      rating: 4.8,
      reviewCount: 2547,
      image: 'phi_phi_islands.jpg',
      description: 'Beautiful islands.',
      tags: ['Beach', 'Snorkeling'],
    },
    {
      id: '5',
      name: 'Phuket Beach',
      nameLocal: 'หาดภูเก็ต',
      province: 'Phuket',
      category: 'Beach',
      rating: 4.6,
      reviewCount: 3421,
      image: 'phuket_beach.jpg',
      description: 'A famous beach.',
      tags: ['Beach', 'Sunset'],
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
};

// Function to create a new query client for each test
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

// Wrapper component to provide necessary context for rendering
const renderWithProviders = (
  ui: React.ReactElement,
  { route = '/', path = '/' } = {}
) => {
  const testQueryClient = createTestQueryClient();
  window.history.pushState({}, 'Test page', route);

  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path={path} element={ui} />
          <Route path="/attraction/:id" element={<div>Attraction Detail Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};


const mockedAttractionService = vi.mocked(AttractionService.attractionService);

describe('CategoryView Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockedAttractionService.getAttractions.mockClear();
  });

  it('should display a loading spinner while fetching data', () => {
    // Mock a promise that never resolves to keep it in a loading state
    mockedAttractionService.getAttractions.mockReturnValue(new Promise(() => {}));

    renderWithProviders(
      <CategoryView currentLanguage="en" category="Beach" />,
      { route: '/discover/category/Beach', path: '/discover/category/:category' }
    );

    // Check for the presence of the loading skeleton container
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should display attraction cards in English when data is fetched successfully', async () => {
    mockedAttractionService.getAttractions.mockResolvedValue(mockAttractionsResponse as any);

    renderWithProviders(
      <CategoryView currentLanguage="en" category="Beach" />,
      { route: '/discover/category/Beach', path: '/discover/category/:category' }
    );

    // Wait for the loading spinner to disappear and cards to appear
    expect(await screen.findByText('Phi Phi Islands')).toBeInTheDocument();
    expect(screen.getByText('Phuket Beach')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should display attraction cards in Thai when data is fetched successfully', async () => {
    mockedAttractionService.getAttractions.mockResolvedValue(mockAttractionsResponse as any);

    renderWithProviders(
      <CategoryView currentLanguage="th" category="Beach" />,
      { route: '/discover/category/Beach', path: '/discover/category/:category' }
    );

    expect(await screen.findByText('หมู่เกาะพีพี')).toBeInTheDocument();
    expect(screen.getByText('หาดภูเก็ต')).toBeInTheDocument();
  });

  it('should display an empty state message when no attractions are found', async () => {
    mockedAttractionService.getAttractions.mockResolvedValue({ attractions: [], total: 0, page: 1, limit: 10 });

    renderWithProviders(
      <CategoryView currentLanguage="en" category="Unpopular" />,
      { route: '/discover/category/Unpopular', path: '/discover/category/:category' }
    );

    expect(await screen.findByText('No places found in this category')).toBeInTheDocument();
  });

  it('should navigate to the attraction detail page when an attraction card is clicked', async () => {
    const user = userEvent.setup();
    mockedAttractionService.getAttractions.mockResolvedValue(mockAttractionsResponse as any);

    renderWithProviders(
      <CategoryView currentLanguage="en" category="Beach" />,
      { route: '/discover/category/Beach', path: '/discover/category/:category' }
    );

    // Wait for the card to be available and then click it
    const firstCard = await screen.findByText('Phi Phi Islands');
    await user.click(firstCard);

    // Check if navigation was successful
    expect(await screen.findByText('Attraction Detail Page')).toBeInTheDocument();
  });
});