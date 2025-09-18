/**
 * Shared API types for frontend-backend communication
 * These types ensure consistency across the entire application
 */

/**
 * Standard API response format for all endpoints
 * @template T - The type of data being returned
 */
export interface APIResponse<T = unknown> {
  /** Whether the request was successful */
  success: boolean;
  /** The returned data (only present if success is true) */
  data?: T;
  /** Human-readable success message */
  message?: string;
  /** Error message (only present if success is false) */
  error?: string;
  /** Additional metadata about the response */
  meta?: {
    /** Request timestamp */
    timestamp?: string;
    /** Request ID for tracking */
    requestId?: string;
    /** API version */
    version?: string;
  };
}

/**
 * Standard pagination parameters for API requests
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Field to sort by */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Search query */
  search?: string;
  /** Filters to apply */
  filters?: Record<string, unknown>;
}

/**
 * Standard pagination metadata in responses
 */
export interface PaginationMeta {
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  itemsPerPage: number;
  /** Total number of items */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Whether there are previous pages */
  hasPreviousPage: boolean;
}

/**
 * Paginated API response
 * @template T - The type of data items in the array
 */
export interface PaginatedResponse<T> extends APIResponse<T[]> {
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Error details for validation failures
 */
export interface ValidationError {
  /** Field that failed validation */
  field: string;
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * API error response for validation failures
 */
export interface ValidationErrorResponse extends APIResponse<never> {
  /** List of validation errors */
  errors: ValidationError[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  /** Service status */
  status: 'healthy' | 'degraded' | 'unhealthy';
  /** Timestamp of the check */
  timestamp: string;
  /** Uptime in seconds */
  uptime: number;
  /** Service version */
  version: string;
  /** Detailed service checks */
  checks: {
    /** Database connectivity */
    database?: 'healthy' | 'unhealthy';
    /** External API connectivity */
    external_apis?: 'healthy' | 'unhealthy';
    /** Memory usage */
    memory?: 'healthy' | 'unhealthy';
    /** Disk space */
    disk?: 'healthy' | 'unhealthy';
  };
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  /** Uploaded file ID */
  id: string;
  /** File URL */
  url: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** Upload timestamp */
  uploadedAt: string;
}