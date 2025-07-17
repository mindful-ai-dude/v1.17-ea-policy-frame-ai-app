import { ApiError, ApiErrorType } from './apiErrorHandling';
import localStorageCache from './localStorageCache';
import type { ContentRequest, ContentResponse, ValidationResult } from '../services/ContentGenerationEngine';
import type { Citation, Frame } from '../types';

// Define cache keys for content recovery
const RECOVERY_CACHE_KEYS = {
  PARTIAL_CONTENT: 'ea-policy-frame-app-partial-content',
  VALIDATION_ERRORS: 'ea-policy-frame-app-validation-errors',
  FRAMING_CONFLICTS: 'ea-policy-frame-app-framing-conflicts',
  CITATION_ERRORS: 'ea-policy-frame-app-citation-errors',
};

// Define types for error recovery
export interface ValidationErrorDetails {
  field: string;
  message: string;
  suggestion?: string;
}

export interface PartialContent {
  content: string;
  request: ContentRequest;
  timestamp: number;
  recoveryAttempts: number;
}

export interface FramingConflict {
  content: string;
  conflictingFrames: {
    frame1: Frame;
    frame2: Frame;
  };
  alternativeSuggestions: Frame[];
}

export interface CitationError {
  citation: Citation;
  errorType: 'missing' | 'invalid' | 'incomplete';
  suggestion?: Citation;
}

/**
 * Save validation errors for real-time feedback
 * @param field - The field with validation error
 * @param message - Error message
 * @param suggestion - Optional suggestion to fix the error
 */
export const saveValidationError = (field: string, message: string, suggestion?: string): void => {
  const errors = getValidationErrors() || [];
  
  // Check if error already exists
  const existingErrorIndex = errors.findIndex(error => error.field === field);
  
  if (existingErrorIndex >= 0) {
    // Update existing error
    errors[existingErrorIndex] = { field, message, suggestion };
  } else {
    // Add new error
    errors.push({ field, message, suggestion });
  }
  
  localStorageCache.saveToCache(RECOVERY_CACHE_KEYS.VALIDATION_ERRORS, errors);
};

/**
 * Get all validation errors
 * @returns Array of validation errors
 */
export const getValidationErrors = (): ValidationErrorDetails[] => {
  return localStorageCache.getFromCache<ValidationErrorDetails[]>(RECOVERY_CACHE_KEYS.VALIDATION_ERRORS) || [];
};

/**
 * Clear validation errors for a specific field or all fields
 * @param field - Optional field to clear errors for
 */
export const clearValidationErrors = (field?: string): void => {
  if (field) {
    const errors = getValidationErrors();
    const filteredErrors = errors.filter(error => error.field !== field);
    localStorageCache.saveToCache(RECOVERY_CACHE_KEYS.VALIDATION_ERRORS, filteredErrors);
  } else {
    localStorageCache.clearCache(RECOVERY_CACHE_KEYS.VALIDATION_ERRORS);
  }
};

/**
 * Save partial content for recovery
 * @param content - Partial content generated so far
 * @param request - Original content request
 */
export const savePartialContent = (content: string, request: ContentRequest): void => {
  // Get existing partial content if any
  const existingPartial = getPartialContent();
  
  const partialContent: PartialContent = {
    content,
    request,
    timestamp: Date.now(),
    recoveryAttempts: existingPartial ? existingPartial.recoveryAttempts + 1 : 0
  };
  
  localStorageCache.saveToCache(RECOVERY_CACHE_KEYS.PARTIAL_CONTENT, partialContent);
};

/**
 * Get saved partial content
 * @returns Partial content if available
 */
export const getPartialContent = (): PartialContent | null => {
  return localStorageCache.getFromCache<PartialContent>(RECOVERY_CACHE_KEYS.PARTIAL_CONTENT);
};

/**
 * Clear saved partial content
 */
export const clearPartialContent = (): void => {
  localStorageCache.clearCache(RECOVERY_CACHE_KEYS.PARTIAL_CONTENT);
};

