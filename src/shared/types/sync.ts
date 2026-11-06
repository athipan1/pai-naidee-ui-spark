// Enhanced sync and queue types
export interface QueueItemData {
  file?: File;
  mediaData?: {
    title: string;
    description: string;
    tags?: string[];
  };
  attractionId?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface QueueItem {
  id: string;
  type: QueueItemType;
  priority: QueuePriority;
  data: QueueItemData;
  status: QueueStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  retryCount: number;
  maxRetries: number;
  error?: string;
  progress?: number; // 0-100
  estimatedDuration?: number; // milliseconds
}

export enum QueueItemType {
  MEDIA_UPLOAD = 'media_upload',
  MEDIA_PROCESS = 'media_process',
  MEDIA_ENCRYPT = 'media_encrypt',
  PLACE_SYNC = 'place_sync',
  VERSION_CREATE = 'version_create',
  BATCH_OPERATION = 'batch_operation',
  FILE_VALIDATION = 'file_validation',
  SEARCH_INDEX = 'search_index'
}

export enum QueuePriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4
}

export enum QueueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

export interface QueueMetrics {
  totalItems: number;
  pendingItems: number;
  processingItems: number;
  completedItems: number;
  failedItems: number;
  averageProcessingTime: number;
  throughput: number; // items per minute
}

// WebSocket types for real-time updates
export interface WebSocketPayload {
  queueUpdate?: {
    itemId: string;
    status: QueueStatus;
    progress?: number;
  };
  mediaUploadProgress?: {
    uploadId: string;
    progress: number;
    bytesUploaded: number;
    totalBytes: number;
  };
  placeUpdate?: {
    placeId: string;
    changes: Record<string, unknown>;
  };
  [key: string]: unknown;
}

export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  payload: WebSocketPayload;
  timestamp: Date;
  userId?: string;
}

export enum WebSocketMessageType {
  QUEUE_UPDATE = 'queue_update',
  MEDIA_UPLOAD_PROGRESS = 'media_upload_progress',
  PLACE_UPDATE = 'place_update',
  VERSION_CREATED = 'version_created',
  USER_NOTIFICATION = 'user_notification',
  SYSTEM_STATUS = 'system_status',
  SYNC_PROGRESS = 'sync_progress'
}

export interface SyncProgress {
  operation: string;
  progress: number; // 0-100
  currentStep: string;
  totalSteps: number;
  currentStepIndex: number;
  estimatedTimeRemaining?: number; // milliseconds
  errors: string[];
  warnings: string[];
}

// Performance monitoring types
export interface PerformanceMetrics {
  id: string;
  operation: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
  networkUsage?: number; // bytes
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}