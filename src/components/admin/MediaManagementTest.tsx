import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { mediaManagementService } from '@/shared/services/mediaManagementService';
import { timelineSyncService } from '@/shared/services/timelineSyncService';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

interface MediaManagementTestProps {
  currentLanguage: 'th' | 'en';
}

const MediaManagementTest = ({ currentLanguage }: MediaManagementTestProps) => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const content = {
    th: {
      title: 'ทดสอบระบบจัดการสื่อและ Timeline',
      runTests: 'เริ่มทดสอบ',
      running: 'กำลังทดสอบ...',
      completed: 'ทดสอบเสร็จสิ้น',
      testResults: 'ผลการทดสอบ',
      passed: 'ผ่าน',
      failed: 'ไม่ผ่าน',
      idle: 'รอ',
      running_status: 'กำลังทำงาน'
    },
    en: {
      title: 'Media Management and Timeline Test Suite',
      runTests: 'Run Tests',
      running: 'Running Tests...',
      completed: 'Tests Completed',
      testResults: 'Test Results',
      passed: 'Passed',
      failed: 'Failed',
      idle: 'Idle',
      running_status: 'Running'
    }
  };

  const t = content[currentLanguage];

  const testCases = [
    {
      name: 'Place Search - Existing Place',
      test: async () => {
        const result = await mediaManagementService.checkPlaceExists('Phi Phi Islands', 'Krabi');
        if (!result.exists) throw new Error('Should find existing place');
        return 'Found existing place successfully';
      }
    },
    {
      name: 'Place Search - Non-existing Place',
      test: async () => {
        const result = await mediaManagementService.checkPlaceExists('NonExistentPlace123', 'Unknown');
        if (result.exists) throw new Error('Should not find non-existing place');
        return 'Correctly identified non-existing place';
      }
    },
    {
      name: 'Media Replacement - Mock Test',
      test: async () => {
        const mockFiles = [
          new File(['mock content'], 'test1.jpg', { type: 'image/jpeg' }),
          new File(['mock content'], 'test2.jpg', { type: 'image/jpeg' })
        ];
        
        const mediaData = mockFiles.map((file, index) => ({
          title: `Test Media ${index + 1}`,
          description: `Test description ${index + 1}`,
          type: 'image' as const,
          file
        }));

        const result = await mediaManagementService.replaceMediaForPlace('test_place_1', mediaData);
        if (!result.success) throw new Error('Media replacement failed');
        return `Replaced media successfully: ${result.message}`;
      }
    },
    {
      name: 'New Place Creation - Mock Test',
      test: async () => {
        const mockFiles = [
          new File(['mock content'], 'new_place.jpg', { type: 'image/jpeg' })
        ];
        
        const mediaData = mockFiles.map((file, index) => ({
          title: `New Place Media ${index + 1}`,
          description: `New place description ${index + 1}`,
          type: 'image' as const,
          file
        }));

        const placeData = {
          placeId: '',
          placeName: 'Test New Place',
          placeNameLocal: 'สถานที่ทดสอบใหม่',
          province: 'Test Province',
          category: 'Test Category',
          description: 'A test place for validation',
          media: []
        };

        const result = await mediaManagementService.createPlaceWithMedia(placeData, mediaData);
        if (!result.success) throw new Error('Place creation failed');
        return `Created place successfully: ${result.message}`;
      }
    },
    {
      name: 'Timeline Sync - Media Replacement',
      test: async () => {
        const syncResult = await timelineSyncService.syncMediaReplacement(
          'test_place_1',
          ['old_media_1', 'old_media_2'],
          ['new_media_1', 'new_media_2'],
          'test_user',
          'Test media replacement sync'
        );
        
        if (!syncResult.success) throw new Error('Timeline sync failed');
        return `Synced ${syncResult.syncedEntries} entries successfully`;
      }
    },
    {
      name: 'Timeline Sync - Place Creation',
      test: async () => {
        const syncResult = await timelineSyncService.syncPlaceCreation(
          'test_place_new',
          ['new_media_1', 'new_media_2'],
          'test_user'
        );
        
        if (!syncResult.success) throw new Error('Timeline sync failed');
        return `Synced ${syncResult.syncedEntries} entries successfully`;
      }
    },
    {
      name: 'Timeline History Retrieval',
      test: async () => {
        const entries = await timelineSyncService.getTimelineHistory({
          placeId: 'test_place_1',
          limit: 10
        });
        
        if (!Array.isArray(entries)) throw new Error('Timeline history should return array');
        return `Retrieved ${entries.length} timeline entries`;
      }
    },
    {
      name: 'Force Timeline Sync',
      test: async () => {
        const syncResult = await timelineSyncService.forceSyncAll();
        if (!syncResult.success) throw new Error('Force sync failed');
        return `Force sync completed: ${syncResult.syncedEntries} entries`;
      }
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTests([]);

    const results: TestResult[] = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const startTime = Date.now();
      
      // Update progress
      setProgress((i / testCases.length) * 100);
      
      // Initialize test as running
      const runningResult: TestResult = {
        name: testCase.name,
        status: 'running',
        message: 'Running...'
      };
      results.push(runningResult);
      setTests([...results]);

      try {
        const message = await testCase.test();
        const duration = Date.now() - startTime;
        
        // Update test as passed
        results[i] = {
          name: testCase.name,
          status: 'passed',
          message,
          duration
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        
        // Update test as failed
        results[i] = {
          name: testCase.name,
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        };
      }
      
      setTests([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setProgress(100);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default' as const,
      failed: 'destructive' as const,
      running: 'secondary' as const,
      idle: 'outline' as const
    };

    const labels = {
      passed: t.passed,
      failed: t.failed,
      running: t.running_status,
      idle: t.idle
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-primary" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isRunning ? t.running : t.runTests}
            </Button>
            
            {tests.length > 0 && (
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✓ {passedTests} {t.passed}</span>
                <span className="text-red-600">✗ {failedTests} {t.failed}</span>
                <span className="text-gray-600">Total: {tests.length}</span>
              </div>
            )}
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {tests.length > 0 && !isRunning && (
            <Alert className={failedTests > 0 ? "border-red-500" : "border-green-500"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {failedTests > 0 
                  ? `Tests completed with ${failedTests} failures and ${passedTests} passes`
                  : `All ${passedTests} tests passed successfully!`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t.testResults}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {test.message}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground">
                        {test.duration}ms
                      </span>
                    )}
                    {getStatusBadge(test.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MediaManagementTest;