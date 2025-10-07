import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttractionCard from '@/components/common/AttractionCard';
import { describe, it, expect, vi } from 'vitest';

// Mock the OptimizedImage component to simplify testing and avoid dealing with actual image loading
vi.mock('@/components/common/OptimizedImage', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => <img src={src} alt={alt} {...props} />,
}));

// Mock the showToast module as it's not relevant to this component's rendering logic
vi.mock('@/components/common/EnhancedToast', () => ({
  showToast: {
    shared: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    addedToFavorites: vi.fn(),
    removedFromFavorites: vi.fn(),
  },
}));

describe('AttractionCard Component', () => {
  const mockProps = {
    id: '123',
    name: 'Test Attraction',
    nameLocal: 'สถานที่ทดสอบ',
    province: 'Test Province',
    category: 'Beach',
    rating: 4.5,
    reviewCount: 100,
    description: 'A test description.',
    tags: ['Test', 'Tag'],
    isFavorite: false,
    currentLanguage: 'en' as const,
    onFavoriteToggle: vi.fn(),
    onCardClick: vi.fn(),
  };

  it('should display the correct image from the provided image prop', () => {
    const imageUrl = 'https://example.com/real-image.jpg';
    render(<AttractionCard {...mockProps} image={imageUrl} />);

    const imageElement = screen.getByAltText(mockProps.name);
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', imageUrl);
  });

  it('should display the fallback image when a placeholder URL is provided', () => {
    const fallbackImageUrl = 'https://via.placeholder.com/400x250?text=No+Image';
    render(<AttractionCard {...mockProps} image={fallbackImageUrl} />);

    const imageElement = screen.getByAltText(mockProps.name);
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute('src', fallbackImageUrl);
  });

  it('should display the Thai name when current language is "th"', () => {
    render(<AttractionCard {...mockProps} image="test.jpg" currentLanguage="th" />);

    // Check for the display name in the heading
    const headingElement = screen.getByRole('heading', { name: mockProps.nameLocal });
    expect(headingElement).toBeInTheDocument();

    // Check that the image alt text also uses the correct display name
    const imageElement = screen.getByAltText(mockProps.nameLocal);
    expect(imageElement).toBeInTheDocument();
  });
});