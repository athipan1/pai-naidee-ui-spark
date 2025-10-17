import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CategoryRedirect } from '@/app/routes/Redirects';

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