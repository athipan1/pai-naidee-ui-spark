export interface ChunkUploadOptions {
  chunkSize?: number; // Default 1MB
  maxRetries?: number; // Default 3
  retryDelay?: number; // Default 1000ms
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  totalSize: number;
  uploadedSize: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  chunks: ChunkProgress[];
  error?: string;
}

export interface ChunkProgress {
  index: number;
  start: number;
  end: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  retries: number;
}

export interface UploadSession {
  fileId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  chunkSize: number;
  uploadedChunks: number[];
  sessionId: string;
  createdAt: number;
}

class ChunkUploadService {
  private readonly STORAGE_KEY = 'video_upload_sessions';
  private readonly DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1MB
  private readonly DEFAULT_MAX_RETRIES = 3;
  private readonly DEFAULT_RETRY_DELAY = 1000;
  
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();
  private activeUploads: Map<string, AbortController> = new Map();

  /**
   * Start chunked upload for a file
   */
  async uploadFile(
    file: File,
    uploadUrl: string,
    options: ChunkUploadOptions = {}
  ): Promise<string> {
    const fileId = this.generateFileId(file);
    const chunkSize = options.chunkSize || this.DEFAULT_CHUNK_SIZE;
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
    
    // Create upload session
    const session = this.createUploadSession(file, fileId, chunkSize);
    this.saveSession(session);
    
    // Initialize progress
    const progress = this.initializeProgress(file, fileId, chunkSize);
    this.updateProgress(fileId, progress);
    
    try {
      const result = await this.performChunkedUpload(
        file,
        uploadUrl,
        session,
        maxRetries,
        options.retryDelay || this.DEFAULT_RETRY_DELAY
      );
      
      // Clean up session on success
      this.deleteSession(fileId);
      return result;
    } catch (error) {
      // Update progress with error
      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : 'Upload failed';
      this.updateProgress(fileId, progress);
      throw error;
    }
  }

  /**
   * Resume a paused upload
   */
  async resumeUpload(
    file: File,
    uploadUrl: string,
    options: ChunkUploadOptions = {}
  ): Promise<string> {
    const fileId = this.generateFileId(file);
    const session = this.getSession(fileId);
    
    if (!session) {
      throw new Error('No upload session found for this file');
    }
    
    const maxRetries = options.maxRetries || this.DEFAULT_MAX_RETRIES;
    const retryDelay = options.retryDelay || this.DEFAULT_RETRY_DELAY;
    
    // Restore progress
    const progress = this.restoreProgress(file, session);
    this.updateProgress(fileId, progress);
    
    try {
      const result = await this.performChunkedUpload(
        file,
        uploadUrl,
        session,
        maxRetries,
        retryDelay
      );
      
      this.deleteSession(fileId);
      return result;
    } catch (error) {
      progress.status = 'error';
      progress.error = error instanceof Error ? error.message : 'Upload failed';
      this.updateProgress(fileId, progress);
      throw error;
    }
  }

  /**
   * Pause an active upload
   */
  pauseUpload(fileId: string): void {
    const controller = this.activeUploads.get(fileId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(fileId);
    }
    
    // Update progress status
    const sessions = this.getSessions();
    const session = sessions.find(s => s.fileId === fileId);
    if (session) {
      const progress = this.restoreProgress(
        null as any, // We don't need the file for status update
        session
      );
      progress.status = 'paused';
      this.updateProgress(fileId, progress);
    }
  }

  /**
   * Cancel upload and clean up
   */
  cancelUpload(fileId: string): void {
    this.pauseUpload(fileId);
    this.deleteSession(fileId);
  }

  /**
   * Get upload progress for a file
   */
  getUploadProgress(fileId: string): UploadProgress | null {
    const session = this.getSession(fileId);
    if (!session) return null;
    
    return this.restoreProgress(null as any, session);
  }

  /**
   * Set progress callback for a file
   */
  setProgressCallback(fileId: string, callback: (progress: UploadProgress) => void): void {
    this.progressCallbacks.set(fileId, callback);
  }

  /**
   * Remove progress callback
   */
  removeProgressCallback(fileId: string): void {
    this.progressCallbacks.delete(fileId);
  }

  /**
   * Get all pending/paused uploads
   */
  getPendingUploads(): UploadSession[] {
    return this.getSessions();
  }

