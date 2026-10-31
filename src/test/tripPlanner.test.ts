import { describe, expect, it } from 'vitest';
import { createTripPlan, estimateTripBudget, mapDirectionsUrl } from '@/shared/utils/tripPlanner';
import type { AttractionDetail } from '@/shared/types/attraction';

const place = (id: string, lat: number, lng: number): AttractionDetail => ({
  id, name: id, nameLocal: id, province: 'ยะลา', category: 'Nature', rating: 0,
  reviewCount: 0, images: [], description: '', tags: [], coordinates: { lat, lng },
});

describe('trip planner', () => {
  const input = { days: 2, people: 2, dailyBudgetPerPerson: 1500, style: 'nature' as const, transport: 'car' as const };

  it('keeps every stop unique, excludes invalid coordinates and respects daily capacity', () => {
    const result = createTripPlan([place('a', 6.1, 101), place('a', 6.1, 101),
      place('b', 6.2, 101.1), place('c', 6.3, 101.2), place('bad', 0, 0)], input);
    expect(result).toHaveLength(3);
    expect(new Set(result.map(stop => stop.place.id)).size).toBe(3);
    expect(result.every(stop => stop.day <= 2 && stop.order <= 3)).toBe(true);
  });

  it('creates transparent budget totals and a route URL from real coordinates', () => {
    const budget = estimateTripBudget(input);
    expect(budget.total).toBe(budget.meals + budget.transport + budget.accommodation + budget.activities);
    expect(budget.perPerson).toBe(Math.round(budget.total / 2));
    const route = mapDirectionsUrl(createTripPlan([place('a', 6.1, 101), place('b', 6.2, 101.1)], input));
    expect(route).toContain('google.com/maps/dir/');
    expect(route).toContain('destination=');
  });
});
