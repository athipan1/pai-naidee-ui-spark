// Search API utilities and types
export interface SearchQuery {
  query: string;
  language: 'th' | 'en';
  filters: {
    provinces: string[];
    categories: string[];
    amenities: string[];
  };
}

export interface SearchSuggestion {
  id: string;
  type: 'place' | 'province' | 'category' | 'tag' | 'phrase';
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

// Mock data for development
export const mockSearchData = {
  places: [
    {
      id: '1',
      name: 'Phi Phi Islands',
      nameLocal: 'เกาะพีพี',
      province: 'Krabi',
      provinceLocal: 'กระบี่',
      category: 'Beach',
      tags: ['Beach', 'Snorkeling', 'Island', 'Photography'],
      tagsLocal: ['ชายหาด', 'ดำน้ำดูปะการัง', 'เกาะ', 'ถ่ายรูป'],
      rating: 4.8,
      reviewCount: 2547,
      image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: {
        th: 'น้ำทะเลใสและหน้าผาหินปูนที่สวยงาม ทำให้ที่นี่เป็นสวรรค์สำหรับผู้ที่ชื่นชอบชายหาดและการดำน้ำดูปะการัง',
        en: 'Crystal clear waters and stunning limestone cliffs make this a paradise for beach lovers and snorkeling enthusiasts.'
      },
      amenities: ['Restaurant', 'Boat Tours', 'Snorkeling Equipment', 'Beach Chairs'],
      location: { lat: 7.7407, lng: 98.7784 }
    },
    {
      id: '2',
      name: 'Wat Phra Kaew',
      nameLocal: 'วัดพระแก้ว',
      province: 'Bangkok',
      provinceLocal: 'กรุงเทพฯ',
      category: 'Culture',
      tags: ['Temple', 'Culture', 'Buddhism', 'History'],
      tagsLocal: ['วัด', 'วัฒนธรรม', 'พุทธศาสนา', 'ประวัติศาสตร์'],
      rating: 4.9,
      reviewCount: 5243,
      image: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: {
        th: 'วัดที่ศักดิ์สิทธิ์ที่สุดในประเทศไทย เป็นที่ประดิษฐานของพระแก้วมรกต',
        en: 'The most sacred Buddhist temple in Thailand, home to the revered Emerald Buddha statue.'
      },
      amenities: ['Audio Guide', 'Gift Shop', 'Guided Tours', 'Parking'],
      location: { lat: 13.7515, lng: 100.4925 }
    },
    {
      id: '3',
      name: 'Doi Inthanon',
      nameLocal: 'ดอยอินทนนท์',
      province: 'Chiang Mai',
      provinceLocal: 'เชียงใหม่',
      category: 'Nature',
      tags: ['Mountain', 'Nature', 'Hiking', 'Waterfalls'],
      tagsLocal: ['ภูเขา', 'ธรรมชาติ', 'เดินป่า', 'น้ำตก'],
      rating: 4.7,
      reviewCount: 1876,
      image: 'https://images.pexels.com/photos/1450360/pexels-photo-1450360.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: {
        th: 'ยอดเขาที่สูงที่สุดในประเทศไทย ชมวิวภูเขาที่งดงาม น้ำตก และอากาศเย็นสบาย',
        en: 'The highest peak in Thailand offering breathtaking mountain views, waterfalls, and cool weather.'
      },
      amenities: ['Hiking Trails', 'Visitor Center', 'Camping', 'Restaurant'],
      location: { lat: 18.5889, lng: 98.4867 }
    }
  ],
  
  provinces: [
    { id: 'bangkok', name: 'Bangkok', nameLocal: 'กรุงเทพฯ' },
    { id: 'krabi', name: 'Krabi', nameLocal: 'กระบี่' },
    { id: 'chiang-mai', name: 'Chiang Mai', nameLocal: 'เชียงใหม่' },
    { id: 'phuket', name: 'Phuket', nameLocal: 'ภูเก็ต' },
    { id: 'koh-samui', name: 'Koh Samui', nameLocal: 'เกาะสมุย' }
  ],
  
  categories: [
    { id: 'beach', name: 'Beach', nameLocal: 'ชายหาด' },
    { id: 'culture', name: 'Culture', nameLocal: 'วัฒนธรรม' },
    { id: 'nature', name: 'Nature', nameLocal: 'ธรรมชาติ' },
    { id: 'food', name: 'Food', nameLocal: 'อาหาร' },
    { id: 'mountain', name: 'Mountain', nameLocal: 'ภูเขา' }
  ],
  
  amenities: [
    { id: 'restaurant', name: 'Restaurant', nameLocal: 'ร้านอาหาร' },
    { id: 'parking', name: 'Parking', nameLocal: 'ที่จอดรถ' },
    { id: 'wifi', name: 'WiFi', nameLocal: 'WiFi' },
    { id: 'guide', name: 'Tour Guide', nameLocal: 'ไกด์นำเที่ยว' },
    { id: 'shop', name: 'Gift Shop', nameLocal: 'ร้านของฝาก' }
  ]
};

