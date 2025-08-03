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
  content: string;
  images: string[];
  videos: string[];
  location?: LocationTag;
  accommodation?: AccommodationTag;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
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
  content: string;
  images?: File[];
  videos?: File[];
  location?: LocationTag;
  accommodation?: AccommodationTag;
  tags: string[];
  privacy: 'public' | 'friends' | 'private';
  groupId?: string;
}

export interface FeedFilter {
  type: 'all' | 'following' | 'groups' | 'saved';
  groupId?: string;
  location?: string;
  sortBy: 'latest' | 'popular' | 'trending';
}

export interface AIRecommendation {
  score: number;
  reasons: string[];
  tags: string[];
}