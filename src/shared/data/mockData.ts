// Mock data for development and fallback scenarios
import type {
  SearchResult,
  SearchSuggestion,
  SearchResponse,
} from "../utils/searchAPI";
import type {
  Post,
  Location,
  LocationExpansion,
  PostSearchResult,
} from "../types/posts";

// Location expansion mappings for keyword expansion (province → popular places/tags)
export const locationExpansionMap: LocationExpansion = {
  "เชียงใหม่": {
    popularPlaces: ["ดอยสุเทพ", "นิมมาน", "ม่อนแจ่ม", "ดอยอินทนนท์", "วัดเจดีย์หลวง", "ตลาดวโรรส"],
    commonTags: ["ภูเขา", "วัด", "วัฒนธรรม", "กาแฟ", "ธรรมชาติ", "ศิลปะ"],
    aliases: ["chiangmai", "เชียงไหม่", "เทพนคร", "ล้านนา"],
    nearbyProvinces: ["เชียงราย", "ลำปาง", "ลำพูน", "แม่ฮ่องสอน"]
  },
  "chiang mai": {
    popularPlaces: ["Doi Suthep", "Nimman", "Mon Jam", "Doi Inthanon", "Wat Chedi Luang", "Warorot Market"],
    commonTags: ["mountain", "temple", "culture", "coffee", "nature", "art"],
    aliases: ["เชียงใหม่", "chiangmai", "lanna"],
    nearbyProvinces: ["Chiang Rai", "Lampang", "Lamphun", "Mae Hong Son"]
  },
  "กระบี่": {
    popularPlaces: ["เกาะพีพี", "อ่าวนาง", "ไร่เลย์", "เกาะลันตา", "ถ้ำมรกต", "น้ำตกร้อน"],
    commonTags: ["ชายหาด", "เกาะ", "ดำน้ำ", "หน้าผา", "ถ้ำ", "ท่องเที่ยวเชิงนิเวศ"],
    aliases: ["krabi", "กระบี่", "อันดามัน"],
    nearbyProvinces: ["ภูเก็ต", "พังงา", "ตรัง", "นครศรีธรรมราช"]
  },
  "krabi": {
    popularPlaces: ["Phi Phi Islands", "Ao Nang", "Railay", "Koh Lanta", "Emerald Pool", "Hot Springs"],
    commonTags: ["beach", "island", "diving", "cliff", "cave", "eco-tourism"],
    aliases: ["กระบี่", "andaman"],
    nearbyProvinces: ["Phuket", "Phang Nga", "Trang", "Nakhon Si Thammarat"]
  },
  "กรุงเทพ": {
    popularPlaces: ["วัดพระแก้ว", "พระบรมมหาราชวัง", "วัดอรุณ", "ตลาดจตุจักร", "ตลาดน้ำ", "ถนนข้าวสาร"],
    commonTags: ["วัด", "ตลาด", "อาหาร", "ช้อปปิ้ง", "วัฒนธรรม", "ประวัติศาสตร์"],
    aliases: ["bangkok", "บางกอก", "กทม", "กรุงเทพมหานคร"],
    nearbyProvinces: ["นนทบุรี", "ปทุมธานี", "สมุทรปราการ", "นครปฐม"]
  },
  "bangkok": {
    popularPlaces: ["Wat Phra Kaew", "Grand Palace", "Wat Arun", "Chatuchak Market", "Floating Market", "Khao San Road"],
    commonTags: ["temple", "market", "food", "shopping", "culture", "history"],
    aliases: ["กรุงเทพ", "บางกอก", "กทม"],
    nearbyProvinces: ["Nonthaburi", "Pathum Thani", "Samut Prakan", "Nakhon Pathom"]
  },
  "ภูเก็ต": {
    popularPlaces: ["ป่าตอง", "กะตะ", "กะรน", "พิพิธภัณฑ์ไทรเซรามิค", "วัดชัยธาราราม", "จุดชมวิวเขาแหลม"],
    commonTags: ["ชายหาด", "ดำน้ำ", "ชีวิตเมื่อคืน", "อาหารทะเล", "โรงแรม", "สปา"],
    aliases: ["phuket", "ภูกัต", "มุกดา"],
    nearbyProvinces: ["พังงา", "กระบี่", "ระนอง", "สุราษฎร์ธานี"]
  },
  "ทะเล": {
    popularPlaces: ["ป่าตอง", "อ่าวนาง", "หาดใหญ่", "เกาะพีพี", "เกาะสมุย", "หัวหิน"],
    commonTags: ["ชายหาด", "เกาะ", "ดำน้ำ", "อาหารทะเล", "โรงแรม", "รีสอร์ท"],
    aliases: ["beach", "sea", "ocean", "ชายหาด"],
    nearbyProvinces: []
  },
  "ภูเขา": {
    popularPlaces: ["ดอยอินทนนท์", "ดอยสุเทพ", "เขาใหญ่", "ดอยผางค่า", "เขาค้อ", "ภูทับเบิก"],
    commonTags: ["ธรรมชาติ", "เดินป่า", "อากาศเย็น", "น้ำตก", "ดูดาว", "ปีนเขา"],
    aliases: ["mountain", "hill", "doi", "เขา", "ภู"],
    nearbyProvinces: []
  }
};

