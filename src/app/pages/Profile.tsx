import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Settings, LogOut, User, Link as LinkIcon, Play, MessageSquare, Calendar, CreditCard, Shield, Globe, Trash2, Camera, Facebook, Instagram, Youtube, MapPin, Star, Eye, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProfileProps {
  currentLanguage: 'th' | 'en';
  onLanguageChange: (lang: 'th' | 'en') => void;
  onBack: () => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinDate: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  stats: {
    videos: number;
    reviews: number;
    bookings: number;
    followers: number;
  };
}

interface UserVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  duration: string;
  uploadDate: string;
}

interface UserReview {
  id: string;
  placeName: string;
  placeImage: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
}

interface UserBooking {
  id: string;
  type: 'hotel' | 'activity';
  name: string;
  image: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
}

const Profile = ({ currentLanguage, onLanguageChange, onBack }: ProfileProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userVideos, setUserVideos] = useState<UserVideo[]>([]);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const content = {
    th: {
      profile: 'โปรไฟล์',
      editProfile: 'แก้ไขโปรไฟล์',
      accountSettings: 'ตั้งค่าบัญชี',
      logout: 'ออกจากระบบ',
      myVideos: 'วิดีโอของฉัน',
      myReviews: 'รีวิวของฉัน',
      myBookings: 'รายการจองของฉัน',
      paymentInfo: 'ข้อมูลการชำระเงิน',
      privacy: 'ความเป็นส่วนตัว',
      language: 'ภาษา',
      paymentManagement: 'จัดการการชำระเงิน',
      deleteAccount: 'ลบบัญชี',
      memberSince: 'สมาชิกตั้งแต่',
      followers: 'ผู้ติดตาม',
      videos: 'วิดีโอ',
      reviews: 'รีวิว',
      bookings: 'การจอง',
      noVideos: 'ยังไม่มีวิดีโอ',
      noReviews: 'ยังไม่มีรีวิว',
      noBookings: 'ยังไม่มีการจอง',
      uploadVideo: 'อัปโหลดวิดีโอ',
      writeReview: 'เขียนรีวิว',
      bookNow: 'จองเลย',
      views: 'ครั้ง',
      likes: 'ถูกใจ',
      confirmed: 'ยืนยันแล้ว',
      pending: 'รอดำเนินการ',
      cancelled: 'ยกเลิกแล้ว',
      name: 'ชื่อ',
      email: 'อีเมล',
      bio: 'แนะนำตัว',
      location: 'ที่อยู่',
      socialLinks: 'ลิงก์โซเชียล',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      publicProfile: 'โปรไฟล์สาธารณะ',
      privateProfile: 'โปรไฟล์ส่วนตัว',
      deleteAccountWarning: 'คุณแน่ใจหรือไม่ที่จะลบบัญชี?',
      deleteAccountDesc: 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลทั้งหมดจะถูกลบอย่างถาวร',
      delete: 'ลบ',
      logoutConfirm: 'คุณต้องการออกจากระบบหรือไม่?',
      baht: 'บาท'
    },
    en: {
      profile: 'Profile',
      editProfile: 'Edit Profile',
      accountSettings: 'Account Settings',
      logout: 'Logout',
      myVideos: 'My Videos',
      myReviews: 'My Reviews',
      myBookings: 'My Bookings',
      paymentInfo: 'Payment Information',
      privacy: 'Privacy',
      language: 'Language',
      paymentManagement: 'Payment Management',
      deleteAccount: 'Delete Account',
      memberSince: 'Member since',
      followers: 'Followers',
      videos: 'Videos',
      reviews: 'Reviews',
      bookings: 'Bookings',
      noVideos: 'No videos yet',
      noReviews: 'No reviews yet',
      noBookings: 'No bookings yet',
      uploadVideo: 'Upload Video',
      writeReview: 'Write Review',
      bookNow: 'Book Now',
      views: 'views',
      likes: 'likes',
      confirmed: 'Confirmed',
      pending: 'Pending',
      cancelled: 'Cancelled',
      name: 'Name',
      email: 'Email',
      bio: 'Bio',
      location: 'Location',
      socialLinks: 'Social Links',
      save: 'Save',
      cancel: 'Cancel',
      publicProfile: 'Public Profile',
      privateProfile: 'Private Profile',
      deleteAccountWarning: 'Are you sure you want to delete your account?',
      deleteAccountDesc: 'This action cannot be undone. All your data will be permanently deleted.',
      delete: 'Delete',
      logoutConfirm: 'Do you want to logout?',
      baht: 'THB'
    }
  };

  const t = content[currentLanguage];

  // Mock data - ในการใช้งานจริงจะดึงจาก API
  useEffect(() => {
    const mockProfile: UserProfile = {
      id: '1',
      name: currentLanguage === 'th' ? 'สมชาย ใจดี' : 'John Doe',
      email: 'john.doe@example.com',
      avatar: '/placeholder-avatar.jpg',
      bio: currentLanguage === 'th' 
        ? 'รักการเที่ยว ชอบถ่ายรูป และแชร์ประสบการณ์ดีๆ ให้เพื่อนๆ'
        : 'Love traveling, photography, and sharing great experiences with friends',
      location: currentLanguage === 'th' ? 'กรุงเทพฯ, ประเทศไทย' : 'Bangkok, Thailand',
      joinDate: '2023-01-15',
      socialLinks: {
        facebook: 'https://facebook.com/johndoe',
        instagram: 'https://instagram.com/johndoe',
        youtube: 'https://youtube.com/@johndoe'
      },
      stats: {
        videos: 12,
        reviews: 28,
        bookings: 5,
        followers: 1247
      }
    };

    const mockVideos: UserVideo[] = [
      {
        id: '1',
        title: currentLanguage === 'th' ? 'เที่ยวเกาะพีพี สวยงาม' : 'Beautiful Phi Phi Islands',
        thumbnail: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400',
        views: 15420,
        likes: 892,
        duration: '5:32',
        uploadDate: '2024-01-10'
      },
      {
        id: '2',
        title: currentLanguage === 'th' ? 'วัดพระแก้ว ความงดงาม' : 'Wat Phra Kaew Beauty',
        thumbnail: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=400',
        views: 8765,
        likes: 543,
        duration: '3:45',
        uploadDate: '2024-01-05'
      }
    ];

    const mockReviews: UserReview[] = [
      {
        id: '1',
        placeName: currentLanguage === 'th' ? 'หมู่เกาะพีพี' : 'Phi Phi Islands',
        placeImage: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 5,
        comment: currentLanguage === 'th' 
          ? 'สวยมากจริงๆ น้ำใสมาก แนะนำให้ไปช่วงเช้าจะได้ถ่ายรูปสวยๆ'
          : 'Absolutely beautiful! Crystal clear water. Recommend going in the morning for great photos.',
        date: '2024-01-12',
        likes: 23
      },
      {
        id: '2',
        placeName: currentLanguage === 'th' ? 'วัดพระแก้ว' : 'Wat Phra Kaew',
        placeImage: 'https://images.pexels.com/photos/2614818/pexels-photo-2614818.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4,
        comment: currentLanguage === 'th'
          ? 'สถานที่ศักดิ์สิทธิ์ สถาปัตยกรรมสวยงาม แต่คนเยอะมาก'
          : 'Sacred place with beautiful architecture, but very crowded.',
        date: '2024-01-08',
        likes: 15
      }
    ];

    const mockBookings: UserBooking[] = [
      {
        id: '1',
        type: 'hotel',
        name: currentLanguage === 'th' ? 'โรงแรมวิวทะเล กระบี่' : 'Sea View Hotel Krabi',
        image: 'https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: '2024-02-15',
        status: 'confirmed',
        amount: 3500
      },
      {
        id: '2',
        type: 'activity',
        name: currentLanguage === 'th' ? 'ทัวร์ดำน้ำดูปะการัง' : 'Snorkeling Tour',
        image: 'https://images.pexels.com/photos/1450361/pexels-photo-1450361.jpeg?auto=compress&cs=tinysrgb&w=400',
        date: '2024-02-16',
        status: 'pending',
        amount: 1200
      }
    ];

    setTimeout(() => {
      setUserProfile(mockProfile);
      setUserVideos(mockVideos);
      setUserReviews(mockReviews);
      setUserBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, [currentLanguage]);

  const handleLogout = () => {
    // Clear JWT/localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    // Redirect to login or home
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    try {
      // API call to delete account
      // await fetch(`/api/users/${userProfile?.id}/delete`, { method: 'POST' });
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return currentLanguage === 'th' 
      ? date.toLocaleDateString('th-TH')
      : date.toLocaleDateString('en-US');
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t.confirmed;
      case 'pending': return t.pending;
      case 'cancelled': return t.cancelled;
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">
              👤 {t.profile}
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* User Info Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              {/* User Details */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">{userProfile.name}</h2>
                <p className="text-muted-foreground mb-2">{userProfile.email}</p>
                <p className="text-sm text-muted-foreground mb-3">{userProfile.bio}</p>
                
                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{t.memberSince} {formatDate(userProfile.joinDate)}</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                  {userProfile.socialLinks.facebook && (
                    <a href={userProfile.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="w-8 h-8">
                        <Facebook className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  {userProfile.socialLinks.instagram && (
                    <a href={userProfile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="w-8 h-8">
                        <Instagram className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                  {userProfile.socialLinks.youtube && (
                    <a href={userProfile.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="icon" className="w-8 h-8">
                        <Youtube className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{formatNumber(userProfile.stats.followers)}</div>
                    <div className="text-xs text-muted-foreground">{t.followers}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userProfile.stats.videos}</div>
                    <div className="text-xs text-muted-foreground">{t.videos}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userProfile.stats.reviews}</div>
                    <div className="text-xs text-muted-foreground">{t.reviews}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{userProfile.stats.bookings}</div>
                    <div className="text-xs text-muted-foreground">{t.bookings}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>{t.editProfile}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.editProfile}</DialogTitle>
                    <DialogDescription>
                      แก้ไขข้อมูลโปรไฟล์ของคุณ
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t.name}</Label>
                      <Input id="name" defaultValue={userProfile.name} />
                    </div>
                    <div>
                      <Label htmlFor="email">{t.email}</Label>
                      <Input id="email" type="email" defaultValue={userProfile.email} />
                    </div>
                    <div>
                      <Label htmlFor="bio">{t.bio}</Label>
                      <Textarea id="bio" defaultValue={userProfile.bio} />
                    </div>
                    <div>
                      <Label htmlFor="location">{t.location}</Label>
                      <Input id="location" defaultValue={userProfile.location} />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                        {t.cancel}
                      </Button>
                      <Button onClick={() => setIsEditModalOpen(false)}>
                        {t.save}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>{t.accountSettings}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t.accountSettings}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t.privacy}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t.publicProfile}
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t.language}</Label>
                        <p className="text-sm text-muted-foreground">
                          {currentLanguage === 'th' ? 'ไทย' : 'English'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLanguageChange(currentLanguage === 'th' ? 'en' : 'th')}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        {currentLanguage === 'th' ? 'EN' : 'TH'}
                      </Button>
                    </div>

                    <Separator />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t.deleteAccount}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t.deleteAccountWarning}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t.deleteAccountDesc}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount}>
                            {t.delete}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 text-destructive hover:text-destructive">
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.logoutConfirm}</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      {t.logout}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>{t.myVideos}</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>{t.myReviews}</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{t.myBookings}</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>{t.paymentInfo}</span>
            </TabsTrigger>
          </TabsList>

          {/* My Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            {userVideos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Play className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t.noVideos}</h3>
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    {t.uploadVideo}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userVideos.map((video) => (
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatNumber(video.views)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{formatNumber(video.likes)}</span>
                          </div>
                        </div>
                        <span>{formatDate(video.uploadDate)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            {userReviews.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t.noReviews}</h3>
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    {t.writeReview}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <img 
                          src={review.placeImage} 
                          alt={review.placeName}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{review.placeName}</h3>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatDate(review.date)}</span>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{review.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            {userBookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t.noBookings}</h3>
                  <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.bookNow}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <img 
                          src={booking.image} 
                          alt={booking.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{booking.name}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusText(booking.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{formatDate(booking.date)}</span>
                            <span className="font-semibold text-primary">
                              ฿{booking.amount.toLocaleString()} {t.baht}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payment Info Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>{t.paymentManagement}</span>
                </CardTitle>
                <CardDescription>
                  จัดการข้อมูลการชำระเงินและประวัติการทำรายการ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">ฟีเจอร์นี้จะเชื่อมต่อกับระบบ Payment Gateway</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    (Stripe, QR Code, PromptPay, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;