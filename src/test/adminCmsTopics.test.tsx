import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import AdminCms from '@/app/pages/AdminCms';

vi.mock('@/app/pages/AdminCoordinatePicker', () => ({ default: () => <div>แผนที่ทดสอบ</div> }));
vi.mock('@/components/admin/ProvinceQualityDashboard', () => ({ default: () => null }));

describe('Admin CMS topic and category controls', () => {
  beforeEach(() => {
    sessionStorage.setItem('painaidee.admin.token', 'fixture-token');
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const pathname = new URL(String(input)).pathname;
      const body = pathname.endsWith('/me') ? { role: 'admin', email: 'fixture@example.test' }
        : pathname.endsWith('/taxonomy') ? { categories: ['Nature', 'Culture'], tags: ['Viewpoint', 'Mountain'] }
        : pathname.endsWith('/places') && options?.method === 'POST'
          ? { id: 'new-draft', status: 'draft', payload: JSON.parse(String(options.body)), version: '1234567890.000001' }
          : pathname.endsWith('/places') ? { drafts: [] }
          : pathname.endsWith('/catalog') ? { places: [], total: 0 }
          : { status: 'ok' };
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }));
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('chooses a category, adds existing and custom topics, and previews removal before save', async () => {
    const user = userEvent.setup();
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter><AdminCms /></MemoryRouter>
    </QueryClientProvider>);
    await user.click(await screen.findByRole('button', { name: 'เพิ่ม / แก้ไข' }));
    const category = screen.getByRole('combobox', { name: 'เลือกหมวดหมู่สถานที่' });
    await user.selectOptions(category, 'Nature');
    expect(category).toHaveValue('Nature');

    const topics = screen.getByRole('region', { name: 'จัดการหัวข้อที่เกี่ยวข้อง' });
    await user.click(await within(topics).findByRole('button', { name: '+ จุดชมวิว' }));
    const input = within(topics).getByRole('textbox', { name: 'พิมพ์หัวข้อที่เกี่ยวข้อง' });
    await user.type(input, 'ทะเลหมอก{Enter}');
    const preview = within(topics).getByLabelText('ตัวอย่างหัวข้อที่จะเผยแพร่');
    expect(within(preview).getByText('จุดชมวิว')).toBeInTheDocument();
    expect(within(preview).getByText('ทะเลหมอก')).toBeInTheDocument();
    await user.click(within(preview).getByRole('button', { name: 'ลบหัวข้อ จุดชมวิว' }));
    expect(within(preview).queryByText('จุดชมวิว')).not.toBeInTheDocument();
    expect(within(preview).getByText('ทะเลหมอก')).toBeInTheDocument();
  });
});