/**
 * Save framing conflict for resolution
 * @param content - Content with framing conflict
 * @param conflictingFrames - The conflicting frames
 * @param alternativeSuggestions - Alternative frame suggestions
 */
export const saveFramingConflict = (
  content: string,
  conflictingFrames: { frame1: Frame; frame2: Frame },
  alternativeSuggestions: Frame[]
): void => {
  const framingConflict: FramingConflict = {
    content,
    conflictingFrames,
    alternativeSuggestions
  };
  
  localStorageCache.saveToCache(RECOVERY_CACHE_KEYS.FRAMING_CONFLICTS, framingConflict);
};

/**
 * Get saved framing conflict
 * @returns Framing conflict if available
 */
export const getFramingConflict = (): FramingConflict | null => {
  return localStorageCache.getFromCache<FramingConflict>(RECOVERY_CACHE_KEYS.FRAMING_CONFLICTS);
};

/**
 * Clear saved framing conflict
 */
export const clearFramingConflict = (): void => {
  localStorageCache.clearCache(RECOVERY_CACHE_KEYS.FRAMING_CONFLICTS);
};

/**
 * Save citation error for manual resolution
 * @param citation - The problematic citation
 * @param errorType - Type of citation error
 * @param suggestion - Optional suggestion for fixing the citation
 */
export const saveCitationError = (
  citation: Citation,
  errorType: 'missing' | 'invalid' | 'incomplete',
  suggestion?: Citation
): void => {
  const errors = getCitationErrors() || [];
  
  // Check if error already exists for this citation
  const existingErrorIndex = errors.findIndex(
    error => error.citation.source === citation.source
  );
  
  const citationError: CitationError = {
    citation,
    errorType,
    suggestion
  };
  
  if (existingErrorIndex >= 0) {
    // Update existing error
    errors[existingErrorIndex] = citationError;
  } else {
    // Add new error
    errors.push(citationError);
  }
  
  localStorageCache.saveToCache(RECOVERY_CACHE_KEYS.CITATION_ERRORS, errors);
};

/**
 * Get all citation errors
 * @returns Array of citation errors
 */
export const getCitationErrors = (): CitationError[] => {
  return localStorageCache.getFromCache<CitationError[]>(RECOVERY_CACHE_KEYS.CITATION_ERRORS) || [];
};

/**
 * Clear citation errors
 * @param source - Optional citation source to clear errors for
 */
export const clearCitationErrors = (source?: string): void => {
  if (source) {
    const errors = getCitationErrors();
    const filteredErrors = errors.filter(error => error.citation.source !== source);
    localStorageCache.saveToCache(RECOVERY_CACHE_KEYS.CITATION_ERRORS, filteredErrors);
  } else {
    localStorageCache.clearCache(RECOVERY_CACHE_KEYS.CITATION_ERRORS);
  }
};

/**
 * Process validation result and save errors for real-time feedback
 * @param validation - Validation result
 * @returns Processed validation result with field-specific errors
 */
export const processValidationResult = (validation: ValidationResult): ValidationResult & { fieldErrors: Record<string, string> } => {
  const fieldErrors: Record<string, string> = {};
  
  // Clear previous validation errors
  clearValidationErrors();
  
  // Process each error and categorize by field
  validation.errors.forEach(error => {
    if (error.includes('Topic')) {
      fieldErrors.topic = error;
      saveValidationError('topic', error, 'Try a more specific topic');
    } else if (error.includes('URL')) {
      fieldErrors.url = error;
      saveValidationError('url', error, 'Make sure the URL is valid and includes http:// or https://');
    } else if (error.includes('Region')) {
      fieldErrors.region = error;
      saveValidationError('region', error);
    } else if (error.includes('Content type')) {
      fieldErrors.contentType = error;
      saveValidationError('contentType', error);
    } else {
      // General error
      saveValidationError('general', error);
    }
  });
  
  return {
    ...validation,
    fieldErrors
  };
};

