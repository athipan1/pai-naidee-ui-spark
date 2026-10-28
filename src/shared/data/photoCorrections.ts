import type { AttractionPhotoCredit } from '@/shared/types/attraction';

// Verified against the linked Wikimedia Commons file pages on 2026-10-28.
// These two Railway records currently point at a photograph explicitly
// depicting Mu Ko Ang Thong, not their own destinations. Keep the correction
// narrowly scoped so a future corrected API record wins automatically.
const WRONG_ANG_THONG_IMAGE = 'Mu_Ko_Ang_Thong%2C_Islands_in_the_sea_2';

const corrections: Record<string, { url: string; credit: AttractionPhotoCredit }> = {
  'curated-ko-chang': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Ko_Chang%2C_Thailand.jpg/960px-Ko_Chang%2C_Thailand.jpg',
    credit: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Ko_Chang%2C_Thailand.jpg/960px-Ko_Chang%2C_Thailand.jpg',
      photographer: 'Nina R',
      licenseName: 'CC BY 2.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Ko_Chang,_Thailand.jpg',
    },
  },
  'curated-ko-kut': {
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Koh_Kut%2C_Thailand%2C_Gulf_of_Thailand.jpg/960px-Koh_Kut%2C_Thailand%2C_Gulf_of_Thailand.jpg',
    credit: {
      url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Koh_Kut%2C_Thailand%2C_Gulf_of_Thailand.jpg/960px-Koh_Kut%2C_Thailand%2C_Gulf_of_Thailand.jpg',
      photographer: 'Vyacheslav Argenberg',
      licenseName: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
      sourcePage: 'https://commons.wikimedia.org/wiki/File:Koh_Kut,_Thailand,_Gulf_of_Thailand.jpg',
    },
  },
};

type PhotoRecord = {
  id: string;
  image?: string | null;
  images?: string[];
  mediaCredits?: AttractionPhotoCredit[];
};

export function correctKnownIncorrectPhoto<T extends PhotoRecord>(place: T): T {
  const correction = corrections[place.id];
  if (!correction) return place;

  const hasWrongImage = [place.image, ...(place.images ?? [])]
    .some(url => url?.includes(WRONG_ANG_THONG_IMAGE));
  if (!hasWrongImage) return place;

  const remainingImages = place.images?.filter(url => !url.includes(WRONG_ANG_THONG_IMAGE));
  return {
    ...place,
    image: correction.url,
    ...(place.images ? { images: [correction.url, ...(remainingImages ?? [])] } : {}),
    mediaCredits: [
      correction.credit,
      ...(place.mediaCredits ?? []).filter(credit => !credit.url.includes(WRONG_ANG_THONG_IMAGE)),
    ],
  };
}
