// Mock data for development and fallback scenarios
import type {
  SearchResult,
  SearchSuggestion,
  SearchResponse,
} from "../utils/searchAPI";

export const mockAttractions: SearchResult[] = [
  {
    id: "1",
    name: "Phi Phi Islands",
    nameLocal: "หมู่เกาะพีพี",
    province: "Krabi",
    category: "Islands",
    tags: ["Beach", "Snorkeling", "Island", "Photography"],
    rating: 4.8,
    reviewCount: 2341,
    image: "/src/shared/assets/hero-beach.jpg",
    description:
      "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
    confidence: 0.95,
    matchedTerms: ["beach", "island", "phi phi"],
    amenities: ["Restaurant", "Snorkeling", "Beach Access", "Boat Tours"],
    location: { lat: 7.7407, lng: 98.7784 },
  },
  {
    id: "2",
    name: "Temple of the Emerald Buddha",
    nameLocal: "วัดพระแก้ว",
    province: "Bangkok",
    category: "Temples",
    tags: ["Temple", "Culture", "History", "Buddhist"],
    rating: 4.9,
    reviewCount: 5678,
    image: "/src/shared/assets/temple-culture.jpg",
    description:
      "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.",
    confidence: 0.98,
    matchedTerms: ["temple", "emerald", "buddha"],
    amenities: ["Audio Guide", "Gift Shop", "Prayer Area", "Cultural Tours"],
    location: { lat: 13.7515, lng: 100.4917 },
  },
  {
    id: "3",
    name: "Doi Inthanon National Park",
    nameLocal: "อุทยานแห่งชาติดอยอินทนนท์",
    province: "Chiang Mai",
    category: "Nature",
    tags: ["Mountain", "Nature", "Hiking", "Wildlife"],
    rating: 4.7,
    reviewCount: 1856,
    image: "/src/shared/assets/mountain-nature.jpg",
    description:
      "Thailand's highest peak offering stunning mountain views, waterfalls, and diverse wildlife.",
    confidence: 0.92,
    matchedTerms: ["mountain", "nature", "doi inthanon"],
    amenities: ["Hiking Trails", "Visitor Center", "Parking", "Restrooms"],
    location: { lat: 18.5885, lng: 98.4867 },
  },
  {
    id: "4",
    name: "Floating Market",
    nameLocal: "ตลาดน้ำ",
    province: "Bangkok",
    category: "Markets",
    tags: ["Market", "Culture", "Food", "Boat Tours"],
    rating: 4.6,
    reviewCount: 3421,
    image: "/src/shared/assets/floating-market.jpg",
    description:
      "Traditional floating market where vendors sell fresh fruits, local food, and handicrafts from boats.",
    confidence: 0.89,
    matchedTerms: ["market", "floating", "boat"],
    amenities: ["Boat Tours", "Food Stalls", "Souvenirs", "Photography"],
    location: { lat: 13.5167, lng: 100.1167 },
  },
];

export const mockSuggestions: SearchSuggestion[] = [
  {
    id: "s1",
    type: "place",
    text: "Phi Phi Islands",
    description: "Beautiful island destination",
    province: "Krabi",
    category: "Islands",
    confidence: 0.95,
    image: "/src/shared/assets/hero-beach.jpg",
  },
  {
    id: "s2",
    type: "category",
    text: "Beaches",
    description: "Coastal attractions and beach destinations",
    confidence: 0.88,
  },
  {
    id: "s3",
    type: "province",
    text: "Krabi",
    description: "Southern province known for limestone cliffs",
    confidence: 0.82,
  },
  {
    id: "s4",
    type: "tag",
    text: "Snorkeling",
    description: "Water activities and marine life",
    confidence: 0.75,
  },
];

