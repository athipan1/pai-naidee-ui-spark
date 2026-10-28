import { describe, expect, it } from 'vitest';
import { uniqueAttractionsById } from '@/shared/utils/uniqueAttractions';

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
