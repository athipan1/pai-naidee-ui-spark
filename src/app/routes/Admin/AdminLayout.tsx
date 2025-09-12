import { useState, useEffect } from "react";
import { ArrowLeft, User, Shield, Activity, BarChart3, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import MediaQueue from "./MediaQueue";
import Moderation from "./Moderation";
import Analytics from "./Analytics";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

// Simple admin role check - in real app this would come from auth context
const useAdminRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // TODO: Replace with actual auth check
    // For demo purposes, we'll simulate admin check
    const isAdminUser = localStorage.getItem('isAdmin') === 'true' || import.meta.env.DEV;
    setIsAdmin(isAdminUser);
  }, []);
  
  return isAdmin;
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAdmin = useAdminRole();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const t = content[language];

  // Show unauthorized access page if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 px-6 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              {t.unauthorized}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t.unauthorizedDesc}
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={() => navigate("/")} className="w-full">
              {t.backToHome}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                // TODO: Implement access request functionality
                alert("Access request functionality would be implemented here");
              }}
              className="w-full"
            >
              {t.requestAccess}
            </Button>
          </div>
        </div>
      </div>
    );
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
            <Dashboard />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaQueue />
          </TabsContent>

          <TabsContent value="moderation" className="space-y-6">
            <Moderation />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminLayout;