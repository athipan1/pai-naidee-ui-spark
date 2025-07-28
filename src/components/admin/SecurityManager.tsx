// Security Manager Component
import { useState } from 'react';
import { Shield, Lock, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityManagerProps {
  currentLanguage: 'th' | 'en';
}

const SecurityManager = ({ currentLanguage }: SecurityManagerProps) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const content = {
    th: {
      title: 'จัดการความปลอดภัย',
      description: 'ตรวจสอบและจัดการความปลอดภัยของระบบ',
      fileEncryption: 'การเข้ารหัสไฟล์',
      virusScan: 'การสแกนไวรัส',
      securityAudit: 'ตรวจสอบความปลอดภัย',
      startScan: 'เริ่มสแกน',
      scanning: 'กำลังสแกน...',
      scanComplete: 'สแกนเสร็จสิ้น'
    },
    en: {
      title: 'Security Management',
      description: 'Monitor and manage system security',
      fileEncryption: 'File Encryption',
      virusScan: 'Virus Scanning',
      securityAudit: 'Security Audit',
      startScan: 'Start Scan',
      scanning: 'Scanning...',
      scanComplete: 'Scan Complete'
    }
  };

  const t = content[currentLanguage];

  const handleSecurityScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate security scan
    for (let i = 0; i <= 100; i += 10) {
      setScanProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              {t.fileEncryption}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between">
                <span>Encrypted Files:</span>
                <span>127</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {t.virusScan}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleSecurityScan} 
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? t.scanning : t.startScan}
              </Button>
              {scanProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t.securityAudit}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Security audit features are available in the full version.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityManager;