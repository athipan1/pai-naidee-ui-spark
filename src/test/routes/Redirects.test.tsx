import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CategoryRedirect, SearchRedirect } from '@/app/routes/Redirects';

// Mock the useNavigate hook
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe('Redirect Components', () => {
  it('routes a legacy search to discover with its query intact', () => {
    render(
      <MemoryRouter initialEntries={['/search?search=%E0%B9%80%E0%B8%8A%E0%B8%B5%E0%B8%A2%E0%B8%87%E0%B9%83%E0%B8%AB%E0%B8%A1%E0%B9%88']}>
        <Routes><Route path="/search" element={<SearchRedirect />} /></Routes>
      </MemoryRouter>
    );
    const [url, options] = mockedNavigate.mock.calls.at(-1)!;
    expect(options).toEqual({ replace: true });
    expect(url).toContain('mode=search');
    expect(new URLSearchParams(url.split('?')[1]).get('q')).toBe('เชียงใหม่');
  });
  it('CategoryRedirect should handle legacy search query parameter correctly', () => {
    const route = '/category/temples?search=';
    render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/discover?cat=temples', { replace: true });
  });
});
