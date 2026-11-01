import { ArrowLeft, Compass, Heart, LogOut, MapPin, Settings, Sparkles, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import BottomNavigation from "@/components/common/BottomNavigation";
import { useAuth } from "@/shared/contexts/AuthContext";

interface ProfileProps {
  currentLanguage: "th" | "en";
}

export default function Profile({ currentLanguage }: ProfileProps) {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const th = currentLanguage === "th";
  const displayName = typeof user?.user_metadata?.full_name === "string"
    ? user.user_metadata.full_name
    : user?.email?.split("@")[0] || (th ? "นักเดินทาง" : "Traveler");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success(th ? "ออกจากระบบแล้ว" : "Signed out");
    } catch {
      toast.error(th ? "ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง" : "Could not sign out. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Link to="/" aria-label={th ? "กลับหน้าหลัก" : "Back home"} className="rounded-xl p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold">{th ? "โปรไฟล์ของฉัน" : "My profile"}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-7 px-4 py-6">
        <section className="rounded-3xl border border-teal-400/30 bg-gradient-to-br from-teal-500/20 via-card to-sky-500/10 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-teal-400/50 bg-teal-400/15">
              <UserRound className="h-10 w-10 text-teal-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-teal-500">PAINAIDEE TRAVELER</p>
              <h2 className="mt-1 truncate text-2xl font-bold">{isLoading ? (th ? "กำลังโหลด..." : "Loading...") : isAuthenticated ? displayName : (th ? "ยินดีต้อนรับ นักเดินทาง!" : "Welcome, traveler!")}</h2>
              <p className="mt-1 break-all text-sm text-muted-foreground">{isAuthenticated ? user?.email : (th ? "ยังไม่ได้เข้าสู่ระบบ" : "Not signed in")}</p>
            </div>
          </div>
          {!isLoading && !isAuthenticated && (
            <p className="mt-5 rounded-2xl bg-background/70 p-4 text-sm text-muted-foreground">
              {th ? "คุณกำลังใช้งานแบบผู้เยี่ยมชม ระบบบัญชีสมาชิกสำหรับบันทึกสถานที่โปรดและซิงก์ทริปยังไม่เปิดให้บริการ" : "You are browsing as a guest. Member accounts for favorites and trip syncing are not available yet."}
            </p>
          )}
        </section>

        <section>
          <h3 className="mb-3 font-semibold">{th ? "ออกเดินทางกันเลย" : "Explore your world"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/trip-planner" className="rounded-2xl border bg-card p-5 transition hover:border-teal-400/70">
              <Sparkles className="mb-3 h-7 w-7 text-teal-400" />
              <p className="font-semibold">{th ? "AI วางแผนเที่ยว" : "AI trip planner"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{th ? "วางเส้นทางและประเมินงบ" : "Plan routes and budgets"}</p>
            </Link>
            <Link to="/discover" className="rounded-2xl border bg-card p-5 transition hover:border-teal-400/70">
              <Compass className="mb-3 h-7 w-7 text-sky-400" />
              <p className="font-semibold">{th ? "สำรวจสถานที่" : "Discover places"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{th ? "หาที่เที่ยวใหม่ ๆ" : "Find new destinations"}</p>
            </Link>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">{th ? "ข้อมูลและการตั้งค่า" : "Your account"}</h3>
          <div className="divide-y rounded-2xl border bg-card">
            {[
              { icon: Heart, title: th ? "สถานที่โปรด" : "Favorites", detail: th ? "ระบบซิงก์รายการโปรดยังไม่เปิดใช้งาน" : "Favorites syncing is not available yet" },
              { icon: MapPin, title: th ? "ทริปที่บันทึก" : "Saved trips", detail: th ? "ยังไม่รองรับการจัดเก็บทริปในบัญชี" : "Account trip storage is not available yet" },
              { icon: Settings, title: th ? "แก้ไขโปรไฟล์" : "Edit profile", detail: th ? "ฟังก์ชันจัดการบัญชีกำลังพัฒนา" : "Account management is coming soon" },
            ].map(({ icon: Icon, title, detail }) => (
              <div key={title} className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5 shrink-0 text-teal-400" />
                <div><p className="font-medium">{title}</p><p className="text-xs text-muted-foreground">{detail}</p></div>
              </div>
            ))}
          </div>
        </section>

        {isAuthenticated && (
          <button type="button" onClick={() => void handleSignOut()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 p-3 text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />{th ? "ออกจากระบบ" : "Sign out"}
          </button>
        )}
      </main>
      <BottomNavigation currentLanguage={currentLanguage} />
    </div>
  );
}
