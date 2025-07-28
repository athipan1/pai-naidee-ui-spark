import { useState, useEffect } from "react";
import { TrendingUp, MapPin, FileImage, Edit, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface UsageAnalyticsProps {
  currentLanguage: "th" | "en";
}

interface MonthlyUsageData {
  month: string;
  additions: number;
  edits: number;
  total: number;
}

interface PlaceUpdateData {
  placeName: string;
  updateCount: number;
  lastUpdate: string;
  category: string;
}

interface MediaTypeData {
  type: string;
  count: number;
  percentage: number;
}

const UsageAnalytics = ({ currentLanguage }: UsageAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState("6months");
  const [monthlyData, setMonthlyData] = useState<MonthlyUsageData[]>([]);
  const [topPlaces, setTopPlaces] = useState<PlaceUpdateData[]>([]);
  const [mediaTypes, setMediaTypes] = useState<MediaTypeData[]>([]);

  const texts = {
    en: {
      title: "Usage Analytics",
      subtitle: "Monitor content creation and editing statistics",
      timeRange: "Time Range",
      last3months: "Last 3 months",
      last6months: "Last 6 months",
      last12months: "Last 12 months",
      monthlyActivity: "Monthly Media Activity",
      totalAdditions: "Total Additions",
      totalEdits: "Total Edits",
      topUpdatedPlaces: "Most Updated Places",
      mediaDistribution: "Media Type Distribution",
      additions: "Additions",
      edits: "Edits",
      updates: "Updates",
      lastUpdate: "Last Update",
      images: "Images",
      videos: "Videos",
      audio: "Audio",
      documents: "Documents",
      viewDetails: "View Details"
    },
    th: {
      title: "สถิติการใช้งาน",
      subtitle: "ติดตามสถิติการสร้างและแก้ไขเนื้อหา",
      timeRange: "ช่วงเวลา",
      last3months: "3 เดือนที่ผ่านมา",
      last6months: "6 เดือนที่ผ่านมา",
      last12months: "12 เดือนที่ผ่านมา",
      monthlyActivity: "กิจกรรมสื่อรายเดือน",
      totalAdditions: "การเพิ่มทั้งหมด",
      totalEdits: "การแก้ไขทั้งหมด",
      topUpdatedPlaces: "สถานที่ที่ได้รับการอัปเดตมากที่สุด",
      mediaDistribution: "การกระจายประเภทสื่อ",
      additions: "การเพิ่ม",
      edits: "การแก้ไข",
      updates: "การอัปเดต",
      lastUpdate: "อัปเดตล่าสุด",
      images: "รูปภาพ",
      videos: "วิดีโอ",
      audio: "เสียง",
      documents: "เอกสาร",
      viewDetails: "ดูรายละเอียด"
    }
  };

  const t = texts[currentLanguage];

  useEffect(() => {
    loadUsageData();
  }, [timeRange]);

  const loadUsageData = async () => {
    // Mock data for demonstration
    const mockMonthlyData: MonthlyUsageData[] = [
      { month: "Jan 2024", additions: 45, edits: 23, total: 68 },
      { month: "Feb 2024", additions: 52, edits: 31, total: 83 },
      { month: "Mar 2024", additions: 38, edits: 28, total: 66 },
      { month: "Apr 2024", additions: 61, edits: 35, total: 96 },
      { month: "May 2024", additions: 47, edits: 29, total: 76 },
      { month: "Jun 2024", additions: 59, edits: 42, total: 101 }
    ];

    const mockTopPlaces: PlaceUpdateData[] = [
      { placeName: "วัดพระแก้ว", updateCount: 45, lastUpdate: "2024-06-15", category: "วัด" },
      { placeName: "เกาะพีพี", updateCount: 38, lastUpdate: "2024-06-14", category: "ชายหาด" },
      { placeName: "ตลาดนัดจตุจักร", updateCount: 32, lastUpdate: "2024-06-13", category: "ตลาด" },
      { placeName: "ดอยสุเทพ", updateCount: 28, lastUpdate: "2024-06-12", category: "ภูเขา" },
      { placeName: "อยุธยา", updateCount: 25, lastUpdate: "2024-06-11", category: "โบราณสถาน" }
    ];

    const mockMediaTypes: MediaTypeData[] = [
      { type: "Images", count: 234, percentage: 65 },
      { type: "Videos", count: 89, percentage: 25 },
      { type: "Audio", count: 25, percentage: 7 },
      { type: "Documents", count: 12, percentage: 3 }
    ];

    setMonthlyData(mockMonthlyData);
    setTopPlaces(mockTopPlaces);
    setMediaTypes(mockMediaTypes);
  };

  const getTotalAdditions = () => monthlyData.reduce((sum, item) => sum + item.additions, 0);
  const getTotalEdits = () => monthlyData.reduce((sum, item) => sum + item.edits, 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
            <SelectItem value="3months">{t.last3months}</SelectItem>
            <SelectItem value="6months">{t.last6months}</SelectItem>
            <SelectItem value="12months">{t.last12months}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalAdditions}</CardTitle>
            <Plus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getTotalAdditions()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalEdits}</CardTitle>
            <Edit className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{getTotalEdits()}</div>
            <div className="flex items-center text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
            <FileImage className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{getTotalAdditions() + getTotalEdits()}</div>
            <div className="flex items-center text-xs text-purple-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +10% from previous period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.monthlyActivity}</CardTitle>
            <CardDescription>Media additions and edits over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="additions" fill="#10b981" name={t.additions} />
                <Bar dataKey="edits" fill="#3b82f6" name={t.edits} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.mediaDistribution}</CardTitle>
            <CardDescription>Distribution of media types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mediaTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percentage }) => `${type} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {mediaTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Updated Places */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t.topUpdatedPlaces}
          </CardTitle>
          <CardDescription>Places with the most content updates</CardDescription>
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
                      <h3 className="font-medium">{place.placeName}</h3>
                      <p className="text-sm text-gray-600">{place.category}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {place.updateCount} {t.updates}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {t.lastUpdate}: {new Date(place.lastUpdate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalytics;