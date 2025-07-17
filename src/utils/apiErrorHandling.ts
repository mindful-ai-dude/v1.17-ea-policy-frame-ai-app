import type { GeminiError } from '../services/GeminiService';

/**
 * API Error types
 */
export enum ApiErrorType {
  // Authentication errors
  AUTHENTICATION = 'authentication',
  INVALID_API_KEY = 'invalid_api_key',
  EXPIRED_API_KEY = 'expired_api_key',
  
  // Rate limiting errors
  RATE_LIMIT = 'rate_limit',
  QUOTA_EXCEEDED = 'quota_exceeded',
  
  // Request errors
  INVALID_REQUEST = 'invalid_request',
  BAD_PARAMETERS = 'bad_parameters',
  
  // Content policy errors
  CONTENT_POLICY = 'content_policy',
  SAFETY_BLOCKED = 'safety_blocked',
  
  // Server errors
  SERVER_ERROR = 'server_error',
  SERVICE_UNAVAILABLE = 'service_unavailable',
  
  // Network errors
  NETWORK_ERROR = 'network_error',
  TIMEOUT = 'timeout',
  
  // Unknown errors
  UNKNOWN = 'unknown'
}

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  type: ApiErrorType;
  statusCode?: number;
  details?: any;
  retryable: boolean;
  
  constructor(
    message: string,
    type: ApiErrorType = ApiErrorType.UNKNOWN,
    statusCode?: number,
    details?: any,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.retryable = retryable;
    
    // Ensure instanceof works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
  
  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(): string {
    switch (this.type) {
      case ApiErrorType.AUTHENTICATION:
        return 'Authentication failed. Please check your API key.';
      
      case ApiErrorType.INVALID_API_KEY:
        return 'Invalid API key. Please check your API key and try again.';
      
      case ApiErrorType.EXPIRED_API_KEY:
        return 'Your API key has expired. Please generate a new API key.';
      
      case ApiErrorType.RATE_LIMIT:
        return 'Rate limit exceeded. Please try again later.';
      
      case ApiErrorType.QUOTA_EXCEEDED:
        return 'API quota exceeded. Please check your usage limits.';
      
      case ApiErrorType.INVALID_REQUEST:
        return 'Invalid request. Please check your input and try again.';
      
      case ApiErrorType.BAD_PARAMETERS:
        return 'Invalid parameters. Please check your input and try again.';
      
      case ApiErrorType.CONTENT_POLICY:
        return 'Content policy violation. Please modify your request and try again.';
      
      case ApiErrorType.SAFETY_BLOCKED:
        return 'Request blocked due to safety concerns. Please modify your content and try again.';
      
      case ApiErrorType.SERVER_ERROR:
        return 'Server error. Please try again later.';
      
      case ApiErrorType.SERVICE_UNAVAILABLE:
        return 'Service temporarily unavailable. Please try again later.';
      
      case ApiErrorType.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.';
      
      case ApiErrorType.TIMEOUT:
        return 'Request timed out. Please try again later.';
      
      default:
        return this.message || 'An unknown error occurred. Please try again.';
    }
  }
  
  /**
   * Get troubleshooting steps based on error type
   */
  getTroubleshootingSteps(): string[] {
    switch (this.type) {
      case ApiErrorType.AUTHENTICATION:
      case ApiErrorType.INVALID_API_KEY:
        return [
          'Verify your API key is correct',
          'Ensure your API key has the necessary permissions',
          'Try generating a new API key'
        ];
      
      case ApiErrorType.EXPIRED_API_KEY:
        return [
          'Generate a new API key',
          'Update your API key in the application settings'
        ];
      
      case ApiErrorType.RATE_LIMIT:
      case ApiErrorType.QUOTA_EXCEEDED:
        return [
          'Wait a few minutes before trying again',
          'Check your API usage in the Google Cloud Console',
          'Consider upgrading your API tier if you need higher limits'
        ];
      
      case ApiErrorType.CONTENT_POLICY:
      case ApiErrorType.SAFETY_BLOCKED:
        return [
          'Review your content for potentially sensitive or prohibited topics',
          'Modify your request to comply with content policies',
          'Try a different approach to your request'
        ];
      
      case ApiErrorType.SERVER_ERROR:
      case ApiErrorType.SERVICE_UNAVAILABLE:
        return [
          'Wait a few minutes and try again',
          'Check the Google AI status page for any reported outages',
          'Try a different model if available'
        ];
      
      case ApiErrorType.NETWORK_ERROR:
        return [
          'Check your internet connection',
          'Try again later',
          'If the problem persists, contact your network administrator'
        ];
      
      default:
        return [
          'Try refreshing the page',
          'Check your input parameters',
          'Try again later'
        ];
    }
  }
  
  /**
   * Create ApiError from GeminiError response
   */
  static fromGeminiError(error: GeminiError): ApiError {
    const { code, message, status, details } = error.error;
    
    // Determine error type based on status and code
    let type = ApiErrorType.UNKNOWN;
    let retryable = false;
    
    // Handle authentication errors
    if (status === 'UNAUTHENTICATED' || code === 401) {
      type = ApiErrorType.AUTHENTICATION;
    }
    // Handle invalid API key
    else if (message.includes('API key')) {
      type = ApiErrorType.INVALID_API_KEY;
    }
    // Handle rate limiting
    else if (status === 'RESOURCE_EXHAUSTED' || code === 429) {
      type = message.includes('quota') 
        ? ApiErrorType.QUOTA_EXCEEDED 
        : ApiErrorType.RATE_LIMIT;
      retryable = true;
    }
    // Handle invalid requests
    else if (status === 'INVALID_ARGUMENT' || code === 400) {
      type = ApiErrorType.INVALID_REQUEST;
    }
    // Handle content policy violations
    else if (status === 'PERMISSION_DENIED' || code === 403) {
      type = message.includes('safety') 
        ? ApiErrorType.SAFETY_BLOCKED 
        : ApiErrorType.CONTENT_POLICY;
    }
    // Handle server errors
    else if (status === 'INTERNAL' || (code >= 500 && code < 600)) {
      type = ApiErrorType.SERVER_ERROR;
      retryable = true;
    }
    // Handle service unavailable
    else if (status === 'UNAVAILABLE' || code === 503) {
      type = ApiErrorType.SERVICE_UNAVAILABLE;
      retryable = true;
    }
    
    return new ApiError(
      message,
      type,
      code,
      details,
      retryable
    );
  }
  
  /**
   * Create ApiError from any error
   */
  static fromError(error: any): ApiError {
    // If it's already an ApiError, return it
    if (error instanceof ApiError) {
      return error;
    }
    
    // If it's a GeminiError (has error.error structure)
    if (error && error.error && error.error.code) {
      return ApiError.fromGeminiError(error as GeminiError);
    }
    
    // If it's a fetch error or network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new ApiError(
        'Network error. Please check your connection and try again.',
        ApiErrorType.NETWORK_ERROR,
        undefined,
        undefined,
        true
      );
    }
    
    // If it's a timeout error
    if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
      return new ApiError(
        'Request timed out. Please try again later.',
        ApiErrorType.TIMEOUT,
        undefined,
        undefined,
        true
      );
    }
    
    // Default case: unknown error
    return new ApiError(
      error instanceof Error ? error.message : String(error),
      ApiErrorType.UNKNOWN
    );
  }
}

/**
 * Retry a function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in milliseconds
 * @returns Promise resolving to the function result
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      // Convert to ApiError if needed
      const apiError = ApiError.fromError(error);
      
      // If not retryable or max retries reached, throw
      if (!apiError.retryable || retries >= maxRetries) {
        throw apiError;
      }
      
      // Increment retry count
      retries++;
      
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry (exponential backoff)
      delay *= 2;
    }
  }
}