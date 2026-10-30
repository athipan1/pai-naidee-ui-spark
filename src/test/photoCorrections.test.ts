import { describe, expect, it } from 'vitest';
import { correctKnownIncorrectPhoto } from '@/shared/data/photoCorrections';

const wrongImage = 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2%2C_Thailand.jpg/960px-Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2%2C_Thailand.jpg';

describe('verified photo corrections', () => {
  it.each([
    ['curated-ko-chang', 'Ko_Chang%2C_Thailand.jpg', 'Nina R'],
    ['curated-ko-kut', 'Koh_Kut%2C_Thailand', 'Vyacheslav Argenberg'],
  ])('replaces a misattributed Ang Thong photo for %s', (id, imageFragment, photographer) => {
    const place = correctKnownIncorrectPhoto({
      id, image: wrongImage, images: [wrongImage],
      mediaCredits: [{ url: wrongImage, photographer: 'Wrong', licenseName: 'CC BY', sourcePage: 'https://example.org', licenseUrl: 'https://example.org' }],
    });
    expect(place.image).toContain(imageFragment);
    expect(place.images).toEqual([place.image]);
    expect(place.mediaCredits).toEqual([expect.objectContaining({ url: place.image, photographer })]);
  });

  it('never overwrites a future database correction or an unrelated place', () => {
    const fixed = { id: 'curated-ko-chang', image: 'https://example.org/updated.jpg' };
    expect(correctKnownIncorrectPhoto(fixed)).toBe(fixed);
    const other = { id: 'curated-mu-ko-ang-thong-national-park', image: wrongImage };
    expect(correctKnownIncorrectPhoto(other)).toBe(other);
  });
});