// Fuzzy matching utility
export const fuzzyMatch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match
  if (textLower === queryLower) return 1.0;
  
  // Contains match
  if (textLower.includes(queryLower)) return 0.8;
  
  // Word boundary match
  const words = textLower.split(' ');
  const queryWords = queryLower.split(' ');
  
  let matchCount = 0;
  for (const queryWord of queryWords) {
    for (const word of words) {
      if (word.includes(queryWord) || queryWord.includes(word)) {
        matchCount++;
        break;
      }
    }
  }
  
  const wordMatchRatio = matchCount / queryWords.length;
  if (wordMatchRatio > 0.5) return 0.6 * wordMatchRatio;
  
  // Character similarity (simplified Levenshtein)
  const similarity = calculateSimilarity(queryLower, textLower);
  return similarity > 0.5 ? similarity * 0.4 : 0;
};

const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Search function
export const performSearch = (searchQuery: SearchQuery): SearchResponse => {
  const { query, language, filters } = searchQuery;
  const startTime = Date.now();
  
  const results: SearchResult[] = [];
  const suggestions: SearchSuggestion[] = [];
  
  // Search places
  for (const place of mockSearchData.places) {
    const nameToSearch = language === 'th' && place.nameLocal ? place.nameLocal : place.name;
    const descriptionToSearch = place.description[language];
    const tagsToSearch = language === 'th' ? place.tagsLocal : place.tags;
    const provinceToSearch = language === 'th' ? place.provinceLocal : place.province;
    
    // Calculate confidence scores
    const nameScore = fuzzyMatch(query, nameToSearch);
    const descriptionScore = fuzzyMatch(query, descriptionToSearch) * 0.7;
    const tagScore = Math.max(...tagsToSearch.map(tag => fuzzyMatch(query, tag))) * 0.8;
    const provinceScore = fuzzyMatch(query, provinceToSearch) * 0.6;
    
    const maxScore = Math.max(nameScore, descriptionScore, tagScore, provinceScore);
    
    if (maxScore > 0.3) {
      // Apply filters
      let passesFilter = true;
      
      if (filters.provinces.length > 0) {
        passesFilter = passesFilter && filters.provinces.includes(place.province.toLowerCase());
      }
      
      if (filters.categories.length > 0) {
        passesFilter = passesFilter && filters.categories.includes(place.category.toLowerCase());
      }
      
      if (filters.amenities.length > 0) {
        passesFilter = passesFilter && filters.amenities.some(amenity => 
          place.amenities?.some(placeAmenity => 
            placeAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
      }
      
      if (passesFilter) {
        const matchedTerms = [];
        if (nameScore > 0.3) matchedTerms.push(nameToSearch);
        if (tagScore > 0.3) matchedTerms.push(...tagsToSearch.filter(tag => fuzzyMatch(query, tag) > 0.3));
        
        results.push({
          id: place.id,
          name: place.name,
          nameLocal: place.nameLocal,
          province: language === 'th' ? place.provinceLocal : place.province,
          category: place.category,
          tags: language === 'th' ? place.tagsLocal : place.tags,
          rating: place.rating,
          reviewCount: place.reviewCount,
          image: place.image,
          description: place.description[language],
          confidence: maxScore,
          matchedTerms,
          amenities: place.amenities,
          location: place.location
        });
      }
    }
  }
  
  // Generate suggestions
  if (query.length > 0) {
    // Place suggestions
    for (const place of mockSearchData.places) {
      const nameToSearch = language === 'th' && place.nameLocal ? place.nameLocal : place.name;
      const score = fuzzyMatch(query, nameToSearch);
      
      if (score > 0.4) {
        suggestions.push({
          id: `place-${place.id}`,
          type: 'place',
          text: nameToSearch,
          description: language === 'th' ? place.provinceLocal : place.province,
          province: language === 'th' ? place.provinceLocal : place.province,
          category: place.category,
          confidence: score,
          image: place.image
        });
      }
    }
    
    // Province suggestions
    for (const province of mockSearchData.provinces) {
      const nameToSearch = language === 'th' ? province.nameLocal : province.name;
      const score = fuzzyMatch(query, nameToSearch);
      
      if (score > 0.4) {
        suggestions.push({
          id: `province-${province.id}`,
          type: 'province',
          text: nameToSearch,
          description: language === 'th' ? 'จังหวัด' : 'Province',
          confidence: score
        });
      }
    }
    
    // Category suggestions
    for (const category of mockSearchData.categories) {
      const nameToSearch = language === 'th' ? category.nameLocal : category.name;
      const score = fuzzyMatch(query, nameToSearch);
      
      if (score > 0.4) {
        suggestions.push({
          id: `category-${category.id}`,
          type: 'category',
          text: nameToSearch,
          description: language === 'th' ? 'หมวดหมู่' : 'Category',
          confidence: score
        });
      }
    }
  }
  
  // Sort results by confidence
  results.sort((a, b) => b.confidence - a.confidence);
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  const processingTime = Date.now() - startTime;
  
  return {
    results: results.slice(0, 20), // Limit to top 20 results
    suggestions: suggestions.slice(0, 10), // Limit to top 10 suggestions
    totalCount: results.length,
    query,
    processingTime
  };
};