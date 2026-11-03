import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import TripPlanner from '@/app/pages/TripPlanner';

vi.mock('@/services/railway-api.service', () => ({
  getRailwayPlaceFacets: vi.fn(async () => ({ provinces: ['เชียงใหม่'], categories: [] })),
}));
vi.mock('@/app/pages/TripTimelineMap', () => ({ default: () => null }));

const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');

afterEach(() => {
  cleanup();
  if (originalScrollIntoView) {
    Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
  } else {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  }
});

function mountChat() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TripPlanner currentLanguage="th" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Trip Planner chat lifecycle', () => {
  it('does not treat scrollIntoView return values as a React effect cleanup on new chat', async () => {
    // Some browser integrations return a Promise rather than undefined.
    // React must never attempt to call that return value as an effect cleanup.
    const scrollIntoView = vi.fn(() => Promise.resolve());
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    mountChat();
    fireEvent.click(screen.getByRole('button', { name: 'เริ่มแชตใหม่' }));

    expect(screen.getByRole('heading', { name: 'อยากไปเที่ยวที่ไหน?' })).toBeVisible();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('keeps the chat usable when the browser refuses to scroll', async () => {
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(() => { throw new Error('scroll refused'); }),
    });

    mountChat();
    fireEvent.change(screen.getByRole('textbox', { name: 'ข้อความถึง PaiNaiDee AI' }), {
      target: { value: 'สวัสดี' },
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'ส่งข้อความ' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'ส่งข้อความ' }));

    expect(await screen.findByText('อยากไปเที่ยวจังหวัดไหนครับ?')).toBeVisible();
    expect(screen.getByText('สวัสดี')).toBeVisible();
  });
});
