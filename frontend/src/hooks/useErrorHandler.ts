import { useCallback } from 'react';
import { useToast } from './use-toast';
import { parseGeneralError, getUserFriendlyMessage, shouldRetryError, getRetryDelay } from '@/lib/errors/errorUtils';
import { AppError, ErrorType } from '@/lib/errors/types';

interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  onError?: (error: AppError) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  preventAutoRedirect?: boolean;
}

interface RetryableOperation<T> {
  operation: () => Promise<T>;
  options?: ErrorHandlerOptions;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        customMessage,
        onError,
        preventAutoRedirect = false,
      } = options;

      // Parse the error
      const appError = parseGeneralError(error);

      // Log error for debugging
      console.error('Error handled:', {
        type: appError.type,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        timestamp: appError.timestamp,
        originalError: error,
      });

      // Handle specific error types
      switch (appError.type) {
        case ErrorType.AUTHENTICATION_ERROR:
          // Only redirect to login if not prevented and the error indicates session expiry
          if (!preventAutoRedirect) {
            // Check if this is a genuine session expiry vs. just a resource access issue
            const isSessionExpired = 
              appError.details?.message?.toLowerCase().includes('token') ||
              appError.details?.message?.toLowerCase().includes('session') ||
              appError.details?.message?.toLowerCase().includes('expired') ||
              appError.details?.message?.toLowerCase().includes('invalid') ||
              appError.statusCode === 401 && !appError.details?.message;

            if (isSessionExpired) {
              // Clear auth data and redirect to login
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('filiup_user');
              
              // Only redirect if we're not already on login page
              if (!window.location.pathname.includes('/login')) {
                console.log('Session expired, redirecting to login');
                window.location.href = '/login';
              }
            }
          }
          break;

        case ErrorType.NETWORK_ERROR:
          // Could implement offline detection here
          break;
      }

      // Show user-friendly toast message
      if (showToast) {
        const message = customMessage || getUserFriendlyMessage(appError);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }

      // Call custom error handler if provided
      if (onError) {
        onError(appError);
      }

      return appError;
    },
    [toast]
  );

  const executeWithRetry = useCallback(
    async <T>(
      { operation, options = {} }: RetryableOperation<T>
    ): Promise<T> => {
      const { maxRetries = 3, enableRetry = true } = options;
      let lastError: AppError | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await operation();
        } catch (error) {
          const appError = parseGeneralError(error);
          lastError = appError;

          const isLastAttempt = attempt === maxRetries;
          const canRetry = enableRetry && shouldRetryError(appError);

          if (canRetry && !isLastAttempt) {
            const delay = getRetryDelay(attempt);
            console.warn(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // If we can't retry or this is the last attempt, handle the error
          throw appError;
        }
      }

      // This should never be reached, but just in case
      throw lastError || new AppError(ErrorType.UNKNOWN_ERROR, 'Operation failed after retries');
    },
    []
  );

  const safeExecute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ErrorHandlerOptions = {}
    ): Promise<{ data: T | null; error: AppError | null }> => {
      try {
        const data = await executeWithRetry({ operation, options });
        return { data, error: null };
      } catch (error) {
        const appError = handleError(error, options);
        return { data: null, error: appError };
      }
    },
    [handleError, executeWithRetry]
  );

  return {
    handleError,
    executeWithRetry,
    safeExecute,
  };
}; 