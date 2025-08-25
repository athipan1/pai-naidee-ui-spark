export interface SearchQuery {
  query: string;
  language: "th" | "en";
  filters: {
    provinces: string[];
    categories: string[];
    amenities: string[];
  };
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
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  confidence: number;
  matchedTerms: string[];
  amenities?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  totalCount: number;
  query: string;
  processingTime: number;
}
