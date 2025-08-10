import { Post, User } from '@/shared/types/community';

// Enhanced travel-themed mock users
export const travelMockUsers: User[] = [
  {
    id: '1',
    username: 'wanderlust_thai',
    displayName: 'นักเดินทางไทย',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150',
    bio: 'เที่ยวทั่วไทย รักการผจญภัย 🌴✈️',
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
    bio: 'Solo traveler | Backpacker 🎒',
    points: 850,
    level: 'explorer',
    badges: [],
    joinedAt: new Date('2024-02-20'),
    isVerified: false
  },
  {
    id: '3',
    username: 'foodie_travel',
    displayName: 'สายกินเที่ยว',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    bio: 'อาหารอร่อย ที่เที่ยวสวย 🍜📸',
    points: 1320,
    level: 'explorer',
    badges: [],
    joinedAt: new Date('2024-01-30'),
    isVerified: true
  },
  {
    id: '4',
    username: 'beach_lover',
    displayName: 'รักทะเล',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    bio: 'Beach vibes only 🏖️🌊',
    points: 990,
    level: 'explorer',
    badges: [],
    joinedAt: new Date('2024-02-10'),
    isVerified: false
  },
  {
    id: '5',
    username: 'mountain_hiker',
    displayName: 'นักปีนเขา',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'เดินป่า ปีนเขา ธรรมชาติ 🏔️🌲',
    points: 1850,
    level: 'adventurer',
    badges: [],
    joinedAt: new Date('2024-01-05'),
    isVerified: true
  }
];

// Enhanced travel-themed mock posts
export const travelMockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    user: travelMockUsers[0],
    content: 'เพิ่งกลับจากดอยสุเทพ วิวสวยมากจริงๆ อากาศเย็นสบาย แนะนำให้มาช่วงเช้าเลย จะได้เห็นทะเลหมอกสวยๆ ✨',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=750&fit=crop'
    ],
    videos: [],
    location: {
      id: 'cm1',
      name: 'ดอยสุเทพ',
      province: 'เชียงใหม่'
    },
    tags: ['เชียงใหม่', 'ดอยสุเทพ', 'วิวสวย', 'เที่ยวคนเดียว', 'ทะเลหมอก'],
    likes: 1247,
    comments: 89,
    shares: 24,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    privacy: 'public'
  },
  {
    id: '2',
    userId: '2',
    user: travelMockUsers[1],
    content: 'ทริปแบกเป้เที่ยวภาคใต้ 7 วัน งบแค่ 3,000 บาท! เทคนิคประหยัดคือนอนหอพัก กินข้าวตามสั่ง เดินทางรถเมล์ธรรมดา มีรายละเอียดในไฮไลท์เลย 💰',
    images: [
      'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=750&fit=crop'
    ],
    videos: [],
    location: {
      id: 'sk1',
      name: 'เกาะสมุย',
      province: 'สุราษฎร์ธานี'
    },
    tags: ['แบกเป้', 'ประหยัด', 'ภาคใต้', 'เที่ยวงบน้อย', 'BackpackLife'],
    likes: 892,
    comments: 156,
    shares: 67,
    isLiked: true,
    isSaved: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    privacy: 'public'
  },
  {
    id: '3',
    userId: '3',
    user: travelMockUsers[2],
    content: 'ตลาดน้ำอัมพวา วันนี้! ข้าวแต๋นน้ำกะทิ กุ้งเผา หอยทอด อร่อยทุกอย่างเลย บรรยากาศดีมาก แนะนำมาช่วงเย็นๆ 🦐🍤',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=750&fit=crop'
    ],
    videos: [],
    location: {
      id: 'sp1',
      name: 'ตลาดน้ำอัมพวา',
      province: 'สมุทรสงคราม'
    },
    tags: ['ตลาดน้ำ', 'อัมพวา', 'สายกิน', 'อาหารไทย', 'ของอร่อย'],
    likes: 543,
    comments: 78,
    shares: 19,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    privacy: 'public'
  },
  {
    id: '4',
    userId: '4',
    user: travelMockUsers[3],
    content: 'เกาะไผ่ ครั้งแรกที่มา น้ำใสมากจริงๆ ปลาเยอะมาก เล่น snorkeling ได้ทั้งวัน แต่ระวังแดดนะ ใส่ครีมกันแดดเยอะๆ ☀️🐠',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=750&fit=crop'
    ],
    videos: [],
    location: {
      id: 'kr1',
      name: 'เกาะไผ่',
      province: 'กระบี่'
    },
    tags: ['เกาะไผ่', 'กระบี่', 'ทะเลไทย', 'snorkeling', 'น้ำใส'],
    likes: 721,
    comments: 92,
    shares: 15,
    isLiked: true,
    isSaved: false,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
    privacy: 'public'
  },
  {
    id: '5',
    userId: '5',
    user: travelMockUsers[4],
    content: 'เส้นทางเดินป่าไปน้ำตกแม่ยะ สวยมากกก! เดินประมาณ 2 ชม. ระดับปานกลาง น้ำตกสูงมาก น้ำเย็นชื่นใจ อย่าลืมเอาผ้าเช็ดตัวมาด้วยนะ 💦',
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=750&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=750&fit=crop'
    ],
    videos: [],
    location: {
      id: 'cm2',
      name: 'น้ำตกแม่ยะ',
      province: 'เชียงใหม่'
    },
    tags: ['น้ำตกแม่ยะ', 'เดินป่า', 'ธรรมชาติ', 'เชียงใหม่', 'hiking'],
    likes: 445,
    comments: 34,
    shares: 8,
    isLiked: false,
    isSaved: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    privacy: 'public'
  },
  {
    id: '6',
    userId: '1',
    user: travelMockUsers[0],
    content: 'สะพานไผ่ ปาย ถ่ายรูปสวยมาก! มาช่วงเย็นจะได้แสงสวยๆ ระวังคิวยาวหน่อยช่วงวันหยุด แต่คุ้มค่าการรอจริงๆ 📸',
    images: [
      'https://images.unsplash.com/photo-1586996292898-71f4036c4e07?w=600&h=750&fit=crop'
    ],
    videos: [],
    location: {
      id: 'mr1',
      name: 'สะพานไผ่',
      province: 'แม่ฮ่องสอน'
    },
    tags: ['สะพานไผ่', 'ปาย', 'แม่ฮ่องสอน', 'ถ่ายรูปสวย', 'ชุดไทย'],
    likes: 1156,
    comments: 67,
    shares: 45,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 1.5 days ago
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    privacy: 'public'
  }
];

