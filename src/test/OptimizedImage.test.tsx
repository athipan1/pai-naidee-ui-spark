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

it('selects CMS variants for the presentation size and keeps legacy URLs intact', () => {
  const base = 'https://painaidee-api-production.up.railway.app/api/media/cms/';
  const original = base + '00111111-1111-8111-8111-111111111111.jpg';
  const legacy = base + '00111111-1111-4111-8111-111111111111.jpg';
  const { rerender } = render(<OptimizedImage src={original} alt="CMS image" width={56} height={56} />);
  const image = screen.getByRole('img', { name: 'CMS image' });
  expect(image).toHaveAttribute('srcset', `${original}?w=256 256w`);
  expect(image).toHaveAttribute('sizes', '56px');
  expect(image).toHaveAttribute('loading', 'lazy');
  rerender(<OptimizedImage src={original} alt="CMS image" width={1200} height={750} loading="eager" fetchPriority="high" sizes="100vw" />);
  expect(image).toHaveAttribute('srcset', ` ${original}?w=256 256w, ${original}?w=640 640w, ${original}?w=1200 1200w`.trim());
  expect(image).toHaveAttribute('fetchpriority', 'high');
  rerender(<OptimizedImage src={legacy} alt="CMS image" />);
  expect(image).toHaveAttribute('src', legacy);
  expect(image).not.toHaveAttribute('srcset');
});

it('falls back without replaying failed CMS variants', () => {
  render(<OptimizedImage src="https://painaidee-api-production.up.railway.app/api/media/cms/00111111-1111-8111-8111-111111111111.jpg" alt="Place" />);
  const image = screen.getByRole('img', { name: 'Place' });
  fireEvent.error(image);
  expect(image).not.toHaveAttribute('srcset');
  expect(image).toHaveAttribute('src', '/placeholder-attraction.svg');
  fireEvent.error(image);
  expect(screen.getByText('Image unavailable')).toBeInTheDocument();
});
