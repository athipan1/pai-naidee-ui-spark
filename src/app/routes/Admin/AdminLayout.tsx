import { useEffect, useState } from "react";
import { ArrowLeft, User, Shield, Activity, BarChart3, Video, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase.service";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  currentLanguage: "th" | "en";
}

const AdminLayout = ({ currentLanguage }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      attractions: "จัดการสถานที่",
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
      attractions: "Attractions",
      moderation: "Moderation",
      analytics: "Analytics",
      unauthorized: "Unauthorized Access",
      unauthorizedDesc: "You don't have permission to access this page",
      requestAccess: "Request Access"
    }
  };

  const t = content[currentLanguage];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { to: "/admin/dashboard", text: t.dashboard, icon: <BarChart3 className="w-4 h-4" /> },
    { to: "/admin/attractions", text: t.attractions, icon: <Video className="w-4 h-4" /> },
    { to: "/admin/moderation", text: t.moderation, icon: <Shield className="w-4 h-4" /> },
    { to: "/admin/analytics", text: t.analytics, icon: <Activity className="w-4 h-4" /> },
  ];

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
              <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{t.backToHome}</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
                <p className="text-sm text-muted-foreground hidden md:block">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium hidden md:inline">{t.adminAccess}</span>
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
          <nav className="grid grid-cols-4 h-12">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-center gap-2 text-xs sm:text-sm font-medium transition-colors",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
                  )
                }
              >
                {link.icon}
                <span className="hidden sm:inline">{link.text}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;