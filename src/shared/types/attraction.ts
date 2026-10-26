// Attraction data interface
export interface AttractionPhotoCredit {
  url: string;
  photographer: string;
  licenseName: string;
  licenseUrl: string;
  sourcePage: string;
}

export interface AttractionDetail {
  source?: { name: string; url: string; verifiedAt?: string | null } | null;
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  mediaCredits?: AttractionPhotoCredit[];
  detailedDescription?: { text: string; sourceUrl: string | null } | null;
  description: string;
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
