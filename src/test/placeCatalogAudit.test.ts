import { describe, expect, it } from 'vitest';
import { auditPlaces } from '../../scripts/audit-place-catalog.mjs';

const place = {
  id: 'one', name: 'Place One', nameLocal: 'สถานที่หนึ่ง', province: 'เชียงใหม่',
  provinceEn: 'Chiang Mai', image: null, descriptionEn: 'A place',
  coordinates: { lat: 18.8, lng: 98.9 }, source: { url: 'https://example.org/one' },
};

describe('read-only production place audit', () => {
  it('flags actual duplicate records but not two distinct names with the same photo', () => {
    const report = auditPlaces([place, { ...place, id: 'two' }]);
    expect(report.duplicateIds).toHaveLength(0);
    expect(report.duplicateNames).toHaveLength(1);
    expect(report.missingPhotos).toHaveLength(2);
  });

  it('requires provenance and usable Thai coordinates for each record', () => {
    const report = auditPlaces([{ ...place, image: 'https://example.org/a.jpg', source: null, coordinates: { lat: 0, lng: 0 } }]);
    expect(report.invalidCoordinates).toEqual(['one']);
    expect(report.missingSource).toEqual(['one']);
    expect(report.uncreditedPhotos).toEqual(['one']);
  });
});
