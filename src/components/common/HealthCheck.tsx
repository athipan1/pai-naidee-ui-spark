import { useState, useEffect } from 'react';
import { getHealth } from '@/lib/axios';
import { Badge } from '@/components/ui/badge';

type Status = 'loading' | 'success' | 'error';

const HealthCheck = () => {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('กำลังตรวจสอบสถานะ...');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await getHealth();
        if (response.status === 'ok') {
          setStatus('success');
          setMessage('ระบบพร้อมใช้งาน');
        } else {
          throw new Error('Backend status not ok');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Backend ไม่ตอบสนอง');
        console.error('Health check failed:', error);
      }
    };

    checkHealth();
  }, []);

  const getBadgeVariant = () => {
    switch (status) {
      case 'success':
        return 'default'; // Typically green in shadcn/ui
      case 'error':
        return 'destructive'; // Typically red
      case 'loading':
      default:
        return 'secondary'; // Typically grey
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'loading':
      default:
        return '⏱️';
    }
  }

  return (
    <Badge variant={getBadgeVariant()} className="text-xs font-normal">
      <span className="mr-2">{getIcon()}</span>
      {message}
    </Badge>
  );
};

export default HealthCheck;
