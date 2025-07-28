// Authentication and Authorization types
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  MODERATOR = 'moderator',
  VIEWER = 'viewer'
}

export enum Permission {
  // Place permissions
  PLACE_CREATE = 'place:create',
  PLACE_READ = 'place:read',
  PLACE_UPDATE = 'place:update',
  PLACE_DELETE = 'place:delete',
  
  // Media permissions
  MEDIA_UPLOAD = 'media:upload',
  MEDIA_READ = 'media:read',
  MEDIA_UPDATE = 'media:update',
  MEDIA_DELETE = 'media:delete',
  MEDIA_APPROVE = 'media:approve',
  
  // Version control permissions
  VERSION_CREATE = 'version:create',
  VERSION_READ = 'version:read',
  VERSION_ROLLBACK = 'version:rollback',
  
  // System permissions
  SYSTEM_ADMIN = 'system:admin',
  SYSTEM_MONITOR = 'system:monitor',
  SYSTEM_TEST = 'system:test'
}

export interface AuthenticationResult {
  success: boolean;
  user?: User;
  token?: string;
  message: string;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.EDITOR]: Permission[];
  [UserRole.MODERATOR]: Permission[];
  [UserRole.VIEWER]: Permission[];
}

// Default role permissions
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.EDITOR]: [
    Permission.PLACE_CREATE,
    Permission.PLACE_READ,
    Permission.PLACE_UPDATE,
    Permission.MEDIA_UPLOAD,
    Permission.MEDIA_READ,
    Permission.MEDIA_UPDATE,
    Permission.VERSION_CREATE,
    Permission.VERSION_READ
  ],
  [UserRole.MODERATOR]: [
    Permission.PLACE_READ,
    Permission.PLACE_UPDATE,
    Permission.MEDIA_READ,
    Permission.MEDIA_UPDATE,
    Permission.MEDIA_APPROVE,
    Permission.VERSION_READ
  ],
  [UserRole.VIEWER]: [
    Permission.PLACE_READ,
    Permission.MEDIA_READ,
    Permission.VERSION_READ
  ]
};