// Enhanced locations with more detailed information
export const mockLocations: Location[] = [
  {
    id: "loc_phi_phi",
    name: "Phi Phi Islands",
    nameLocal: "หมู่เกาะพีพี",
    aliases: ["พีพี", "phi phi", "pp island"],
    province: "Krabi",
    provinceLocal: "กระบี่",
    region: "South",
    category: "Islands",
    tags: ["Beach", "Snorkeling", "Island", "Photography", "Diving"],
    geo: { lat: 7.7407, lng: 98.7784 },
    popularityScore: 0.95,
    description: "Crystal clear waters and stunning limestone cliffs",
    descriptionLocal: "น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม"
  },
  {
    id: "loc_doi_suthep",
    name: "Doi Suthep",
    nameLocal: "ดอยสุเทพ",
    aliases: ["สุเทพ", "doi suthep", "wat doi suthep"],
    province: "Chiang Mai",
    provinceLocal: "เชียงใหม่",
    region: "North",
    category: "Temples",
    tags: ["Temple", "Mountain", "Culture", "Buddhism", "View"],
    geo: { lat: 18.8044, lng: 98.9217 },
    popularityScore: 0.93,
    description: "Sacred temple on the mountain with panoramic city views",
    descriptionLocal: "วัดศักดิ์สิทธิ์บนภูเขาที่มีวิวเมืองอันงดงาม"
  },
  {
    id: "loc_grand_palace",
    name: "Grand Palace",
    nameLocal: "พระบรมมหาราชวัง",
    aliases: ["palace", "royal palace", "พระราชวัง"],
    province: "Bangkok",
    provinceLocal: "กรุงเทพฯ",
    region: "Central",
    category: "Attraction",
    tags: ["Palace", "Culture", "History", "Architecture", "Royal"],
    geo: { lat: 13.7500, lng: 100.4917 },
    popularityScore: 0.98,
    description: "The former royal residence and Thailand's most sacred temple complex",
    descriptionLocal: "พระราชวังเก่าและวัดที่ศักดิ์สิทธิ์ที่สุดของไทย"
  },
  {
    id: "loc_doi_inthanon",
    name: "Doi Inthanon",
    nameLocal: "ดอยอินทนนท์",
    aliases: ["อินทนนท์", "doi inthanon", "inthanon"],
    province: "Chiang Mai",
    provinceLocal: "เชียงใหม่",
    region: "North",
    category: "Nature",
    tags: ["Mountain", "Nature", "Hiking", "Wildlife", "Cool Weather"],
    geo: { lat: 18.5885, lng: 98.4867 },
    popularityScore: 0.87,
    description: "Thailand's highest peak with stunning views and cool climate",
    descriptionLocal: "ยอดเขาที่สูงที่สุดในไทยพร้อมวิวสวยและอากาศเย็น"
  }
];

