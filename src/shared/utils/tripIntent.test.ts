import { describe, expect, it } from 'vitest';
import { parseTripIntent } from './tripIntent';
import { auditTripRoute, createTripPlan } from './tripPlanner';
import type { AttractionDetail } from '@/shared/types/attraction';

const provinces = ['เชียงใหม่', 'เชียงราย', 'ภูเก็ต'];
const place = (id: string, lat: number, lng: number): AttractionDetail => ({
  id, name: id, nameLocal: id, province: 'เชียงใหม่', category: 'ธรรมชาติ',
  rating: 4, reviewCount: 1, tags: ['ธรรมชาติ'], images: [], description: '', coordinates: { lat, lng },
});

describe('Thai trip request and safety gates', () => {
  it('extracts destination, days, budget, nature, and short drives', () => {
    const result = parseTripIntent('อยากเที่ยวเชียงใหม่ 3 วัน งบ 6,000 บาท ชอบธรรมชาติ ไม่อยากขับรถไกล', provinces);
    expect(result).toMatchObject({ province: 'เชียงใหม่', days: 3, people: 1, totalBudget: 6000, style: 'nature', avoidLongDrives: true, maxLegKm: 30, issues: [] });
  });
  it('does not invent missing provinces or budget', () => {
    expect(parseTripIntent('เที่ยว 3 วัน', provinces).issues.length).toBeGreaterThan(0);
  });
  it('does not allow an over-budget or out-of-range request', () => {
    expect(parseTripIntent('ภูเก็ต 8 วัน งบ 100 บาท', provinces).issues.length).toBeGreaterThan(0);
  });
  it('rejects remote candidate legs when short drives are requested', () => {
    const stops = createTripPlan([place('a', 18.78, 98.98), place('b', 18.80, 99.00), place('c', 19.90, 99.00)], {
      days: 1, people: 1, dailyBudgetPerPerson: 2000, style: 'nature', transport: 'car',
    }, 30);
    expect(stops).toHaveLength(2);
    const audit = auditTripRoute(stops, 30);
    expect(audit.overDistanceLimit).toBe(false);
    expect(audit.openingHoursStatus).toBe('unverified');
  });
});
