// Attraction data interface
export interface AttractionPhotoCredit {
  url: string;
  photographer: string;
  licenseName: string;
  licenseUrl: string;
  sourcePage: string;
  kind?: 'commons' | 'user-provided' | 'licensed-source';
}

export interface AttractionDetail {
  image?: string;
  publishedPrimaryImage?: string | null;
  imageIssues?: string[];
  navigation?: {lat:number;lng:number;kind:'vehicle_entrance'|'parking'|'trailhead';sourceUrl:string;verifiedAt:string} | null;
  placeFacts?: {district:string|null;openingHours?:{text:string;sourceUrl:string;checkedAt:string}|null;admissionFee?:{text:string;sourceUrl:string;checkedAt:string}|null;verifiedAt:string}|null;
  source?: { name: string; url: string; verifiedAt?: string | null } | null;
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  provinceEn?: string | null;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  mediaCredits?: AttractionPhotoCredit[];
  detailedDescription?: { text: string; sourceUrl: string | null } | null;
  description: string;
  descriptionEn?: string | null;
  tags: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  externalLinks?: {
    officialWebsite?: string;
    wikipediaUrl?: string;
  };
  lastUpdated?: string;
}

export interface Accommodation {
  id: string;
  name: string;
  nameLocal?: string;
  rating: number;
  distance: number;
  image: string;
  price: number;
  currency: string;
  amenities: string[];
  booking_url?: string;
}

export interface WikiData {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
}
