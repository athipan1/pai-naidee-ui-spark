import type { AttractionDetail } from '@/shared/types/attraction';

export type TripStyle = 'balanced' | 'nature' | 'culture';
export type TransportMode = 'car' | 'public';

export interface TripPlanInput {
  days: number;
  people: number;
  dailyBudgetPerPerson: number;
  style: TripStyle;
  transport: TransportMode;
}

export interface TripStop {
  place: AttractionDetail;
  day: number;
  order: number;
}

export interface TripBudget {
  accommodation: number;
  meals: number;
  transport: number;
  activities: number;
  total: number;
  perPerson: number;
}

const isValidCoordinate = (place: AttractionDetail) => Number.isFinite(place.coordinates?.lat)
  && Number.isFinite(place.coordinates?.lng)
  && place.coordinates.lat >= 5 && place.coordinates.lat <= 21
  && place.coordinates.lng >= 97 && place.coordinates.lng <= 106;

export function distanceKm(a: AttractionDetail, b: AttractionDetail): number {
  const rad = Math.PI / 180;
  const dLat = (b.coordinates.lat - a.coordinates.lat) * rad;
  const dLng = (b.coordinates.lng - a.coordinates.lng) * rad;
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(a.coordinates.lat * rad)
    * Math.cos(b.coordinates.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(value)));
}

function styleScore(place: AttractionDetail, style: TripStyle): number {
  if (style === 'balanced') return 0;
  const text = `${place.category} ${place.tags.join(' ')}`.toLowerCase();
  const terms = style === 'nature'
    ? ['nature', 'beach', 'mountain', 'park', 'น้ำตก', 'ภูเขา', 'ธรรมชาติ', 'ชายหาด']
    : ['culture', 'temple', 'history', 'museum', 'วัด', 'ประวัติศาสตร์', 'พิพิธภัณฑ์'];
  return terms.some(term => text.includes(term)) ? 3 : 0;
}

export function createTripPlan(places: AttractionDetail[], input: TripPlanInput): TripStop[] {
  const days = Math.max(1, Math.min(5, Math.floor(input.days)));
  const candidates = [...new Map(places.filter(isValidCoordinate).map(p => [p.id, p])).values()];
  const used = new Set<string>();
  const stops: TripStop[] = [];
  let previous: AttractionDetail | undefined;

  for (let day = 1; day <= days; day++) {
    for (let order = 1; order <= 3; order++) {
      const available = candidates.filter(p => !used.has(p.id));
      if (available.length === 0) break;
      available.sort((a, b) => {
        const score = (p: AttractionDetail) => styleScore(p, input.style)
          + Math.min(2, Math.max(0, p.rating || 0) / 2.5)
          - (previous ? Math.min(3, distanceKm(previous, p) / 30) : 0);
        return score(b) - score(a) || a.id.localeCompare(b.id);
      });
      const place = available[0];
      stops.push({ place, day, order });
      used.add(place.id);
      previous = place;
    }
  }
  return stops;
}

export function estimateTripBudget(input: TripPlanInput): TripBudget {
  const days = Math.max(1, Math.min(5, Math.floor(input.days)));
  const people = Math.max(1, Math.min(10, Math.floor(input.people)));
  const perDay = Math.max(500, input.dailyBudgetPerPerson);
  // Indicative planning allocation, NOT merchant quotes or live prices.
  const meals = Math.round(perDay * 0.3 * people * days);
  const transport = Math.round(perDay * (input.transport === 'car' ? 0.3 : 0.2) * people * days);
  const accommodation = Math.round(perDay * 0.25 * people * Math.max(0, days - 1));
  const activities = Math.round(perDay * 0.15 * people * days);
  const total = meals + transport + accommodation + activities;
  return { meals, transport, accommodation, activities, total, perPerson: Math.round(total / people) };
}

export function mapDirectionsUrl(stops: TripStop[]): string | null {
  if (stops.length === 0) return null;
  const points = stops.slice(0, 9).map(s => `${s.place.coordinates.lat},${s.place.coordinates.lng}`);
  const params = new URLSearchParams({ api: '1', destination: points[points.length - 1], travelmode: 'driving' });
  if (points.length > 1) params.set('origin', points[0]);
  if (points.length > 2) params.set('waypoints', points.slice(1, -1).join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
