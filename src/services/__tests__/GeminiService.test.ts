import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService, MODEL_CAPABILITIES } from '../GeminiService';
import { GeminiModel } from '../../types';

// Mock fetch
global.fetch = vi.fn();

describe('GeminiService', () => {
  let service: GeminiService;
  
  beforeEach(() => {
    service = new GeminiService();
    vi.resetAllMocks();
  });
  
  describe('API Key Management', () => {
    it('should set and clear API key', () => {
      expect(service.hasApiKey()).toBe(false);
      
      service.setApiKey('test-api-key');
      expect(service.hasApiKey()).toBe(true);
      
      service.clearApiKey();
      expect(service.hasApiKey()).toBe(false);
    });
    
    it('should validate API key', async () => {
      service.setApiKey('test-api-key');
      
      // Mock successful validation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'gemini-2.5-flash' })
      });
      
      const isValid = await service.validateApiKey();
      expect(isValid).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('models/gemini-2.5-flash?key=test-api-key')
      );
    });
    
    it('should handle invalid API key', async () => {
      service.setApiKey('invalid-key');
      
      // Mock failed validation
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: { message: 'Invalid API key' } })
      });
      
      const isValid = await service.validateApiKey();
      expect(isValid).toBe(false);
    });
  });
  
  describe('Model Capabilities', () => {
    it('should return all model capabilities', () => {
      const capabilities = service.getModelCapabilities();
      expect(capabilities).toHaveLength(3);
      expect(capabilities[0].name).toBe('gemini-2.5-pro');
      expect(capabilities[1].name).toBe('gemini-2.5-flash');
      expect(capabilities[2].name).toBe('gemma-3-12b-it');
    });
    
    it('should return specific model capability', () => {
      const capability = service.getModelCapability('gemini-2.5-pro');
      expect(capability).toBe(MODEL_CAPABILITIES['gemini-2.5-pro']);
    });
  });
  
  describe('Content Generation', () => {
    it('should generate content', async () => {
      service.setApiKey('test-api-key');
      
      // Mock successful content generation
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Generated content' }]
              },
              finishReason: 'STOP'
            }
          ]
        })
      });
      
      const content = await service.generateContent('Test prompt', {
        model: 'gemini-2.5-pro'
      });
      
      expect(content).toBe('Generated content');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('models/gemini-2.5-pro:generateContent'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );
    });
    
    it('should throw error when API key is not set', async () => {
      await expect(
        service.generateContent('Test prompt', { model: 'gemini-2.5-pro' })
      ).rejects.toThrow('API key not set');
    });
    
    it('should handle API errors', async () => {
      service.setApiKey('test-api-key');
      
      // Mock API error
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 400,
            message: 'Invalid request',
            status: 'INVALID_ARGUMENT'
          }
        })
      });
      
      await expect(
        service.generateContent('Test prompt', { model: 'gemini-2.5-pro' })
      ).rejects.toThrow('API Error: Invalid request');
    });
  });
  
  describe('Prompt Optimization', () => {
    it('should create optimized prompts for different models', () => {
      const basePrompt = 'Generate content about AI policy';
      
      const proPrompt = service.createOptimizedPrompt(basePrompt, 'gemini-2.5-pro');
      const flashPrompt = service.createOptimizedPrompt(basePrompt, 'gemini-2.5-flash');
      const gemmaPrompt = service.createOptimizedPrompt(basePrompt, 'gemma-3-12b-it');
      
      expect(proPrompt).toContain('Additional instructions for Gemini 2.5 Pro');
      expect(flashPrompt).toContain('Additional instructions for Gemini 2.5 Flash');
      expect(gemmaPrompt).toContain('Additional instructions for Gemma 3');
      
      // All prompts should contain the base instructions
      expect(proPrompt).toContain(basePrompt);
      expect(flashPrompt).toContain(basePrompt);
      expect(gemmaPrompt).toContain(basePrompt);
    });
  });
});