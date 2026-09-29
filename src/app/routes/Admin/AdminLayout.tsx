import { useEffect } from "react";
import { ArrowLeft, User, Shield, Activity, BarChart3, Video, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { cn } from "@/shared/utils/cn";

interface AdminLayoutProps {
  currentLanguage: "th" | "en";
}

const AdminLayout = ({ currentLanguage }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

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
    await signOut();
    navigate('/login', { replace: true });
  };

  if (isLoading || !isAuthenticated) {
    return <LoadingSpinner text="Authenticating..." />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">{t.unauthorized}</h1>
          <p className="text-muted-foreground">{t.unauthorizedDesc}</p>
          <Button onClick={() => navigate('/', { replace: true })}>{t.backToHome}</Button>
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
          <nav className="grid w-full grid-cols-4 h-12">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center gap-2 text-xs sm:text-sm",
                  isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                )
              }
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">{t.dashboard}</span>
            </NavLink>
            <NavLink
              to="/admin/media"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center gap-2 text-xs sm:text-sm",
                  isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                )
              }
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">{t.media}</span>
            </NavLink>
            <NavLink
              to="/admin/moderation"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center gap-2 text-xs sm:text-sm",
                  isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                )
              }
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t.moderation}</span>
            </NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center gap-2 text-xs sm:text-sm",
                  isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                )
              }
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">{t.analytics}</span>
            </NavLink>
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