/**
 * Handle content generation error and provide recovery options
 * @param error - The error that occurred
 * @param partialContent - Partial content generated so far
 * @param request - Original content request
 * @returns Error recovery information
 */
export const handleContentGenerationError = (
  error: any,
  partialContent: string,
  request: ContentRequest
): {
  apiError: ApiError;
  recoveryOptions: {
    canRetry: boolean;
    canSavePartial: boolean;
    suggestedAction: string;
  };
} => {
  // Convert to ApiError if needed
  const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
  
  // Save partial content for recovery
  if (partialContent && partialContent.length > 0) {
    savePartialContent(partialContent, request);
  }
  
  // Determine recovery options based on error type
  let recoveryOptions = {
    canRetry: apiError.retryable,
    canSavePartial: partialContent && partialContent.length > 50,
    suggestedAction: ''
  };
  
  switch (apiError.type) {
    case ApiErrorType.RATE_LIMIT:
    case ApiErrorType.QUOTA_EXCEEDED:
      recoveryOptions.suggestedAction = 'Wait a few minutes before trying again';
      break;
      
    case ApiErrorType.CONTENT_POLICY:
    case ApiErrorType.SAFETY_BLOCKED:
      recoveryOptions.suggestedAction = 'Modify your topic to avoid sensitive content';
      break;
      
    case ApiErrorType.INVALID_REQUEST:
    case ApiErrorType.BAD_PARAMETERS:
      recoveryOptions.suggestedAction = 'Check your input parameters and try again';
      break;
      
    case ApiErrorType.NETWORK_ERROR:
    case ApiErrorType.TIMEOUT:
      recoveryOptions.suggestedAction = 'Check your internet connection and try again';
      break;
      
    case ApiErrorType.SERVER_ERROR:
    case ApiErrorType.SERVICE_UNAVAILABLE:
      recoveryOptions.suggestedAction = 'Try a different model or wait and try again later';
      break;
      
    default:
      recoveryOptions.suggestedAction = 'Try again with modified parameters';
  }
  
  return {
    apiError,
    recoveryOptions
  };
};

/**
 * Create a citation template for manual completion
 * @param source - Optional source information
 * @returns Citation template
 */
export const createCitationTemplate = (source?: string): Citation => {
  return {
    title: source || 'Enter title',
    author: 'Enter author name',
    source: source || 'Enter source',
    url: '',
    accessDate: new Date(),
    pages: '',
    publisher: '',
    year: new Date().getFullYear()
  };
};

/**
 * Detect and resolve framing conflicts in content
 * @param content - The content to check for conflicts
 * @param frames - Detected frames in the content
 * @returns Resolved content or null if manual resolution is needed
 */
export const resolveFramingConflicts = (
  content: string,
  frames: Frame[]
): { resolvedContent: string } | { needsManualResolution: true; conflictingFrames: { frame1: Frame; frame2: Frame } } => {
  // Define potentially conflicting frame pairs
  const conflictingPairs: [string, string][] = [
    ['Strict Father', 'Nurturant Parent'],
    ['Freedom', 'Security'],
    ['Progress', 'Sustainability'],
    ['Individual', 'Community']
  ];
  
  // Check for conflicting frames
  for (const [frame1Name, frame2Name] of conflictingPairs) {
    const frame1 = frames.find(f => f.name === frame1Name);
    const frame2 = frames.find(f => f.name === frame2Name);
    
    if (frame1 && frame2) {
      // Found conflicting frames
      // Check if we can automatically resolve based on frame strength
      if (frame1.strength && frame2.strength) {
        // If one frame is significantly stronger, use that one
        if (frame1.strength > frame2.strength * 1.5) {
          // Frame 1 is dominant, no need for manual resolution
          return { resolvedContent: content };
        } else if (frame2.strength > frame1.strength * 1.5) {
          // Frame 2 is dominant, no need for manual resolution
          return { resolvedContent: content };
        }
      }
      
      // Frames are of similar strength, need manual resolution
      return {
        needsManualResolution: true,
        conflictingFrames: { frame1, frame2 }
      };
    }
  }
  
  // No conflicts found
  return { resolvedContent: content };
};

