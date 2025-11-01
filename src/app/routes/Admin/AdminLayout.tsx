import { useState, useEffect } from "react";
import { ArrowLeft, User, Shield, Activity, BarChart3, Video, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient } from "@/services/supabase.service";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Dashboard from "./Dashboard";
import Moderation from "./Moderation";
import Analytics from "./Analytics";
import MediaManagementInterface from "@/components/admin/MediaManagementInterface";

interface AdminLayoutProps {
  currentLanguage: "th" | "en";
}

const AdminLayout = ({ currentLanguage }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const supabase = getSupabaseClient();
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      } else {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const content = {
    th: {
      title: "แผงควบคุมผู้ดูแลระบบ",
      subtitle: "จัดการระบบและเนื้อหา",
      backToHome: "กลับหน้าแรก",
      adminAccess: "การเข้าถึงสำหรับผู้ดูแลระบบ",
      dashboard: "แดชบอร์ด",
      media: "จัดการสื่อ",
      moderation: "การควบคุม",
      analytics: "สถิติ",
      unauthorized: "ไม่มีสิทธิ์เข้าถึง",
      unauthorizedDesc: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
      requestAccess: "ขอสิทธิ์เข้าถึง"
    },
    en: {
      title: "Admin Console",
      subtitle: "Manage system and content",
      backToHome: "Back to Home",
      adminAccess: "Administrator access",
      dashboard: "Dashboard",
      media: "Media",
      moderation: "Moderation",
      analytics: "Analytics",
      unauthorized: "Unauthorized Access",
      unauthorizedDesc: "You don't have permission to access this page",
      requestAccess: "Request Access"
    }
  };

  const t = content[currentLanguage];

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isLoading) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t.backToHome}</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
                <p className="text-sm text-muted-foreground hidden md:block">
                  {t.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium hidden md:inline">
                  {t.adminAccess}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="border-b border-border/30 bg-card/30">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 h-12">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.dashboard}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">{t.media}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="moderation" 
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">{t.moderation}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">{t.analytics}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaManagementInterface currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Moderation currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics currentLanguage={currentLanguage} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminLayout;
