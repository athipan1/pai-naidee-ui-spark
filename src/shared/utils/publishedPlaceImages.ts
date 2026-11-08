import type { AttractionPhotoCredit } from '@/shared/types/attraction';
import { reviewedGallery } from './reviewedGallery';
const FALLBACK = '/placeholder-attraction.svg';
type Place = { image?: string | null; images?: string[]; mediaCredits?: AttractionPhotoCredit[]; publishedPrimaryImage?: string | null; imageIssues?: string[] };
// The client may hide an unusable published primary, but never selects another
// photograph or injects a hardcoded gallery in its place.
export function withPublishedPlaceImages<T extends Place>(place: T): T & {image:string;images:string[]} {
  const primary = place.image || place.images?.[0] || FALLBACK;
  const gallery = reviewedGallery(place.images || [primary], place.mediaCredits);
  const image = reviewedGallery([primary], place.mediaCredits).length ? primary : FALLBACK;
  return {...place, image, images: [image, ...gallery.filter(url => url !== image)]};
}
