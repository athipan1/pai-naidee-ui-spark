// Version Control Service for media and places
import {
  MediaVersion,
  PlaceVersion,
  VersionHistory,
  VersionComparison,
  VersionDifference,
  RollbackRequest,
  RollbackResult,
  ChangeType
} from '../types/version';
import type { MediaItem } from '../types/media';
import { authService } from './authService';

class VersionControlService {
  private apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  private mediaVersions = new Map<string, MediaVersion[]>();
  private placeVersions = new Map<string, PlaceVersion[]>();

  /**
   * Create a new version of media item
   */
  async createMediaVersion(
    mediaId: string,
    updatedMedia: Partial<MediaItem>,
    changeType: ChangeType,
    changeReason?: string
  ): Promise<MediaVersion> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get current version number
      const existingVersions = await this.getMediaVersionHistory(mediaId);
      const currentVersion = existingVersions.versions.length > 0 
        ? Math.max(...existingVersions.versions.map(v => v.version))
        : 0;

      const newVersion: MediaVersion = {
        id: `version_${mediaId}_${currentVersion + 1}_${Date.now()}`,
        mediaId,
        version: currentVersion + 1,
        title: updatedMedia.title || '',
        description: updatedMedia.description || '',
        url: updatedMedia.url,
        file: updatedMedia.file,
        mimeType: updatedMedia.mimeType,
        size: updatedMedia.size,
        hash: await this.generateFileHash(updatedMedia.file),
        encrypted: updatedMedia.encrypted || false,
        createdAt: new Date(),
        createdBy: currentUser.id,
        changeType,
        changeReason,
        previousVersionId: existingVersions.versions.length > 0 
          ? existingVersions.versions.find(v => v.isActive)?.id
          : undefined,
        isActive: true
      };

      // Mark previous version as inactive
      if (existingVersions.versions.length > 0) {
        const currentVersions = this.mediaVersions.get(mediaId) || [];
        currentVersions.forEach(v => v.isActive = false);
        this.mediaVersions.set(mediaId, [...currentVersions, newVersion]);
      } else {
        this.mediaVersions.set(mediaId, [newVersion]);
      }

      // In production, save to server
      if (!import.meta.env.DEV) {
        await fetch(`${this.apiBaseUrl}/versions/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authService.getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newVersion),
        });
      }

      console.log('Created media version:', newVersion);
      return newVersion;
    } catch (error) {
      console.error('Failed to create media version:', error);
      throw error;
    }
  }

  /**
   * Create a new version of place
   */
  async createPlaceVersion(
    placeId: string,
    updatedPlace: any,
    changeType: ChangeType,
    changeReason?: string
  ): Promise<PlaceVersion> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get current version number
      const existingVersions = await this.getPlaceVersionHistory(placeId);
      const currentVersion = existingVersions.versions.length > 0 
        ? Math.max(...existingVersions.versions.map(v => v.version))
        : 0;

      const newVersion: PlaceVersion = {
        id: `place_version_${placeId}_${currentVersion + 1}_${Date.now()}`,
        placeId,
        version: currentVersion + 1,
        name: updatedPlace.name || '',
        nameLocal: updatedPlace.nameLocal,
        description: updatedPlace.description,
        province: updatedPlace.province || '',
        category: updatedPlace.category || '',
        coordinates: updatedPlace.coordinates,
        tags: updatedPlace.tags || [],
        mediaVersions: updatedPlace.mediaVersions || [],
        createdAt: new Date(),
        createdBy: currentUser.id,
        changeType,
        changeReason,
        previousVersionId: existingVersions.versions.length > 0 
          ? existingVersions.versions.find(v => v.isActive)?.id
          : undefined,
        isActive: true
      };

      // Mark previous version as inactive
      if (existingVersions.versions.length > 0) {
        const currentVersions = this.placeVersions.get(placeId) || [];
        currentVersions.forEach(v => v.isActive = false);
        this.placeVersions.set(placeId, [...currentVersions, newVersion]);
      } else {
        this.placeVersions.set(placeId, [newVersion]);
      }

      // In production, save to server
      if (!import.meta.env.DEV) {
        await fetch(`${this.apiBaseUrl}/versions/place`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authService.getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newVersion),
        });
      }

      console.log('Created place version:', newVersion);
      return newVersion;
    } catch (error) {
      console.error('Failed to create place version:', error);
      throw error;
    }
  }

  /**
   * Get version history for media
   */
  async getMediaVersionHistory(mediaId: string): Promise<VersionHistory> {
    try {
      let versions = this.mediaVersions.get(mediaId) || [];

      // In production, fetch from server
      if (!import.meta.env.DEV) {
        const response = await fetch(`${this.apiBaseUrl}/versions/media/${mediaId}`, {
          headers: {
            'Authorization': `Bearer ${authService.getAuthToken()}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          versions = data.versions || [];
        }
      }