// Mock posts with enhanced metadata
export const mockPosts: Post[] = [
  {
    id: "post_1",
    userId: "user_1",
    user: {
      id: "user_1",
      name: "Travel Thailand",
      avatar: "/src/shared/assets/hero-beach.jpg",
      verified: true
    },
    media: [
      {
        id: "media_1",
        type: "image",
        url: "/src/shared/assets/hero-beach.jpg",
        thumbUrl: "/src/shared/assets/hero-beach.jpg",
        alt: "Beautiful Phi Phi Islands sunset",
        size: { width: 1920, height: 1080 }
      }
    ],
    caption: "Amazing sunset at Phi Phi Islands! The crystal clear water and limestone cliffs create the perfect paradise. ชายหาดที่สวยงามที่สุดในประเทศไทย 🏝️ #PhiPhiIslands #Thailand #Beach #Sunset",
    tags: ["Beach", "Sunset", "PhiPhiIslands", "Krabi", "Paradise", "Travel"],
    locationId: "loc_phi_phi",
    location: {
      name: "Phi Phi Islands",
      nameLocal: "หมู่เกาะพีพี",
      province: "Krabi"
    },
    geo: { lat: 7.7407, lng: 98.7784, accuracy: 100 },
    likeCount: 1250,
    commentCount: 89,
    shareCount: 45,
    viewCount: 15420,
    createdAt: "2024-01-15T14:30:00Z",
    isPublic: true,
    language: "en"
  },
  {
    id: "post_2", 
    userId: "user_2",
    user: {
      id: "user_2",
      name: "เที่ยวไทยกับเรา",
      avatar: "/src/shared/assets/temple-culture.jpg",
      verified: false
    },
    media: [
      {
        id: "media_2",
        type: "image",
        url: "/src/shared/assets/temple-culture.jpg",
        thumbUrl: "/src/shared/assets/temple-culture.jpg",
        alt: "Doi Suthep Temple golden pagoda",
        size: { width: 1280, height: 960 }
      }
    ],
    caption: "วัดดอยสุเทพที่สวยงาม วิวเชียงใหม่จากที่นี่งดมาก! การไหว้พระและชมพระอาทิตย์ตกดิน เป็นประสบการณ์ที่ไม่ลืม 🙏 #ดอยสุเทพ #เชียงใหม่ #วัด #วิว",
    tags: ["Temple", "DoiSuthep", "ChiangMai", "Buddhism", "View", "Culture"],
    locationId: "loc_doi_suthep",
    location: {
      name: "Doi Suthep",
      nameLocal: "ดอยสุเทพ", 
      province: "Chiang Mai"
    },
    geo: { lat: 18.8044, lng: 98.9217, accuracy: 50 },
    likeCount: 892,
    commentCount: 56,
    shareCount: 23,
    viewCount: 8900,
    createdAt: "2024-01-12T10:15:00Z",
    isPublic: true,
    language: "th"
  },
  {
    id: "post_3",
    userId: "user_3", 
    user: {
      id: "user_3",
      name: "Bangkok Explorer",
      avatar: "/src/shared/assets/floating-market.jpg",
      verified: false
    },
    media: [
      {
        id: "media_3",
        type: "image",
        url: "/src/shared/assets/temple-culture.jpg",
        thumbUrl: "/src/shared/assets/temple-culture.jpg",
        alt: "Grand Palace architecture detail",
        size: { width: 1600, height: 1200 }
      }
    ],
    caption: "The magnificent Grand Palace in Bangkok - a masterpiece of Thai architecture and history. The intricate details and golden decorations are absolutely breathtaking! พระบรมมหาราชวังที่สวยงามตระการตา #GrandPalace #Bangkok #Thai #Architecture #History",
    tags: ["Palace", "Bangkok", "Architecture", "History", "Culture", "Royal"],
    locationId: "loc_grand_palace",
    location: {
      name: "Grand Palace",
      nameLocal: "พระบรมมหาราชวัง",
      province: "Bangkok"
    },
    geo: { lat: 13.7500, lng: 100.4917, accuracy: 25 },
    likeCount: 2156,
    commentCount: 134,
    shareCount: 89,
    viewCount: 23100,
    createdAt: "2024-01-10T16:45:00Z",
    isPublic: true,
    language: "en"
  },
  {
    id: "post_4",
    userId: "user_4",
    user: {
      id: "user_4", 
      name: "Nature Lover TH",
      avatar: "/src/shared/assets/mountain-nature.jpg",
      verified: false
    },
    media: [
      {
        id: "media_4",
        type: "image",
        url: "/src/shared/assets/mountain-nature.jpg",
        thumbUrl: "/src/shared/assets/mountain-nature.jpg",
        alt: "Doi Inthanon misty mountain view",
        size: { width: 1920, height: 1440 }
      }
    ],
    caption: "เช้าที่ดอยอินทนนท์ หมอกขาวปกคลุมภูเขา อากาศเย็นสบาย นกน้อยร้องเพลง ธรรมชาติที่บริสุทธิ์และสงบ 🏔️ #ดอยอินทนนท์ #เชียงใหม่ #ภูเขา #ธรรมชาติ #หมอก",
    tags: ["Mountain", "Nature", "DoiInthanon", "ChiangMai", "Mist", "Peaceful"],
    locationId: "loc_doi_inthanon",
    location: {
      name: "Doi Inthanon",
      nameLocal: "ดอยอินทนนท์",
      province: "Chiang Mai"
    },
    geo: { lat: 18.5885, lng: 98.4867, accuracy: 75 },
    likeCount: 567,
    commentCount: 34,
    shareCount: 12,
    viewCount: 4200,
    createdAt: "2024-01-08T06:30:00Z",
    isPublic: true,
    language: "th"
  }
];

