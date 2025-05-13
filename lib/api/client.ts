/**
 * API Client
 *
 * A standardized, centralized API client based on Axios with enhanced
 * features for authentication, error handling, and request management.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

// Define types that are no longer directly exported from axios
type AxiosRequestConfig = Parameters<typeof axios.request>[0];
type AxiosResponse<T = any> = {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: AxiosRequestConfig;
};
type CancelTokenSource = ReturnType<typeof axios.CancelToken.source>;

// Environment variables with defaults
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com/v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10);
const API_RETRY_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3', 10);
const API_RETRY_DELAY = parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY || '1000', 10);

/**
 * Custom API error class
 */
export class ApiError extends Error {
  status: number;
  data: any;
  isNetworkError: boolean;
  isTimeoutError: boolean;
  isAuthError: boolean;
  isRetryable: boolean;

  constructor(
    message: string,
    status: number = 0,
    data: any = null,
    isNetworkError: boolean = false,
    isTimeoutError: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
    this.isTimeoutError = isTimeoutError;
    this.isAuthError = status === 401 || status === 403;
    // Determine if this error should be retried automatically
    this.isRetryable =
      isNetworkError || isTimeoutError || (status >= 500 && status < 600) || status === 429;
  }
}

/**
 * API response type that wraps the standard Axios response
 */
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  requestId?: string;
  timestamp: Date;
}

/**
 * Pending request interface for tracking and aborting requests
 */
interface PendingRequest {
  id: string;
  source: CancelTokenSource;
  timestamp: Date;
}

/**
 * Auth token interface for managing authentication
 */
interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Token refresh function type
 */
type TokenRefreshFunction = () => Promise<AuthToken>;

/**
 * API client class
 */
class ApiClient {
  private instance: AxiosInstance;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private tokenRefreshPromise: Promise<AuthToken> | null = null;
  private tokenRefreshFunction: TokenRefreshFunction | null = null;
  private currentAuthToken: AuthToken | null = null;
  private retryAttempts: number = API_RETRY_ATTEMPTS;
  private retryDelay: number = API_RETRY_DELAY;
  private debug: boolean = process.env.NODE_ENV === 'development';

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    // Create the Axios instance with default configuration
    this.instance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add request interceptor
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Add response interceptor
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Set authentication tokens
   */
  public setAuthToken(token: AuthToken): void {
    this.currentAuthToken = token;
  }

  /**
   * Clear authentication tokens
   */
  public clearAuthToken(): void {
    this.currentAuthToken = null;
  }

  /**
   * Get current authentication token
   */
  public getAuthToken(): AuthToken | null {
    return this.currentAuthToken;
  }

  /**
   * Set token refresh function
   */
  public setTokenRefreshFunction(refreshFn: TokenRefreshFunction): void {
    this.tokenRefreshFunction = refreshFn;
  }

  /**
   * Configure retry attempts and delay
   */
  public configureRetry(attempts: number, delay: number): void {
    this.retryAttempts = attempts;
    this.retryDelay = delay;
  }

  /**
   * Enable/disable debug mode
   */
  public setDebug(enabled: boolean): void {
    this.debug = enabled;
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.get<T>(url, config).then(this.createApiResponse);
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.post<T>(url, data, config).then(this.createApiResponse);
  }

