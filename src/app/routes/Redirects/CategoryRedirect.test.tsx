import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CategoryRedirect } from './index';
import { vi } from 'vitest';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CategoryRedirect', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('should redirect to /discover with the correct category parameter', () => {
    render(
      <MemoryRouter initialEntries={['/category/temples']}>
        <Routes>
          <Route path="/category/:categoryName" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/discover?cat=temples', { replace: true });
  });

  it('should redirect to /discover when category is an empty string', () => {
    render(
      <MemoryRouter initialEntries={['/category/']}>
        <Routes>
          <Route path="/category/:categoryName?" element={<CategoryRedirect />} />
        </Routes>
      </MemoryRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/discover', { replace: true });
  });
});