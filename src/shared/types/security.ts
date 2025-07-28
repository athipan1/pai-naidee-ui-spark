// Security and encryption types
export interface EncryptionConfig {
  algorithm: string;
  keySize: number;
  ivSize: number;
  saltSize: number;
}

export interface EncryptedFile {
  id: string;
  originalFileName: string;
  encryptedFileName: string;
  originalSize: number;
  encryptedSize: number;
  algorithm: string;
  keyId: string;
  iv: string;
  salt: string;
  hash: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface FileValidationResult {
  isValid: boolean;
  fileName: string;
  fileSize: number;
  mimeType: string;
  hash: string;
  virusScanResult?: VirusScanResult;
  errors: string[];
  warnings: string[];
}

export interface VirusScanResult {
  isClean: boolean;
  scannerUsed: string;
  scanDate: Date;
  threats: string[];
}

export interface SecureUploadSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  uploadUrl: string;
  allowedFileTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  uploadedFiles: string[];
  isComplete: boolean;
}

export interface AuthenticationChallenge {
  id: string;
  type: ChallengeType;
  question?: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

export enum ChallengeType {
  TWO_FACTOR = 'two_factor',
  SECURITY_QUESTION = 'security_question',
  BIOMETRIC = 'biometric',
  EMAIL_VERIFICATION = 'email_verification',
  SMS_VERIFICATION = 'sms_verification'
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: SecurityAction;
  resourceType: string;
  resourceId: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: Record<string, any>;
  riskLevel: RiskLevel;
}

export enum SecurityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  FILE_DELETE = 'file_delete',
  PERMISSION_CHANGE = 'permission_change',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCK = 'account_lock',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}