// Mock search results with enhanced metadata
export const mockPostSearchResults: PostSearchResult[] = mockPosts.map(post => ({
  ...post,
  searchMetrics: {
    relevanceScore: Math.random() * 0.4 + 0.6,
    popularityScore: Math.min(post.likeCount / 2500, 1),
    recencyScore: Math.max(0, 1 - (Date.now() - new Date(post.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000)),
    finalScore: 0
  },
  matchedTerms: [],
  highlightedCaption: post.caption
}));

// Keep original attractions for backward compatibility  
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
  {
    id: "5",
    name: "Grand Palace",
    nameLocal: "พระบรมมหาราชวัง",
    province: "Bangkok",
    category: "Attraction",
    tags: ["Palace", "Culture", "History", "Architecture"],
    rating: 4.9,
    reviewCount: 8765,
    image: "/src/shared/assets/temple-culture.jpg",
    description:
      "The Grand Palace is a complex of buildings at the heart of Bangkok, Thailand. It was the official residence of the Kings of Siam.",
    confidence: 0.97,
    matchedTerms: ["palace", "grand", "attraction"],
    amenities: ["Audio Guide", "Gift Shop", "Cultural Tours", "Photography"],
    location: { lat: 13.7500, lng: 100.4917 },
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
    ],
    location: { lat: 7.7407, lng: 98.7784 },
    amenities: ["Restaurant", "Snorkeling", "Beach Access", "Boat Tours"],
    externalLinks: {
      officialWebsite: "https://www.thailand.travel/en/destinations/krabi/phi-phi-islands",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Phi_Phi_Islands"
    },
  },
};

// Mock accommodations data
export const mockAccommodations = {
  "1": [
    {
      id: "h1",
      name: "Phi Phi Island Resort",
      nameLocal: "รีสอร์ทหมู่เกาะพีพี",
      rating: 4.5,
      distance: 0.8,
      image: "/src/shared/assets/hero-beach.jpg",
      price: 3500,
      currency: "THB",
      amenities: ["Sea View", "Private Beach", "Pool", "Spa"],
      booking_url: "https://booking.com/hotel/phi-phi-island-resort"
    },
  ]
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