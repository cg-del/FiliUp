import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { parseAxiosError, shouldRetryError, getRetryDelay } from '../../errors/errorUtils';
import { ErrorType } from '../../errors/types';

export class BaseApiClient {
  protected client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable sending cookies with cross-origin requests
      timeout: 30000, // 30 seconds timeout
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        // Try multiple token keys for compatibility
        const token = localStorage.getItem('accessToken') || 
                      localStorage.getItem('authToken') || 
                      localStorage.getItem('token');
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          // Log token for debugging
          console.log('Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');
          console.log('Authorization header set:', `Bearer ${token.substring(0, 10)}...`);
        }
        
        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        return config;
      },
      (error) => {
        console.error('BaseApiClient request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log successful requests for debugging
        const duration = new Date().getTime() - response.config.metadata?.startTime?.getTime();
        console.log(`✅ BaseApiClient ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
        
        // Log error details
        const duration = new Date().getTime() - originalRequest?.metadata?.startTime?.getTime();
        console.error(`❌ BaseApiClient ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${duration}ms`, {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data,
        });

        // Parse the error using our error utilities
        const appError = parseAxiosError(error);
        
        // Handle authentication errors
        if (appError.type === ErrorType.AUTHENTICATION_ERROR) {
          // Be more selective about when to redirect to login
          // Only redirect if this appears to be a token/session issue
          const shouldRedirect = 
            appError.details?.message?.toLowerCase().includes('token') ||
            appError.details?.message?.toLowerCase().includes('session') ||
            appError.details?.message?.toLowerCase().includes('expired') ||
            appError.details?.message?.toLowerCase().includes('invalid') ||
            appError.details?.message?.toLowerCase().includes('unauthorized') ||
            // If there's no specific error message, assume it's a session issue
            (!appError.details?.message && appError.statusCode === 401);
          
          if (shouldRedirect) {
            // Clear all auth-related data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            localStorage.removeItem('filiup_user');
            
            // Only redirect if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
              console.log('Session expired, redirecting to login from BaseApiClient');
              window.location.href = '/login';
            }
          } else {
            // This is a resource-specific 401, log but don't redirect
            console.warn('Resource access denied (401), but not redirecting to login from BaseApiClient:', appError);
          }
          
          return Promise.reject(appError);
        }
        
        // Implement retry logic for retryable errors
        if (shouldRetryError(appError) && originalRequest && !originalRequest._retry) {
          const maxRetries = 3;
          const retryCount = originalRequest._retryCount || 0;
          
          if (retryCount < maxRetries) {
            originalRequest._retry = true;
            originalRequest._retryCount = retryCount + 1;
            
            const delay = getRetryDelay(retryCount);
            console.warn(`BaseApiClient retrying request in ${delay}ms (attempt ${retryCount + 1}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Reset metadata for retry
            originalRequest.metadata = { startTime: new Date() };
            
            return this.client(originalRequest);
          }
        }
        
        return Promise.reject(appError);
      }
    );
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      // Error is already processed by the interceptor
      throw error;
    }
  }

  protected async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      // Error is already processed by the interceptor
      throw error;
    }
  }

  protected async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      // Error is already processed by the interceptor
      throw error;
    }
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      // Error is already processed by the interceptor
      throw error;
    }
  }

  protected async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      // Error is already processed by the interceptor
      throw error;
    }
  }
}

// Extend the AxiosRequestConfig interface to include our metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime: Date;
    };
  }
} 