import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../utils/api';
import type { ModelCapability } from '../services/GeminiService';
import { geminiService } from '../services/GeminiService';
import type { GeminiModel } from '../types';
import { validateApiKeyFormat, securelyStoreTemporary, retrieveSecureTemporary, clearSecureTemporary } from '../utils/encryption';
import { ApiError, ApiErrorType } from '../utils/apiErrorHandling';

const API_KEY_STORAGE_KEY = 'gemini_api_key_temp';

/**
 * Hook for managing Gemini API interactions
 */
export const useGeminiApi = () => {
  // State
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-pro');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Convex mutations and queries
  const storeApiKey = useMutation(api.auth.encryptAndStoreApiKey);
  const getApiKeyInfo = useQuery(api.auth.getApiKey);
  const deleteStoredApiKey = useMutation(api.auth.deleteApiKey);
  
  /**
   * Initialize the API service with the stored key if available
   */
  useEffect(() => {
    const initializeApiKey = async () => {
      // First check session storage for temporary key
      const tempKey = retrieveSecureTemporary(API_KEY_STORAGE_KEY);
      
      if (tempKey) {
        geminiService.setApiKey(tempKey);
        const isValid = await geminiService.validateApiKey();
        setIsApiKeyValid(isValid);
        return;
      }
      
      // If no temporary key, check if we have a stored key indicator from Convex
      if (getApiKeyInfo?.hasKey) {
        setIsApiKeyValid(true);
      } else {
        setIsApiKeyValid(false);
      }
    };
    
    initializeApiKey();
  }, [getApiKeyInfo]);
  
  /**
   * Set and validate a new API key
   */
  const setApiKey = useCallback(async (apiKey: string): Promise<boolean> => {
    setError(null);
    setIsValidating(true);
    
    try {
      // Validate format first
      if (!validateApiKeyFormat(apiKey)) {
        setError('Invalid API key format. Google API keys typically start with "AIza" and are 39 characters long.');
        setIsApiKeyValid(false);
        return false;
      }
      
      // Set the key in the service
      geminiService.setApiKey(apiKey);
      
      // Validate with the API
      const isValid = await geminiService.validateApiKey();
      setIsApiKeyValid(isValid);
      
      if (isValid) {
        // Store in session storage temporarily
        securelyStoreTemporary(API_KEY_STORAGE_KEY, apiKey);
        
        // Store encrypted in Convex
        await storeApiKey({ apiKey });
        
        return true;
      } else {
        setError('API key validation failed. Please check your key and try again.');
        return false;
      }
    } catch (err) {
      // Convert to ApiError if needed
      const apiError = err instanceof ApiError ? err : ApiError.fromError(err);
      
      // Set user-friendly error message
      setError(apiError.getUserFriendlyMessage());
      setIsApiKeyValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [storeApiKey]);
  
  /**
   * Clear the stored API key
   */
  const clearApiKey = useCallback(async (): Promise<void> => {
    try {
      // Clear from service
      geminiService.clearApiKey();
      
      // Clear from session storage
      clearSecureTemporary(API_KEY_STORAGE_KEY);
      
      // Clear from Convex
      await deleteStoredApiKey();
      
      setIsApiKeyValid(false);
    } catch (err) {
      // Convert to ApiError if needed
      const apiError = err instanceof ApiError ? err : ApiError.fromError(err);
      setError(apiError.getUserFriendlyMessage());
    }
  }, [deleteStoredApiKey]);
  
  /**
   * Get available models and their capabilities
   */
  const getModelCapabilities = useCallback((): ModelCapability[] => {
    return geminiService.getModelCapabilities();
  }, []);
  
  /**
   * Get capabilities for the currently selected model
   */
  const getCurrentModelCapability = useCallback((): ModelCapability => {
    return geminiService.getModelCapability(selectedModel);
  }, [selectedModel]);
  
  /**
   * Change the selected model
   */
  const changeModel = useCallback((model: GeminiModel): void => {
    setSelectedModel(model);
  }, []);
  
  return {
    selectedModel,
    isApiKeyValid,
    isValidating,
    error,
    hasStoredKey: getApiKeyInfo?.hasKey || false,
    maskedKey: getApiKeyInfo?.maskedKey || null,
    setApiKey,
    clearApiKey,
    getModelCapabilities,
    getCurrentModelCapability,
    changeModel,
    geminiService
  };
};

export default useGeminiApi;