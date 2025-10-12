// Extended attraction data interface to match Supabase response
export interface AttractionDetail {
  id: string;
  name: string;
  nameLocal: string;
  province: string;
  category: string;
  rating: number;
  reviewCount: number;
  image: string; // The main image for the attraction
  images: string[]; // Array of all image URLs
  description: string;
  tags: string[];
  amenities: string[];
  location: {
    lat: number;
    lng: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  reviews: {
    count: number;
    average: number;
    breakdown: Record<number, number>;
    recent: any[];
  };
  confidence: number;
  matchedTerms: string[];
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
