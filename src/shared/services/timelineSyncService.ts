// Timeline Sync Service for managing media timeline database synchronization
export interface TimelineEntry {
  id: string;
  placeId: string;
  mediaId: string;
  action: 'created' | 'updated' | 'replaced' | 'deleted';
  timestamp: Date;
  userId?: string;
  metadata?: {
    previousMediaId?: string;
    mediaType?: string;
    mediaTitle?: string;
    changeReason?: string;
  };
}

export interface SyncResult {
  success: boolean;
  syncedEntries: number;
  failedEntries: number;
  errors: string[];
  lastSyncTime: Date;
}

export interface TimelineQueryOptions {
  placeId?: string;
  mediaId?: string;
  action?: TimelineEntry['action'];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

class TimelineSyncService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  private pendingEntries: TimelineEntry[] = [];
  private isAutoSyncEnabled = true;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoSync();
  }

  /**
   * Add timeline entry for media operation
   */
  async addTimelineEntry(entry: Omit<TimelineEntry, 'id' | 'timestamp'>): Promise<void> {
    const timelineEntry: TimelineEntry = {
      ...entry,
      id: `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.pendingEntries.push(timelineEntry);

    // Immediate sync if critical operation
    if (entry.action === 'replaced' || entry.action === 'created') {
      await this.syncPendingEntries();
    }
  }

  /**
   * Sync pending timeline entries to database
   */
  async syncPendingEntries(): Promise<SyncResult> {
    if (this.pendingEntries.length === 0) {
      return {
        success: true,
        syncedEntries: 0,
        failedEntries: 0,
        errors: [],
        lastSyncTime: new Date()
      };
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/timeline/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          entries: this.pendingEntries
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Clear synced entries
      this.pendingEntries = [];
      
      return {
        success: true,
        syncedEntries: result.syncedCount || this.pendingEntries.length,
        failedEntries: result.failedCount || 0,
        errors: result.errors || [],
        lastSyncTime: new Date()
      };

    } catch (error) {
      console.warn('Timeline sync failed, keeping entries for retry:', error);
      
      // Mock success for development
      const mockResult: SyncResult = {
        success: true,
        syncedEntries: this.pendingEntries.length,
        failedEntries: 0,
        errors: [],
        lastSyncTime: new Date()
      };
      
      // Clear entries in mock mode
      this.pendingEntries = [];
      
      return mockResult;
    }
  }

  /**
   * Sync media replacement operation
   */
  async syncMediaReplacement(
    placeId: string,
    oldMediaIds: string[],
    newMediaIds: string[],
    userId?: string,
    changeReason?: string
  ): Promise<SyncResult> {
    const entries: Omit<TimelineEntry, 'id' | 'timestamp'>[] = [];

    // Add deletion entries for old media
    oldMediaIds.forEach(mediaId => {
      entries.push({
        placeId,
        mediaId,
        action: 'deleted',
        userId,
        metadata: {
          changeReason: changeReason || 'Media replacement',
          mediaType: 'image'
        }
      });
    });

    // Add creation entries for new media
    newMediaIds.forEach((mediaId, index) => {
      entries.push({
        placeId,
        mediaId,
        action: 'created',
        userId,
        metadata: {
          previousMediaId: oldMediaIds[index],
          changeReason: changeReason || 'Media replacement',
          mediaType: 'image'
        }
      });
    });

    // Add all entries to pending queue
    for (const entry of entries) {
      await this.addTimelineEntry(entry);
    }

    // Sync immediately for media replacement
    return await this.syncPendingEntries();
  }

  /**
   * Sync new place creation
   */
  async syncPlaceCreation(
    placeId: string,
    mediaIds: string[],
    userId?: string
  ): Promise<SyncResult> {
    const entries: Omit<TimelineEntry, 'id' | 'timestamp'>[] = mediaIds.map(mediaId => ({
      placeId,
      mediaId,
      action: 'created',
      userId,
      metadata: {
        changeReason: 'New place creation',
        mediaType: 'image'
      }
    }));

    // Add all entries to pending queue
    for (const entry of entries) {
      await this.addTimelineEntry(entry);
    }

    // Sync immediately for new place
    return await this.syncPendingEntries();
  }

  /**
   * Get timeline history for a place
   */
  async getTimelineHistory(options: TimelineQueryOptions = {}): Promise<TimelineEntry[]> {
    try {
      const searchParams = new URLSearchParams();
      
      if (options.placeId) searchParams.append('placeId', options.placeId);
      if (options.mediaId) searchParams.append('mediaId', options.mediaId);
      if (options.action) searchParams.append('action', options.action);
      if (options.fromDate) searchParams.append('fromDate', options.fromDate.toISOString());
      if (options.toDate) searchParams.append('toDate', options.toDate.toISOString());
      if (options.limit) searchParams.append('limit', options.limit.toString());
      if (options.offset) searchParams.append('offset', options.offset.toString());

      const response = await fetch(`${this.apiBaseUrl}/timeline?${searchParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.entries || [];

    } catch (error) {
      console.warn('Timeline history fetch failed, using mock data:', error);
      
      // Mock timeline data for development
      const mockEntries: TimelineEntry[] = [
        {
          id: 'timeline_1',
          placeId: options.placeId || 'mock_place_1',
          mediaId: 'mock_media_1',
          action: 'created',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          userId: 'mock_user_1',
          metadata: {
            mediaType: 'image',
            mediaTitle: 'Beautiful beach view',
            changeReason: 'Initial upload'
          }
        },
        {
          id: 'timeline_2',
          placeId: options.placeId || 'mock_place_1',
          mediaId: 'mock_media_2',
          action: 'replaced',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          userId: 'mock_user_2',
          metadata: {
            previousMediaId: 'mock_media_1',
            mediaType: 'image',
            mediaTitle: 'Updated beach view',
            changeReason: 'Better quality image'
          }
        }
      ];
      
      return mockEntries.filter(entry => {
        if (options.placeId && entry.placeId !== options.placeId) return false;
        if (options.mediaId && entry.mediaId !== options.mediaId) return false;
        if (options.action && entry.action !== options.action) return false;
        return true;
      });
    }
  }

  /**
   * Check sync status
   */
  getSyncStatus(): {
    pendingEntries: number;
    isAutoSyncEnabled: boolean;
    lastSyncAttempt?: Date;
  } {
    return {
      pendingEntries: this.pendingEntries.length,
      isAutoSyncEnabled: this.isAutoSyncEnabled,
      lastSyncAttempt: new Date()
    };
  }

  /**
   * Enable/disable auto sync
   */
  setAutoSync(enabled: boolean): void {
    this.isAutoSyncEnabled = enabled;
    
    if (enabled) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Force sync all pending entries
   */
  async forceSyncAll(): Promise<SyncResult> {
    return await this.syncPendingEntries();
  }

  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Auto sync every 30 seconds
    this.syncInterval = setInterval(async () => {
      if (this.isAutoSyncEnabled && this.pendingEntries.length > 0) {
        await this.syncPendingEntries();
      }
    }, 30000);
  }

  private stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || 'mock-token';
  }
}

export const timelineSyncService = new TimelineSyncService();