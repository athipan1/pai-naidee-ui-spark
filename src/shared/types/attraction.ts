// Attraction data interface
export interface ImageCredit {
  source?: string | null;
  license?: string | null;
  credit?: string | null;
  sourceUrl?: string | null;
  isAiGenerated?: boolean;
}

export interface AttractionDetail {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  images: string[];
  /** Credits aligned by index with `images` */
  imageCredits?: ImageCredit[];
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
