import { Server, Activity, TrendingUp, Eye, Database, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ApiStatusPrompt from "@/components/common/ApiStatusPrompt";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSystemMetrics } from "@/services/admin.service";
import StatCard from "@/components/admin/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardProps {
  currentLanguage: "th" | "en";
}

const Dashboard = ({ currentLanguage }: DashboardProps) => {
  const queryClient = useQueryClient();

  const { data: metrics, isLoading, isError, error } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: getSystemMetrics,
  });

  const content = {
    th: {
      title: "ภาพรวมระบบ",
      subtitle: "สถานะและเมตริกส์หลักของระบบ",
      systemStatus: "สถานะระบบ",
      systemOnline: "ระบบออนไลน์",
      systemOffline: "ระบบออฟไลน์",
      apiStatus: "API สถานะ",
      databaseStatus: "สถานะฐานข้อมูล",
      serverLoad: "โหลดเซิร์ฟเวอร์",
      activeUsers: "ผู้ใช้งานปัจจุบัน",
      totalAttractions: "สถานที่ท่องเที่ยวทั้งหมด",
      todayViews: "การเข้าชมวันนี้",
      weeklyGrowth: "การเติบโตรายสัปดาห์",
      refresh: "รีเฟรช",
      lastUpdated: "อัปเดตล่าสุด",
      viewsToday: "การเข้าชมวันนี้",
      newUsers: "ผู้ใช้ใหม่",
      serverHealth: "สุขภาพเซิร์ฟเวอร์"
    },
    en: {
      title: "System Overview",
      subtitle: "Core system status and metrics",
      error: "Failed to load metrics",
      systemStatus: "System Status",
      systemOnline: "System Online",
      systemOffline: "System Offline",
      apiStatus: "API Status",
      databaseStatus: "Database Status",
      serverLoad: "Server Load",
      activeUsers: "Active Users",
      totalAttractions: "Total Attractions",
      todayViews: "Today's Views",
      weeklyGrowth: "Weekly Growth",
      refresh: "Refresh",
      lastUpdated: "Last Updated",
      viewsToday: "Views Today",
      newUsers: "New Users",
      serverHealth: "Server Health"
    }
  };

  const t = content[currentLanguage];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
  };

  const renderSkeleton = () => (
    Array.from({ length: 8 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-1/3 mt-2" />
        </CardContent>
      </Card>
    ))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          {t.refresh}
        </Button>
      </div>

      {isError && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <div>
              <CardTitle>{t.error}</CardTitle>
              <CardDescription className="text-destructive-foreground">
                {error?.message || "An unknown error occurred"}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          renderSkeleton()
        ) : metrics ? (
          <>
            <StatCard icon={<Database />} title={t.totalAttractions} value={metrics.totalAttractions} />
            <StatCard icon={<Eye />} title={t.activeUsers} value={metrics.activeUsers.toLocaleString()} description="Placeholder" />
            <StatCard icon={<Activity />} title={t.todayViews} value={metrics.todayViews.toLocaleString()} description="Placeholder" />
            <StatCard icon={<TrendingUp />} title={t.serverLoad} value={`${metrics.serverLoad}%`} description="Placeholder" />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.systemStatus}</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-100 text-green-800">{t.systemOnline}</Badge>
              </CardContent>
            </Card>
            <ApiStatusPrompt />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.databaseStatus}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-100 text-green-800">
                  {metrics.databaseStatus.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Performance Charts Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>System Performance</CardTitle>
          <CardDescription>
            Detailed performance metrics and charts would be displayed here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Performance charts placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;