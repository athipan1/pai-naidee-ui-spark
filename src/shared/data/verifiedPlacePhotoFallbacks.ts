import type { AttractionPhotoCredit } from '@/shared/types/attraction';
import userProvidedMedia from '../../../api/user-provided-place-media.json';

// Hand-reviewed Commons file pages and their licensing metadata, 2026-10-29.
// A fallback is used ONLY while the corresponding Railway place has no image.
// Never replace an existing photo supplied by an editor or a subsequent data import.
type VerifiedFile = {
  filename: string;
  photographer: string;
  licenseName: 'CC BY 2.0' | 'CC BY 3.0' | 'CC BY 4.0' | 'CC BY-SA 2.0' | 'CC BY-SA 3.0' | 'CC BY-SA 4.0' | 'Public domain';
};

export const verifiedMissingPhotoFiles: Record<string, VerifiedFile> = {
  'curated-aiyerweng-sea-of-mist-viewpoint': {
    filename: 'The Sea of Mist Ai Yerweng, Betong.jpg', photographer: 'Aoeinista', licenseName: 'CC BY-SA 4.0',
  },
  'curated-ao-manao-beach': {
    filename: 'Ao Manao Beach, Prachuap Khiri Khan.JPG', photographer: 'Immoreel', licenseName: 'CC BY-SA 3.0',
  },
  'curated-ao-nang-beach': {
    filename: 'A view of Ao Nang beach, Krabi.jpg', photographer: 'Satdeep Gill', licenseName: 'CC BY-SA 4.0',
  },
  'curated-ban-chiang-archaeological-site': {
    filename: 'Ban Chiang Archaeological Site UNESCO plaque.JPG', photographer: 'Akiponkun', licenseName: 'CC BY-SA 3.0',
  },
  'curated-river-kwai-bridge': {
    filename: 'Bridge over River Kwai in Kanchanaburi, Thailand.jpg', photographer: 'spotter_nl', licenseName: 'CC BY 2.0',
  },
  'curated-erawan-falls': {
    filename: 'Erawan Waterfall Level 3 P1110261.JPG', photographer: 'Deror Avi', licenseName: 'CC BY-SA 3.0',
  },
  'curated-emerald-cave-ko-muk': {
    filename: 'Inside the emerald cave (8161381748).jpg', photographer: 'Nik Cyclist', licenseName: 'CC BY 2.0',
  },
  '4': {
    filename: 'Ratchaburi Damnoen Saduak Floating Market 2.jpg',
    photographer: 'Mr. Niwat Tantayanusorn', licenseName: 'CC BY-SA 4.0',
  },
  'curated-khao-khitchakut-national-park': {
    filename: 'Khao Khitchakut National Park - panoramio - carbon60 (6).jpg',
    photographer: 'carbon60', licenseName: 'CC BY-SA 3.0',
  },
  'curated-hin-ta-hin-yai': {
    filename: 'Hin ta hin yai - koh samui - panoramio.jpg',
    photographer: 'Dirk Enthoven', licenseName: 'CC BY 3.0',
  },
  'curated-ko-samet': {
    filename: 'Ko Samet Beach, Thailand.jpg', photographer: 'Ken Eckert', licenseName: 'CC BY-SA 4.0',
  },
  'curated-similan-islands-national-park': {
    filename: 'Similan.jpg', photographer: 'Ist Meekwamdee', licenseName: 'CC BY-SA 4.0',
  },
  'curated-pa-hin-ngam-national-park': {
    filename: 'Pa hin ngam.jpg', photographer: 'Poohpachatpimuk', licenseName: 'CC BY-SA 4.0',
  },
  'curated-pai-canyon': {
    filename: 'Pai canyon.jpg', photographer: 'Sgroey', licenseName: 'CC BY 4.0',
  },
  'curated-phra-maha-chedi-chai-mongkol': {
    filename: 'Phra Maha Chedi Chai Mongkol.JPG', photographer: 'Pawyilee', licenseName: 'Public domain',
  },
  'curated-phra-mongkhon-ming-mueang': {
    filename: 'Mingmuang.jpg', photographer: 'นายพงษ์ศักดิ์ แก้วแสนเมือง', licenseName: 'CC BY-SA 3.0',
  },
  'curated-phu-phan-national-park': {
    filename: 'ถ้ำเสรีไทยภูพาน.jpg', photographer: 'อรอนงค์ ฮาดทักษ์วงค์', licenseName: 'CC BY-SA 3.0',
  },
  'curated-phra-that-kong-khao-noi': {
    filename: 'Phra That Kong Khao Noi (I).jpg',
    photographer: 'Supanut Arunoprayote', licenseName: 'CC BY-SA 4.0',
  },
  'curated-phu-chi-fa': {
    filename: 'Phu Chi Fa National Park, Chiengrai, Thailand.jpg',
    photographer: 'SunnyCamera', licenseName: 'CC BY-SA 4.0',
  },
  'curated-promthep-cape': {
    filename: 'Promthep Cape Phuket.jpg', photographer: 'Christophe95', licenseName: 'CC BY-SA 4.0',
  },
  'curated-sam-chuk-old-market': {
    filename: 'Suphanburi Samchuk Market 1.jpg', photographer: 'Mr.Peerapong Prasutr', licenseName: 'CC BY-SA 4.0',
  },
  'curated-samila-beach': {
    filename: 'Songkhla mermaid.jpg', photographer: 'Ahoerstemeier', licenseName: 'CC BY-SA 3.0',
  },
  'curated-thung-wua-laen-beach': {
    filename: 'Thung Wua Laen beach - Chumphon.jpg',
    photographer: 'Lamacchiacosta', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-chang-hai': {
    filename: 'Wat Chang Hai im 2018.jpg', photographer: 'แอนเดอร์สัน', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-chalong': {
    filename: 'Wat Chalong.jpg', photographer: 'Gossipguy', licenseName: 'CC BY-SA 3.0',
  },
  'curated-wat-chedi-hoi': {
    filename: 'วัดเจดีย์หอย อ.ลาดหลุมแก้ว จ.ปทุมธานี (4).jpg',
    photographer: 'กสิณธร ราชโอรส', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-khok-kham': {
    filename: '0006052-วัดโคกขาม-2.jpg', photographer: 'Paul-shy', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-phra-mahathat-nakhon': {
    filename: 'Wat Phra Mahathat Woramahawihan, Nakhon Si Thammarat.jpg',
    photographer: 'Preecha.MJ', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-phra-that-choeng-chum': {
    filename: 'Prathat Cherng Chum Temple (1).jpg', photographer: 'Chaiyathat', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-phra-that-doi-suthep': {
    filename: 'Wat Phra That Doi Suthep temple Thailand.jpg',
    photographer: 'Kate Branch', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-phra-that-phanom': {
    filename: 'Wat Phra That Phanom, That Phanom, Nakhon Phanom, Thailand.jpg',
    photographer: 'Paul Cornelis', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-rong-khun': {
    filename: 'Wat Rong Khun view.jpg', photographer: 'JurriaanH', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-tham-klong-phen': {
    filename: 'วัดถ่ำกลองเพล.jpg', photographer: 'Thanongsuk harakunno', licenseName: 'CC BY-SA 4.0',
  },
  'curated-wat-yai-chai-mongkhon': {
    filename: 'Wat Yai Chai Mongkhon Ayutthaya.jpg',
    photographer: 'KOSIN SUKHUM', licenseName: 'CC BY-SA 4.0',
  },
};

