import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import * as Redirects from './index';
import { vi } from 'vitest';
import { useState, useEffect } from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: vi.fn(),
  };
});

const mockedUseSearchParams = useSearchParams as jest.Mock;

describe('Redirect Components', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('MapRedirect', () => {
    it('should not enter an infinite loop when a parent component re-renders', async () => {
      mockedUseSearchParams.mockImplementation(() => [new URLSearchParams()]);

      const renderSpy = vi.spyOn(Redirects, 'MapRedirect');

      // This component simulates a parent that re-renders,
      // which would cause useSearchParams to return a new object
      // and trigger the infinite loop if it's in the dependency array.
      const TestComponent = () => {
        const [, setTick] = useState(0);
        useEffect(() => {
          const timer = setTimeout(() => setTick(1), 50);
          return () => clearTimeout(timer);
        }, []);

        return (
          <MemoryRouter initialEntries={['/map/123']}>
            <Routes>
              <Route path="/map/:id" element={<Redirects.MapRedirect />} />
            </Routes>
          </MemoryRouter>
        );
      };

      render(<TestComponent />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/discover?mode=map&id=123', { replace: true });
      });

      // Give it a moment to see if navigation is called again
      await new Promise(r => setTimeout(r, 100));

      // The navigation should only be called once.
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });
});