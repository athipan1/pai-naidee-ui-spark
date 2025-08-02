// Queue Management Service for improved sync performance
import {
  QueueItem,
  QueueItemType,
  QueuePriority,
  QueueStatus,
  QueueMetrics,
  WebSocketMessage,
  WebSocketMessageType,
  SyncProgress,
  PerformanceMetrics
} from '../types/sync';
import { authService } from './authService';

class QueueService {
  private queue: QueueItem[] = [];
  private processing = new Set<string>();
  private workers = new Map<string, Worker | null>();
  private maxConcurrentTasks = 3;
  private webSocket: WebSocket | null = null;
  private isProcessing = false;
  private performanceMetrics: PerformanceMetrics[] = [];
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  constructor() {
    this.initializeWebSocket();
    this.startProcessing();
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket(): void {
    try {
      const wsUrl = this.apiBaseUrl.replace('http', 'ws') + '/ws';
      this.webSocket = new WebSocket(wsUrl);

      this.webSocket.onopen = () => {
        console.log('WebSocket connected for queue updates');
        this.sendMessage({
          id: `auth_${Date.now()}`,
          type: WebSocketMessageType.SYSTEM_STATUS,
          payload: { token: authService.getAuthToken() },
          timestamp: new Date()
        });
      };

      this.webSocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.webSocket.onclose = () => {
        console.log('WebSocket connection closed');
        // Reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.webSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case WebSocketMessageType.QUEUE_UPDATE:
        this.handleQueueUpdate(message.payload);
        break;
      case WebSocketMessageType.SYNC_PROGRESS:
        this.handleSyncProgress(message.payload);
        break;
      case WebSocketMessageType.SYSTEM_STATUS:
        console.log('System status update:', message.payload);
        break;
      default:
        console.log('Unhandled WebSocket message:', message);
    }
  }

  /**
   * Send message via WebSocket
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      this.webSocket.send(JSON.stringify(message));
    }
  }

  /**
   * Add item to queue
   */
  async addToQueue(
    type: QueueItemType,
    data: any,
    priority: QueuePriority = QueuePriority.NORMAL,
    maxRetries: number = 3
  ): Promise<string> {
    const queueItem: QueueItem = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      priority,
      data,
      status: QueueStatus.PENDING,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries,
      progress: 0
    };

    this.queue.push(queueItem);
    this.sortQueueByPriority();

    // Notify via WebSocket
    this.sendMessage({
      id: `queue_add_${Date.now()}`,
      type: WebSocketMessageType.QUEUE_UPDATE,
      payload: { action: 'added', item: queueItem },
      timestamp: new Date(),
      userId: authService.getCurrentUser()?.id
    });

    console.log(`Added to queue: ${queueItem.id} (${type})`);
    return queueItem.id;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): QueueMetrics {
    const totalItems = this.queue.length;
    const pendingItems = this.queue.filter(item => item.status === QueueStatus.PENDING).length;
    const processingItems = this.queue.filter(item => item.status === QueueStatus.PROCESSING).length;
    const completedItems = this.queue.filter(item => item.status === QueueStatus.COMPLETED).length;
    const failedItems = this.queue.filter(item => item.status === QueueStatus.FAILED).length;

    // Calculate average processing time
    const completedMetrics = this.performanceMetrics.filter(m => m.success && m.duration);
    const averageProcessingTime = completedMetrics.length > 0
      ? completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length
      : 0;

    // Calculate throughput (items per minute)
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentCompletions = this.queue.filter(
      item => item.completedAt && item.completedAt > oneMinuteAgo
    ).length;

    return {
      totalItems,
      pendingItems,
      processingItems,
      completedItems,
      failedItems,
      averageProcessingTime,
      throughput: recentCompletions
    };
  }

  /**
   * Start queue processing
   */
  private startProcessing(): void {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processQueue();
  }

  /**
   * Process queue items
   */
  private async processQueue(): Promise<void> {
    while (this.isProcessing) {
      if (this.processing.size >= this.maxConcurrentTasks) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      const nextItem = this.getNextQueueItem();
      if (!nextItem) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      this.processQueueItem(nextItem);
    }
  }

  /**
   * Get next queue item to process
   */
  private getNextQueueItem(): QueueItem | null {
    return this.queue.find(
      item => item.status === QueueStatus.PENDING && !this.processing.has(item.id)
    ) || null;
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    this.processing.add(item.id);
    item.status = QueueStatus.PROCESSING;
    item.startedAt = new Date();

    const metrics: PerformanceMetrics = {
      id: `metrics_${item.id}`,
      operation: item.type,
      startTime: new Date(),
      success: false
    };

    try {
      // Update progress
      this.updateItemProgress(item.id, 10);

      const result = await this.executeQueueItem(item);
      
      item.status = QueueStatus.COMPLETED;
      item.completedAt = new Date();
      item.progress = 100;
      
      metrics.success = true;
      metrics.endTime = new Date();
      metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();

      // Notify completion
      this.sendMessage({
        id: `queue_complete_${Date.now()}`,
        type: WebSocketMessageType.QUEUE_UPDATE,
        payload: { action: 'completed', item, result },
        timestamp: new Date(),
        userId: authService.getCurrentUser()?.id
      });

      console.log(`Completed queue item: ${item.id}`);
    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      
      metrics.success = false;
      metrics.endTime = new Date();
      metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
      metrics.error = error instanceof Error ? error.message : 'Unknown error';

      item.retryCount++;
      if (item.retryCount >= item.maxRetries) {
        item.status = QueueStatus.FAILED;
        item.failedAt = new Date();
        item.error = error instanceof Error ? error.message : 'Unknown error';
      } else {
        item.status = QueueStatus.RETRYING;
        // Add delay before retry
        setTimeout(() => {
          item.status = QueueStatus.PENDING;
        }, Math.pow(2, item.retryCount) * 1000); // Exponential backoff
      }
    } finally {
      this.processing.delete(item.id);
      this.performanceMetrics.push(metrics);
      
      // Keep only last 1000 metrics entries
      if (this.performanceMetrics.length > 1000) {
        this.performanceMetrics = this.performanceMetrics.slice(-1000);
      }
    }
  }

  /**
   * Execute queue item based on type
   */
  private async executeQueueItem(item: QueueItem): Promise<any> {
    switch (item.type) {
      case QueueItemType.MEDIA_UPLOAD:
        return this.processMediaUpload(item);
      case QueueItemType.MEDIA_PROCESS:
        return this.processMediaProcessing(item);
      case QueueItemType.MEDIA_ENCRYPT:
        return this.processMediaEncryption(item);
      case QueueItemType.PLACE_SYNC:
        return this.processPlaceSync(item);
      case QueueItemType.VERSION_CREATE:
        return this.processVersionCreation(item);
      case QueueItemType.FILE_VALIDATION:
        return this.processFileValidation(item);
      case QueueItemType.SEARCH_INDEX:
        return this.processSearchIndexing(item);
      default:
        throw new Error(`Unknown queue item type: ${item.type}`);
    }
  }

  /**
   * Process media upload
   */
  private async processMediaUpload(item: QueueItem): Promise<any> {
    this.updateItemProgress(item.id, 20);
    
    const { file, mediaData } = item.data;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify(mediaData));

    this.updateItemProgress(item.id, 50);

    const response = await fetch(`${this.apiBaseUrl}/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authService.getAuthToken()}`,
      },
      body: formData,
    });

    this.updateItemProgress(item.id, 80);

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Process media processing (thumbnail generation, optimization)
   */
  private async processMediaProcessing(item: QueueItem): Promise<any> {
    this.updateItemProgress(item.id, 30);
    
    // Simulate media processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.updateItemProgress(item.id, 70);
    
    // More processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { processed: true, mediaId: item.data.mediaId };
  }

  /**
   * Process media encryption
   */
  private async processMediaEncryption(item: QueueItem): Promise<any> {
    this.updateItemProgress(item.id, 25);
    
    // Simulate encryption process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    this.updateItemProgress(item.id, 75);
    
    // Finalize encryption
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { encrypted: true, mediaId: item.data.mediaId };
  }

  /**
   * Process other queue item types
   */
  private async processPlaceSync(item: QueueItem): Promise<any> {
    // Simulate place sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { synced: true, placeId: item.data.placeId };
  }

  private async processVersionCreation(item: QueueItem): Promise<any> {
    // Simulate version creation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { versionCreated: true, targetId: item.data.targetId };
  }

  private async processFileValidation(item: QueueItem): Promise<any> {
    // Simulate file validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { validated: true, fileName: item.data.fileName };
  }

  private async processSearchIndexing(item: QueueItem): Promise<any> {
    // Simulate search indexing
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { indexed: true, documentId: item.data.documentId };
  }

  /**
   * Update item progress
   */
  private updateItemProgress(itemId: string, progress: number): void {
    const item = this.queue.find(q => q.id === itemId);
    if (item) {
      item.progress = progress;
      
      // Notify progress update
      this.sendMessage({
        id: `progress_${Date.now()}`,
        type: WebSocketMessageType.QUEUE_UPDATE,
        payload: { action: 'progress', itemId, progress },
        timestamp: new Date(),
        userId: authService.getCurrentUser()?.id
      });
    }
  }

  /**
   * Sort queue by priority
   */
  private sortQueueByPriority(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Higher priority first
      }
      return a.createdAt.getTime() - b.createdAt.getTime(); // FIFO for same priority
    });
  }

  /**
   * Handle queue update from server
   */
  private handleQueueUpdate(payload: any): void {
    console.log('Queue update received:', payload);
    // Handle server-side queue updates
  }

  /**
   * Handle sync progress update
   */
  private handleSyncProgress(payload: SyncProgress): void {
    console.log('Sync progress update:', payload);
    // Emit event for UI components to listen
    window.dispatchEvent(new CustomEvent('syncProgress', { detail: payload }));
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics[] {
    return this.performanceMetrics.slice(); // Return copy
  }

  /**
   * Cancel queue item
   */
  cancelQueueItem(itemId: string): boolean {
    const item = this.queue.find(q => q.id === itemId);
    if (item && item.status === QueueStatus.PENDING) {
      item.status = QueueStatus.CANCELLED;
      return true;
    }
    return false;
  }

  /**
   * Clear completed items from queue
   */
  clearCompleted(): number {
    const beforeCount = this.queue.length;
    this.queue = this.queue.filter(
      item => item.status !== QueueStatus.COMPLETED && item.status !== QueueStatus.FAILED
    );
    return beforeCount - this.queue.length;
  }

  /**
   * Stop queue processing
   */
  stopProcessing(): void {
    this.isProcessing = false;
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}

export const queueService = new QueueService();