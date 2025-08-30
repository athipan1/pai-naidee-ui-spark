// Security Service for file encryption and validation
import API_BASE from '../../config/api';
import {
  EncryptionConfig,
  EncryptedFile,
  FileValidationResult,
  VirusScanResult,
  SecureUploadSession,
  AuthenticationChallenge,
  ChallengeType,
  SecurityAuditLog,
  SecurityAction,
  RiskLevel
} from '../types/security';
import { authService } from './authService';

class SecurityService {
  private apiBaseUrl = API_BASE;
  private encryptionConfig: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keySize: 256,
    ivSize: 12,
    saltSize: 16
  };
  private encryptedFiles = new Map<string, EncryptedFile>();
  private uploadSessions = new Map<string, SecureUploadSession>();

  /**
   * Generate encryption key
   */
  private async generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.encryptionConfig.algorithm,
        length: this.encryptionConfig.keySize,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random bytes
   */
  private generateRandomBytes(size: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(size));
  }

  /**
   * Encrypt file
   */
  async encryptFile(file: File): Promise<EncryptedFile> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Generate key, IV, and salt
      const key = await this.generateEncryptionKey();
      const iv = this.generateRandomBytes(this.encryptionConfig.ivSize);
      const salt = this.generateRandomBytes(this.encryptionConfig.saltSize);

      // Read file as array buffer
      const fileBuffer = await file.arrayBuffer();

      // Encrypt the file
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.encryptionConfig.algorithm,
          iv: iv,
        },
        key,
        fileBuffer
      );

      // Generate file hash for integrity
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Export key for storage
      const exportedKey = await crypto.subtle.exportKey('raw', key);
      const keyId = await this.storeEncryptionKey(exportedKey);

      const encryptedFile: EncryptedFile = {
        id: `encrypted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        originalFileName: file.name,
        encryptedFileName: `encrypted_${file.name}`,
        originalSize: file.size,
        encryptedSize: encryptedBuffer.byteLength,
        algorithm: this.encryptionConfig.algorithm,
        keyId,
        iv: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join(''),
        salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
        hash,
        createdAt: new Date()
      };

      this.encryptedFiles.set(encryptedFile.id, encryptedFile);

      // Log security event
      await this.logSecurityEvent(
        SecurityAction.FILE_UPLOAD,
        'file',
        encryptedFile.id,
        true,
        { 
          fileName: file.name, 
          encrypted: true,
          fileSize: file.size 
        }
      );

      console.log('File encrypted successfully:', encryptedFile.id);
      return encryptedFile;
    } catch (error) {
      console.error('File encryption failed:', error);
      throw new Error('File encryption failed');
    }
  }

  /**
   * Decrypt file
   */
  async decryptFile(encryptedFileId: string): Promise<Blob> {
    try {
      const encryptedFile = this.encryptedFiles.get(encryptedFileId);
      if (!encryptedFile) {
        throw new Error('Encrypted file not found');
      }

      // Retrieve encryption key
      const keyBuffer = await this.retrieveEncryptionKey(encryptedFile.keyId);
      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: this.encryptionConfig.algorithm },
        false,
        ['decrypt']
      );

      // Convert hex strings back to Uint8Array
      const iv = new Uint8Array(
        encryptedFile.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );

      // In a real implementation, you would fetch the encrypted data from storage
      // For now, we'll simulate it
      const encryptedData = new ArrayBuffer(encryptedFile.encryptedSize);

      // Decrypt the file
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.encryptionConfig.algorithm,
          iv: iv,
        },
        key,
        encryptedData
      );

      // Verify file integrity
      const hashBuffer = await crypto.subtle.digest('SHA-256', decryptedBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hash !== encryptedFile.hash) {
        throw new Error('File integrity check failed');
      }

      // Log security event
      await this.logSecurityEvent(
        SecurityAction.FILE_DOWNLOAD,
        'file',
        encryptedFileId,
        true,
        { 
          fileName: encryptedFile.originalFileName,
          decrypted: true 
        }
      );

      return new Blob([decryptedBuffer]);
    } catch (error) {
      console.error('File decryption failed:', error);
      
      await this.logSecurityEvent(
        SecurityAction.FILE_DOWNLOAD,
        'file',
        encryptedFileId,
        false,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );

      throw new Error('File decryption failed');
    }
  }

  /**
   * Validate file before upload
   */
  async validateFile(file: File): Promise<FileValidationResult> {
    const result: FileValidationResult = {
      isValid: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      hash: '',
      errors: [],
      warnings: []
    };

    try {
      // Check file size
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        result.errors.push(`File size ${file.size} exceeds maximum allowed size ${maxSize}`);
        result.isValid = false;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'video/mp4'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        result.errors.push(`File type ${file.type} is not allowed`);
        result.isValid = false;
      }

      // Generate file hash
      const fileBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      result.hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Check for duplicate files
      const isDuplicate = await this.checkForDuplicateFile(result.hash);
      if (isDuplicate) {
        result.warnings.push('File appears to be a duplicate');
      }

      // Simulate virus scan
      result.virusScanResult = await this.performVirusScan(file);
      if (!result.virusScanResult.isClean) {
        result.errors.push('File failed virus scan');
        result.isValid = false;
      }

      // Check file name for suspicious patterns
      const suspiciousPatterns = [
        /\.exe$/i,
        /\.bat$/i,
        /\.cmd$/i,
        /\.scr$/i,
        /\.com$/i,
        /\.pif$/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(file.name)) {
          result.errors.push('File name contains suspicious extension');
          result.isValid = false;
          break;
        }
      }

      // Log validation result
      await this.logSecurityEvent(
        SecurityAction.FILE_UPLOAD,
        'file',
        result.hash,
        result.isValid,
        {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          validated: true,
          errors: result.errors,
          warnings: result.warnings
        }
      );

      return result;
    } catch (error) {
      console.error('File validation failed:', error);
      result.errors.push('File validation failed due to system error');
      result.isValid = false;
      return result;
    }
  }

  /**
   * Perform virus scan (simulated)
   */
  private async performVirusScan(file: File): Promise<VirusScanResult> {
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would integrate with antivirus APIs
    return {
      isClean: true,
      scannerUsed: 'MockScanner v1.0',
      scanDate: new Date(),
      threats: []
    };
  }

  /**
   * Check for duplicate files
   */
  private async checkForDuplicateFile(hash: string): Promise<boolean> {
    // In production, check against database
    if (import.meta.env.DEV) {
      // Simulate check
      return Math.random() < 0.1; // 10% chance of duplicate
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/files/check-duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hash }),
      });

      const result = await response.json();
      return result.isDuplicate || false;
    } catch (error) {
      console.error('Duplicate check failed:', error);
      return false;
    }
  }

  /**
   * Create secure upload session
   */
  async createSecureUploadSession(
    allowedFileTypes: string[],
    maxFileSize: number = 50 * 1024 * 1024,
    maxFiles: number = 10
  ): Promise<SecureUploadSession> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const session: SecureUploadSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        token: await this.generateSecureToken(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        uploadUrl: `${this.apiBaseUrl}/upload/secure`,
        allowedFileTypes,
        maxFileSize,
        maxFiles,
        uploadedFiles: [],
        isComplete: false
      };

      this.uploadSessions.set(session.id, session);

      console.log('Created secure upload session:', session.id);
      return session;
    } catch (error) {
      console.error('Failed to create upload session:', error);
      throw new Error('Failed to create secure upload session');
    }
  }

  /**
   * Validate upload session
   */
  validateUploadSession(sessionId: string, token: string): boolean {
    const session = this.uploadSessions.get(sessionId);
    if (!session) return false;
    if (session.token !== token) return false;
    if (session.expiresAt < new Date()) return false;
    if (session.isComplete) return false;
    
    return true;
  }

  /**
   * Generate authentication challenge
   */
  async generateAuthChallenge(type: ChallengeType): Promise<AuthenticationChallenge> {
    const challenge: AuthenticationChallenge = {
      id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      maxAttempts: 3
    };

    switch (type) {
      case ChallengeType.SECURITY_QUESTION:
        challenge.question = 'What is your favorite travel destination in Thailand?';
        break;
      case ChallengeType.TWO_FACTOR:
        // In production, send SMS/email code
        break;
      default:
        break;
    }

    return challenge;
  }

  /**
   * Store encryption key securely
   */
  private async storeEncryptionKey(keyBuffer: ArrayBuffer): Promise<string> {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In production, store in secure key management system
    if (import.meta.env.DEV) {
      // For development, store in memory (not secure!)
      localStorage.setItem(`encryption_key_${keyId}`, 
        Array.from(new Uint8Array(keyBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
      );
    }

    return keyId;
  }

  /**
   * Retrieve encryption key
   */
  private async retrieveEncryptionKey(keyId: string): Promise<ArrayBuffer> {
    // In production, retrieve from secure key management system
    if (import.meta.env.DEV) {
      const hexKey = localStorage.getItem(`encryption_key_${keyId}`);
      if (!hexKey) {
        throw new Error('Encryption key not found');
      }
      
      const keyArray = new Uint8Array(
        hexKey.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      return keyArray.buffer;
    }

    throw new Error('Key retrieval not implemented');
  }

  /**
   * Generate secure token
   */
  private async generateSecureToken(): Promise<string> {
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    action: SecurityAction,
    resourceType: string,
    resourceId: string,
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    try {
      const currentUser = authService.getCurrentUser();
      const auditLog: Omit<SecurityAuditLog, 'id'> = {
        userId: currentUser?.id || 'anonymous',
        action,
        resourceType,
        resourceId,
        timestamp: new Date(),
        ipAddress: 'unknown', // Would be populated by server
        userAgent: navigator.userAgent,
        success,
        details,
        riskLevel: this.calculateRiskLevel(action, success)
      };

      // In production, send to server
      if (!import.meta.env.DEV) {
        await fetch(`${this.apiBaseUrl}/security/audit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authService.getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(auditLog),
        });
      } else {
        console.log('Security audit log:', auditLog);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Calculate risk level for security events
   */
  private calculateRiskLevel(action: SecurityAction, success: boolean): RiskLevel {
    if (!success) {
      switch (action) {
        case SecurityAction.LOGIN:
          return RiskLevel.MEDIUM;
        case SecurityAction.FILE_UPLOAD:
        case SecurityAction.FILE_DELETE:
          return RiskLevel.HIGH;
        default:
          return RiskLevel.LOW;
      }
    }

    switch (action) {
      case SecurityAction.PERMISSION_CHANGE:
      case SecurityAction.ACCOUNT_LOCK:
        return RiskLevel.HIGH;
      case SecurityAction.FILE_DELETE:
        return RiskLevel.MEDIUM;
      default:
        return RiskLevel.LOW;
    }
  }

  /**
   * Get encrypted file info
   */
  getEncryptedFile(fileId: string): EncryptedFile | undefined {
    return this.encryptedFiles.get(fileId);
  }

  /**
   * Get upload session
   */
  getUploadSession(sessionId: string): SecureUploadSession | undefined {
    return this.uploadSessions.get(sessionId);
  }
}

export const securityService = new SecurityService();