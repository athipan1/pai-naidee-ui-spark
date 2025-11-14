// System Monitor Component
import { useState, useEffect } from 'react';
import { Settings, Server, Activity, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnection } from '@/shared/utils/supabaseHealthCheck';

type ConnectionStatus = 'checking' | 'connected' | 'error';

interface SystemMonitorProps {
  currentLanguage: 'th' | 'en';
}

const SystemMonitor = ({ currentLanguage }: SystemMonitorProps) => {
  const [supabaseStatus, setSupabaseStatus] = useState<ConnectionStatus>('checking');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  const content = {
    th: {
      title: 'ตรวจสอบระบบ',
      description: 'ตรวจสอบสถานะและการเชื่อมต่อของส่วนประกอบต่างๆ',
      systemStatus: 'สถานะการเชื่อมต่อ',
      supabaseConnection: 'การเชื่อมต่อ Supabase',
      checking: 'กำลังตรวจสอบ...',
      connected: 'เชื่อมต่อสำเร็จ',
      error: 'เชื่อมต่อล้มเหลว',
      refresh: 'รีเฟรช',
      apiServer: 'เซิร์ฟเวอร์ API',
      queueService: 'บริการคิว',
    },
    en: {
      title: 'System Monitor',
      description: 'Monitor the status and connectivity of various components.',
      systemStatus: 'Connection Status',
      supabaseConnection: 'Supabase Connection',
      checking: 'Checking...',
      connected: 'Connected Successfully',
      error: 'Connection Failed',
      refresh: 'Refresh',
      apiServer: 'API Server',
      queueService: 'Queue Service',
    }
  };

  const t = content[currentLanguage];

  const handleCheckSupabaseStatus = async () => {
    setSupabaseStatus('checking');
    setSupabaseError(null);
    console.log('Checking Supabase connection...');
    const result = await checkSupabaseConnection();
    if (result.ok) {
      setSupabaseStatus('connected');
      console.log('Supabase connection successful.');
    } else {
      setSupabaseStatus('error');
      setSupabaseError(result.error || 'An unknown error occurred.');
      console.error('Supabase connection failed:', result.error);
    }
  };

  useEffect(() => {
    handleCheckSupabaseStatus();
  }, []);

  const getStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">{t.checking}</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t.connected}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t.error}</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              {t.title}
            </CardTitle>
            <CardDescription>{t.description}</CardDescription>
          </div>
          <Button onClick={handleCheckSupabaseStatus} size="sm" variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${supabaseStatus === 'checking' ? 'animate-spin' : ''}`} />
            {t.refresh}
          </Button>
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
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>{t.supabaseConnection}</span>
                {getStatusBadge(supabaseStatus)}
              </div>
              {/* Mock statuses for other services */}
              <div className="flex justify-between items-center">
                <span>{t.apiServer}</span>
                <Badge variant="default" className="bg-gray-400">Not Monitored</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>{t.queueService}</span>
                <Badge variant="default" className="bg-gray-400">Not Monitored</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* You can add other monitoring cards here if needed */}
        <Card className="opacity-50">
           <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Performance monitoring is not implemented.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMonitor;
