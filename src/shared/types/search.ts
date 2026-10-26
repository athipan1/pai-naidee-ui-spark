import type { AttractionPhotoCredit } from './attraction';

export interface SearchQuery {
  query: string;
  language: "th" | "en";
  filters: {
    provinces?: string[];
    categories?: string[];
    amenities?: string[];
    priceRange?: 'all' | 'free' | 'paid';
    maxDistance?: number;
    minRating?: number;
  };
  sortBy?: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'distance';
}

export interface SearchSuggestion {
  id: string;
  type: "place" | "province" | "category" | "tag" | "phrase";
  text: string;
  description?: string;
  province?: string;
  category?: string;
  confidence: number;
  image?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  nameLocal?: string;
  province: string;
  provinceEn?: string | null;
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  image: string;
  mediaCredits?: AttractionPhotoCredit[];
  description: string;
  descriptionEn?: string | null;
  confidence: number;
  matchedTerms: string[];
  amenities?: string[];
  location?: {
    lat: number;
    lng: number;
  };
  coordinates?: { lat: number; lng: number };
  distanceKm?: number;
  source?: { name: string; url: string; verifiedAt?: string | null } | null;
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  totalCount: number;
  query: string;
  processingTime: number;
}
