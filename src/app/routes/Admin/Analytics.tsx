import { useState } from "react";
import { BarChart3, TrendingUp, Users, Eye, Calendar, Download } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalyticsProps {
  currentLanguage: "th" | "en";
}

const Analytics = ({ currentLanguage }: AnalyticsProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const content = {
    th: {
      title: "สถิติและวิเคราะห์",
      subtitle: "ข้อมูลการใช้งานและประสิทธิภาพของแพลตฟอร์ม",
      overview: "ภาพรวม",
      users: "ผู้ใช้งาน",
      content: "เนื้อหา",
      engagement: "การมีส่วนร่วม",
      totalUsers: "ผู้ใช้งานทั้งหมด",
      activeUsers: "ผู้ใช้งานที่ใช้งานอยู่",
      newUsers: "ผู้ใช้งานใหม่",
      pageViews: "การเข้าชมหน้า",
      totalContent: "เนื้อหาทั้งหมด",
      contentUploads: "อัปโหลดเนื้อหา",
      averageRating: "คะแนนเฉลี่ย",
      topContent: "เนื้อหายอดนิยม",
      userEngagement: "การมีส่วนร่วมของผู้ใช้",
      exportData: "ส่งออกข้อมูล",
      last7days: "7 วันที่ผ่านมา",
      last30days: "30 วันที่ผ่านมา",
      last90days: "90 วันที่ผ่านมา",
      thisYear: "ปีนี้",
      growth: "การเติบโต",
      decline: "ลดลง"
    },
    en: {
      title: "Analytics & Insights",
      subtitle: "Platform usage data and performance insights",
      overview: "Overview",
      users: "Users",
      content: "Content",
      engagement: "Engagement",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      newUsers: "New Users",
      pageViews: "Page Views",
      totalContent: "Total Content",
      contentUploads: "Content Uploads",
      averageRating: "Average Rating",
      topContent: "Top Content",
      userEngagement: "User Engagement",
      exportData: "Export Data",
      last7days: "Last 7 days",
      last30days: "Last 30 days",
      last90days: "Last 90 days",
      thisYear: "This year",
      growth: "growth",
      decline: "decline"
    }
  };

  const t = content[currentLanguage];

  // Mock analytics data - in real app this would come from API
  const analyticsData = {
    "7d": {
      totalUsers: 12456,
      activeUsers: 8923,
      newUsers: 456,
      pageViews: 34567,
      totalContent: 1234,
      contentUploads: 89,
      averageRating: 4.6,
      userGrowth: 12.5,
      contentGrowth: 8.3,
      engagementRate: 76.2
    },
    "30d": {
      totalUsers: 12456,
      activeUsers: 9876,
      newUsers: 1234,
      pageViews: 145678,
      totalContent: 1234,
      contentUploads: 234,
      averageRating: 4.6,
      userGrowth: 18.7,
      contentGrowth: 15.2,
      engagementRate: 78.9
    },
    "90d": {
      totalUsers: 12456,
      activeUsers: 10234,
      newUsers: 2345,
      pageViews: 456789,
      totalContent: 1234,
      contentUploads: 567,
      averageRating: 4.5,
      userGrowth: 22.1,
      contentGrowth: 28.4,
      engagementRate: 74.5
    },
    "1y": {
      totalUsers: 12456,
      activeUsers: 11234,
      newUsers: 8765,
      pageViews: 1234567,
      totalContent: 1234,
      contentUploads: 1234,
      averageRating: 4.4,
      userGrowth: 145.8,
      contentGrowth: 234.7,
      engagementRate: 72.3
    }
  };

  const currentData = analyticsData[selectedPeriod as keyof typeof analyticsData];

  const handleExportData = () => {
    // TODO: Implement data export functionality
    console.log("Exporting analytics data for period:", selectedPeriod);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const periodOptions = [
    { value: "7d", label: t.last7days },
    { value: "30d", label: t.last30days },
    { value: "90d", label: t.last90days },
    { value: "1y", label: t.thisYear }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Period Selector */}
          <div className="flex items-center space-x-1 border rounded-lg p-1">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={selectedPeriod === option.value ? "default" : "ghost"}
                onClick={() => setSelectedPeriod(option.value)}
                className="text-xs"
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleExportData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t.exportData}
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="users">{t.users}</TabsTrigger>
          <TabsTrigger value="content">{t.content}</TabsTrigger>
          <TabsTrigger value="engagement">{t.engagement}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.totalUsers)}</div>
                <p className="text-xs text-green-600">
                  +{currentData.userGrowth}% {t.growth}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.pageViews}</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.pageViews)}</div>
                <p className="text-xs text-muted-foreground">
                  Total page impressions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.totalContent}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.totalContent)}</div>
                <p className="text-xs text-green-600">
                  +{currentData.contentGrowth}% {t.growth}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.averageRating}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                  Out of 5.0 stars
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>
                User activity and content engagement over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Usage trends chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.activeUsers}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.activeUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  Users who visited in this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.newUsers}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.newUsers)}</div>
                <p className="text-xs text-green-600">
                  New registrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.userEngagement}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Average engagement rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Analytics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>
                Detailed user behavior and demographics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">User analytics chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.contentUploads}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(currentData.contentUploads)}</div>
                <p className="text-xs text-green-600">
                  New content this period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.averageRating}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.averageRating}</div>
                <p className="text-xs text-muted-foreground">
                  Content quality score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>
                Top performing content and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Content performance chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.userEngagement}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Overall engagement rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5m 32s</div>
                <p className="text-xs text-green-600">
                  +15% from last period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                User interaction patterns and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Engagement trends chart placeholder</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;