/**
 * Generate alternative frame suggestions based on conflicting frames
 * @param frame1 - First conflicting frame
 * @param frame2 - Second conflicting frame
 * @returns Alternative frame suggestions
 */
export const generateAlternativeFrameSuggestions = (frame1: Frame, frame2: Frame): Frame[] => {
  // Create hybrid frame that combines elements from both
  const hybridFrame: Frame = {
    name: `${frame1.name}-${frame2.name} Hybrid`,
    description: `A balanced approach combining elements of ${frame1.name} and ${frame2.name}`,
    values: [...new Set([...frame1.values.slice(0, 2), ...frame2.values.slice(0, 2)])],
    metaphors: [...new Set([...frame1.metaphors.slice(0, 2), ...frame2.metaphors.slice(0, 2)])],
    keywords: [...new Set([...frame1.keywords.slice(0, 3), ...frame2.keywords.slice(0, 3)])],
    strength: Math.max(frame1.strength || 0, frame2.strength || 0)
  };
  
  // Create alternative frames that might work better
  const alternatives: Frame[] = [
    hybridFrame,
    {
      name: 'Common Ground',
      description: 'Focus on shared values and common goals',
      values: ['cooperation', 'progress', 'shared prosperity', 'mutual benefit'],
      metaphors: ['journey together', 'building bridges', 'common path'],
      keywords: ['collaborate', 'together', 'shared', 'mutual', 'common'],
      strength: 0.8
    },
    {
      name: 'Balanced Approach',
      description: 'A pragmatic approach that balances competing concerns',
      values: ['balance', 'pragmatism', 'effectiveness', 'adaptability'],
      metaphors: ['scales of justice', 'ecosystem', 'harmony'],
      keywords: ['balance', 'practical', 'effective', 'measured', 'reasonable'],
      strength: 0.75
    }
  ];
  
  return alternatives;
};

/**
 * Validate and fix citations
 * @param citations - Citations to validate
 * @returns Validated citations and any errors
 */
export const validateAndFixCitations = (
  citations: Citation[]
): { validCitations: Citation[]; errors: CitationError[] } => {
  const validCitations: Citation[] = [];
  const errors: CitationError[] = [];
  
  citations.forEach(citation => {
    // Check for missing required fields
    if (!citation.title || citation.title === 'Unknown') {
      errors.push({
        citation,
        errorType: 'incomplete',
        suggestion: {
          ...citation,
          title: citation.source || 'Enter title'
        }
      });
      return;
    }
    
    // Check for invalid URLs
    if (citation.url && !isValidUrl(citation.url)) {
      errors.push({
        citation,
        errorType: 'invalid',
        suggestion: {
          ...citation,
          url: ''
        }
      });
      return;
    }
    
    // Citation is valid
    validCitations.push(citation);
  });
  
  return { validCitations, errors };
};

/**
 * Check if a URL is valid
 * @param url - URL to validate
 * @returns Whether the URL is valid
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Clear all error recovery data
 */
export const clearAllErrorRecoveryData = (): void => {
  Object.values(RECOVERY_CACHE_KEYS).forEach(key => {
    localStorageCache.clearCache(key);
  });
};

export default {
  saveValidationError,
  getValidationErrors,
  clearValidationErrors,
  savePartialContent,
  getPartialContent,
  clearPartialContent,
  saveFramingConflict,
  getFramingConflict,
  clearFramingConflict,
  saveCitationError,
  getCitationErrors,
  clearCitationErrors,
  processValidationResult,
  handleContentGenerationError,
  createCitationTemplate,
  resolveFramingConflicts,
  generateAlternativeFrameSuggestions,
  validateAndFixCitations,
  clearAllErrorRecoveryData
};