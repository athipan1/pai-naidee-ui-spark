import { render } from '@testing-library/react';
import { describe, it, vi, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MapRedirect, SearchRedirect, CategoryRedirect } from './index';

// Mock useNavigate from react-router-dom
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Redirect Components', () => {
  // Clear mock history before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MapRedirect', () => {
    it('should preserve existing query parameters on redirect', () => {
      render(
        <MemoryRouter initialEntries={['/map?id=123&existing=param']}>
          <Routes>
            <Route path="/map" element={<MapRedirect />} />
          </Routes>
        </MemoryRouter>
      );

      // Check that navigate was called and capture the URL
      expect(mockedNavigate).toHaveBeenCalled();
      const redirectUrl = new URL(mockedNavigate.mock.calls[0][0], 'http://localhost');

      // Verify the path and parameters independently of order
      expect(redirectUrl.pathname).toBe('/discover');
      expect(redirectUrl.searchParams.get('mode')).toBe('map');
      expect(redirectUrl.searchParams.get('id')).toBe('123');
      expect(redirectUrl.searchParams.get('existing')).toBe('param');

      // Verify the replace option
      expect(mockedNavigate).toHaveBeenCalledWith(
        expect.any(String),
        { replace: true }
      );
    });
  });

  describe('SearchRedirect', () => {
    it('should preserve existing query parameters on redirect', () => {
      render(
        <MemoryRouter initialEntries={['/search?q=test&existing=param']}>
          <Routes>
            <Route path="/search" element={<SearchRedirect />} />
          </Routes>
        </MemoryRouter>
      );

      // Check that navigate was called and capture the URL
      expect(mockedNavigate).toHaveBeenCalled();
      const redirectUrl = new URL(mockedNavigate.mock.calls[0][0], 'http://localhost');

      // Verify the path and parameters independently of order
      expect(redirectUrl.pathname).toBe('/discover');
      expect(redirectUrl.searchParams.get('mode')).toBe('search');
      expect(redirectUrl.searchParams.get('q')).toBe('test');
      expect(redirectUrl.searchParams.get('existing')).toBe('param');
    });
  });

  describe('CategoryRedirect', () => {
    it('should preserve existing query parameters on redirect', () => {
      render(
        <MemoryRouter initialEntries={['/category/cafes?existing=param']}>
          <Routes>
            <Route path="/category/:categoryName" element={<CategoryRedirect />} />
          </Routes>
        </MemoryRouter>
      );

      // Check that navigate was called and capture the URL
      expect(mockedNavigate).toHaveBeenCalled();
      const redirectUrl = new URL(mockedNavigate.mock.calls[0][0], 'http://localhost');

      // Verify the path and parameters independently of order
      expect(redirectUrl.pathname).toBe('/discover');
      expect(redirectUrl.searchParams.get('cat')).toBe('cafes');
      expect(redirectUrl.searchParams.get('existing')).toBe('param');
    });
  });
});