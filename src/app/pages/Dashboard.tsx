import { useState } from "react";
import { ArrowLeft, Server, Activity, FileText, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceStatus from "@/components/dashboard/ServiceStatus";
import ProcessControl from "@/components/dashboard/ProcessControl";
import LogsViewer from "@/components/dashboard/LogsViewer";
import SystemMetrics from "@/components/dashboard/SystemMetrics";

interface DashboardProps {
  currentLanguage: "th" | "en";
  onBack: () => void;
}

const Dashboard = ({ currentLanguage, onBack }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("status");

  const texts = {
    en: {
      title: "Developer Dashboard",
      subtitle: "Monitor and manage backend services",
      status: "Service Status",
      processes: "Process Control",
      logs: "Logs",
      metrics: "System Metrics",
      welcome: "Welcome to the Developer Dashboard",
      description: "Use this dashboard to monitor backend services, initiate processes, and view system logs and metrics."
    },
    th: {
      title: "แดชบอร์ดสำหรับนักพัฒนา",
      subtitle: "ตรวจสอบและจัดการบริการฝั่งเซิร์ฟเวอร์",
      status: "สถานะบริการ",
      processes: "การควบคุมกระบวนการ",
      logs: "บันทึกระบบ",
      metrics: "เมตริกซ์ระบบ",
      welcome: "ยินดีต้อนรับสู่แดชบอร์ดสำหรับนักพัฒนา",
      description: "ใช้แดชบอร์ดนี้เพื่อตรวจสอบบริการฝั่งเซิร์ฟเวอร์ เริ่มกระบวนการต่างๆ และดูบันทึกและเมตริกซ์ของระบบ"
    }
  };

  const t = texts[currentLanguage];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t.welcome}
            </CardTitle>
            <CardDescription>
              {t.description}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="hidden sm:inline">{t.status}</span>
            </TabsTrigger>
            <TabsTrigger value="processes" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">{t.processes}</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t.logs}</span>
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t.metrics}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <ServiceStatus currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="processes" className="space-y-6">
            <ProcessControl currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsViewer currentLanguage={currentLanguage} />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <SystemMetrics currentLanguage={currentLanguage} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;