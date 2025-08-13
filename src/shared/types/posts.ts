// Enhanced Post model for contextual search and community features
export interface Post {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  media: MediaItem[];
  caption: string;
  tags: string[]; // extracted + user-defined
  locationId?: string;
  location?: {
    name: string;
    nameLocal?: string;
    province: string;
  };
  geo?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
  embeddingVector?: number[]; // optional caching for semantic search
  isPublic: boolean;
  language: 'th' | 'en' | 'auto';
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbUrl?: string;
  alt?: string;
  duration?: number; // for videos in seconds
  size?: {
    width: number;
    height: number;
  };
}

export interface Location {
  id: string;
  name: string;
  nameLocal?: string;
  aliases: string[]; // for fuzzy search expansion
  province: string;
  provinceLocal?: string;
  region: string; // North, Central, South, Northeast
  category: string; // Beach, Mountain, Temple, etc.
  tags: string[];
  geo: {
    lat: number;
    lng: number;
  };
  popularityScore: number; // 0-1 for ranking
  description?: string;
  descriptionLocal?: string;
  parentLocationId?: string; // for hierarchical locations
}

export interface LocationExpansion {
  [key: string]: {
    popularPlaces: string[];
    commonTags: string[];
    aliases: string[];
    nearbyProvinces: string[];
  };
}

export interface SearchMetrics {
  relevanceScore: number; // 0-1
  popularityScore: number; // 0-1 normalized
  recencyScore: number; // 0-1 based on age
  semanticScore?: number; // 0-1 from embedding similarity
  finalScore: number; // weighted combination
}

export interface PostSearchResult extends Post {
  searchMetrics: SearchMetrics;
  matchedTerms: string[];
  highlightedCaption?: string;
}

export interface RelatedPostsConfig {
  maxResults: number;
  minSimilarityThreshold: number;
  useSemanticSimilarity: boolean;
  weightByPopularity: boolean;
  weightByRecency: boolean;
}