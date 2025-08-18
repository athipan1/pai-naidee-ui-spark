import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { getServiceStatus } from "@/shared/utils/dashboardAPI";

interface ServiceStatusProps {
  currentLanguage: "th" | "en";
}

interface ServiceInfo {
  id: string;
  name: string;
  status: "healthy" | "warning" | "error";
  lastCheck: string;
  responseTime: number;
  uptime: string;
  endpoint: string;
}

const ServiceStatus = ({ currentLanguage }: ServiceStatusProps) => {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const texts = {
    en: {
      title: "Backend Service Status",
      subtitle: "Monitor the health of all backend services",
      refresh: "Refresh Status",
      healthy: "Healthy",
      warning: "Warning", 
      error: "Error",
      responseTime: "Response Time",
      uptime: "Uptime",
      lastCheck: "Last Check",
      endpoint: "Endpoint",
      refreshSuccess: "Service status updated successfully",
      refreshError: "Failed to refresh service status"
    },
    th: {
      title: "สถานะบริการฝั่งเซิร์ฟเวอร์",
      subtitle: "ตรวจสอบสถานภาพของบริการฝั่งเซิร์ฟเวอร์ทั้งหมด",
      refresh: "รีเฟรชสถานะ",
      healthy: "ปกติ",
      warning: "เตือน",
      error: "ข้อผิดพลาด",
      responseTime: "เวลาตอบสนอง",
      uptime: "เวลาทำงาน",
      lastCheck: "ตรวจสอบล่าสุด",
      endpoint: "ปลายทาง",
      refreshSuccess: "อัปเดตสถานะบริการเรียบร้อยแล้ว",
      refreshError: "ไม่สามารถรีเฟรชสถานะบริการได้"
    }
  };

  const t = texts[currentLanguage];

  useEffect(() => {
    loadServiceStatus();
  }, []);

  const loadServiceStatus = async () => {
    setLoading(true);
    try {
      const data = await getServiceStatus();
      setServices(data);
      toast({
        title: t.refreshSuccess,
        description: `Updated ${data.length} services`,
      });
    } catch (error) {
      console.error('Failed to load service status:', error);
      
      // Provide specific error messages based on the error
      let errorMessage = "Please try again later";
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          errorMessage = "Please log in to view service status";
        } else if (error.message.includes('Access forbidden')) {
          errorMessage = "Admin privileges required";
        } else if (error.message.includes('Unable to connect')) {
          errorMessage = "Backend services unavailable";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: t.refreshError,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Only load mock data if it's a network error (backend unavailable)
      if (error instanceof Error && (
        error.message.includes('Unable to connect') || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError')
      )) {
        // Load mock data for demo when backend is unavailable
        setServices([
          {
            id: "api-gateway",
            name: "API Gateway",
            status: "healthy",
            lastCheck: new Date().toISOString(),
            responseTime: 45,
            uptime: "99.9%",
            endpoint: "/api/health"
          },
          {
            id: "database",
            name: "Database Service",
            status: "healthy",
            lastCheck: new Date().toISOString(),
            responseTime: 12,
            uptime: "99.8%",
            endpoint: "/db/health"
          },
          {
            id: "auth-service",
            name: "Authentication Service",
            status: "warning",
            lastCheck: new Date().toISOString(),
            responseTime: 120,
            uptime: "98.5%",
            endpoint: "/auth/health"
          },
          {
            id: "file-storage",
            name: "File Storage Service",
            status: "healthy",
            lastCheck: new Date().toISOString(),
            responseTime: 78,
            uptime: "99.7%",
            endpoint: "/storage/health"
          },
          {
            id: "cache-service",
            name: "Cache Service",
            status: "error",
            lastCheck: new Date().toISOString(),
            responseTime: 0,
            uptime: "95.2%",
            endpoint: "/cache/health"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "healthy" ? "default" : 
                   status === "warning" ? "secondary" : "destructive";
    const statusText = status === "healthy" ? t.healthy :
                      status === "warning" ? t.warning : t.error;
    
    return <Badge variant={variant}>{statusText}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
        <Button 
          onClick={loadServiceStatus} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t.refresh}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                {getStatusBadge(service.status)}
              </div>
              <CardDescription className="text-xs font-mono">
                {t.endpoint}: {service.endpoint}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">{t.responseTime}</p>
                  <p className="font-medium">{service.responseTime}ms</p>
                </div>
                <div>
                  <p className="text-gray-600">{t.uptime}</p>
                  <p className="font-medium">{service.uptime}</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  {t.lastCheck}: {new Date(service.lastCheck).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceStatus;