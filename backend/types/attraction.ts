/**
 * Attraction and location related types
 * Shared between frontend and backend
 */

/**
 * Attraction categories
 */
export enum AttractionCategory {
  TEMPLE = 'temple',
  BEACH = 'beach',
  MOUNTAIN = 'mountain',
  WATERFALL = 'waterfall',
  ISLAND = 'island',
  NATURE = 'nature',
  CULTURE = 'culture',
  FOOD = 'food',
  SHOPPING = 'shopping',
  NIGHTLIFE = 'nightlife',
  ADVENTURE = 'adventure',
  WELLNESS = 'wellness',
  HISTORICAL = 'historical',
  MUSEUM = 'museum',
  PARK = 'park'
}

/**
 * Geographic coordinates
 */
export interface Coordinates {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Accuracy in meters (optional) */
  accuracy?: number;
}

/**
 * Address information
 */
export interface Address {
  /** Street address */
  street?: string;
  /** Sub-district */
  subDistrict?: string;
  /** District */
  district?: string;
  /** Province */
  province: string;
  /** Province in local language */
  provinceLocal?: string;
  /** Postal code */
  postalCode?: string;
  /** Country */
  country?: string;
  /** Full formatted address */
  formatted?: string;
}

/**
 * Opening hours for a single day
 */
export interface DayHours {
  /** Whether the place is open this day */
  isOpen: boolean;
  /** Opening time (24-hour format, e.g., "09:00") */
  open?: string;
  /** Closing time (24-hour format, e.g., "18:00") */
  close?: string;
  /** Special notes for this day */
  note?: string;
}

/**
 * Weekly opening hours
 */
export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
  /** General notes about opening hours */
  notes?: string;
  /** Timezone */
  timezone?: string;
}

/**
 * Attraction image/media
 */
export interface AttractionMedia {
  /** Media ID */
  id: string;
  /** Media type */
  type: 'image' | 'video';
  /** Media URL */
  url: string;
  /** Thumbnail URL */
  thumbnailUrl?: string;
  /** Alt text */
  alt?: string;
  /** Caption */
  caption?: string;
  /** Whether this is the primary image */
  isPrimary?: boolean;
  /** Upload timestamp */
  uploadedAt: string;
  /** Credits/attribution */
  credits?: string;
}

/**
 * Attraction rating and reviews summary
 */
export interface AttractionRating {
  /** Average rating (1-5) */
  average: number;
  /** Total number of reviews */
  count: number;
  /** Rating breakdown */
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Attraction amenities and facilities
 */
export interface AttractionAmenities {
  /** Parking available */
  parking?: boolean;
  /** WiFi available */
  wifi?: boolean;
  /** Wheelchair accessible */
  wheelchairAccessible?: boolean;
  /** Restrooms available */
  restrooms?: boolean;
  /** Food/restaurant available */
  restaurant?: boolean;
  /** Gift shop available */
  giftShop?: boolean;
  /** Guided tours available */
  guidedTours?: boolean;
  /** Pet friendly */
  petFriendly?: boolean;
  /** Air conditioning */
  airConditioning?: boolean;
  /** Photography allowed */
  photographyAllowed?: boolean;
  /** Additional amenities */
  other?: string[];
}

/**
 * Detailed attraction information
 */
export interface Attraction {
  /** Unique identifier */
  id: string;
  /** Attraction name in English */
  name: string;
  /** Attraction name in local language */
  nameLocal?: string;
  /** Alternative names */
  aliases?: string[];
  /** Short description */
  description: string;
  /** Description in local language */
  descriptionLocal?: string;
  /** Long description */
  longDescription?: string;
  /** Category */
  category: AttractionCategory;
  /** Additional tags */
  tags: string[];
  /** Geographic coordinates */
  coordinates: Coordinates;
  /** Address information */
  address: Address;
  /** Rating information */
  rating: AttractionRating;
  /** Media gallery */
  media: AttractionMedia[];
  /** Opening hours */
  openingHours?: OpeningHours;
  /** Entrance fees */
  entranceFee?: {
    /** Fee for adults */
    adult?: number;
    /** Fee for children */
    child?: number;
    /** Fee for students */
    student?: number;
    /** Fee for seniors */
    senior?: number;
    /** Currency */
    currency: string;
    /** Special notes about fees */
    notes?: string;
  };
  /** Amenities and facilities */
  amenities?: AttractionAmenities;
  /** Website URL */
  website?: string;
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Social media links */
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  /** Popularity score (0-1) */
  popularityScore: number;
  /** Whether the attraction is verified */
  isVerified: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last update timestamp */
  updatedAt: string;
  /** Who created this entry */
  createdBy?: string;
  /** Whether the attraction is active/published */
  isActive: boolean;
}

/**
 * Simplified attraction information for lists
 */
export interface AttractionSummary {
  id: string;
  name: string;
  nameLocal?: string;
  category: AttractionCategory;
  coordinates: Coordinates;
  address: {
    province: string;
    provinceLocal?: string;
  };
  rating: {
    average: number;
    count: number;
  };
  primaryImage?: string;
  popularityScore: number;
}

/**
 * Attraction search filters
 */
export interface AttractionFilters {
  /** Categories to include */
  categories?: AttractionCategory[];
  /** Provinces to include */
  provinces?: string[];
  /** Minimum rating */
  minRating?: number;
  /** Maximum distance from a point (in km) */
  maxDistance?: number;
  /** Center point for distance calculation */
  centerPoint?: Coordinates;
  /** Free entrance only */
  freeEntrance?: boolean;
  /** Wheelchair accessible only */
  wheelchairAccessible?: boolean;
  /** Open now */
  openNow?: boolean;
  /** Has amenities */
  amenities?: string[];
}

/**
 * Nearby accommodation
 */
export interface Accommodation {
  /** Unique identifier */
  id: string;
  /** Accommodation name */
  name: string;
  /** Name in local language */
  nameLocal?: string;
  /** Type of accommodation */
  type: 'hotel' | 'resort' | 'guesthouse' | 'hostel' | 'apartment' | 'villa';
  /** Rating */
  rating: number;
  /** Number of reviews */
  reviewCount: number;
  /** Distance from attraction (in km) */
  distance: number;
  /** Primary image */
  image: string;
  /** Price per night */
  price: {
    /** Amount */
    amount: number;
    /** Currency */
    currency: string;
    /** Price period */
    period: 'night' | 'week' | 'month';
  };
  /** Key amenities */
  amenities: string[];
  /** Booking URL */
  bookingUrl?: string;
  /** Coordinates */
  coordinates: Coordinates;
}

/**
 * Location autocomplete suggestion
 */
export interface LocationSuggestion {
  /** Suggestion ID */
  id: string;
  /** Display name */
  name: string;
  /** Name in local language */
  nameLocal?: string;
  /** Type of location */
  type: 'attraction' | 'province' | 'district' | 'subdistrict';
  /** Parent location (e.g., province for a district) */
  parent?: string;
  /** Coordinates */
  coordinates?: Coordinates;
  /** Match score (0-1) */
  score: number;
}