export const mockFilters = {
  provinces: [
    { id: "bangkok", name: "Bangkok", nameLocal: "กรุงเทพฯ" },
    { id: "krabi", name: "Krabi", nameLocal: "กระบี่" },
    { id: "chiang-mai", name: "Chiang Mai", nameLocal: "เชียงใหม่" },
    { id: "phuket", name: "Phuket", nameLocal: "ภูเก็ต" },
    { id: "ayutthaya", name: "Ayutthaya", nameLocal: "อยุธยา" },
  ],
  categories: [
    { id: "temples", name: "Temples", nameLocal: "วัด" },
    { id: "beaches", name: "Beaches", nameLocal: "ชายหาด" },
    { id: "mountains", name: "Mountains", nameLocal: "ภูเขา" },
    { id: "markets", name: "Markets", nameLocal: "ตลาด" },
    { id: "islands", name: "Islands", nameLocal: "เกาะ" },
  ],
  amenities: [
    { id: "restaurant", name: "Restaurant", nameLocal: "ร้านอาหาร" },
    { id: "parking", name: "Parking", nameLocal: "ที่จอดรถ" },
    { id: "wifi", name: "WiFi", nameLocal: "ไวไฟ" },
    { id: "guide", name: "Tour Guide", nameLocal: "ไกด์นำเที่ยว" },
    { id: "shop", name: "Gift Shop", nameLocal: "ร้านของฝาก" },
  ],
};

export const mockVideos = [
  {
    id: "v1",
    title: "Amazing Phi Phi Islands",
    description: "Explore the stunning beauty of Phi Phi Islands",
    thumbnail: "/src/shared/assets/hero-beach.jpg",
    duration: 180,
    views: 15420,
    likes: 892,
    user: {
      id: "u1",
      name: "Travel Thailand",
      avatar: "/src/shared/assets/hero-beach.jpg",
      followers: 12500,
    },
    location: "Phi Phi Islands, Krabi",
  },
  {
    id: "v2",
    title: "Temple Culture in Bangkok",
    description: "Discover the spiritual side of Thailand",
    thumbnail: "/src/shared/assets/temple-culture.jpg",
    duration: 240,
    views: 23100,
    likes: 1340,
    user: {
      id: "u2",
      name: "Culture Explorer",
      avatar: "/src/shared/assets/temple-culture.jpg",
      followers: 8900,
    },
    location: "Bangkok, Thailand",
  },
];

export const mockComments = [
  {
    id: "c1",
    text: "สวยมากเลยครับ! อยากไปมาก",
    user: {
      id: "u3",
      name: "Thai Traveler",
      avatar: "/src/shared/assets/hero-beach.jpg",
    },
    timestamp: "2 hours ago",
    likes: 15,
  },
  {
    id: "c2",
    text: "Amazing place! Cannot wait to visit",
    user: {
      id: "u4",
      name: "Adventure Seeker",
      avatar: "/src/shared/assets/mountain-nature.jpg",
    },
    timestamp: "1 day ago",
    likes: 8,
  },
];

