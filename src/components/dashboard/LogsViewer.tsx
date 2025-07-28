import { useState, useEffect, useRef } from "react";
import { Download, Filter, RefreshCw, Search, AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/shared/hooks/use-toast";
import { getSystemLogs } from "@/shared/utils/dashboardAPI";

interface LogsViewerProps {
  currentLanguage: "th" | "en";
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
}

const LogsViewer = ({ currentLanguage }: LogsViewerProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const texts = {
    en: {
      title: "System Logs",
      subtitle: "View and monitor application logs and backend interactions",
      refresh: "Refresh",
      autoRefresh: "Auto Refresh",
      search: "Search logs...",
      level: "Level",
      source: "Source",
      download: "Download Logs",
      allLevels: "All Levels",
      allSources: "All Sources",
      info: "Info",
      warning: "Warning", 
      error: "Error",
      debug: "Debug",
      noLogs: "No logs found",
      timestamp: "Timestamp",
      logsRefreshed: "Logs refreshed successfully",
      downloadStarted: "Log download started",
      refreshError: "Failed to refresh logs"
    },
    th: {
      title: "บันทึกระบบ",
      subtitle: "ดูและตรวจสอบบันทึกแอปพลิเคชันและการโต้ตอบฝั่งเซิร์ฟเวอร์",
      refresh: "รีเฟรช",
      autoRefresh: "รีเฟรชอัตโนมัติ",
      search: "ค้นหาบันทึก...",
      level: "ระดับ",
      source: "แหล่งที่มา",
      download: "ดาวน์โหลดบันทึก",
      allLevels: "ทุกระดับ",
      allSources: "ทุกแหล่งที่มา",
      info: "ข้อมูล",
      warning: "เตือน",
      error: "ข้อผิดพลาด",
      debug: "ดีบัก",
      noLogs: "ไม่พบบันทึก",
      timestamp: "เวลา",
      logsRefreshed: "รีเฟรชบันทึกเรียบร้อยแล้ว",
      downloadStarted: "เริ่มดาวน์โหลดบันทึกแล้ว",
      refreshError: "ไม่สามารถรีเฟรชบันทึกได้"
    }
  };

  const t = texts[currentLanguage];

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadLogs, 5000); // Refresh every 5 seconds
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, levelFilter, sourceFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getSystemLogs();
      setLogs(data);
      if (!autoRefresh) {
        toast({
          title: t.logsRefreshed,
          description: `Loaded ${data.length} log entries`,
        });
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
      if (!autoRefresh) {
        toast({
          title: t.refreshError,
          description: "Please try again later",
          variant: "destructive",
        });
      }
      // Load mock data for demo
      const mockLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          source: "API Gateway",
          message: "Request processed successfully",
          metadata: { endpoint: "/api/attractions", method: "GET", responseTime: 45 }
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 30000).toISOString(),
          level: "warning",
          source: "Auth Service",
          message: "Slow authentication response detected",
          metadata: { userId: "user123", responseTime: 2500 }
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: "error",
          source: "Database",
          message: "Connection timeout occurred",
          metadata: { query: "SELECT * FROM attractions", timeout: 5000 }
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 90000).toISOString(),
          level: "info",
          source: "Image Processor",
          message: "Image optimization completed",
          metadata: { filename: "temple-001.jpg", originalSize: "2.4MB", compressedSize: "856KB" }
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: "debug",
          source: "Cache Service",
          message: "Cache hit for attractions list",
          metadata: { key: "attractions:page:1", ttl: 300 }
        }
      ];
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== "all") {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter(log => log.source === sourceFilter);
    }

    setFilteredLogs(filtered);
  };

  const handleDownloadLogs = () => {
    const logsData = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: t.downloadStarted,
      description: `Downloaded ${filteredLogs.length} log entries`,
    });
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "debug":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variant = level === "info" ? "default" :
                   level === "warning" ? "secondary" :
                   level === "error" ? "destructive" : "outline";
    const levelText = level === "info" ? t.info :
                     level === "warning" ? t.warning :
                     level === "error" ? t.error : t.debug;
    
    return <Badge variant={variant} className="text-xs">{levelText}</Badge>;
  };

  const uniqueSources = Array.from(new Set(logs.map(log => log.source)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {t.autoRefresh}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadLogs}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {t.download}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.level} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allLevels}</SelectItem>
                <SelectItem value="info">{t.info}</SelectItem>
                <SelectItem value="warning">{t.warning}</SelectItem>
                <SelectItem value="error">{t.error}</SelectItem>
                <SelectItem value="debug">{t.debug}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.source} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allSources}</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Log Entries ({filteredLogs.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96" ref={scrollAreaRef}>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {t.noLogs}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {getLevelIcon(log.level)}
                        <span className="text-sm font-medium">{log.source}</span>
                        {getLevelBadge(log.level)}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2">{log.message}</p>
                    
                    {log.metadata && (
                      <div className="text-xs text-gray-600 bg-gray-100 rounded p-2 font-mono">
                        {JSON.stringify(log.metadata, null, 2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsViewer;