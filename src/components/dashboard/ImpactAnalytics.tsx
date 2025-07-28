import { useState, useEffect } from "react";
import { Eye, Share2, Heart, TrendingUp, Users, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface ImpactAnalyticsProps {
  currentLanguage: "th" | "en";
}

interface EngagementData {
  date: string;
  views: number;
  shares: number;
  favorites: number;
  newContentViews: number;
}

interface PlaceImpactData {
  placeName: string;
  views: number;
  shares: number;
  favorites: number;
  engagementRate: number;
  hasNewContent: boolean;
  contentAddedDate: string;
}

interface UserResponseData {
  metric: string;
  current: number;
  previous: number;
  change: number;
}

const ImpactAnalytics = ({ currentLanguage }: ImpactAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("7days");
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [topPlaces, setTopPlaces] = useState<PlaceImpactData[]>([]);
  const [userResponse, setUserResponse] = useState<UserResponseData[]>([]);

  const texts = {
    en: {
      title: "Impact Analytics",
      subtitle: "Track user engagement and response to new content",
      timeRange: "Time Range",
      last7days: "Last 7 days",
      last30days: "Last 30 days",
      last90days: "Last 90 days",
      userEngagement: "User Engagement Trends",
      totalViews: "Total Views",
      totalShares: "Total Shares",
      totalFavorites: "Total Favorites",
      avgEngagementRate: "Avg Engagement Rate",
      topPerformingPlaces: "Top Performing Places",
      newContentImpact: "New Content Impact",
      views: "Views",
      shares: "Shares",
      favorites: "Favorites",
      engagementRate: "Engagement Rate",
      newContent: "New Content",
      contentAdded: "Content Added",
      daysAgo: "days ago",
      increaseFromPrevious: "increase from previous period",
      decreaseFromPrevious: "decrease from previous period",
      viewDetails: "View Details",
      responseMetrics: "User Response Metrics"
    },
    th: {
      title: "การวิเคราะห์ผลกระทบ",
      subtitle: "ติดตามการมีส่วนร่วมของผู้ใช้และการตอบสนองต่อเนื้อหาใหม่",
      timeRange: "ช่วงเวลา",
      last7days: "7 วันที่ผ่านมา",
      last30days: "30 วันที่ผ่านมา",
      last90days: "90 วันที่ผ่านมา",
      userEngagement: "แนวโน้มการมีส่วนร่วมของผู้ใช้",
      totalViews: "ยอดเข้าชมทั้งหมด",
      totalShares: "การแชร์ทั้งหมด",
      totalFavorites: "รายการโปรดทั้งหมด",
      avgEngagementRate: "อัตราการมีส่วนร่วมเฉลี่ย",
      topPerformingPlaces: "สถานที่ที่มีประสิทธิภาพสูงสุด",
      newContentImpact: "ผลกระทบของเนื้อหาใหม่",
      views: "ยอดเข้าชม",
      shares: "การแชร์",
      favorites: "รายการโปรด",
      engagementRate: "อัตราการมีส่วนร่วม",
      newContent: "เนื้อหาใหม่",
      contentAdded: "เนื้อหาที่เพิ่ม",
      daysAgo: "วันที่ผ่านมา",
      increaseFromPrevious: "เพิ่มขึ้นจากช่วงก่อน",
      decreaseFromPrevious: "ลดลงจากช่วงก่อน",
      viewDetails: "ดูรายละเอียด",
      responseMetrics: "เมตริกซ์การตอบสนองของผู้ใช้"
    }
  };

  const t = texts[currentLanguage];

  useEffect(() => {
    loadImpactData();
  }, [timeRange]);

  const loadImpactData = async () => {
    // Mock data for demonstration
    const mockEngagementData: EngagementData[] = [
      { date: "2024-06-10", views: 1250, shares: 45, favorites: 89, newContentViews: 320 },
      { date: "2024-06-11", views: 1380, shares: 52, favorites: 95, newContentViews: 410 },
      { date: "2024-06-12", views: 1420, shares: 48, favorites: 102, newContentViews: 380 },
      { date: "2024-06-13", views: 1560, shares: 63, favorites: 118, newContentViews: 450 },
      { date: "2024-06-14", views: 1690, shares: 71, favorites: 134, newContentViews: 520 },
      { date: "2024-06-15", views: 1580, shares: 59, favorites: 125, newContentViews: 480 },
      { date: "2024-06-16", views: 1720, shares: 78, favorites: 142, newContentViews: 560 }
    ];

    const mockTopPlaces: PlaceImpactData[] = [
      { 
        placeName: "เกาะพีพี", 
        views: 3450, 
        shares: 156, 
        favorites: 234, 
        engagementRate: 12.4,
        hasNewContent: true,
        contentAddedDate: "2024-06-14"
      },
      { 
        placeName: "วัดพระแก้ว", 
        views: 2890, 
        shares: 89, 
        favorites: 187, 
        engagementRate: 9.8,
        hasNewContent: true,
        contentAddedDate: "2024-06-13"
      },
      { 
        placeName: "ดอยสุเทพ", 
        views: 2340, 
        shares: 67, 
        favorites: 145, 
        engagementRate: 8.6,
        hasNewContent: false,
        contentAddedDate: "2024-05-28"
      },
      { 
        placeName: "ตลาดนัดจตุจักร", 
        views: 1980, 
        shares: 134, 
        favorites: 98, 
        engagementRate: 11.2,
        hasNewContent: true,
        contentAddedDate: "2024-06-15"
      },
      { 
        placeName: "อยุธยา", 
        views: 1750, 
        shares: 78, 
        favorites: 123, 
        engagementRate: 10.5,
        hasNewContent: false,
        contentAddedDate: "2024-06-01"
      }
    ];

    const mockUserResponse: UserResponseData[] = [
      { metric: "Average View Time", current: 142, previous: 128, change: 10.9 },
      { metric: "Share Rate", current: 4.2, previous: 3.8, change: 10.5 },
      { metric: "Favorite Rate", current: 8.1, previous: 7.6, change: 6.6 },
      { metric: "Return Visitors", current: 67, previous: 61, change: 9.8 }
    ];

    setEngagementData(mockEngagementData);
    setTopPlaces(mockTopPlaces);
    setUserResponse(mockUserResponse);
  };

  const getTotalViews = () => engagementData.reduce((sum, item) => sum + item.views, 0);
  const getTotalShares = () => engagementData.reduce((sum, item) => sum + item.shares, 0);
  const getTotalFavorites = () => engagementData.reduce((sum, item) => sum + item.favorites, 0);
  const getAvgEngagementRate = () => {
    const total = getTotalViews();
    const engaged = getTotalShares() + getTotalFavorites();
    return total > 0 ? ((engaged / total) * 100).toFixed(1) : "0";
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t.timeRange} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">{t.last7days}</SelectItem>
            <SelectItem value="30days">{t.last30days}</SelectItem>
            <SelectItem value="90days">{t.last90days}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalViews}</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getTotalViews().toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalShares}</CardTitle>
            <Share2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getTotalShares()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +22% from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalFavorites}</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getTotalFavorites()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgEngagementRate}</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getAvgEngagementRate()}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t.userEngagement}</CardTitle>
          <CardDescription>Daily engagement metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="views" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.6}
                name={t.views}
              />
              <Area 
                type="monotone" 
                dataKey="newContentViews" 
                stackId="2"
                stroke="#10b981" 
                fill="#10b981"
                fillOpacity={0.6}
                name="New Content Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Response Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>{t.responseMetrics}</CardTitle>
          <CardDescription>How users respond to content updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userResponse.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{metric.metric}</h3>
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div className="text-xl font-bold">{metric.current.toLocaleString()}</div>
                <div className={`flex items-center text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% {metric.change >= 0 ? t.increaseFromPrevious : t.decreaseFromPrevious}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Places */}
      <Card>
        <CardHeader>
          <CardTitle>{t.topPerformingPlaces}</CardTitle>
          <CardDescription>Places with highest user engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPlaces.map((place, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{place.placeName}</h3>
                        {place.hasNewContent && (
                          <Badge variant="secondary" className="text-xs">
                            {t.newContent}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {t.contentAdded}: {getDaysAgo(place.contentAddedDate)} {t.daysAgo}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {place.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      {place.shares}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {place.favorites}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {place.engagementRate}% {t.engagementRate}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactAnalytics;