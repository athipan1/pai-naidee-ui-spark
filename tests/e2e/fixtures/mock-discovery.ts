import type { Route } from '@playwright/test';

type Entry = { id: string; province: string; category: string; categories?: string[]; publishedAt?: string };
export async function mockDiscovery<T extends Entry>(route: Route, entries: T[]): Promise<boolean> {
  const path = new URL(route.request().url()).pathname;
  if (path.endsWith('/discovery-index')) {
    await route.fulfill({ json: { entries: entries.map(p => ({
      id:p.id, province:p.province, category:p.category, categories:p.categories || [p.category],
      publishedAt:p.publishedAt || '2020-01-01T00:00:00Z',
    })), nextCursor:null } });
    return true;
  }
  if (path.endsWith('/discovery-batch')) {
    const ids = route.request().postDataJSON().ids as string[];
    await route.fulfill({json:{attractions:ids.flatMap(id=>entries.filter(p=>p.id===id))}});
    return true;
  }
  return false;
}
