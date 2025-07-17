import { describe, it, expect, vi } from 'vitest';
import { ApiError, ApiErrorType, retryWithBackoff } from '../apiErrorHandling';

describe('API Error Handling', () => {
  describe('ApiError', () => {
    it('should create an API error with correct properties', () => {
      const error = new ApiError(
        'Rate limit exceeded',
        ApiErrorType.RATE_LIMIT,
        429,
        { retryAfter: 30 },
        true
      );
      
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.type).toBe(ApiErrorType.RATE_LIMIT);
      expect(error.statusCode).toBe(429);
      expect(error.details).toEqual({ retryAfter: 30 });
      expect(error.retryable).toBe(true);
    });
    
    it('should provide user-friendly error messages', () => {
      const authError = new ApiError('Auth failed', ApiErrorType.AUTHENTICATION);
      const rateError = new ApiError('Rate limited', ApiErrorType.RATE_LIMIT);
      const unknownError = new ApiError('Something went wrong');
      
      expect(authError.getUserFriendlyMessage()).toContain('Authentication failed');
      expect(rateError.getUserFriendlyMessage()).toContain('Rate limit exceeded');
      expect(unknownError.getUserFriendlyMessage()).toBe('Something went wrong');
    });
    
    it('should provide troubleshooting steps based on error type', () => {
      const authError = new ApiError('Auth failed', ApiErrorType.AUTHENTICATION);
      const rateError = new ApiError('Rate limited', ApiErrorType.RATE_LIMIT);
      
      expect(authError.getTroubleshootingSteps()).toContain(expect.stringContaining('API key'));
      expect(rateError.getTroubleshootingSteps()).toContain(expect.stringContaining('Wait'));
    });
    
    it('should convert generic errors to ApiErrors', () => {
      const genericError = new Error('Something went wrong');
      const apiError = ApiError.fromError(genericError);
      
      expect(apiError).toBeInstanceOf(ApiError);
      expect(apiError.type).toBe(ApiErrorType.UNKNOWN);
      expect(apiError.message).toBe('Something went wrong');
    });

    it('should handle network errors correctly', () => {
      const fetchError = new TypeError('Failed to fetch');
      const apiError = ApiError.fromError(fetchError);
      
      expect(apiError.type).toBe(ApiErrorType.NETWORK_ERROR);
      expect(apiError.retryable).toBe(true);
    });

    it('should handle timeout errors correctly', () => {
      const timeoutError = { name: 'TimeoutError', message: 'Request timed out' };
      const apiError = ApiError.fromError(timeoutError);
      
      expect(apiError.type).toBe(ApiErrorType.TIMEOUT);
      expect(apiError.retryable).toBe(true);
    });

    it('should convert Gemini errors to ApiErrors', () => {
      const geminiError = {
        error: {
          code: 429,
          message: 'Rate limit exceeded',
          status: 'RESOURCE_EXHAUSTED',
          details: { reason: 'rateLimitExceeded' }
        }
      };
      
      const apiError = ApiError.fromGeminiError(geminiError as any);
      
      expect(apiError.type).toBe(ApiErrorType.RATE_LIMIT);
      expect(apiError.statusCode).toBe(429);
      expect(apiError.retryable).toBe(true);
    });

    it('should identify content policy violations', () => {
      const geminiError = {
        error: {
          code: 403,
          message: 'Content violates safety policy',
          status: 'PERMISSION_DENIED',
          details: { reason: 'safetyPolicy' }
        }
      };
      
      const apiError = ApiError.fromGeminiError(geminiError as any);
      
      expect(apiError.type).toBe(ApiErrorType.SAFETY_BLOCKED);
      expect(apiError.getUserFriendlyMessage()).toContain('safety concerns');
    });
  });
  
  describe('retryWithBackoff', () => {
    it('should retry retryable errors up to max retries', async () => {
      let attempts = 0;
      const mockFn = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts <= 2) {
          throw new ApiError('Rate limited', ApiErrorType.RATE_LIMIT, 429, undefined, true);
        }
        return 'success';
      });
      
      const result = await retryWithBackoff(mockFn, 3, 10);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
    });
    
    it('should not retry non-retryable errors', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new ApiError('Auth failed', ApiErrorType.AUTHENTICATION);
      });
      
      await expect(retryWithBackoff(mockFn, 3, 10)).rejects.toThrow('Auth failed');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    
    it('should throw after max retries', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new ApiError('Rate limited', ApiErrorType.RATE_LIMIT, 429, undefined, true);
      });
      
      await expect(retryWithBackoff(mockFn, 2, 10)).rejects.toThrow('Rate limited');
      expect(mockFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should handle success on first try', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, 3, 10);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should convert generic errors to ApiErrors during retry', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        throw new Error('Generic error');
      });
      
      await expect(retryWithBackoff(mockFn, 2, 10)).rejects.toBeInstanceOf(ApiError);
      expect(mockFn).toHaveBeenCalledTimes(1); // No retry for unknown errors
    });
  });
});