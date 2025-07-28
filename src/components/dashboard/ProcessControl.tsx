import { useState } from "react";
import { Play, Square, RotateCcw, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { 
  startBackendProcess, 
  stopBackendProcess, 
  restartBackendProcess
} from "@/shared/utils/dashboardAPI";

interface ProcessControlProps {
  currentLanguage: "th" | "en";
}

interface BackendProcess {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "starting" | "stopping";
  description: string;
  lastStarted?: string;
  memoryUsage?: string;
  cpuUsage?: string;
}

const ProcessControl = ({ currentLanguage }: ProcessControlProps) => {
  const [processes, setProcesses] = useState<BackendProcess[]>([
    {
      id: "data-sync",
      name: "Data Synchronization",
      status: "running",
      description: "Syncs tourism data from external APIs",
      lastStarted: new Date().toISOString(),
      memoryUsage: "245 MB",
      cpuUsage: "12%"
    },
    {
      id: "image-processor",
      name: "Image Processing Service",
      status: "stopped",
      description: "Processes and optimizes uploaded images",
      memoryUsage: "0 MB",
      cpuUsage: "0%"
    },
    {
      id: "backup-service",
      name: "Database Backup",
      status: "running",
      description: "Automated database backup service",
      lastStarted: new Date(Date.now() - 3600000).toISOString(),
      memoryUsage: "89 MB",
      cpuUsage: "5%"
    },
    {
      id: "notification-service",
      name: "Notification Service",
      status: "error",
      description: "Handles push notifications and emails",
      memoryUsage: "0 MB",
      cpuUsage: "0%"
    }
  ]);
  
  const [loadingProcesses, setLoadingProcesses] = useState<string[]>([]);
  const { toast } = useToast();

  const texts = {
    en: {
      title: "Backend Process Control",
      subtitle: "Start, stop, and manage backend processes",
      start: "Start",
      stop: "Stop", 
      restart: "Restart",
      running: "Running",
      stopped: "Stopped",
      error: "Error",
      starting: "Starting",
      stopping: "Stopping",
      status: "Status",
      actions: "Actions",
      lastStarted: "Last Started",
      memoryUsage: "Memory",
      cpuUsage: "CPU",
      processStarted: "Process started successfully",
      processStopped: "Process stopped successfully",
      processRestarted: "Process restarted successfully",
      processError: "Failed to control process",
      bulkActions: "Bulk Actions",
      selectAction: "Select action...",
      stopAll: "Stop All Processes",
      startAll: "Start All Processes",
      restartAll: "Restart All Processes"
    },
    th: {
      title: "การควบคุมกระบวนการฝั่งเซิร์ฟเวอร์",
      subtitle: "เริ่ม หยุด และจัดการกระบวนการฝั่งเซิร์ฟเวอร์",
      start: "เริ่ม",
      stop: "หยุด",
      restart: "เริ่มใหม่",
      running: "กำลังทำงาน",
      stopped: "หยุดทำงาน",
      error: "ข้อผิดพลาด",
      starting: "กำลังเริ่ม",
      stopping: "กำลังหยุด",
      status: "สถานะ",
      actions: "การดำเนินการ",
      lastStarted: "เริ่มล่าสุด",
      memoryUsage: "หน่วยความจำ",
      cpuUsage: "CPU",
      processStarted: "เริ่มกระบวนการเรียบร้อยแล้ว",
      processStopped: "หยุดกระบวนการเรียบร้อยแล้ว",
      processRestarted: "เริ่มกระบวนการใหม่เรียบร้อยแล้ว",
      processError: "ไม่สามารถควบคุมกระบวนการได้",
      bulkActions: "การดำเนินการหลายรายการ",
      selectAction: "เลือกการดำเนินการ...",
      stopAll: "หยุดกระบวนการทั้งหมด",
      startAll: "เริ่มกระบวนการทั้งหมด",
      restartAll: "เริ่มกระบวนการใหม่ทั้งหมด"
    }
  };

  const t = texts[currentLanguage];

  const handleProcessAction = async (processId: string, action: "start" | "stop" | "restart") => {
    setLoadingProcesses(prev => [...prev, processId]);
    
    try {
      switch (action) {
        case "start":
          await startBackendProcess(processId);
          break;
        case "stop":
          await stopBackendProcess(processId);
          break;
        case "restart":
          await restartBackendProcess(processId);
          break;
      }

      // Update process status
      setProcesses(prev => prev.map(p => 
        p.id === processId 
          ? { 
              ...p, 
              status: action === "stop" ? "stopped" : "running",
              lastStarted: action !== "stop" ? new Date().toISOString() : p.lastStarted
            }
          : p
      ));

      toast({
        title: action === "start" ? t.processStarted :
               action === "stop" ? t.processStopped : t.processRestarted,
        description: `Process: ${processes.find(p => p.id === processId)?.name}`,
      });
    } catch (error) {
      console.error(`Failed to ${action} process:`, error);
      toast({
        title: t.processError,
        description: `Action: ${action}`,
        variant: "destructive",
      });
    } finally {
      setLoadingProcesses(prev => prev.filter(id => id !== processId));
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "running" ? "default" :
                   status === "stopped" ? "secondary" :
                   status === "error" ? "destructive" : "outline";
    const statusText = status === "running" ? t.running :
                      status === "stopped" ? t.stopped :
                      status === "error" ? t.error :
                      status === "starting" ? t.starting : t.stopping;
    
    return <Badge variant={variant}>{statusText}</Badge>;
  };

  const isProcessLoading = (processId: string) => loadingProcesses.includes(processId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600">{t.subtitle}</p>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t.selectAction} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start-all">{t.startAll}</SelectItem>
              <SelectItem value="stop-all">{t.stopAll}</SelectItem>
              <SelectItem value="restart-all">{t.restartAll}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {processes.map((process) => (
          <Card key={process.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{process.name}</CardTitle>
                  <CardDescription>{process.description}</CardDescription>
                </div>
                {getStatusBadge(process.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Process Metrics */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">{t.memoryUsage}</p>
                  <p className="font-medium">{process.memoryUsage}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t.cpuUsage}</p>
                  <p className="font-medium">{process.cpuUsage}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t.status}</p>
                  <p className="font-medium">{process.status}</p>
                </div>
              </div>

              {/* Last Started */}
              {process.lastStarted && (
                <div className="text-xs text-gray-500 border-t pt-3">
                  {t.lastStarted}: {new Date(process.lastStarted).toLocaleString()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant={process.status === "running" ? "outline" : "default"}
                  onClick={() => handleProcessAction(process.id, "start")}
                  disabled={process.status === "running" || isProcessLoading(process.id)}
                  className="flex items-center gap-1"
                >
                  {isProcessLoading(process.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  {t.start}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcessAction(process.id, "stop")}
                  disabled={process.status === "stopped" || isProcessLoading(process.id)}
                  className="flex items-center gap-1"
                >
                  <Square className="h-3 w-3" />
                  {t.stop}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleProcessAction(process.id, "restart")}
                  disabled={isProcessLoading(process.id)}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t.restart}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProcessControl;