// Community Service for social features
import { Post, Comment, Group, User, CreatePostData, FeedFilter, UserPoints, Reward, Badge } from '../types/community';

// Mock data for development
const mockUsers: User[] = [
  {
    id: '1',
    username: 'wanderlust_thai',
    displayName: 'นักเดินทางไทย',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
    bio: 'เที่ยวทั่วไทย รักการผจญภัย',
    points: 2450,
    level: 'adventurer',
    badges: [],
    joinedAt: new Date('2024-01-15'),
    isVerified: true
  },
  {
    id: '2', 
    username: 'solo_explorer',
    displayName: 'เที่ยวคนเดียว',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Solo traveler | Backpacker',
    points: 850,
    level: 'explorer',
    badges: [],
    joinedAt: new Date('2024-02-20'),
    isVerified: false
  }
];

const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: mockUsers[0],
    title: 'พาหัวใจไปปักหลักดอยสุเทพ',
    content: 'เพิ่งกลับจากเที่ยวเชียงใหม่มา อากาศดีมาก วิวสวยมาก แนะนำให้ไปช่วงนี้เลย! อุณหภูมิเพอร์เฟค เย็นสบาย ได้ทำบุญที่วัดพระธาตุดอยสุเทพ และชมวิวเมืองเชียงใหม่จากมุมสูง 🏔️✨',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
      'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600'
    ],
    videos: [],
    location: {
      id: 'cm1',
      name: 'ดอยสุเทพ',
      province: 'เชียงใหม่',
      coordinates: { lat: 18.8050, lng: 98.9220 }
    },
    route: {
      id: 'route1',
      name: 'เส้นทางชมดอยสุเทพ',
      summary: 'เริ่มจากตัวเมืองเชียงใหม่ ขึ้นดอยสุเทพ ชมพระธาตุ และวิวเมือง',
      waypoints: [
        {
          id: 'wp1',
          name: 'ประตูท่าแพ',
          province: 'เชียงใหม่',
          coordinates: { lat: 18.7883, lng: 98.9930 }
        },
        {
          id: 'wp2', 
          name: 'วัดพระธาตุดอยสุเทพ',
          province: 'เชียงใหม่',
          coordinates: { lat: 18.8050, lng: 98.9220 }
        }
      ],
      duration: '1 วัน',
      budget: '500-1,000 บาท',
      difficulty: 'easy',
      highlights: ['วิวเมืองเชียงใหม่', 'พระธาตุศักดิ์สิทธิ์', 'อากาศเย็นสบาย']
    },
    tags: ['เชียงใหม่', 'ดอยสุเทพ', 'วิวสวย', 'วัด', 'ธรรมชาติ'],
    likes: 124,
    comments: 23,
    shares: 12,
    inspirationScore: 4.2,
    inspirationCount: 89,
    isLiked: false,
    isSaved: false,
    userInspiration: undefined,
    travelZone: 'culture',
    createdAt: new Date('2024-03-15T10:30:00'),
    updatedAt: new Date('2024-03-15T10:30:00'),
    privacy: 'public'
  },
  {
    id: '2',
    userId: '2',
    user: mockUsers[1],
    title: 'ทริปแบกเป้ภาคใต้ งบ 3K ไป 7 วัน',
    content: 'ทริปแบกเป้เที่ยวภาคใต้ 7 วัน งบแค่ 3,000 บาท! มาดูเทคนิคประหยัดกัน 💰 นอนโฮสเทล กินข้าวตามร้านประชาชน ใช้รถประจำทาง และหาของฟรี ๆ ทำได้จริง!',
    images: [
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600'
    ],
    videos: [],
    location: {
      id: 'sk1',
      name: 'เกาะสมุย',
      province: 'สุราษฎร์ธานี',
      coordinates: { lat: 9.5018, lng: 99.9648 }
    },
    route: {
      id: 'route2',
      name: 'เส้นทางแบกเป้ภาคใต้',
      summary: 'ทริปประหยัด เริ่มจากกรุงเทพ-สุราษฎร์ธานี-เกาะสมุย-เกาะพะงัน',
      waypoints: [
        {
          id: 'wp3',
          name: 'สุราษฎร์ธานี',
          province: 'สุราษฎร์ธานี',
          coordinates: { lat: 9.1382, lng: 99.3215 }
        },
        {
          id: 'wp4',
          name: 'เกาะสมุย',
          province: 'สุราษฎร์ธานี', 
          coordinates: { lat: 9.5018, lng: 99.9648 }
        },
        {
          id: 'wp5',
          name: 'เกาะพะงัน',
          province: 'สุราษฎร์ธานี',
          coordinates: { lat: 9.7604, lng: 100.0270 }
        }
      ],
      duration: '7 วัน 6 คืน',
      budget: '3,000 บาท',
      difficulty: 'medium',
      highlights: ['ชายหาดสวย', 'โฮสเทลถูก', 'อาหารประชาชน', 'ฟูลมูนปาร์ตี้']
    },
    tags: ['แบกเป้', 'ประหยัด', 'ภาคใต้', 'เที่ยวงบน้อย', 'เกาะ'],
    likes: 89,
    comments: 15,
    shares: 8,
    inspirationScore: 3.8,
    inspirationCount: 67,
    isLiked: true,
    isSaved: true,
    userInspiration: 4,
    travelZone: 'budget',
    createdAt: new Date('2024-03-14T15:45:00'),
    updatedAt: new Date('2024-03-14T15:45:00'),
    privacy: 'public'
  },
  {
    id: '3',
    userId: '1',
    user: mockUsers[0],
    title: 'ผจญภัยล่องแก่งแม่ปิง',
    content: 'วันนี้ไปล่องแก่งแม่ปิงกับครอบครัว สนุกมาก! น้ำใสมาก ปลาเยอะ และได้เห็นช้างป่าด้วย 🐘 แนะนำสำหรับใครที่ชอบผจญภัยแต่ไม่อันตราย เหมาะกับครอบครัวมาก',
    images: [
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600'
    ],
    videos: [],
    location: {
      id: 'cm2',
      name: 'แม่ปิง',
      province: 'เชียงใหม่',
      coordinates: { lat: 18.7061, lng: 98.9825 }
    },
    route: {
      id: 'route3',
      name: 'ล่องแก่งแม่ปิง',
      summary: 'เส้นทางล่องแก่งตั้งแต่ท่าเรือแม่ปิงถึงสวนป่าแม่ปิง',
      waypoints: [
        {
          id: 'wp6',
          name: 'ท่าเรือแม่ปิง',
          province: 'เชียงใหม่',
          coordinates: { lat: 18.7061, lng: 98.9825 }
        },
        {
          id: 'wp7',
          name: 'สวนป่าแม่ปิง',
          province: 'เชียงใหม่',
          coordinates: { lat: 18.6900, lng: 98.9600 }
        }
      ],
      duration: 'ครึ่งวัน',
      budget: '800-1,200 บาท',
      difficulty: 'easy',
      highlights: ['ล่องแก่งปลอดภัย', 'ชมธรรมชาติ', 'เห็นสัตว์ป่า', 'เหมาะครอบครัว']
    },
    tags: ['ล่องแก่ง', 'ผจญภัย', 'ครอบครัว', 'ธรรมชาติ', 'แม่ปิง'],
    likes: 156,
    comments: 31,
    shares: 18,
    inspirationScore: 4.5,
    inspirationCount: 102,
    isLiked: false,
    isSaved: true,
    userInspiration: undefined,
    travelZone: 'adventure',
    createdAt: new Date('2024-03-13T09:15:00'),
    updatedAt: new Date('2024-03-13T09:15:00'),
    privacy: 'public'
  }
];