  /**
   * Make a PUT request
   */
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.put<T>(url, data, config).then(this.createApiResponse);
  }

  /**
   * Make a PATCH request
   */
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.instance.patch<T>(url, data, config).then(this.createApiResponse);
  }

  /**
   * Make a DELETE request
   */
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.instance.delete<T>(url, config).then(this.createApiResponse);
  }

  /**
   * Cancel a specific request
   */
  public cancelRequest(requestId: string): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (pendingRequest) {
      pendingRequest.source.cancel(`Request ${requestId} was cancelled`);
      this.pendingRequests.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  public cancelAllRequests(reason: string = 'All requests cancelled'): void {
    this.pendingRequests.forEach(request => {
      request.source.cancel(reason);
    });
    this.pendingRequests.clear();
  }

  /**
   * Create a request ID for tracking
   */
  private createRequestId(config: AxiosRequestConfig): string {
    const method = config.method || 'unknown';
    const url = config.url || 'unknown';
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `${method}-${url}-${timestamp}-${random}`;
  }

  /**
   * Request interceptor handler
   */
  private async handleRequest(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {
    // Generate request ID if not already present
    if (!config.headers) {
      config.headers = {};
    }

    const requestId = config.headers['X-Request-ID'] || this.createRequestId(config);
    config.headers['X-Request-ID'] = requestId;

    // Set up cancel token
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    // Store the pending request for potential cancellation
    this.pendingRequests.set(requestId, {
      id: requestId,
      source,
      timestamp: new Date(),
    });

    // Add auth token if available
    if (this.currentAuthToken?.accessToken) {
      config.headers.Authorization = `Bearer ${this.currentAuthToken.accessToken}`;
    }

    // Log request in debug mode
    if (this.debug) {
      console.debug(`🌐 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  }

  /**
   * Request error interceptor handler
   */
  private handleRequestError(error: AxiosError): Promise<never> {
    // Log error in debug mode
    if (this.debug) {
      console.debug('🔴 [API Request Error]', error);
    }
    return Promise.reject(error);
  }

  /**
   * Response interceptor handler
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Extract and remove the request ID from pending requests
    const requestId = response.config.headers?.['X-Request-ID'] as string;
    if (requestId) {
      this.pendingRequests.delete(requestId);
    }

    // Log response in debug mode
    if (this.debug) {
      console.debug(
        `✅ [API Response] ${response.status} ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          requestId,
          data: response.data,
          status: response.status,
          headers: response.headers,
        }
      );
    }

    return response;
  }

  /**
   * Response error interceptor handler
   */
  private async handleResponseError(error: AxiosError): Promise<AxiosResponse | never> {
    // Get request configuration
    const config = error.config;
    if (!config) {
      return Promise.reject(error);
    }

    // Extract request ID
    const requestId = config.headers?.['X-Request-ID'] as string;
    if (requestId) {
      this.pendingRequests.delete(requestId);
    }

    // Check if the request was cancelled
    if (axios.isCancel(error)) {
      if (this.debug) {
        console.debug('🚫 [API Request Cancelled]', error.message);
      }
      return Promise.reject(error);
    }

    // Determine error type
    const isNetworkError = !error.response && Boolean(error.code);
    const isTimeoutError = error.code === 'ECONNABORTED';
    const status = error.response?.status || 0;

    // Log error in debug mode
    if (this.debug) {
      console.debug(`❌ [API Error] ${status} ${config.method?.toUpperCase()} ${config.url}`, {
        requestId,
        status,
        message: error.message,
        data: error.response?.data,
        isNetworkError,
        isTimeoutError,
      });
    }

    // Handle token refresh for 401 Unauthorized responses
    if (status === 401 && this.tokenRefreshFunction && this.currentAuthToken) {
      // Check if we should retry based on retry-attempt header or config
      const retryAttempt = parseInt((config.headers?.['X-Retry-Attempt'] as string) || '0', 10);

      // Only try to refresh token if we haven't already tried
      if (retryAttempt < 1) {
        try {
          // Initialize token refresh if not already in progress
          if (!this.tokenRefreshPromise) {
            this.tokenRefreshPromise = this.tokenRefreshFunction();
          }

          // Wait for token refresh to complete
          const newToken = await this.tokenRefreshPromise;
          this.currentAuthToken = newToken;

          // Reset refresh promise
          this.tokenRefreshPromise = null;

          // Update authorization header with new token
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${newToken.accessToken}`,
            'X-Retry-Attempt': '1', // Mark as retried
          };

          // Retry the request with the new token
          return this.instance(config);
        } catch (refreshError) {
          // Token refresh failed, clear tokens and reject
          this.currentAuthToken = null;
          this.tokenRefreshPromise = null;

          // Create and throw API error
          const apiError = new ApiError(
            'Authentication failed and token refresh was unsuccessful',
            401,
            error.response?.data,
            isNetworkError,
            isTimeoutError
          );

          return Promise.reject(apiError);
        }
      }
    }

    // Handle automatic retry for certain errors
    const shouldRetry =
      (isNetworkError || isTimeoutError || (status >= 500 && status < 600) || status === 429) &&
      config.method !== 'POST' && // Don't retry POST requests automatically
      config.method !== 'PUT' && // Don't retry PUT requests automatically
      config.method !== 'PATCH'; // Don't retry PATCH requests automatically

    if (shouldRetry) {
      const retryAttempt = parseInt((config.headers?.['X-Retry-Attempt'] as string) || '0', 10);

      if (retryAttempt < this.retryAttempts) {
        // Exponential backoff for retry delay
        const delay = this.retryDelay * Math.pow(2, retryAttempt);

        // Update retry attempt count in headers
        config.headers = {
          ...config.headers,
          'X-Retry-Attempt': `${retryAttempt + 1}`,
        };

        // Wait for the delay and retry the request
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.instance(config);
      }
    }

    // Create API error for consistent error handling
    const apiError = new ApiError(
      error.message || 'An error occurred while making the request',
      status,
      error.response?.data,
      isNetworkError,
      isTimeoutError
    );

    return Promise.reject(apiError);
  }

  /**
   * Create standardized API response object
   */
  private createApiResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
      requestId: response.config.headers?.['X-Request-ID'] as string,
      timestamp: new Date(),
    };
  }
}

// Create and export the API client instance
export const api = new ApiClient();

// Export the Axios types for convenience
export type { AxiosRequestConfig, AxiosResponse, AxiosError, CancelTokenSource };

export default api;