function asPhoto(verified: VerifiedFile): AttractionPhotoCredit {
  const filename = encodeURIComponent(verified.filename.replaceAll(' ', '_'));
  const version = verified.licenseName.split(' ').at(-1);
  const licenseType = verified.licenseName.includes('BY-SA') ? 'by-sa' : 'by';
  return {
    url: `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(verified.filename)}?width=960`,
    photographer: verified.photographer,
    licenseName: verified.licenseName,
    licenseUrl: verified.licenseName === 'Public domain'
      ? 'https://creativecommons.org/publicdomain/mark/1.0/'
      : `https://creativecommons.org/licenses/${licenseType}/${version}`,
    sourcePage: `https://commons.wikimedia.org/wiki/File:${filename}`,
  };
}

type PlacePhotoRecord = {
  id: string;
  image?: string | null;
  images?: string[];
  mediaCredits?: AttractionPhotoCredit[];
};

export function addVerifiedPhotoIfMissing<T extends PlacePhotoRecord>(place: T): T {
  const verified = verifiedMissingPhotoFiles[place.id];
  if (!verified || place.image || place.images?.length) return place;
  const credit = asPhoto(verified);
  return {
    ...place,
    image: credit.url,
    ...(place.images ? { images: [credit.url] } : {}),
    mediaCredits: [credit, ...(place.mediaCredits ?? [])],
  };
}

// While Railway is deploying its idempotent media backfill, the primary Vercel
// site can already show the user-submitted galleries for both temples.
// Never replace a photo already returned by Railway or uploaded by an editor.
export function addUserProvidedGalleryIfMissing<T extends PlacePhotoRecord>(place: T): T {
  if (place.image || place.images?.length) return place;
  const photos = userProvidedMedia.filter(photo => photo.placeId === place.id);
  if (!photos.length) return place;
  const credits: AttractionPhotoCredit[] = photos.map(photo => ({
    url: photo.url,
    photographer: 'PaiNaiDee user',
    licenseName: 'User-provided photo for PaiNaiDee',
    licenseUrl: '',
    sourcePage: '',
    kind: 'user-provided',
  }));
  return {
    ...place,
    image: photos[0].url,
    ...(place.images ? { images: photos.map(photo => photo.url) } : {}),
    mediaCredits: [...credits, ...(place.mediaCredits ?? [])],
  };
}