export const generateMorePosts = (count: number): Post[] => {
  const additionalPosts: Post[] = [];
  const locationPool = [
    { id: 'bkk1', name: 'วัดพระแก้ว', province: 'กรุงเทพมหานคร' },
    { id: 'ayy1', name: 'วัดไชยวัฒนาราม', province: 'พระนครศรีอยุธยา' },
    { id: 'kn1', name: 'ปราสาทหินพิมาย', province: 'นครราชสีมา' },
    { id: 'hh1', name: 'ปลาช้างภูเขียว', province: 'หัวหิน' },
    { id: 'pt1', name: 'วิวพอยท์ภูเก็ต', province: 'ภูเก็ต' }
  ];

  const imagePool = [
    'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600&h=750&fit=crop',
    'https://images.unsplash.com/photo-1540206395-68808572332f?w=600&h=750&fit=crop'
  ];

  const contentPool = [
    'วิวสวยมากจริงๆ แนะนำให้มาช่วงเช้าเลย',
    'บรรยากาศดีมาก คนไม่เยอะ เหมาะสำหรับพักผ่อน',
    'ถ่ายรูปสวยมาก ไปกับแฟนก็โรแมนติกดี',
    'อาหารอร่อย ราคาไม่แพง แนะนำให้ลอง',
    'เดินทางสะดวก มีรถสองแถวผ่าน',
    'ธรรมชาติสวยงาม อากาศดี เหมาะสำหรับเดินป่า'
  ];

  for (let i = 0; i < count; i++) {
    const randomUser = travelMockUsers[Math.floor(Math.random() * travelMockUsers.length)];
    const randomLocation = locationPool[Math.floor(Math.random() * locationPool.length)];
    const randomContent = contentPool[Math.floor(Math.random() * contentPool.length)];
    const randomImage = imagePool[Math.floor(Math.random() * imagePool.length)];
    
    additionalPosts.push({
      id: `generated_${i + 7}`,
      userId: randomUser.id,
      user: randomUser,
      content: randomContent,
      images: [randomImage],
      videos: [],
      location: randomLocation,
      tags: ['เที่ยวไทย', 'ธรรมชาติ', 'ถ่ายรูป'],
      likes: Math.floor(Math.random() * 500) + 50,
      comments: Math.floor(Math.random() * 50) + 5,
      shares: Math.floor(Math.random() * 20) + 1,
      isLiked: Math.random() > 0.7,
      isSaved: Math.random() > 0.8,
      createdAt: new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random within last week
      updatedAt: new Date(Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000)),
      privacy: 'public'
    });
  }

  return additionalPosts;
};