// Mock attraction details for AttractionDetail page
export const mockAttractionDetails = {
  "1": {
    id: "1",
    name: "Phi Phi Islands",
    nameLocal: "หมู่เกาะพีพี",
    province: "Krabi",
    category: "Islands",
    rating: 4.8,
    reviewCount: 2341,
    images: [
      "/src/shared/assets/hero-beach.jpg",
      "/src/shared/assets/mountain-nature.jpg",
      "/src/shared/assets/temple-culture.jpg",
    ],
    description:
      "Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.",
    tags: ["Beach", "Snorkeling", "Island", "Photography"],
    rooms: [
      {
        id: "r1",
        name: "Beachfront Villa",
        price: 2500,
        currency: "THB",
        image: "/src/shared/assets/hero-beach.jpg",
        amenities: ["Sea View", "Private Beach", "WiFi", "Air Conditioning"],
      },
      {
        id: "r2",
        name: "Garden Bungalow",
        price: 1800,
        currency: "THB",
        image: "/src/shared/assets/mountain-nature.jpg",
        amenities: ["Garden View", "WiFi", "Air Conditioning", "Breakfast"],
      },
    ],
    location: { lat: 7.7407, lng: 98.7784 },
    amenities: ["Restaurant", "Snorkeling", "Beach Access", "Boat Tours"],
  },
  "2": {
    id: "2",
    name: "Temple of the Emerald Buddha",
    nameLocal: "วัดพระแก้ว",
    province: "Bangkok",
    category: "Temples",
    rating: 4.9,
    reviewCount: 5678,
    images: [
      "/src/shared/assets/temple-culture.jpg",
      "/src/shared/assets/hero-beach.jpg",
      "/src/shared/assets/mountain-nature.jpg",
    ],
    description:
      "The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue. Located within the Grand Palace complex, this temple is a must-visit for anyone interested in Thai culture and Buddhism.",
    tags: ["Temple", "Culture", "History", "Buddhist"],
    rooms: [
      {
        id: "r3",
        name: "Heritage Hotel Suite",
        price: 3200,
        currency: "THB",
        image: "/src/shared/assets/temple-culture.jpg",
        amenities: ["Temple View", "Cultural Tours", "WiFi", "Traditional Décor"],
      },
      {
        id: "r4",
        name: "City Center Room",
        price: 2100,
        currency: "THB",
        image: "/src/shared/assets/temple-culture.jpg",
        amenities: ["City View", "WiFi", "Air Conditioning", "Breakfast"],
      },
    ],
    location: { lat: 13.7515, lng: 100.4917 },
    amenities: ["Audio Guide", "Gift Shop", "Prayer Area", "Cultural Tours"],
  },
  "3": {
    id: "3",
    name: "Doi Inthanon National Park",
    nameLocal: "อุทยานแห่งชาติดอยอินทนนท์",
    province: "Chiang Mai",
    category: "Nature",
    rating: 4.7,
    reviewCount: 1856,
    images: [
      "/src/shared/assets/mountain-nature.jpg",
      "/src/shared/assets/hero-beach.jpg",
      "/src/shared/assets/temple-culture.jpg",
    ],
    description:
      "Thailand's highest peak offering stunning mountain views, waterfalls, and diverse wildlife. Perfect for nature lovers, hikers, and photographers seeking cooler climate and pristine natural beauty.",
    tags: ["Mountain", "Nature", "Hiking", "Wildlife"],
    rooms: [
      {
        id: "r5",
        name: "Mountain Lodge",
        price: 1800,
        currency: "THB",
        image: "/src/shared/assets/mountain-nature.jpg",
        amenities: ["Mountain View", "Fireplace", "Hiking Gear", "Nature Tours"],
      },
      {
        id: "r6",
        name: "Eco Cabin",
        price: 1200,
        currency: "THB",
        image: "/src/shared/assets/mountain-nature.jpg",
        amenities: ["Forest View", "Eco-friendly", "WiFi", "Hot Water"],
      },
    ],
    location: { lat: 18.5885, lng: 98.4867 },
    amenities: ["Hiking Trails", "Visitor Center", "Parking", "Restrooms"],
  },
  "4": {
    id: "4",
    name: "Floating Market",
    nameLocal: "ตลาดน้ำ",
    province: "Bangkok",
    category: "Markets",
    rating: 4.6,
    reviewCount: 3421,
    images: [
      "/src/shared/assets/floating-market.jpg",
      "/src/shared/assets/temple-culture.jpg",
      "/src/shared/assets/hero-beach.jpg",
    ],
    description:
      "Traditional floating market where vendors sell fresh fruits, local food, and handicrafts from boats. Experience authentic Thai culture while enjoying delicious local cuisine and shopping for unique souvenirs.",
    tags: ["Market", "Culture", "Food", "Boat Tours"],
    rooms: [
      {
        id: "r7",
        name: "Riverside Resort",
        price: 2800,
        currency: "THB",
        image: "/src/shared/assets/floating-market.jpg",
        amenities: ["River View", "Boat Access", "Restaurant", "Cultural Shows"],
      },
      {
        id: "r8",
        name: "Local Homestay",
        price: 1500,
        currency: "THB",
        image: "/src/shared/assets/floating-market.jpg",
        amenities: ["Local Experience", "Home Cooking", "WiFi", "Family Friendly"],
      },
    ],
    location: { lat: 13.5167, lng: 100.1167 },
    amenities: ["Boat Tours", "Food Stalls", "Souvenirs", "Photography"],
  },
};

// Simulate network delay for realistic mock responses
export const simulateDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock search function with realistic behavior
export const mockSearch = async (query: string): Promise<SearchResponse> => {
  await simulateDelay();

  const filteredResults = mockAttractions.filter(
    (attraction) =>
      attraction.name.toLowerCase().includes(query.toLowerCase()) ||
      attraction.nameLocal?.includes(query) ||
      attraction.tags.some((tag) =>
        tag.toLowerCase().includes(query.toLowerCase())
      ) ||
      attraction.category.toLowerCase().includes(query.toLowerCase())
  );

  return {
    results: filteredResults,
    suggestions: mockSuggestions.filter((s) =>
      s.text.toLowerCase().includes(query.toLowerCase())
    ),
    totalCount: filteredResults.length,
    query,
    processingTime: Math.random() * 200 + 50,
  };
};
