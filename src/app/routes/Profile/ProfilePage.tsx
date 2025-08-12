import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  LogOut,
  User,
  Globe,
  Settings,
  MapPin,
  Star,
  Eye,
  Heart,
  Bell,
  Shield,
  HelpCircle,
  CreditCard,
  Moon,
  Sun,
  Check,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface ProfilePageProps {
  currentLanguage: "th" | "en";
  onLanguageChange: (lang: "th" | "en") => void;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  joinDate: string;
  stats: {
    places: number;
    reviews: number;
    followers: number;
  };
}

const ProfilePage = ({ currentLanguage, onLanguageChange }: ProfilePageProps) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const content = {
    th: {
      title: "โปรไฟล์",
      settings: "การตั้งค่า",
      profile: "ข้อมูลส่วนตัว",
      preferences: "ค่าตั้งเบื้องต้น", 
      privacy: "ความเป็นส่วนตัว",
      help: "ช่วยเหลือ",
      editProfile: "แก้ไขโปรไฟล์",
      signOut: "ออกจากระบบ",
      language: "ภาษา",
      thai: "ภาษาไทย",
      english: "English",
      darkMode: "โหมดมืด",
      notifications: "การแจ้งเตือน",
      location: "ตำแหน่ง",
      memberSince: "สมาชิกตั้งแต่",
      places: "สถานที่",
      reviews: "รีวิว",
      followers: "ผู้ติดตาม",
      viewActivity: "ดูกิจกรรม",
      manageAccount: "จัดการบัญชี",
      privacySettings: "การตั้งค่าความเป็นส่วนตัว",
      helpCenter: "ศูนย์ช่วยเหลือ",
      contactSupport: "ติดต่อฝ่ายสนับสนุน",
      version: "เวอร์ชัน",
      guestUser: "ผู้ใช้งานแขก",
      guestEmail: "guest@example.com",
      guestBio: "สำรวจและค้นพบสถานที่ท่องเที่ยวที่น่าสนใจ",
      saveChanges: "บันทึกการเปลี่ยนแปลง",
      changesSaved: "บันทึกการเปลี่ยนแปลงแล้ว"
    },
    en: {
      title: "Profile",
      settings: "Settings",
      profile: "Profile",
      preferences: "Preferences",
      privacy: "Privacy",
      help: "Help",
      editProfile: "Edit Profile",
      signOut: "Sign Out",
      language: "Language",
      thai: "ภาษาไทย",
      english: "English",
      darkMode: "Dark Mode",
      notifications: "Notifications",
      location: "Location",
      memberSince: "Member since",
      places: "Places",
      reviews: "Reviews",
      followers: "Followers",
      viewActivity: "View Activity",
      manageAccount: "Manage Account",
      privacySettings: "Privacy Settings",
      helpCenter: "Help Center",
      contactSupport: "Contact Support",
      version: "Version",
      guestUser: "Guest User",
      guestEmail: "guest@example.com",
      guestBio: "Explore and discover amazing travel destinations",
      saveChanges: "Save Changes",
      changesSaved: "Changes saved successfully"
    }
  };

  const t = content[currentLanguage];

  // Mock user data - in real app this would come from auth context/API
  useEffect(() => {
    const mockProfile: UserProfile = {
      id: "guest",
      name: t.guestUser,
      email: t.guestEmail,
      avatar: "",
      bio: t.guestBio,
      location: currentLanguage === "th" ? "กรุงเทพฯ, ประเทศไทย" : "Bangkok, Thailand",
      joinDate: "2024-01-01",
      stats: {
        places: 12,
        reviews: 8,
        followers: 45
      }
    };

    setTimeout(() => {
      setProfile(mockProfile);
      setLoading(false);
    }, 500);
  }, [currentLanguage, t]);

  const handleLanguageChange = (newLanguage: "th" | "en") => {
    onLanguageChange(newLanguage);
    // Save language preference
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  const handleSignOut = () => {
    // TODO: Implement sign out functionality
    console.log("Signing out...");
    navigate("/");
  };

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    console.log("Saving changes...");
    // Show success message
    alert(t.changesSaved);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      currentLanguage === "th" ? "th-TH" : "en-US",
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">👤 {t.title}</h1>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("Edit profile")}
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">{t.editProfile}</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {profile && (
          <>
            {/* Profile Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback className="text-2xl">
                      <User className="w-10 h-10" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-semibold">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{profile.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{t.memberSince} {formatDate(profile.joinDate)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="text-center">
                        <div className="text-xl font-semibold">{profile.stats.places}</div>
                        <div className="text-xs text-muted-foreground">{t.places}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold">{profile.stats.reviews}</div>
                        <div className="text-xs text-muted-foreground">{t.reviews}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-semibold">{profile.stats.followers}</div>
                        <div className="text-xs text-muted-foreground">{t.followers}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings Tabs */}
            <Tabs defaultValue="preferences" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="preferences" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.preferences}</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.privacy}</span>
                </TabsTrigger>
                <TabsTrigger value="help" className="flex items-center gap-2 text-xs sm:text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.help}</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2 text-xs sm:text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {t.language}
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred language for the interface
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Button
                          variant={currentLanguage === "th" ? "default" : "outline"}
                          onClick={() => handleLanguageChange("th")}
                          className="w-32 justify-start"
                        >
                          {currentLanguage === "th" && <Check className="w-4 h-4 mr-2" />}
                          {t.thai}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant={currentLanguage === "en" ? "default" : "outline"}
                          onClick={() => handleLanguageChange("en")}
                          className="w-32 justify-start"
                        >
                          {currentLanguage === "en" && <Check className="w-4 h-4 mr-2" />}
                          {t.english}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t.preferences}</CardTitle>
                    <CardDescription>
                      Customize your app experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-4 h-4" />
                        <Label htmlFor="dark-mode">{t.darkMode}</Label>
                      </div>
                      <Switch
                        id="dark-mode"
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4" />
                        <Label htmlFor="notifications">{t.notifications}</Label>
                      </div>
                      <Switch
                        id="notifications"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {t.privacySettings}
                    </CardTitle>
                    <CardDescription>
                      Manage your privacy and data settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Privacy settings and data management options would be displayed here.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="help" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      {t.helpCenter}
                    </CardTitle>
                    <CardDescription>
                      Get help and support
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => console.log("Contact support")}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      {t.contactSupport}
                    </Button>

                    <div className="pt-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {t.version} 1.0.0
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {t.manageAccount}
                    </CardTitle>
                    <CardDescription>
                      Account settings and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => navigate("/saved")}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      {t.viewActivity}
                    </Button>

                    <Separator />

                    <Button
                      variant="destructive"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t.signOut}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveChanges} className="w-full sm:w-auto">
                {t.saveChanges}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;