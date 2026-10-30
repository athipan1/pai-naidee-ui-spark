import { describe, expect, it } from 'vitest';
import { splitHomeAttractions, uniqueAttractionsById } from '@/shared/utils/uniqueAttractions';

describe('deduplication of attraction cards', () => {
  it('shows one card when the backend returns the same ID twice', () => {
    const places = [{ id: 'amphawa', name: 'ตลาดน้ำอัมพวา' }, { id: 'amphawa', name: 'ตลาดน้ำอัมพวา' }];
    expect(uniqueAttractionsById(places)).toHaveLength(1);
  });

  it('does not merge places that share a name but have distinct IDs', () => {
    const places = [{ id: 'temple-a', name: 'วัดป่า' }, { id: 'temple-b', name: 'วัดป่า' }];
    expect(uniqueAttractionsById(places)).toEqual(places);
  });
});

describe('home page attraction sections', () => {
  const places = Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));

  it('never repeats a featured place in the recommended grid', () => {
    const { featured, recommended } = splitHomeAttractions(places, true);
    expect(featured.map(place => place.id)).toEqual(['1', '2']);
    expect(recommended.map(place => place.id)).toEqual(['3', '4', '5', '6', '7', '8', '9', '10']);
    expect(new Set([...featured, ...recommended].map(place => place.id)).size).toBe(10);
  });

  it('uses all available slots when featured cards are hidden', () => {
    const { featured, recommended } = splitHomeAttractions(places, false);
    expect(featured).toEqual([]);
    expect(recommended).toHaveLength(8);
  });

  it('does not repeat an ID returned more than once by the backend', () => {
    const { featured, recommended } = splitHomeAttractions([places[0], places[0], places[1]], true);
    expect(featured).toHaveLength(2);
    expect(recommended).toEqual([]);
  });
});
