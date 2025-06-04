import { AxiosError } from 'axios';
import { ErrorType, AppError } from './types';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Naganap ang hindi inaasahang error. Subukan ulit mamaya.';
};

export const parseAxiosError = (error: AxiosError): AppError => {
  const response = error.response;
  const request = error.request;
  
  // Network error - no response received
  if (!response && request) {
    return new AppError(
      ErrorType.NETWORK_ERROR,
      'Hindi ma-connect sa server. Tignan kung may internet connection.',
      undefined,
      { originalError: error.message }
    );
  }
  
  // Request was made but no response was received
  if (!response) {
    return new AppError(
      ErrorType.NETWORK_ERROR,
      'Walang response mula sa server. Subukan ulit mamaya.',
      undefined,
      { originalError: error.message }
    );
  }
  
  const statusCode = response.status;
  const responseData = response.data;
  
  // Handle different HTTP status codes
  switch (statusCode) {
    case 400:
      return new AppError(
        ErrorType.VALIDATION_ERROR,
        responseData?.message || 'Mali ang datos na naipadala. Pakicheck ang input.',
        statusCode,
        responseData
      );
      
    case 401:
      return new AppError(
        ErrorType.AUTHENTICATION_ERROR,
        responseData?.message || 'Hindi kayo naka-login. Mag-login muna.',
        statusCode,
        responseData
      );
      
    case 403:
      return new AppError(
        ErrorType.AUTHORIZATION_ERROR,
        responseData?.message || 'Walang permiso para sa aksyon na ito.',
        statusCode,
        responseData
      );
      
    case 404:
      return new AppError(
        ErrorType.NOT_FOUND_ERROR,
        responseData?.message || 'Hindi makita ang hinahanap na resource.',
        statusCode,
        responseData
      );
      
    case 408:
      return new AppError(
        ErrorType.TIMEOUT_ERROR,
        'Nag-timeout ang request. Subukan ulit.',
        statusCode,
        responseData
      );
      
    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(
        ErrorType.SERVER_ERROR,
        responseData?.message || 'May problema sa server. Subukan ulit mamaya.',
        statusCode,
        responseData
      );
      
    default:
      return new AppError(
        ErrorType.UNKNOWN_ERROR,
        responseData?.message || `Naganap ang error (${statusCode}). Subukan ulit.`,
        statusCode,
        responseData
      );
  }
};

export const parseGeneralError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    // Check if it's an axios error
    if ('isAxiosError' in error && error.isAxiosError) {
      return parseAxiosError(error as AxiosError);
    }
    
    // Check for common JavaScript errors
    if (error.name === 'TypeError') {
      return new AppError(
        ErrorType.UNKNOWN_ERROR,
        'May problema sa application. Subukan i-refresh ang page.',
        undefined,
        { originalError: error.message }
      );
    }
    
    return new AppError(
      ErrorType.UNKNOWN_ERROR,
      error.message || 'Naganap ang hindi inaasahang error.',
      undefined,
      { originalError: error.message }
    );
  }
  
  return new AppError(
    ErrorType.UNKNOWN_ERROR,
    'Naganap ang hindi inaasahang error. Subukan ulit mamaya.',
    undefined,
    { originalError: String(error) }
  );
};

export const shouldRetryError = (error: AppError): boolean => {
  return [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.SERVER_ERROR
  ].includes(error.type);
};

export const getRetryDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s (max)
  return Math.min(1000 * Math.pow(2, retryCount), 16000);
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.type === ErrorType.NETWORK_ERROR;
  }
  
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return !axiosError.response && !!axiosError.request;
  }
  
  return false;
};

export const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return 'Problema sa internet connection. Pakicheck ang inyong connection at subukan ulit.';
      
    case ErrorType.AUTHENTICATION_ERROR:
      return 'Kailangan mag-login muna para makagamit ng feature na ito.';
      
    case ErrorType.AUTHORIZATION_ERROR:
      return 'Walang permiso para sa aksyon na ito. Makipag-ugnayan sa admin kung may tanong.';
      
    case ErrorType.VALIDATION_ERROR:
      return 'May mali sa datos na nailagay. Pakicheck ang mga input at subukan ulit.';
      
    case ErrorType.NOT_FOUND_ERROR:
      return 'Hindi makita ang hinahanap. Maaaring naitanggal na o hindi nag-eexist.';
      
    case ErrorType.SERVER_ERROR:
      return 'May problema sa server. Subukan ulit mamaya o makipag-ugnayan sa support.';
      
    case ErrorType.TIMEOUT_ERROR:
      return 'Nag-timeout ang request. Pakicheck ang internet connection at subukan ulit.';
      
    default:
      return error.message || 'Naganap ang hindi inaasahang error. Subukan ulit mamaya.';
  }
}; 