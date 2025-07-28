// Testing Interface Component
import { useState } from 'react';
import { TestTube, Play, Users, FileUp, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TestingInterfaceProps {
  currentLanguage: 'th' | 'en';
}

const TestingInterface = ({ currentLanguage }: TestingInterfaceProps) => {
  const [runningTests, setRunningTests] = useState<string[]>([]);
  const [testProgress, setTestProgress] = useState<Record<string, number>>({});

  const content = {
    th: {
      title: 'อินเทอร์เฟซการทดสอบ',
      description: 'รันการทดสอบอัตโนมัติและจำลองสถานการณ์',
      largeFileTest: 'ทดสอบไฟล์ขนาดใหญ่',
      networkFailureTest: 'ทดสอบความล้มเหลวของเครือข่าย',
      concurrentUsersTest: 'ทดสอบผู้ใช้พร้อมกัน',
      runTest: 'รันการทดสอบ',
      running: 'กำลังรัน...',
      testComplete: 'การทดสอบเสร็จสิ้น'
    },
    en: {
      title: 'Testing Interface',
      description: 'Run automated tests and simulations',
      largeFileTest: 'Large File Upload Test',
      networkFailureTest: 'Network Failure Test', 
      concurrentUsersTest: 'Concurrent Users Test',
      runTest: 'Run Test',
      running: 'Running...',
      testComplete: 'Test Complete'
    }
  };

  const t = content[currentLanguage];

  const runTest = async (testType: string) => {
    setRunningTests(prev => [...prev, testType]);
    setTestProgress(prev => ({ ...prev, [testType]: 0 }));

    // Simulate test execution
    for (let i = 0; i <= 100; i += 5) {
      setTestProgress(prev => ({ ...prev, [testType]: i }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setRunningTests(prev => prev.filter(t => t !== testType));
  };

  const isTestRunning = (testType: string) => runningTests.includes(testType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5" />
              {t.largeFileTest}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => runTest('largeFile')}
                disabled={isTestRunning('largeFile')}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {isTestRunning('largeFile') ? t.running : t.runTest}
              </Button>
              {testProgress.largeFile !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{testProgress.largeFile}%</span>
                  </div>
                  <Progress value={testProgress.largeFile} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              {t.networkFailureTest}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => runTest('networkFailure')}
                disabled={isTestRunning('networkFailure')}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {isTestRunning('networkFailure') ? t.running : t.runTest}
              </Button>
              {testProgress.networkFailure !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{testProgress.networkFailure}%</span>
                  </div>
                  <Progress value={testProgress.networkFailure} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t.concurrentUsersTest}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={() => runTest('concurrentUsers')}
                disabled={isTestRunning('concurrentUsers')}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {isTestRunning('concurrentUsers') ? t.running : t.runTest}
              </Button>
              {testProgress.concurrentUsers !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{testProgress.concurrentUsers}%</span>
                  </div>
                  <Progress value={testProgress.concurrentUsers} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <TestTube className="w-4 h-4" />
        <AlertDescription>
          Testing services are running in simulation mode. Connect to a real backend for full functionality.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TestingInterface;