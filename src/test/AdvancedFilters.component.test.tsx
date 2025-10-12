import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdvancedFilters, { FilterState } from '@/components/search/AdvancedFilters';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

const initialFilters: FilterState = {
  priceRange: 'all',
  maxDistance: 50,
  categories: [],
  minRating: 0,
  sortBy: 'relevance',
};

const mockProps = {
  currentLanguage: 'en' as const,
  filters: initialFilters,
  onFiltersChange: vi.fn(),
  onApplyFilters: vi.fn(),
  isOpen: true,
  onToggle: vi.fn(),
};

describe('AdvancedFilters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial props', () => {
    render(<AdvancedFilters {...mockProps} />);
    expect(screen.getByRole('heading', { name: /advanced filters/i })).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('Place Categories')).toBeInTheDocument();
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument();
    expect(screen.getByText('Sort By')).toBeInTheDocument();
  });

  it('updates price range, applies, and calls onFiltersChange', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} />);

    const priceSelectTrigger = screen.getByRole('combobox', { name: /price range/i });
    await user.click(priceSelectTrigger);

    const freeOption = await screen.findByText('Free');
    await user.click(freeOption);

    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    await user.click(applyButton);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ priceRange: 'free' })
    );
    expect(mockProps.onApplyFilters).toHaveBeenCalled();
  });

  it('updates distance slider and displays the correct value', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} />);
    const sliders = screen.getAllByRole('slider');
    const distanceSlider = sliders.find(s => s.getAttribute('aria-valuemax') === '50');

    expect(distanceSlider).toBeInTheDocument();
    expect(screen.getByText('Any Distance')).toBeInTheDocument();

    distanceSlider.focus();
    // Simulate moving the slider down by one step
    await user.keyboard('{ArrowLeft}');

    await waitFor(() => {
      expect(screen.getByText('49 km')).toBeInTheDocument();
    });
  });

  it('toggles categories, applies, and calls onFiltersChange', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} />);

    const categoryCheckbox = screen.getByLabelText('Beach');
    await user.click(categoryCheckbox);

    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    await user.click(applyButton);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['beach'] })
    );
    expect(mockProps.onApplyFilters).toHaveBeenCalled();
  });

  it('updates sort by, applies, and calls onFiltersChange', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} />);

    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    await user.click(sortSelect);

    const lowToHighOption = await screen.findByText('Price: Low to High');
    await user.click(lowToHighOption);

    const applyButton = screen.getByRole('button', { name: /apply filters/i });
    await user.click(applyButton);

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: 'price-low' })
    );
    expect(mockProps.onApplyFilters).toHaveBeenCalled();
  });

  it('resets filters when "Reset" is clicked', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} />);

    // First, change a filter
    const categoryCheckbox = screen.getByLabelText('Beach');
    await user.click(categoryCheckbox);

    // Now, click the reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    const expectedResetState = {
      priceRange: 'all',
      maxDistance: 50,
      categories: [],
      minRating: 0,
      sortBy: 'relevance',
    };

    expect(mockProps.onFiltersChange).toHaveBeenCalledWith(expectedResetState);
  });

  it('calls onToggle when the trigger is clicked', async () => {
    const user = userEvent.setup();
    // Start with the panel closed
    render(<AdvancedFilters {...mockProps} isOpen={false} />);

    const trigger = screen.getByRole('button', { name: /advanced filters/i });
    await user.click(trigger);

    expect(mockProps.onToggle).toHaveBeenCalled();
  });

  it('displays the correct number of active filters in the badge', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} isOpen={true} />);

    // No badge initially
    const triggerButton = screen.getByRole('button', { name: /advanced filters/i });
    expect(triggerButton.querySelector('.ml-2')).toBeNull();

    // Change two filters
    const priceSelectTrigger = screen.getByRole('combobox', { name: /price range/i });
    await user.click(priceSelectTrigger);
    const freeOption = await screen.findByText('Free');
    await user.click(freeOption);

    const categoryCheckbox = screen.getByLabelText('Beach');
    await user.click(categoryCheckbox);

    // Badge should now be visible with count 2
    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });
  });

  it('updates rating slider and displays the correct value', async () => {
    const user = userEvent.setup();
    render(<AdvancedFilters {...mockProps} />);
    const sliders = screen.getAllByRole('slider');
    const ratingSlider = sliders.find(s => s.getAttribute('aria-valuemax') === '5');

    expect(ratingSlider).toBeInTheDocument();

    ratingSlider.focus();
    await user.keyboard('{ArrowRight}');

    await waitFor(() => {
      expect(screen.getByText('0.5 stars & up')).toBeInTheDocument();
    });
  });
});