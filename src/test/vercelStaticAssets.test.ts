import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8'));

describe('Vercel SPA routing', () => {
  it('serves real public assets before applying the SPA index fallback', () => {
    const filesystem = config.routes.findIndex((route: { handle?: string }) => route.handle === 'filesystem');
    const catchAll = config.routes.findIndex((route: { src?: string }) => route.src === '/(.*)');
    expect(filesystem).toBeGreaterThan(0);
    expect(catchAll).toBeGreaterThan(filesystem);
    const svg = readFileSync(resolve(process.cwd(), 'public/placeholder-attraction.svg'), 'utf8');
    expect(svg).toContain('<svg');
  });
});
