// Version control types for media and places
export interface MediaVersion {
  id: string;
  mediaId: string;
  version: number;
  title: string;
  description: string;
  url?: string;
  file?: File;
  mimeType?: string;
  size?: number;
  hash?: string; // File hash for integrity check
  encrypted?: boolean;
  encryptionKey?: string;
  createdAt: Date;
  createdBy: string;
  changeType: ChangeType;
  changeReason?: string;
  previousVersionId?: string;
  isActive: boolean;
}

export enum ChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  RESTORED = 'restored',
  ENCRYPTED = 'encrypted',
  DECRYPTED = 'decrypted'
}

export interface PlaceVersion {
  id: string;
  placeId: string;
  version: number;
  name: string;
  nameLocal?: string;
  description?: string;
  province: string;
  category: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  tags?: string[];
  mediaVersions: string[]; // Media version IDs
  createdAt: Date;
  createdBy: string;
  changeType: ChangeType;
  changeReason?: string;
  previousVersionId?: string;
  isActive: boolean;
}

export interface VersionHistory {
  totalVersions: number;
  versions: (MediaVersion | PlaceVersion)[];
  currentVersion: number;
}

export interface VersionComparison {
  oldVersion: MediaVersion | PlaceVersion;
  newVersion: MediaVersion | PlaceVersion;
  differences: VersionDifference[];
}

export interface VersionDifference {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'added' | 'modified' | 'removed';
}

export interface RollbackRequest {
  targetId: string; // Media or Place ID
  targetType: 'media' | 'place';
  targetVersionId: string;
  reason: string;
  requestedBy: string;
}

export interface RollbackResult {
  success: boolean;
  targetId: string;
  newVersionId?: string;
  rollbackedToVersion: number;
  message: string;
}