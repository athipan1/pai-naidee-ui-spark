import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OptimizedImage from '@/components/common/OptimizedImage';

describe('OptimizedImage', () => {
  it('never hides a lazy image with display:none while waiting for it to load', () => {
    render(<OptimizedImage src="https://example.org/real.jpg" alt="อ่าวนาง" loading="lazy" />);
    const image = screen.getByRole('img', { name: 'อ่าวนาง' });
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).not.toHaveClass('hidden');
    fireEvent.load(image);
    expect(image).toHaveClass('opacity-100');
  });

  it('falls back to a real local SVG when the requested image fails', () => {
    render(<OptimizedImage src="https://example.org/missing.jpg" alt="Unknown place" />);
    const image = screen.getByRole('img', { name: 'Unknown place' });
    fireEvent.error(image);
    expect(image).toHaveAttribute('src', '/placeholder-attraction.svg');
  });

  it('uses a local SVG immediately when the API returns no photo', () => {
    render(<OptimizedImage src="" alt="Unnamed place" />);
    expect(screen.getByRole('img', { name: 'Unnamed place' })).toHaveAttribute('src', '/placeholder-attraction.svg');
  });

  it('resets its image source when the place changes', () => {
    const { rerender } = render(<OptimizedImage src="https://example.org/first.jpg" alt="One" />);
    rerender(<OptimizedImage src="https://example.org/second.jpg" alt="Two" />);
    expect(screen.getByRole('img', { name: 'Two' })).toHaveAttribute('src', 'https://example.org/second.jpg');
  });
});
