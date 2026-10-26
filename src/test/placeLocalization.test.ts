import { describe, expect, it } from 'vitest';
import { localizedCategory, localizedDescription, localizedProvince, localizedTag } from '@/shared/i18n/placeLocalization';

const amphawa = {
  province: 'สมุทรสงคราม',
  provinceEn: 'Samut Songkhram',
  description: 'ตลาดน้ำอัมพวาตั้งอยู่ริมคลอง',
  descriptionEn: 'Amphawa Floating Market is situated beside a canal.',
};

describe('place localization', () => {
  it('switches province and summary together without mixing scripts', () => {
    expect(localizedProvince(amphawa, 'th')).toBe('สมุทรสงคราม');
    expect(localizedDescription(amphawa, 'th')).toBe('ตลาดน้ำอัมพวาตั้งอยู่ริมคลอง');
    expect(localizedProvince(amphawa, 'en')).toBe('Samut Songkhram');
    expect(localizedDescription(amphawa, 'en')).toBe('Amphawa Floating Market is situated beside a canal.');
  });

  it('does not expose Thai-only descriptions in English mode for unreviewed entries', () => {
    const missing = { province: 'สมุทรสงคราม', description: 'รายละเอียดภาษาไทย' };
    expect(localizedProvince(missing, 'en')).toBe('Thailand');
    expect(localizedDescription(missing, 'en')).toBe('English description is not available yet.');
    expect(localizedProvince(missing, 'th')).toBe('สมุทรสงคราม');
  });

  it('localizes category and thematic tags on cards and details', () => {
    expect(localizedCategory('Food', 'th')).toBe('อาหาร');
    expect(localizedTag('Market', 'th')).toBe('ตลาด');
    expect(localizedCategory('Food', 'en')).toBe('Food');
    expect(localizedTag('Market', 'en')).toBe('Market');
  });
});
