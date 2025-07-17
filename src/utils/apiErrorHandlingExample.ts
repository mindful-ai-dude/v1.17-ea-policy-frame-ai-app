/**
 * Example usage of API error handling utilities
 * 
 * This file demonstrates how to use the ApiError class and retryWithBackoff function
 * in different parts of the application.
 */

import { ApiError, ApiErrorType, retryWithBackoff } from './apiErrorHandling';
import { geminiService } from '../services/GeminiService';
import type { GeminiModel } from '../types';

/**
 * Example: Making an API call with retry and error handling
 */
export async function generateContentWithErrorHandling(
  prompt: string,
  model: GeminiModel
): Promise<string> {
  // Check preconditions
  if (!prompt || prompt.trim() === '') {
    throw new ApiError('Prompt cannot be empty', ApiErrorType.BAD_PARAMETERS);
  }
  
  if (!geminiService.hasApiKey()) {
    throw new ApiError(
      'API key not set. Please add your Google API key in settings.',
      ApiErrorType.AUTHENTICATION
    );
  }
  
  // Use retry with backoff for retryable errors
  return retryWithBackoff(async () => {
    try {
      // Make the API call
      return await geminiService.generateContent(prompt, { model });
    } catch (error) {
      // Convert to ApiError if it's not already
      const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
      
      // Handle specific error types
      switch (apiError.type) {
        case ApiErrorType.RATE_LIMIT:
        case ApiErrorType.QUOTA_EXCEEDED:
          console.warn('Rate limit exceeded, retrying with backoff...');
          throw apiError; // Let retryWithBackoff handle it
          
        case ApiErrorType.CONTENT_POLICY:
        case ApiErrorType.SAFETY_BLOCKED:
          console.error('Content policy violation:', apiError.message);
          throw apiError; // Don't retry content policy violations
          
        case ApiErrorType.AUTHENTICATION:
        case ApiErrorType.INVALID_API_KEY:
          console.error('Authentication error:', apiError.message);
          throw apiError; // Don't retry authentication errors
          
        case ApiErrorType.SERVER_ERROR:
        case ApiErrorType.SERVICE_UNAVAILABLE:
          console.warn('Server error, retrying with backoff...', apiError.message);
          throw apiError; // Let retryWithBackoff handle it
          
        default:
          console.error('API error:', apiError.message);
          throw apiError;
      }
    }
  }, 3, 1000); // 3 retries with 1s initial delay
}

/**
 * Example: React component error handling
 */
export function handleApiErrorInComponent(error: unknown): {
  errorMessage: string;
  troubleshootingSteps: string[];
} {
  // Convert to ApiError if needed
  const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
  
  // Get user-friendly error message
  const errorMessage = apiError.getUserFriendlyMessage();
  
  // Get troubleshooting steps
  const troubleshootingSteps = apiError.getTroubleshootingSteps();
  
  // Log the error for debugging
  console.error('API error in component:', apiError);
  
  return {
    errorMessage,
    troubleshootingSteps
  };
}

/**
 * Example: Error handling in a hook
 */
export function useApiErrorHandler() {
  // This would be a React hook in a real implementation
  
  const handleApiError = (error: unknown) => {
    // Convert to ApiError if needed
    const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
    
    // Handle based on error type
    switch (apiError.type) {
      case ApiErrorType.AUTHENTICATION:
      case ApiErrorType.INVALID_API_KEY:
      case ApiErrorType.EXPIRED_API_KEY:
        // Handle authentication errors
        console.error('Authentication error:', apiError.message);
        // In a real hook: setAuthError(apiError.getUserFriendlyMessage());
        break;
        
      case ApiErrorType.RATE_LIMIT:
      case ApiErrorType.QUOTA_EXCEEDED:
        // Handle rate limiting errors
        console.warn('Rate limit error:', apiError.message);
        // In a real hook: setRateLimitError(apiError.getUserFriendlyMessage());
        break;
        
      case ApiErrorType.CONTENT_POLICY:
      case ApiErrorType.SAFETY_BLOCKED:
        // Handle content policy errors
        console.error('Content policy error:', apiError.message);
        // In a real hook: setContentPolicyError(apiError.getUserFriendlyMessage());
        break;
        
      default:
        // Handle other errors
        console.error('API error:', apiError.message);
        // In a real hook: setError(apiError.getUserFriendlyMessage());
        break;
    }
    
    return apiError.getUserFriendlyMessage();
  };
  
  return {
    handleApiError
  };
}