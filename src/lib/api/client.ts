import { generateSecureUUID } from '@/lib/utils/uuid';
import { IApiResponse } from '@/types/api';

// Types
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  onRequest?: (config: RequestInit) => void | Promise<void>;
  onResponse?: (response: Response) => void | Promise<void>;
  onError?: (error: ApiError) => void | Promise<void>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
  },
};

// Utility to check if we're on the client side
const isClient = typeof window !== 'undefined';

// Storage for offline queue
const OFFLINE_QUEUE_KEY = 'rioporto_offline_queue';

interface QueuedRequest {
  id: string;
  url: string;
  options: RequestOptions;
  timestamp: number;
}

export class ApiClient {
  private config: ApiClientConfig;
  private abortControllers: Map<string, AbortController> = new Map();
  private offlineQueue: QueuedRequest[] = [];

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Load offline queue from localStorage
    if (isClient) {
      this.loadOfflineQueue();
      this.setupOnlineListener();
    }
  }

  /**
   * Makes an API request with retry logic and error handling
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<IApiResponse<T>> {
    const url = this.buildURL(endpoint);
    const requestId = generateSecureUUID();
    
    // Merge options with defaults
    const timeout = options.timeout ?? this.config.timeout;
    const retries = options.retries ?? this.config.retries;
    const retryDelay = options.retryDelay ?? this.config.retryDelay;
    
    // Create abort controller for timeout
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);
    
    // Setup timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout!);
    
    // Merge headers
    const headers = {
      ...this.config.headers,
      ...options.headers,
      'X-Request-ID': requestId,
    };
    
    // Build request options
    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: abortController.signal,
    };
    
    // Call onRequest hook
    if (this.config.onRequest) {
      await this.config.onRequest(requestOptions);
    }
    
    let lastError: Error | null = null;
    
    // Retry logic
    for (let attempt = 0; attempt <= retries!; attempt++) {
      try {
        // Check if online, queue if offline
        if (isClient && !navigator.onLine) {
          this.queueOfflineRequest(url, requestOptions);
          throw new ApiError('No internet connection. Request queued.', 0, 'OFFLINE');
        }
        
        const response = await fetch(url, requestOptions);
        
        clearTimeout(timeoutId);
        this.abortControllers.delete(requestId);
        
        // Call onResponse hook
        if (this.config.onResponse) {
          await this.config.onResponse(response);
        }
        
        // Parse response
        const data = await this.parseResponse<IApiResponse<T>>(response);
        
        // Check if response indicates an error
        if (!response.ok || !data.success) {
          throw new ApiError(
            data.error?.message || 'Request failed',
            response.status,
            data.error?.code,
            data.error?.details
          );
        }
        
        return data;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain errors
        if (
          error instanceof ApiError &&
          (error.status === 400 || error.status === 401 || error.status === 403 || error.status === 404)
        ) {
          break;
        }
        
        // Don't retry if aborted
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new ApiError('Request timeout', 408, 'TIMEOUT');
          break;
        }
        
        // Wait before retry
        if (attempt < retries!) {
          await this.delay(retryDelay! * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }
    
    // Call onError hook
    if (this.config.onError && lastError instanceof ApiError) {
      await this.config.onError(lastError);
    }
    
    // Cleanup
    clearTimeout(timeoutId);
    this.abortControllers.delete(requestId);
    
    // Return error response
    return {
      success: false,
      error: {
        code: lastError instanceof ApiError ? lastError.code || 'UNKNOWN_ERROR' : 'UNKNOWN_ERROR',
        message: lastError?.message || 'An unknown error occurred',
        details: lastError instanceof ApiError ? lastError.details : undefined,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        requestId,
      },
    };
  }

  /**
   * Convenience methods for different HTTP methods
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<IApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions & {
      onProgress?: (progress: number) => void;
    }
  ): Promise<IApiResponse<T>> {
    // Remove Content-Type header to let browser set it with boundary
    const headers = { ...options?.headers };
    delete headers['Content-Type'];
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      headers,
    });
  }

  /**
   * Cancel a specific request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiClientConfig {
    return { ...this.config };
  }

  // Private methods

  private buildURL(endpoint: string): string {
    // If endpoint is already a full URL, return it
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Remove leading slash from endpoint
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Ensure baseURL doesn't end with slash
    const baseURL = this.config.baseURL?.endsWith('/')
      ? this.config.baseURL.slice(0, -1)
      : this.config.baseURL;
    
    return `${baseURL}/${cleanEndpoint}`;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    // Try to parse as JSON anyway
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      // Return text wrapped in API response format
      return {
        success: response.ok,
        data: text,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      } as any;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Offline support methods

  private loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private queueOfflineRequest(url: string, options: RequestOptions): void {
    const queuedRequest: QueuedRequest = {
      id: generateSecureUUID(),
      url,
      options,
      timestamp: Date.now(),
    };
    
    this.offlineQueue.push(queuedRequest);
    this.saveOfflineQueue();
  }

  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.processOfflineQueue();
    });
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;
    
    console.log(`Processing ${this.offlineQueue.length} offline requests...`);
    
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    this.saveOfflineQueue();
    
    for (const request of queue) {
      try {
        await fetch(request.url, request.options);
      } catch (error) {
        console.error('Failed to process offline request:', error);
        // Re-queue failed requests
        this.offlineQueue.push(request);
      }
    }
    
    if (this.offlineQueue.length > 0) {
      this.saveOfflineQueue();
    }
  }

  /**
   * Get offline queue
   */
  getOfflineQueue(): QueuedRequest[] {
    return [...this.offlineQueue];
  }

  /**
   * Clear offline queue
   */
  clearOfflineQueue(): void {
    this.offlineQueue = [];
    this.saveOfflineQueue();
  }
}

// Create default client instance
export const apiClient = new ApiClient();

// Export typed client creators for specific APIs
export function createApiClient(config?: Partial<ApiClientConfig>): ApiClient {
  return new ApiClient(config);
}