      return {
        totalVersions: versions.length,
        versions: versions.sort((a, b) => b.version - a.version),
        currentVersion: versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0
      };
    } catch (error) {
      console.error('Failed to get media version history:', error);
      return {
        totalVersions: 0,
        versions: [],
        currentVersion: 0
      };
    }
  }

  /**
   * Get version history for place
   */
  async getPlaceVersionHistory(placeId: string): Promise<VersionHistory> {
    try {
      let versions = this.placeVersions.get(placeId) || [];

      // In production, fetch from server
      if (!import.meta.env.DEV) {
        const response = await fetch(`${this.apiBaseUrl}/versions/place/${placeId}`, {
          headers: {
            'Authorization': `Bearer ${authService.getAuthToken()}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          versions = data.versions || [];
        }
      }

      return {
        totalVersions: versions.length,
        versions: versions.sort((a, b) => b.version - a.version),
        currentVersion: versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0
      };
    } catch (error) {
      console.error('Failed to get place version history:', error);
      return {
        totalVersions: 0,
        versions: [],
        currentVersion: 0
      };
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    oldVersionId: string,
    newVersionId: string,
    type: 'media' | 'place'
  ): Promise<VersionComparison> {
    try {
      let oldVersion: MediaVersion | PlaceVersion | undefined;
      let newVersion: MediaVersion | PlaceVersion | undefined;

      if (type === 'media') {
        // Find versions in stored data
        for (const versions of this.mediaVersions.values()) {
          const found1 = versions.find(v => v.id === oldVersionId);
          const found2 = versions.find(v => v.id === newVersionId);
          if (found1) oldVersion = found1;
          if (found2) newVersion = found2;
        }
      } else {
        // Find versions in stored data
        for (const versions of this.placeVersions.values()) {
          const found1 = versions.find(v => v.id === oldVersionId);
          const found2 = versions.find(v => v.id === newVersionId);
          if (found1) oldVersion = found1;
          if (found2) newVersion = found2;
        }
      }

      if (!oldVersion || !newVersion) {
        throw new Error('One or both versions not found');
      }

      const differences = this.calculateDifferences(oldVersion, newVersion);

      return {
        oldVersion,
        newVersion,
        differences
      };
    } catch (error) {
      console.error('Failed to compare versions:', error);
      throw error;
    }
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(request: RollbackRequest): Promise<RollbackResult> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Find the target version
      let targetVersion: MediaVersion | PlaceVersion | undefined;
      
      if (request.targetType === 'media') {
        const versions = this.mediaVersions.get(request.targetId) || [];
        targetVersion = versions.find(v => v.id === request.targetVersionId);
      } else {
        const versions = this.placeVersions.get(request.targetId) || [];
        targetVersion = versions.find(v => v.id === request.targetVersionId);
      }

      if (!targetVersion) {
        return {
          success: false,
          targetId: request.targetId,
          message: 'Target version not found',
          rollbackedToVersion: null
        };
      }

      // Create a new version based on the target version
      let newVersion: MediaVersion | PlaceVersion;
      
      if (request.targetType === 'media') {
        const mediaVersion = targetVersion as MediaVersion;
        newVersion = await this.createMediaVersion(
          request.targetId,
          {
            title: mediaVersion.title,
            description: mediaVersion.description,
            url: mediaVersion.url,
            mimeType: mediaVersion.mimeType,
            size: mediaVersion.size
          },
          ChangeType.RESTORED,
          `Rollback: ${request.reason}`
        );
      } else {
        const placeVersion = targetVersion as PlaceVersion;
        newVersion = await this.createPlaceVersion(
          request.targetId,
          {
            name: placeVersion.name,
            nameLocal: placeVersion.nameLocal,
            description: placeVersion.description,
            province: placeVersion.province,
            category: placeVersion.category,
            coordinates: placeVersion.coordinates,
            tags: placeVersion.tags,
            mediaVersions: placeVersion.mediaVersions
          },
          ChangeType.RESTORED,
          `Rollback: ${request.reason}`
        );
      }

      return {
        success: true,
        targetId: request.targetId,
        newVersionId: newVersion.id,
        rollbackedToVersion: targetVersion.version,
        message: `Successfully rolled back to version ${targetVersion.version}`
      };
    } catch (error) {
      console.error('Failed to rollback version:', error);
      return {
        success: false,
        targetId: request.targetId,
        message: `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        rollbackedToVersion: null
      };
    }
  }

  /**
   * Calculate differences between two versions
   */
  private calculateDifferences(
    oldVersion: MediaVersion | PlaceVersion,
    newVersion: MediaVersion | PlaceVersion
  ): VersionDifference[] {
    const differences: VersionDifference[] = [];

    // Compare common fields
    const commonFields = ['title', 'description'];
    
    if ('name' in oldVersion && 'name' in newVersion) {
      commonFields.push('name', 'nameLocal', 'province', 'category');
    }

    for (const field of commonFields) {
      const oldValue = field in oldVersion ? (oldVersion as Record<string, unknown>)[field] : undefined;
      const newValue = field in newVersion ? (newVersion as Record<string, unknown>)[field] : undefined;

      if (oldValue !== newValue) {
        differences.push({
          field,
          oldValue,
          newValue,
          changeType: oldValue === undefined ? 'added' : 
                     newValue === undefined ? 'removed' : 'modified'
        });
      }
    }

    // Compare arrays (tags, mediaVersions)
    if ('tags' in oldVersion && 'tags' in newVersion) {
      const oldTags = oldVersion.tags || [];
      const newTags = newVersion.tags || [];
      
      if (JSON.stringify(oldTags) !== JSON.stringify(newTags)) {
        differences.push({
          field: 'tags',
          oldValue: oldTags,
          newValue: newTags,
          changeType: 'modified'
        });
      }
    }

    return differences;
  }

  /**
   * Generate file hash for integrity checking
   */
  private async generateFileHash(file?: File): Promise<string | undefined> {
    if (!file) return undefined;

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Failed to generate file hash:', error);
      return undefined;
    }
  }

  /**
   * Get current active version for media
   */
  async getCurrentMediaVersion(mediaId: string): Promise<MediaVersion | null> {
    const history = await this.getMediaVersionHistory(mediaId);
    return (history.versions.find(v => v.isActive) as MediaVersion) || null;
  }

  /**
   * Get current active version for place
   */
  async getCurrentPlaceVersion(placeId: string): Promise<PlaceVersion | null> {
    const history = await this.getPlaceVersionHistory(placeId);
    return (history.versions.find(v => v.isActive) as PlaceVersion) || null;
  }
}

export const versionControlService = new VersionControlService();