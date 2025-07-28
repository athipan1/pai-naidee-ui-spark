import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Users, Database, Server, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { getSystemMetrics } from "@/shared/utils/dashboardAPI";

interface SystemMetricsProps {
  currentLanguage: "th" | "en";
}

interface MetricData {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  requestCount: number;
  responseTime: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  avgResponseTime: number;
  uptime: string;
  diskUsage: number;
  memoryUsage: number;
  cpuUsage: number;
}

const SystemMetrics = ({ currentLanguage }: SystemMetricsProps) => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 12547,
    activeUsers: 342,
    totalRequests: 89651,
    avgResponseTime: 89,
    uptime: "15 days, 7 hours",
    diskUsage: 67,
    memoryUsage: 73,
    cpuUsage: 45
  });

  const texts = {
    en: {
      title: "System Metrics",
      subtitle: "Monitor system performance and usage statistics",
      totalUsers: "Total Users",
      activeUsers: "Active Users",
      totalRequests: "Total Requests",
      avgResponseTime: "Avg Response Time",
      uptime: "System Uptime",
      diskUsage: "Disk Usage",
      memoryUsage: "Memory Usage",
      cpuUsage: "CPU Usage",
      performanceMetrics: "Performance Metrics",
      requestVolume: "Request Volume",
      systemHealth: "System Health",
      last24Hours: "Last 24 Hours",
      ms: "ms",
      requests: "requests",
      users: "users"
    },
    th: {
      title: "เมตริกซ์ระบบ",
      subtitle: "ตรวจสอบประสิทธิภาพระบบและสถิติการใช้งาน",
      totalUsers: "ผู้ใช้ทั้งหมด",
      activeUsers: "ผู้ใช้ที่ใช้งานอยู่",
      totalRequests: "คำขอทั้งหมด",
      avgResponseTime: "เวลาตอบสนองเฉลี่ย",
      uptime: "เวลาทำงานระบบ",
      diskUsage: "การใช้ดิสก์",
      memoryUsage: "การใช้หน่วยความจำ",
      cpuUsage: "การใช้ CPU",
      performanceMetrics: "เมตริกซ์ประสิทธิภาพ",
      requestVolume: "ปริมาณคำขอ",
      systemHealth: "สุขภาพระบบ",
      last24Hours: "24 ชั่วโมงที่ผ่านมา",
      ms: "มิลลิวินาทi",
      requests: "คำขอ",
      users: "ผู้ใช้"
    }
  };

  const t = texts[currentLanguage];

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await getSystemMetrics();
      setMetrics(data.metrics);
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load metrics:', error);
      // Load mock data for demo
      const mockMetrics: MetricData[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        cpuUsage: Math.random() * 80 + 20,
        memoryUsage: Math.random() * 60 + 30,
        requestCount: Math.floor(Math.random() * 1000 + 500),
        responseTime: Math.random() * 200 + 50
      }));
      setMetrics(mockMetrics);
    }
  };

  const getUsageVariant = (percentage: number) => {
    if (percentage < 50) return "default";
    if (percentage < 80) return "secondary";
    return "destructive";
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.activeUsers}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalRequests}</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2% from last hour
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.avgResponseTime}</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime}{t.ms}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              15ms faster
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>{t.systemHealth}</CardTitle>
          <CardDescription>
            {t.uptime}: {stats.uptime}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.cpuUsage}</span>
                <Badge variant={getUsageVariant(stats.cpuUsage)}>
                  {stats.cpuUsage}%
                </Badge>
              </div>
              <Progress value={stats.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.memoryUsage}</span>
                <Badge variant={getUsageVariant(stats.memoryUsage)}>
                  {stats.memoryUsage}%
                </Badge>
              </div>
              <Progress value={stats.memoryUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t.diskUsage}</span>
                <Badge variant={getUsageVariant(stats.diskUsage)}>
                  {stats.diskUsage}%
                </Badge>
              </div>
              <Progress value={stats.diskUsage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t.performanceMetrics}</CardTitle>
            <CardDescription>{t.last24Hours}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number, name: string) => [
                    `${value.toFixed(1)}${name.includes('Usage') ? '%' : name.includes('Time') ? 'ms' : ''}`,
                    name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="cpuUsage" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="CPU Usage"
                />
                <Line 
                  type="monotone" 
                  dataKey="memoryUsage" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Memory Usage"
                />
                <Line 
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Response Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.requestVolume}</CardTitle>
            <CardDescription>{t.last24Hours}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTime}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value: number) => [`${value} requests`, "Request Count"]}
                />
                <Bar dataKey="requestCount" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMetrics;