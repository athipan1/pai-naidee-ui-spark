export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'text';
  url?: string;
  file?: File;
  mimeType?: string;
  size?: number;
  uploadedAt: Date;
  updatedAt: Date;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Version control
  version: number;
  versionHistory?: string[]; // Version IDs
  parentVersionId?: string;
  isCurrentVersion: boolean;
  
  // Security
  hash?: string;
  encrypted?: boolean;
  encryptionKeyId?: string;
  securityLevel: SecurityLevel;
  
  // Access control
  createdBy: string;
  lastModifiedBy?: string;
  accessPermissions: MediaPermission[];
  
  // Audit trail
  auditLog?: string[]; // Audit log entry IDs
}

export interface MediaUploadData {
  title: string;
  description: string;
  type: 'image' | 'video' | 'text';
  file?: File;
  
  // Security options
  requireEncryption?: boolean;
  securityLevel?: SecurityLevel;
  additionalValidation?: boolean;
  
  // Version control
  parentVersionId?: string;
  changeReason?: string;
  
  // Access control
  permissions?: MediaPermission[];
}

export enum SecurityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal', 
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'
}

export interface MediaPermission {
  userId: string;
  permission: 'read' | 'write' | 'delete' | 'approve';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'] as const;
export const SUPPORTED_VIDEO_TYPES = ['video/mp4'] as const;
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export type SupportedImageType = typeof SUPPORTED_IMAGE_TYPES[number];
export type SupportedVideoType = typeof SUPPORTED_VIDEO_TYPES[number];
export type SupportedFileType = SupportedImageType | SupportedVideoType;