const mockGroups: Group[] = [
  {
    id: '1',
    name: 'แบกเป้เที่ยวคนเดียว',
    description: 'ชุมชนสำหรับคนที่ชอบเที่ยวคนเดียวแบบแบกเป้',
    coverImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    category: 'solo-travel',
    memberCount: 12450,
    postCount: 3201,
    isPrivate: false,
    moderators: [mockUsers[0]],
    isJoined: true,
    createdAt: new Date('2024-01-01'),
    rules: [
      'โพสต์เนื้อหาที่เกี่ยวข้องกับการเดินทางเท่านั้น',
      'ไม่โพสต์โฆษณาหรือขาย',
      'เคารพความเห็นของสมาชิกอื่น'
    ]
  },
  {
    id: '2',
    name: 'สายกิน เที่ยวทั่วไทย',
    description: 'แนะนำร้านอาหารและขนมอร่อยทั่วไทย',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    category: 'food-travel',
    memberCount: 8750,
    postCount: 1856,
    isPrivate: false,
    moderators: [mockUsers[1]],
    isJoined: false,
    createdAt: new Date('2024-01-15'),
    rules: [
      'แชร์เฉพาะร้านอาหารและสถานที่กิน',
      'ใส่รายละเอียดที่ตั้งและราคา',
      'รูปภาพต้องชัดและน่าสนใจ'
    ]
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

export const communityService = {
  // Feed operations
  getFeed: async (filter: FeedFilter = { type: 'all', sortBy: 'latest' }): Promise<Post[]> => {
    await simulateDelay(800);
    
    let posts = [...mockPosts];
    
    // Apply sorting
    if (filter.sortBy === 'popular') {
      posts.sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
    } else if (filter.sortBy === 'trending') {
      posts.sort((a, b) => (b.likes + b.shares) - (a.likes + a.shares));
    } else if (filter.sortBy === 'inspiration') {
      posts.sort((a, b) => b.inspirationScore - a.inspirationScore);
    } else {
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Apply travel zone filter
    if (filter.travelZone) {
      posts = posts.filter(post => post.travelZone === filter.travelZone);
    }
    
    return posts;
  },

  createPost: async (postData: CreatePostData): Promise<Post> => {
    await simulateDelay(1500);
    
    const newPost: Post = {
      id: Date.now().toString(),
      userId: '1', // Current user
      user: mockUsers[0],
      title: postData.title,
      content: postData.content,
      images: [], // Would be uploaded URLs
      videos: [], // Would be uploaded URLs  
      location: postData.location,
      accommodation: postData.accommodation,
      route: postData.route,
      tags: postData.tags,
      likes: 0,
      comments: 0,
      shares: 0,
      inspirationScore: 0,
      inspirationCount: 0,
      isLiked: false,
      isSaved: false,
      userInspiration: undefined,
      travelZone: postData.travelZone,
      createdAt: new Date(),
      updatedAt: new Date(),
      privacy: postData.privacy
    };
    
    mockPosts.unshift(newPost);
    return newPost;
  },

  // Post interactions
  likePost: async (postId: string): Promise<boolean> => {
    await simulateDelay(300);
    
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
      return post.isLiked;
    }
    return false;
  },

  savePost: async (postId: string): Promise<boolean> => {
    await simulateDelay(300);
    
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      post.isSaved = !post.isSaved;
      return post.isSaved;
    }
    return false;
  },

  sharePost: async (postId: string): Promise<void> => {
    await simulateDelay(500);
    
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      post.shares += 1;
    }
  },

  // Inspiration rating
  ratePost: async (postId: string, rating: number): Promise<boolean> => {
    await simulateDelay(500);
    
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      const oldRating = post.userInspiration || 0;
      const wasAlreadyRated = oldRating > 0;
      
      post.userInspiration = rating;
      
      if (wasAlreadyRated) {
        // Update existing rating
        const totalScore = post.inspirationScore * post.inspirationCount;
        const newTotalScore = totalScore - oldRating + rating;
        post.inspirationScore = newTotalScore / post.inspirationCount;
      } else {
        // Add new rating
        const totalScore = post.inspirationScore * post.inspirationCount;
        post.inspirationCount += 1;
        post.inspirationScore = (totalScore + rating) / post.inspirationCount;
      }
      
      return true;
    }
    return false;
  },

  // Comments
  getComments: async (postId: string): Promise<Comment[]> => {
    await simulateDelay(600);
    
    return [
      {
        id: '1',
        postId,
        userId: '2',
        user: mockUsers[1],
        content: 'สวยมากเลย! ขอเบอร์โทรที่พักหน่อยครับ',
        likes: 5,
        isLiked: false,
        createdAt: new Date('2024-03-15T11:00:00')
      }
    ];
  },

  addComment: async (postId: string, content: string): Promise<Comment> => {
    await simulateDelay(800);
    
    const comment: Comment = {
      id: Date.now().toString(),
      postId,
      userId: '1',
      user: mockUsers[0],
      content,
      likes: 0,
      isLiked: false,
      createdAt: new Date()
    };
    
    // Update post comment count
    const post = mockPosts.find(p => p.id === postId);
    if (post) {
      post.comments += 1;
    }
    
    return comment;
  },

  // Groups
  getGroups: async (): Promise<Group[]> => {
    await simulateDelay(600);
    return mockGroups;
  },

  joinGroup: async (groupId: string): Promise<boolean> => {
    await simulateDelay(500);
    
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      group.isJoined = !group.isJoined;
      group.memberCount += group.isJoined ? 1 : -1;
      return group.isJoined;
    }
    return false;
  },

  // User points and rewards
  getUserPoints: async (): Promise<UserPoints> => {
    await simulateDelay(400);
    
    return {
      total: 2450,
      available: 1850,
      earned: 2450,
      spent: 600,
      history: [
        {
          id: '1',
          type: 'earned',
          amount: 50,
          reason: 'โพสต์ได้รับ Like มากกว่า 100',
          createdAt: new Date('2024-03-15')
        },
        {
          id: '2',
          type: 'spent', 
          amount: 200,
          reason: 'แลกส่วนลดที่พัก 10%',
          createdAt: new Date('2024-03-10')
        }
      ]
    };
  },

  getRewards: async (): Promise<Reward[]> => {
    await simulateDelay(500);
    
    return [
      {
        id: '1',
        name: 'ส่วนลดที่พัก 10%',
        description: 'ใช้ได้กับโรงแรมและรีสอร์ทที่ร่วมรายการ',
        pointsCost: 500,
        category: 'discount',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
        isAvailable: true
      },
      {
        id: '2',
        name: 'Badge นักเดินทางมือโปร',
        description: 'แบดจ์พิเศษสำหรับนักเดินทางผู้เชี่ยวชาญ',
        pointsCost: 1000,
        category: 'badge',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300',
        isAvailable: true
      }
    ];
  },

  redeemReward: async (rewardId: string): Promise<boolean> => {
    await simulateDelay(1000);
    // Simulate redemption logic
    return true;
  }
};