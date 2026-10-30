import { describe, expect, it } from 'vitest';
import { addVerifiedPhotoIfMissing, addUserProvidedGalleryIfMissing, verifiedMissingPhotoFiles } from '@/shared/data/verifiedPlacePhotoFallbacks';
import persistedCommonsPhotos from '../../api/verified-missing-commons-media.json';
import userProvidedMedia from '../../api/user-provided-place-media.json';

describe('Verified place photo fallback catalogue', () => {
  it('renders three supplied photos per temple in order only while Railway has no photos', () => {
    for (const id of ['curated-phra-that-na-dun', 'curated-wat-phu-manorom']) {
      const place = { id, image: null, images: [] as string[], mediaCredits: [] };
      const photos = userProvidedMedia.filter(photo => photo.placeId === id);
      const result = addUserProvidedGalleryIfMissing(place);
      expect(photos).toHaveLength(3);
      expect(result.image).toBe(photos[0].url);
      expect(result.images).toEqual(photos.map(photo => photo.url));
      expect(result.mediaCredits).toHaveLength(3);
      expect(result.mediaCredits?.every(credit => credit.kind === 'user-provided' && !credit.licenseUrl)).toBe(true);
      const edited = { ...place, image: 'https://example.org/editor.jpg', images: ['https://example.org/editor.jpg'] };
      expect(addUserProvidedGalleryIfMissing(edited)).toBe(edited);
    }
    const unrelated = { id: 'unrelated', image: null };
    expect(addUserProvidedGalleryIfMissing(unrelated)).toBe(unrelated);
  });
  it('maps distinct real Commons files to curated places with complete rights metadata', () => {
    const filenames = Object.values(verifiedMissingPhotoFiles).map(photo => photo.filename);
    expect(filenames.length).toBeGreaterThanOrEqual(30);
    expect(new Set(filenames).size).toBe(filenames.length);
    for (const id of Object.keys(verifiedMissingPhotoFiles)) {
      const added = addVerifiedPhotoIfMissing({ id, image: null, images: [], mediaCredits: [] });
      expect(added.image).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
      expect(added.images).toEqual([added.image]);
      expect(added.mediaCredits).toEqual([expect.objectContaining({
        url: added.image,
        photographer: expect.any(String),
        sourcePage: expect.stringMatching(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/),
        licenseUrl: expect.stringMatching(/^https:\/\/creativecommons\.org\/(licenses|publicdomain)\//),
      })]);
    }
  });

  it('does not replace an editor-provided image or an unrelated place', () => {
    const submitted = { id: 'curated-pai-canyon', image: 'https://example.com/editor.jpg',
      images: ['https://example.com/editor.jpg'] };
    expect(addVerifiedPhotoIfMissing(submitted)).toBe(submitted);
    const unrelated = { id: 'unknown-id', image: null };
    expect(addVerifiedPhotoIfMissing(unrelated)).toBe(unrelated);
  });

  it('keeps the Railway backfill catalogue aligned with the frontend photo credits', () => {
    expect(persistedCommonsPhotos).toHaveLength(Object.keys(verifiedMissingPhotoFiles).length);
    const ids = new Set<string>();
    for (const photo of persistedCommonsPhotos) {
      expect(ids.has(photo.placeId)).toBe(false);
      ids.add(photo.placeId);
      const corresponding = verifiedMissingPhotoFiles[photo.placeId];
      expect(corresponding).toBeDefined();
      expect(photo.filename).toBe(corresponding.filename);
      expect(photo.photographer).toBe(corresponding.photographer);
      expect(photo.licenseName).toBe(corresponding.licenseName);
      const frontendPhoto = addVerifiedPhotoIfMissing({ id: photo.placeId, image: null });
      expect(photo.url).toBe(frontendPhoto.image);
      expect(frontendPhoto.mediaCredits?.[0]).toEqual(expect.objectContaining({
        licenseUrl: photo.licenseUrl, sourcePage: photo.sourcePage,
      }));
    }
  });
});
