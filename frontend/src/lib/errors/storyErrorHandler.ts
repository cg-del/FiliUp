/**
 * Story-specific error handler
 * Provides detailed error handling and user-friendly messages for story operations
 */

export interface StoryError {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  retryable: boolean;
}

export class StoryErrorHandler {
  
  /**
   * Parse and handle story creation errors
   */
  static handleStoryCreationError(error: any): StoryError {
    // Default error
    let storyError: StoryError = {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'May hindi kilalang error na naganap. Subukang muli.',
      statusCode: 500,
      retryable: true
    };

    // Handle network errors
    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        userMessage: 'Walang koneksyon sa internet. Tingnan ang inyong koneksyon.',
        statusCode: 0,
        retryable: true
      };
    }

    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 400:
        storyError = {
          code: 'VALIDATION_ERROR',
          message: errorData?.message || 'Invalid request data',
          userMessage: this.getValidationMessage(errorData?.message),
          statusCode: 400,
          retryable: false
        };
        break;

      case 401:
        storyError = {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          userMessage: 'Kailangan mo munang mag-login ulit.',
          statusCode: 401,
          retryable: false
        };
        break;

      case 403:
        storyError = {
          code: 'FORBIDDEN',
          message: errorData?.message || 'Access denied',
          userMessage: 'Walang pahintulot na gumawa ng kuwento. Guro ka ba?',
          statusCode: 403,
          retryable: false
        };
        break;

      case 404:
        storyError = {
          code: 'NOT_FOUND',
          message: errorData?.message || 'Resource not found',
          userMessage: 'Hindi makita ang klase na napili. Subukang pumili ng ibang klase.',
          statusCode: 404,
          retryable: false
        };
        break;

      case 409:
        storyError = {
          code: 'CONFLICT',
          message: errorData?.message || 'Resource conflict',
          userMessage: 'May kuwentong may katulad na pamagat na. Gumamit ng ibang pamagat.',
          statusCode: 409,
          retryable: false
        };
        break;

      case 413:
        storyError = {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request entity too large',
          userMessage: 'Masyadong malaki ang nilalaman ng kuwento. Paikliing muna.',
          statusCode: 413,
          retryable: false
        };
        break;

      case 429:
        storyError = {
          code: 'RATE_LIMIT',
          message: 'Too many requests',
          userMessage: 'Masyadong maraming pagsubuk. Maghintay muna ng ilang minuto.',
          statusCode: 429,
          retryable: true
        };
        break;

      case 500:
        storyError = {
          code: 'SERVER_ERROR',
          message: errorData?.message || 'Internal server error',
          userMessage: 'May problema sa server. Subukang muli mamaya.',
          statusCode: 500,
          retryable: true
        };
        break;

      case 502:
      case 503:
      case 504:
        storyError = {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Service temporarily unavailable',
          userMessage: 'Hindi available ang serbisyo ngayon. Subukang muli mamaya.',
          statusCode: status,
          retryable: true
        };
        break;

      default:
        storyError = {
          code: 'HTTP_ERROR',
          message: errorData?.message || `HTTP ${status} error`,
          userMessage: 'May problema sa pagkakagawa ng kuwento. Subukang muli.',
          statusCode: status,
          retryable: status >= 500
        };
    }

    return storyError;
  }

  /**
   * Handle cover image upload errors
   */
  static handleImageUploadError(error: any): StoryError {
    // Default error
    let storyError: StoryError = {
      code: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'May problema sa pag-upload ng larawan. Subukang muli.',
      statusCode: 500,
      retryable: true
    };

    // Handle network errors
    if (!error.response) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        userMessage: 'Walang koneksyon sa internet. Tingnan ang inyong koneksyon.',
        statusCode: 0,
        retryable: true
      };
    }

    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 400:
        storyError = {
          code: 'INVALID_FILE',
          message: errorData?.message || 'Invalid file',
          userMessage: this.getImageValidationMessage(errorData?.message),
          statusCode: 400,
          retryable: false
        };
        break;

      case 413:
        storyError = {
          code: 'FILE_TOO_LARGE',
          message: 'File too large',
          userMessage: 'Masyadong malaki ang larawan. Maximum na 5MB lang.',
          statusCode: 413,
          retryable: false
        };
        break;

      case 415:
        storyError = {
          code: 'UNSUPPORTED_FILE_TYPE',
          message: 'Unsupported file type',
          userMessage: 'Hindi supported ang uri ng file. Gumamit ng JPG, PNG, o GIF.',
          statusCode: 415,
          retryable: false
        };
        break;

      default:
        return this.handleStoryCreationError(error);
    }

    return storyError;
  }

  /**
   * Get user-friendly validation messages
   */
  private static getValidationMessage(serverMessage?: string): string {
    if (!serverMessage) {
      return 'May mali sa mga datos na ipinasok. Tingnan ulit ang form.';
    }

    const message = serverMessage.toLowerCase();

    if (message.includes('title') && message.includes('required')) {
      return 'Kailangan ng pamagat ng kuwento.';
    }
    if (message.includes('title') && message.includes('exceed')) {
      return 'Masyadong mahaba ang pamagat. Maximum na 255 characters lang.';
    }
    if (message.includes('content') && message.includes('required')) {
      return 'Kailangan ng nilalaman ng kuwento.';
    }
    if (message.includes('content') && message.includes('exceed')) {
      return 'Masyadong mahaba ang kuwento. Paikliing muna.';
    }
    if (message.includes('genre') && message.includes('required')) {
      return 'Piliin ang uri ng kuwento.';
    }
    if (message.includes('class') && message.includes('required')) {
      return 'Piliin ang klase para sa kuwento.';
    }

    // Return the server message if we can't parse it
    return serverMessage;
  }

  /**
   * Get user-friendly image validation messages
   */
  private static getImageValidationMessage(serverMessage?: string): string {
    if (!serverMessage) {
      return 'May problema sa larawan. Subukang pumili ng ibang larawan.';
    }

    const message = serverMessage.toLowerCase();

    if (message.includes('file type') || message.includes('invalid')) {
      return 'Hindi valid ang uri ng file. Gumamit ng JPG, PNG, o GIF.';
    }
    if (message.includes('size') || message.includes('large')) {
      return 'Masyadong malaki ang larawan. Maximum na 5MB lang.';
    }
    if (message.includes('missing') || message.includes('required')) {
      return 'Pumili ng larawan para sa pabalat.';
    }

    // Return the server message if we can't parse it
    return serverMessage;
  }

  /**
   * Determine if an error should trigger a retry
   */
  static shouldRetry(error: StoryError, attemptCount: number, maxRetries: number): boolean {
    if (attemptCount >= maxRetries) {
      return false;
    }

    // Don't retry client errors (400-499)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }

    // Retry server errors and network errors
    return error.retryable;
  }

  /**
   * Get retry delay in milliseconds (exponential backoff)
   */
  static getRetryDelay(attemptCount: number): number {
    const baseDelay = 1000; // 1 second
    const maxDelay = 5000; // 5 seconds
    
    return Math.min(baseDelay * Math.pow(2, attemptCount), maxDelay);
  }
} 