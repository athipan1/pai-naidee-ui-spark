import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CategoryView from './CategoryView';
import * as AttractionService from '@/services/attraction.service';

// Mock services
vi.mock('@/services/attraction.service');

// Mock components
vi.mock('@/components/common/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock('@/components/common/AttractionCard', () => ({
  default: ({
    name,
    nameLocal,
    currentLanguage,
    onCardClick,
    id,
  }: {
    name: string;
    nameLocal: string;
    currentLanguage: 'en' | 'th';
    onCardClick: (id: string) => void;
    id: string;
  }) => (
    <div data-testid="attraction-card" onClick={() => onCardClick(id)}>
      {currentLanguage === 'th' ? nameLocal : name}
    </div>
  ),
}));

const mockBeachAttractions = [
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
];

describe('CategoryView Component', () => {
  const renderComponent = (category: string, language: 'en' | 'th' = 'en') => {
    return render(
      <MemoryRouter initialEntries={[`/discover/category/${category}`]}>
        <Routes>
          <Route
            path="/discover/category/:category"
            element={<CategoryView currentLanguage={language} category={category} />}
          />
          <Route path="/attraction/:id" element={<div>Attraction Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('should display a loading spinner while fetching data', async () => {
    vi.mocked(AttractionService.getAttractions).mockReturnValue(new Promise(() => {})); // Never resolves

    renderComponent('Beach');

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display attraction cards in English when data is fetched successfully', async () => {
    vi.mocked(AttractionService.getAttractions).mockResolvedValue(mockBeachAttractions as any);

    renderComponent('Beach', 'en');

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const attractionCards = screen.getAllByTestId('attraction-card');
    expect(attractionCards).toHaveLength(2);
    expect(screen.getByText('Phi Phi Islands')).toBeInTheDocument();
    expect(screen.getByText('Phuket Beach')).toBeInTheDocument();
  });

  it('should display attraction cards in Thai when data is fetched successfully', async () => {
    vi.mocked(AttractionService.getAttractions).mockResolvedValue(mockBeachAttractions as any);

    renderComponent('Beach', 'th');

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const attractionCards = screen.getAllByTestId('attraction-card');
    expect(attractionCards).toHaveLength(2);
    expect(screen.getByText('หมู่เกาะพีพี')).toBeInTheDocument();
    expect(screen.getByText('หาดภูเก็ต')).toBeInTheDocument();
  });

  it('should display an empty state message when no attractions are found', async () => {
    vi.mocked(AttractionService.getAttractions).mockResolvedValue([]);

    renderComponent('Unpopular Category');

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No places found in this category')).toBeInTheDocument();
  });

  it('should navigate to the attraction detail page when an attraction card is clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(AttractionService.getAttractions).mockResolvedValue(mockBeachAttractions as any);

    renderComponent('Beach');

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    const firstCard = screen.getByText('Phi Phi Islands');
    await user.click(firstCard);

    await waitFor(() => {
      expect(screen.getByText('Attraction Page')).toBeInTheDocument();
    });
  });
});