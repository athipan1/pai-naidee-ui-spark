// System Monitor Component
import { useState } from 'react';
import { Settings, Server, Activity, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SystemMonitorProps {
  currentLanguage: 'th' | 'en';
}

const SystemMonitor = ({ currentLanguage }: SystemMonitorProps) => {
  const content = {
    th: {
      title: 'ตรวจสอบระบบ',
      description: 'ตรวจสอบสถานะและประสิทธิภาพของระบบ',
      systemStatus: 'สถานะระบบ',
      performance: 'ประสิทธิภาพ',
      resources: 'ทรัพยากร',
      online: 'ออนไลน์',
      offline: 'ออฟไลน์'
    },
    en: {
      title: 'System Monitor',
      description: 'Monitor system status and performance',
      systemStatus: 'System Status',
      performance: 'Performance',
      resources: 'Resources',
      online: 'Online',
      offline: 'Offline'
    }
  };

  const t = content[currentLanguage];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              {t.systemStatus}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>API Server</span>
                <Badge variant="default">{t.online}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Database</span>
                <Badge variant="default">{t.online}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Queue Service</span>
                <Badge variant="default">{t.online}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t.performance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>45%</span>
                </div>
                <Progress value={45} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>67%</span>
                </div>
                <Progress value={67} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>23%</span>
                </div>
                <Progress value={23} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMonitor;