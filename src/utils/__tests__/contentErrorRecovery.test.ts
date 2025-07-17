import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as contentErrorRecovery from '../contentErrorRecovery';
import localStorageCache from '../localStorageCache';
import { ApiError, ApiErrorType } from '../apiErrorHandling';
import type { Frame, Citation } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock localStorageCache
vi.mock('../localStorageCache', () => ({
  default: {
    saveToCache: vi.fn(),
    getFromCache: vi.fn(),
    clearCache: vi.fn(),
    clearAllCache: vi.fn()
  }
}));

describe('Content Error Recovery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Validation Error Handling', () => {
    it('should save validation errors', () => {
      contentErrorRecovery.saveValidationError('topic', 'Topic is required', 'Enter a topic');
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        [{ field: 'topic', message: 'Topic is required', suggestion: 'Enter a topic' }]
      );
    });

    it('should process validation results', () => {
      vi.mocked(localStorageCache.getFromCache).mockReturnValue([]);
      
      const validationResult = {
        isValid: false,
        errors: ['Topic is required', 'URL is not valid']
      };
      
      const processed = contentErrorRecovery.processValidationResult(validationResult);
      
      expect(processed.fieldErrors).toEqual({
        topic: 'Topic is required',
        url: 'URL is not valid'
      });
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledTimes(3); // Once for clearing, twice for saving
    });

    it('should update existing validation errors', () => {
      vi.mocked(localStorageCache.getFromCache).mockReturnValue([
        { field: 'topic', message: 'Old error', suggestion: 'Old suggestion' }
      ]);
      
      contentErrorRecovery.saveValidationError('topic', 'New error', 'New suggestion');
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        [{ field: 'topic', message: 'New error', suggestion: 'New suggestion' }]
      );
    });

    it('should clear validation errors', () => {
      // Clear specific field
      contentErrorRecovery.clearValidationErrors('topic');
      expect(localStorageCache.clearCache).not.toHaveBeenCalled();
      expect(localStorageCache.getFromCache).toHaveBeenCalled();
      expect(localStorageCache.saveToCache).toHaveBeenCalled();
      
      vi.resetAllMocks();
      
      // Clear all fields
      contentErrorRecovery.clearValidationErrors();
      expect(localStorageCache.clearCache).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Partial Content Saving', () => {
    it('should save partial content', () => {
      const content = 'Partial content';
      const request = {
        input: {
          topic: 'AI Policy',
          region: 'usa',
          contentType: 'blog'
        },
        model: 'gemini-2.5-pro'
      };
      
      contentErrorRecovery.savePartialContent(content, request as any);
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          content,
          request,
          timestamp: expect.any(Number),
          recoveryAttempts: 0
        })
      );
    });

    it('should increment recovery attempts for existing partial content', () => {
      vi.mocked(localStorageCache.getFromCache).mockReturnValue({
        content: 'Existing content',
        request: {},
        timestamp: Date.now(),
        recoveryAttempts: 2
      });
      
      contentErrorRecovery.savePartialContent('New content', {} as any);
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          recoveryAttempts: 3
        })
      );
    });

    it('should get partial content', () => {
      const mockPartialContent = {
        content: 'Partial content',
        request: {},
        timestamp: Date.now(),
        recoveryAttempts: 1
      };
      
      vi.mocked(localStorageCache.getFromCache).mockReturnValue(mockPartialContent);
      
      const result = contentErrorRecovery.getPartialContent();
      
      expect(result).toEqual(mockPartialContent);
      expect(localStorageCache.getFromCache).toHaveBeenCalledWith(expect.any(String));
    });

    it('should clear partial content', () => {
      contentErrorRecovery.clearPartialContent();
      
      expect(localStorageCache.clearCache).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Framing Conflict Resolution', () => {
    it('should detect conflicting frames', () => {
      const content = 'Content with conflicting frames';
      const frames: Frame[] = [
        {
          name: 'Strict Father',
          description: 'Discipline and self-reliance',
          values: ['discipline', 'self-reliance'],
          metaphors: ['tough love'],
          keywords: ['strict', 'discipline'],
          strength: 0.7
        },
        {
          name: 'Nurturant Parent',
          description: 'Empathy and care',
          values: ['empathy', 'care'],
          metaphors: ['nurturing'],
          keywords: ['care', 'support'],
          strength: 0.6
        }
      ];
      
      const result = contentErrorRecovery.resolveFramingConflicts(content, frames);
      
      expect(result).toHaveProperty('needsManualResolution', true);
      expect(result).toHaveProperty('conflictingFrames');
      expect(result.conflictingFrames.frame1.name).toBe('Strict Father');
      expect(result.conflictingFrames.frame2.name).toBe('Nurturant Parent');
    });

    it('should automatically resolve when one frame is significantly stronger', () => {
      const content = 'Content with dominant frame';
      const frames: Frame[] = [
        {
          name: 'Strict Father',
          description: 'Discipline and self-reliance',
          values: ['discipline', 'self-reliance'],
          metaphors: ['tough love'],
          keywords: ['strict', 'discipline'],
          strength: 0.9
        },
        {
          name: 'Nurturant Parent',
          description: 'Empathy and care',
          values: ['empathy', 'care'],
          metaphors: ['nurturing'],
          keywords: ['care', 'support'],
          strength: 0.4
        }
      ];
      
      const result = contentErrorRecovery.resolveFramingConflicts(content, frames);
      
      expect(result).toHaveProperty('resolvedContent', content);
    });

    it('should return resolved content when no conflicts exist', () => {
      const content = 'Content with no conflicting frames';
      const frames: Frame[] = [
        {
          name: 'Freedom',
          description: 'Individual liberty',
          values: ['liberty', 'choice'],
          metaphors: ['open road'],
          keywords: ['freedom', 'liberty'],
          strength: 0.7
        },
        {
          name: 'Fairness',
          description: 'Equal treatment',
          values: ['equality', 'justice'],
          metaphors: ['scales'],
          keywords: ['fair', 'equal'],
          strength: 0.6
        }
      ];
      
      const result = contentErrorRecovery.resolveFramingConflicts(content, frames);
      
      expect(result).toHaveProperty('resolvedContent', content);
    });

    it('should generate alternative frame suggestions', () => {
      const frame1: Frame = {
        name: 'Freedom',
        description: 'Individual liberty',
        values: ['liberty', 'choice'],
        metaphors: ['open road'],
        keywords: ['freedom', 'liberty'],
        strength: 0.7
      };
      
      const frame2: Frame = {
        name: 'Security',
        description: 'Protection and safety',
        values: ['safety', 'protection'],
        metaphors: ['shield'],
        keywords: ['secure', 'protect'],
        strength: 0.6
      };
      
      const alternatives = contentErrorRecovery.generateAlternativeFrameSuggestions(frame1, frame2);
      
      expect(alternatives).toHaveLength(3);
      expect(alternatives[0].name).toContain('Hybrid');
      expect(alternatives[0].values).toContain('liberty');
      expect(alternatives[0].values).toContain('safety');
      expect(alternatives[1].name).toBe('Common Ground');
      expect(alternatives[2].name).toBe('Balanced Approach');
    });

    it('should save and retrieve framing conflicts', () => {
      const content = 'Content with conflict';
      const frame1: Frame = {
        name: 'Freedom',
        description: 'Liberty',
        values: ['liberty'],
        metaphors: ['open road'],
        keywords: ['freedom'],
        strength: 0.7
      };
      
      const frame2: Frame = {
        name: 'Security',
        description: 'Safety',
        values: ['safety'],
        metaphors: ['shield'],
        keywords: ['secure'],
        strength: 0.6
      };
      
      const alternatives = [
        {
          name: 'Hybrid',
          description: 'Combined',
          values: ['balance'],
          metaphors: ['middle path'],
          keywords: ['balanced'],
          strength: 0.8
        }
      ];
      
      contentErrorRecovery.saveFramingConflict(content, { frame1, frame2 }, alternatives);
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        {
          content,
          conflictingFrames: { frame1, frame2 },
          alternativeSuggestions: alternatives
        }
      );
      
      vi.mocked(localStorageCache.getFromCache).mockReturnValue({
        content,
        conflictingFrames: { frame1, frame2 },
        alternativeSuggestions: alternatives
      });
      
      const result = contentErrorRecovery.getFramingConflict();
      
      expect(result).toEqual({
        content,
        conflictingFrames: { frame1, frame2 },
        alternativeSuggestions: alternatives
      });
    });

    it('should clear framing conflicts', () => {
      contentErrorRecovery.clearFramingConflict();
      
      expect(localStorageCache.clearCache).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Citation Error Handling', () => {
    it('should validate citations and identify errors', () => {
      const citations: Citation[] = [
        {
          title: 'Valid Citation',
          author: 'Author Name',
          source: 'Journal',
          url: 'https://example.com',
          accessDate: new Date(),
          year: 2023
        },
        {
          title: '',
          author: 'Unknown',
          source: 'Missing Title',
          url: '',
          accessDate: new Date(),
          year: 2023
        },
        {
          title: 'Invalid URL',
          author: 'Author',
          source: 'Source',
          url: 'not-a-url',
          accessDate: new Date(),
          year: 2023
        }
      ];
      
      const { validCitations, errors } = contentErrorRecovery.validateAndFixCitations(citations);
      
      expect(validCitations).toHaveLength(1);
      expect(errors).toHaveLength(2);
      expect(errors[0].errorType).toBe('incomplete');
      expect(errors[1].errorType).toBe('invalid');
    });

    it('should create citation template', () => {
      const template = contentErrorRecovery.createCitationTemplate('Example Source');
      
      expect(template).toHaveProperty('title', 'Example Source');
      expect(template).toHaveProperty('author', 'Enter author name');
      expect(template).toHaveProperty('accessDate');
      expect(template.year).toBe(new Date().getFullYear());
    });

    it('should save and retrieve citation errors', () => {
      const citation: Citation = {
        title: 'Problem Citation',
        author: '',
        source: 'Source',
        url: '',
        accessDate: new Date()
      };
      
      const suggestion: Citation = {
        title: 'Problem Citation',
        author: 'Suggested Author',
        source: 'Source',
        url: '',
        accessDate: new Date()
      };
      
      contentErrorRecovery.saveCitationError(citation, 'incomplete', suggestion);
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        [{ citation, errorType: 'incomplete', suggestion }]
      );
      
      vi.mocked(localStorageCache.getFromCache).mockReturnValue([
        { citation, errorType: 'incomplete', suggestion }
      ]);
      
      const errors = contentErrorRecovery.getCitationErrors();
      
      expect(errors).toHaveLength(1);
      expect(errors[0].citation).toEqual(citation);
      expect(errors[0].errorType).toBe('incomplete');
    });

    it('should update existing citation errors', () => {
      const citation: Citation = {
        title: 'Citation',
        author: '',
        source: 'Source',
        url: '',
        accessDate: new Date()
      };
      
      vi.mocked(localStorageCache.getFromCache).mockReturnValue([
        { citation, errorType: 'incomplete', suggestion: undefined }
      ]);
      
      const newSuggestion: Citation = {
        title: 'Citation',
        author: 'New Author',
        source: 'Source',
        url: '',
        accessDate: new Date()
      };
      
      contentErrorRecovery.saveCitationError(citation, 'missing', newSuggestion);
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        [{ citation, errorType: 'missing', suggestion: newSuggestion }]
      );
    });

    it('should clear citation errors', () => {
      // Clear specific source
      contentErrorRecovery.clearCitationErrors('Source');
      expect(localStorageCache.clearCache).not.toHaveBeenCalled();
      expect(localStorageCache.getFromCache).toHaveBeenCalled();
      expect(localStorageCache.saveToCache).toHaveBeenCalled();
      
      vi.resetAllMocks();
      
      // Clear all errors
      contentErrorRecovery.clearCitationErrors();
      expect(localStorageCache.clearCache).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle content generation errors and provide recovery options', () => {
      const apiError = new ApiError(
        'Rate limit exceeded',
        ApiErrorType.RATE_LIMIT,
        429,
        undefined,
        true
      );
      
      const partialContent = 'Some partial content that was generated before the error';
      const request = { input: { topic: 'Test' } } as any;
      
      const result = contentErrorRecovery.handleContentGenerationError(apiError, partialContent, request);
      
      expect(result.apiError).toBe(apiError);
      expect(result.recoveryOptions.canRetry).toBe(true);
      expect(result.recoveryOptions.canSavePartial).toBe(true);
      expect(result.recoveryOptions.suggestedAction).toContain('Wait');
      
      expect(localStorageCache.saveToCache).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          content: partialContent,
          request
        })
      );
    });

    it('should convert generic errors to ApiErrors', () => {
      const genericError = new Error('Something went wrong');
      
      const result = contentErrorRecovery.handleContentGenerationError(
        genericError,
        'Partial content',
        {} as any
      );
      
      expect(result.apiError).toBeInstanceOf(ApiError);
      expect(result.apiError.type).toBe(ApiErrorType.UNKNOWN);
    });

    it('should provide different recovery suggestions based on error type', () => {
      // Content policy error
      const policyError = new ApiError(
        'Content policy violation',
        ApiErrorType.CONTENT_POLICY,
        403
      );
      
      const policyResult = contentErrorRecovery.handleContentGenerationError(
        policyError,
        'Content',
        {} as any
      );
      
      expect(policyResult.recoveryOptions.suggestedAction).toContain('Modify your topic');
      
      // Network error
      const networkError = new ApiError(
        'Network error',
        ApiErrorType.NETWORK_ERROR
      );
      
      const networkResult = contentErrorRecovery.handleContentGenerationError(
        networkError,
        'Content',
        {} as any
      );
      
      expect(networkResult.recoveryOptions.suggestedAction).toContain('internet connection');
      
      // Server error
      const serverError = new ApiError(
        'Server error',
        ApiErrorType.SERVER_ERROR,
        500
      );
      
      const serverResult = contentErrorRecovery.handleContentGenerationError(
        serverError,
        'Content',
        {} as any
      );
      
      expect(serverResult.recoveryOptions.suggestedAction).toContain('different model');
    });

    it('should clear all error recovery data', () => {
      contentErrorRecovery.clearAllErrorRecoveryData();
      
      // Should clear all caches
      expect(localStorageCache.clearCache).toHaveBeenCalledTimes(4);
    });
  });
});