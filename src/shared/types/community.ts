// Community types for social features
export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  points: number;
  level: UserLevel;
  badges: Badge[];
  joinedAt: Date;
  isVerified: boolean;
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  title?: string; // Travel story title
  content: string;
  images: string[];
  videos: string[];
  location?: LocationTag;
  accommodation?: AccommodationTag;
  route?: TravelRoute; // Travel route information
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  inspirationScore: number; // Average 1-5 star rating
  inspirationCount: number; // Number of inspiration votes
  isLiked: boolean;
  isSaved: boolean;
  userInspiration?: number; // Current user's inspiration rating
  travelZone?: TravelZone; // Travel zone category
  createdAt: Date;
  updatedAt: Date;
  privacy: 'public' | 'friends' | 'private';
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  replyToId?: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  category: GroupCategory;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  moderators: User[];
  isJoined: boolean;
  createdAt: Date;
  rules: string[];
}

export interface LocationTag {
  id: string;
  name: string;
  province: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface TravelRoute {
  id: string;
  name: string;
  summary: string;
  waypoints: LocationTag[];
  duration: string; // e.g., "3 วัน 2 คืน"
  budget?: string; // e.g., "5,000-10,000 บาท"
  difficulty: 'easy' | 'medium' | 'hard';
  highlights: string[];
}

export type TravelZone = 
  | 'adventure' // สายผจญภัย
  | 'chill'     // สายชิล  
  | 'family'    // ครอบครัว
  | 'solo'      // เที่ยวคนเดียว
  | 'foodie'    // สายกิน
  | 'culture'   // วัฒนธรรม
  | 'nature'    // ธรรมชาติ
  | 'budget';   // ประหยัด

export type SeasonalTheme = 
  | 'spring'    // ฤดูใบไม้ผลิ
  | 'summer'    // ฤดูร้อน
  | 'autumn'    // ฤดูใบไม้ร่วง  
  | 'winter'    // ฤดูหนาว
  | 'songkran'  // สงกรานต์
  | 'newyear'   // ปีใหม่
  | 'loy-krathong'; // ลอยกระทง

export interface AccommodationTag {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'hostel' | 'guesthouse' | 'homestay';
  location: LocationTag;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserPoints {
  total: number;
  available: number;
  earned: number;
  spent: number;
  history: PointsTransaction[];
}

export interface PointsTransaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'badge' | 'privilege';
  image: string;
  isAvailable: boolean;
  expiresAt?: Date;
}

export type UserLevel = 
  | 'newbie'        // 0-100 points
  | 'explorer'      // 101-500 points  
  | 'adventurer'    // 501-1500 points
  | 'expert'        // 1501-5000 points
  | 'legend';       // 5000+ points

export type GroupCategory = 
  | 'solo-travel'
  | 'family-travel'
  | 'backpacking'
  | 'luxury-travel'
  | 'food-travel'
  | 'adventure'
  | 'cultural'
  | 'photography'
  | 'budget-travel'
  | 'general';

export interface CreatePostData {
  title?: string; // Travel story title
  content: string;
  images?: File[];
  videos?: File[];
  location?: LocationTag;
  accommodation?: AccommodationTag;
  route?: TravelRoute;
  tags: string[];
  travelZone?: TravelZone;
  privacy: 'public' | 'friends' | 'private';
  groupId?: string;
}

export interface FeedFilter {
  type: 'all' | 'following' | 'groups' | 'saved';
  travelZone?: TravelZone; // Filter by travel zone
  groupId?: string;
  location?: string;
  sortBy: 'latest' | 'popular' | 'trending' | 'inspiration'; // Added inspiration sort
}

export interface AIRecommendation {
  score: number;
  reasons: string[];
  tags: string[];
}