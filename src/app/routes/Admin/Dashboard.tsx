import { useState } from "react";
import { Server, Activity, TrendingUp, Eye, Database, RefreshCw } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/shared/contexts/LanguageProvider";

const Dashboard = () => {
  const { language } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

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

  const t = content[language];

  // Mock data - in real app this would come from API
  const systemMetrics = {
    isOnline: true,
    apiStatus: "healthy",
    databaseStatus: "connected",
    serverLoad: 65,
    activeUsers: 1247,
    totalAttractions: 156,
    todayViews: 8934,
    weeklyGrowth: 12.5,
    newUsers: 89,
    lastUpdated: new Date().toLocaleTimeString()
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
          disabled={refreshing}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {t.refresh}
        </Button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.systemStatus}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(systemMetrics.isOnline ? "healthy" : "error")}>
                {systemMetrics.isOnline ? t.systemOnline : t.systemOffline}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.apiStatus}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(systemMetrics.apiStatus)}>
                {systemMetrics.apiStatus.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.databaseStatus}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(systemMetrics.databaseStatus)}>
                {systemMetrics.databaseStatus.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.serverLoad}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.serverLoad}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${systemMetrics.serverLoad}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeUsers}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{systemMetrics.newUsers} {t.newUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalAttractions}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.totalAttractions}</div>
            <p className="text-xs text-muted-foreground">
              {/* TODO: Add growth metric */}
              Active destinations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.todayViews}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.todayViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{systemMetrics.weeklyGrowth}% {t.weeklyGrowth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.serverHealth}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">
              {t.lastUpdated}: {systemMetrics.lastUpdated}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Add charts and more detailed metrics */}
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