  private async performChunkedUpload(
    file: File,
    uploadUrl: string,
    session: UploadSession,
    maxRetries: number,
    retryDelay: number
  ): Promise<string> {
    const fileId = session.fileId;
    const controller = new AbortController();
    this.activeUploads.set(fileId, controller);
    
    const progress = this.restoreProgress(file, session);
    progress.status = 'uploading';
    this.updateProgress(fileId, progress);
    
    try {
      // Upload chunks
      for (let i = 0; i < session.totalChunks; i++) {
        // Skip already uploaded chunks
        if (session.uploadedChunks.includes(i)) {
          continue;
        }
        
        const start = i * session.chunkSize;
        const end = Math.min(start + session.chunkSize, file.size);
        const chunk = file.slice(start, end);
        
        // Update chunk status
        progress.chunks[i].status = 'uploading';
        this.updateProgress(fileId, progress);
        
        // Upload chunk with retries
        await this.uploadChunkWithRetry(
          chunk,
          i,
          session,
          uploadUrl,
          maxRetries,
          retryDelay,
          controller.signal
        );
        
        // Update progress
        session.uploadedChunks.push(i);
        progress.chunks[i].status = 'completed';
        progress.uploadedSize = session.uploadedChunks.length * session.chunkSize;
        progress.percentage = Math.round((progress.uploadedSize / file.size) * 100);
        
        this.saveSession(session);
        this.updateProgress(fileId, progress);
      }
      
      // Complete upload
      const result = await this.completeUpload(uploadUrl, session);
      progress.status = 'completed';
      progress.percentage = 100;
      this.updateProgress(fileId, progress);
      
      return result;
    } finally {
      this.activeUploads.delete(fileId);
    }
  }

  private async uploadChunkWithRetry(
    chunk: Blob,
    chunkIndex: number,
    session: UploadSession,
    uploadUrl: string,
    maxRetries: number,
    retryDelay: number,
    signal: AbortSignal
  ): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.uploadChunk(chunk, chunkIndex, session, uploadUrl, signal);
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Upload failed');
        
        // Don't retry if aborted
        if (signal.aborted) {
          throw new Error('Upload cancelled');
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retry
        await this.delay(retryDelay * (attempt + 1));
      }
    }
    
    throw lastError || new Error('Upload failed after retries');
  }

  private async uploadChunk(
    chunk: Blob,
    chunkIndex: number,
    session: UploadSession,
    uploadUrl: string,
    signal: AbortSignal
  ): Promise<void> {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('sessionId', session.sessionId);
    formData.append('fileName', session.fileName);
    formData.append('totalChunks', session.totalChunks.toString());
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      signal
    });
    
    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }
  }

  private async completeUpload(uploadUrl: string, session: UploadSession): Promise<string> {
    const response = await fetch(`${uploadUrl}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: session.sessionId,
        fileName: session.fileName,
        fileSize: session.fileSize,
        totalChunks: session.totalChunks,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Upload completion failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.fileUrl || result.url;
  }

  private generateFileId(file: File): string {
    return `${file.name}_${file.size}_${file.lastModified}`;
  }

  private createUploadSession(file: File, fileId: string, chunkSize: number): UploadSession {
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    return {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      totalChunks,
      chunkSize,
      uploadedChunks: [],
      sessionId: this.generateSessionId(),
      createdAt: Date.now(),
    };
  }

  private generateSessionId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeProgress(file: File, fileId: string, chunkSize: number): UploadProgress {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks: ChunkProgress[] = [];
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      
      chunks.push({
        index: i,
        start,
        end,
        status: 'pending',
        retries: 0,
      });
    }
    
    return {
      fileId,
      fileName: file.name,
      totalSize: file.size,
      uploadedSize: 0,
      percentage: 0,
      status: 'pending',
      chunks,
    };
  }

  private restoreProgress(file: File | null, session: UploadSession): UploadProgress {
    const chunks: ChunkProgress[] = [];
    
    for (let i = 0; i < session.totalChunks; i++) {
      const start = i * session.chunkSize;
      const end = Math.min(start + session.chunkSize, session.fileSize);
      
      chunks.push({
        index: i,
        start,
        end,
        status: session.uploadedChunks.includes(i) ? 'completed' : 'pending',
        retries: 0,
      });
    }
    
    const uploadedSize = session.uploadedChunks.length * session.chunkSize;
    
    return {
      fileId: session.fileId,
      fileName: session.fileName,
      totalSize: session.fileSize,
      uploadedSize,
      percentage: Math.round((uploadedSize / session.fileSize) * 100),
      status: 'pending',
      chunks,
    };
  }

  private updateProgress(fileId: string, progress: UploadProgress): void {
    const callback = this.progressCallbacks.get(fileId);
    if (callback) {
      callback(progress);
    }
  }

  private getSessions(): UploadSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveSession(session: UploadSession): void {
    const sessions = this.getSessions().filter(s => s.fileId !== session.fileId);
    sessions.push(session);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  private getSession(fileId: string): UploadSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.fileId === fileId) || null;
  }

  private deleteSession(fileId: string): void {
    const sessions = this.getSessions().filter(s => s.fileId !== fileId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const chunkUploadService = new ChunkUploadService();