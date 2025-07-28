// Queue Monitor Component
import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, XCircle, Play, Pause, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { queueService } from '@/shared/services/queueService';
import type { QueueMetrics, QueueItem, QueueStatus, QueueItemType, QueuePriority } from '@/shared/types/sync';

interface QueueMonitorProps {
  currentLanguage: 'th' | 'en';
}

const QueueMonitor = ({ currentLanguage }: QueueMonitorProps) => {
  const [metrics, setMetrics] = useState<QueueMetrics | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const content = {
    th: {
      // Main titles
      title: 'การตรวจสอบคิว',
      description: 'ติดตามสถานะและประสิทธิภาพของระบบคิว',
      
      // Tabs
      overview: 'ภาพรวม',
      queue: 'รายการคิว',
      performance: 'ประสิทธิภาพ',
      
      // Metrics
      totalItems: 'รายการทั้งหมด',
      pendingItems: 'รอดำเนินการ',
      processingItems: 'กำลังประมวลผล',
      completedItems: 'เสร็จสิ้น',
      failedItems: 'ล้มเหลว',
      averageTime: 'เวลาเฉลี่ย',
      throughput: 'อัตราการประมวลผล',
      
      // Queue status
      pending: 'รอดำเนินการ',
      processing: 'กำลังประมวลผล',
      completed: 'เสร็จสิ้น',
      failed: 'ล้มเหลว',
      cancelled: 'ยกเลิก',
      retrying: 'ลองใหม่',
      
      // Queue item types
      media_upload: 'อัปโหลดสื่อ',
      media_process: 'ประมวลผลสื่อ',
      media_encrypt: 'เข้ารหัสสื่อ',
      place_sync: 'ซิงค์สถานที่',
      version_create: 'สร้างเวอร์ชัน',
      file_validation: 'ตรวจสอบไฟล์',
      search_index: 'จัดทำดัชนีค้นหา',
      
      // Actions
      refresh: 'รีเฟรช',
      autoRefresh: 'รีเฟรชอัตโนมัติ',
      clearCompleted: 'ล้างรายการที่เสร็จแล้ว',
      retryFailed: 'ลองรายการที่ล้มเหลวใหม่',
      cancelItem: 'ยกเลิกรายการ',
      
      // Status messages
      refreshing: 'กำลังรีเฟรช...',
      noItems: 'ไม่มีรายการในคิว',
      itemsPerMinute: 'รายการต่อนาที'
    },
    en: {
      // Main titles
      title: 'Queue Monitor',
      description: 'Monitor queue status and performance',
      
      // Tabs
      overview: 'Overview',
      queue: 'Queue Items',
      performance: 'Performance',
      
      // Metrics
      totalItems: 'Total Items',
      pendingItems: 'Pending',
      processingItems: 'Processing',
      completedItems: 'Completed',
      failedItems: 'Failed',
      averageTime: 'Average Time',
      throughput: 'Throughput',
      
      // Queue status
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      retrying: 'Retrying',
      
      // Queue item types
      media_upload: 'Media Upload',
      media_process: 'Media Processing',
      media_encrypt: 'Media Encryption',
      place_sync: 'Place Sync',
      version_create: 'Version Creation',
      file_validation: 'File Validation',
      search_index: 'Search Indexing',
      
      // Actions
      refresh: 'Refresh',
      autoRefresh: 'Auto Refresh',
      clearCompleted: 'Clear Completed',
      retryFailed: 'Retry Failed',
      cancelItem: 'Cancel Item',
      
      // Status messages
      refreshing: 'Refreshing...',
      noItems: 'No items in queue',
      itemsPerMinute: 'items per minute'
    }
  };

  const t = content[currentLanguage];

  // Auto-refresh effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (autoRefresh) {
      interval = setInterval(refreshData, 5000); // Refresh every 5 seconds
    }
    
    // Initial load
    refreshData();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // WebSocket effect for real-time updates
  useEffect(() => {
    const handleSyncProgress = (event: CustomEvent) => {
      console.log('Sync progress update:', event.detail);
      // Update UI with real-time progress
    };

    window.addEventListener('syncProgress', handleSyncProgress as EventListener);
    
    return () => {
      window.removeEventListener('syncProgress', handleSyncProgress as EventListener);
    };
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      // Get queue metrics
      const queueMetrics = queueService.getQueueStatus();
      setMetrics(queueMetrics);
      
      // In a real implementation, we would get queue items from the service
      // For now, we'll simulate some queue items
      const mockQueueItems: QueueItem[] = [
        {
          id: 'queue_1',
          type: 'media_upload' as QueueItemType,
          priority: 2 as QueuePriority,
          data: { fileName: 'beach-photo.jpg' },
          status: 'processing' as QueueStatus,
          createdAt: new Date(Date.now() - 30000),
          startedAt: new Date(Date.now() - 10000),
          retryCount: 0,
          maxRetries: 3,
          progress: 65
        },
        {
          id: 'queue_2',
          type: 'place_sync' as QueueItemType,
          priority: 3 as QueuePriority,
          data: { placeId: 'place_123' },
          status: 'pending' as QueueStatus,
          createdAt: new Date(Date.now() - 60000),
          retryCount: 0,
          maxRetries: 3,
          progress: 0
        },
        {
          id: 'queue_3',
          type: 'media_encrypt' as QueueItemType,
          priority: 1 as QueuePriority,
          data: { mediaId: 'media_456' },
          status: 'completed' as QueueStatus,
          createdAt: new Date(Date.now() - 120000),
          startedAt: new Date(Date.now() - 90000),
          completedAt: new Date(Date.now() - 30000),
          retryCount: 0,
          maxRetries: 3,
          progress: 100
        },
        {
          id: 'queue_4',
          type: 'file_validation' as QueueItemType,
          priority: 2 as QueuePriority,
          data: { fileName: 'document.pdf' },
          status: 'failed' as QueueStatus,
          createdAt: new Date(Date.now() - 180000),
          startedAt: new Date(Date.now() - 150000),
          failedAt: new Date(Date.now() - 120000),
          retryCount: 2,
          maxRetries: 3,
          progress: 30,
          error: 'File type not supported'
        }
      ];
      
      setQueueItems(mockQueueItems);
    } catch (error) {
      console.error('Failed to refresh queue data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearCompleted = () => {
    const clearedCount = queueService.clearCompleted();
    console.log(`Cleared ${clearedCount} completed items`);
    refreshData();
  };

  const handleCancelItem = (itemId: string) => {
    const success = queueService.cancelQueueItem(itemId);
    if (success) {
      console.log(`Cancelled item ${itemId}`);
      refreshData();
    }
  };

  const getStatusIcon = (status: QueueStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'processing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'retrying':
        return <RotateCcw className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: QueueStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'retrying':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: QueuePriority) => {
    switch (priority) {
      case 4: // CRITICAL
        return 'bg-red-100 text-red-800';
      case 3: // HIGH
        return 'bg-orange-100 text-orange-800';
      case 2: // NORMAL
        return 'bg-blue-100 text-blue-800';
      case 1: // LOW
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t.title}
          </CardTitle>
          <CardDescription>{t.description}</CardDescription>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isRefreshing}
            >
              <RotateCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? t.refreshing : t.refresh}
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Play className="w-4 h-4 mr-2" />
              {t.autoRefresh}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t.clearCompleted}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
          <TabsTrigger value="queue">{t.queue}</TabsTrigger>
          <TabsTrigger value="performance">{t.performance}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.totalItems}</p>
                      <p className="text-2xl font-bold">{metrics.totalItems}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.pendingItems}</p>
                      <p className="text-2xl font-bold">{metrics.pendingItems}</p>
                    </div>
                    <Clock className="w-8 h-8 text-gray-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.processingItems}</p>
                      <p className="text-2xl font-bold">{metrics.processingItems}</p>
                    </div>
                    <Play className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.completedItems}</p>
                      <p className="text-2xl font-bold">{metrics.completedItems}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.failedItems}</p>
                      <p className="text-2xl font-bold">{metrics.failedItems}</p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.averageTime}</p>
                      <p className="text-2xl font-bold">
                        {formatDuration(metrics.averageProcessingTime)}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.throughput}</p>
                      <p className="text-2xl font-bold">
                        {metrics.throughput}
                        <span className="text-sm font-normal ml-1">{t.itemsPerMinute}</span>
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Queue Items Tab */}
        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>{t.queue}</CardTitle>
              <CardDescription>
                Current queue items and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {queueItems.length > 0 ? (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {queueItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <Badge className={getStatusColor(item.status)}>
                              {t[item.status]}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)}>
                              Priority {item.priority}
                            </Badge>
                            <Badge variant="outline">
                              {t[item.type as keyof typeof t] || item.type}
                            </Badge>
                          </div>
                          
                          {item.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelItem(item.id)}
                            >
                              <XCircle className="w-4 h-4" />
                              {t.cancelItem}
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>ID: {item.id}</span>
                            <span>Created: {new Date(item.createdAt).toLocaleTimeString()}</span>
                          </div>

                          {item.progress !== undefined && item.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{item.progress}%</span>
                              </div>
                              <Progress value={item.progress} className="h-2" />
                            </div>
                          )}

                          {item.error && (
                            <Alert variant="destructive">
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription>{item.error}</AlertDescription>
                            </Alert>
                          )}

                          {item.retryCount > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Retry {item.retryCount}/{item.maxRetries}
                            </p>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Data: {JSON.stringify(item.data)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{t.noItems}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-bold">
                        {((metrics.completedItems / Math.max(metrics.totalItems, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className="font-bold">
                        {((metrics.failedItems / Math.max(metrics.totalItems, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Processing Time:</span>
                      <span className="font-bold">{formatDuration(metrics.averageProcessingTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Throughput:</span>
                      <span className="font-bold">{metrics.throughput} items/min</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Queue Service: Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>WebSocket: Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Auto-refresh: {autoRefresh ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QueueMonitor;