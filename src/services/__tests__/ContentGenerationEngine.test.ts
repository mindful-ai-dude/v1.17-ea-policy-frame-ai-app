import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentGenerationEngine } from '../ContentGenerationEngine';
import { geminiService } from '../GeminiService';
import { lakoffFramingEngine } from '../LakoffFramingEngine';
import { FileReferenceService } from '../FileReferenceService';
import { geographicContextService } from '../GeographicContextService';
import { Region, ContentType, GeminiModel } from '../../types';
import { ApiError, ApiErrorType } from '../../utils/apiErrorHandling';

// Mock the dependencies
vi.mock('../GeminiService', () => ({
  geminiService: {
    hasApiKey: vi.fn(),
    createOptimizedPrompt: vi.fn((prompt, model) => `Optimized for ${model}: ${prompt}`),
    generateContent: vi.fn(),
    generateContentStream: vi.fn(),
    processStream: vi.fn()
  }
}));

vi.mock('../LakoffFramingEngine', () => ({
  lakoffFramingEngine: {
    analyzeFraming: vi.fn(),
    reframeContent: vi.fn((content, frame) => `Reframed with ${frame.name}: ${content}`),
    extractMetaphors: vi.fn(),
    avoidNegativeFrames: vi.fn(content => `Avoided negative frames: ${content}`),
    reinforcePositiveFrames: vi.fn(content => `Reinforced positive frames: ${content}`)
  }
}));

vi.mock('../FileReferenceService', () => {
  return {
    FileReferenceService: vi.fn().mockImplementation(() => ({
      searchDocuments: vi.fn(),
      extractContent: vi.fn(),
      findRelevantExamples: vi.fn(),
      generateCitations: vi.fn()
    }))
  };
});

vi.mock('../GeographicContextService', () => ({
  geographicContextService: {
    getRegionalContext: vi.fn()
  }
}));

// Mock contentErrorRecovery
vi.mock('../../utils/contentErrorRecovery', () => ({
  processValidationResult: vi.fn(result => ({ ...result, fieldErrors: {} })),
  getPartialContent: vi.fn(),
  clearPartialContent: vi.fn(),
  savePartialContent: vi.fn(),
  resolveFramingConflicts: vi.fn(),
  generateAlternativeFrameSuggestions: vi.fn(),
  saveFramingConflict: vi.fn(),
  validateAndFixCitations: vi.fn(citations => ({ validCitations: citations, errors: [] })),
  saveCitationError: vi.fn(),
  handleContentGenerationError: vi.fn()
}));

describe('ContentGenerationEngine', () => {
  let engine: ContentGenerationEngine;
  
  beforeEach(() => {
    engine = new ContentGenerationEngine();
    vi.resetAllMocks();
  });
  
  describe('Input Validation', () => {
    it('should validate valid input', () => {
      const input = {
        topic: 'AI Safety',
        region: 'usa' as Region,
        contentType: 'blog' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject empty topic', () => {
      const input = {
        topic: '',
        region: 'usa' as Region,
        contentType: 'blog' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic is required');
    });
    
    it('should reject invalid URL', () => {
      const input = {
        topic: 'AI Safety',
        url: 'not-a-url',
        region: 'usa' as Region,
        contentType: 'blog' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('URL is not valid');
    });
    
    it('should accept valid URL', () => {
      const input = {
        topic: 'AI Safety',
        url: 'https://example.com',
        region: 'usa' as Region,
        contentType: 'blog' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(true);
    });
    
    it('should reject invalid region', () => {
      const input = {
        topic: 'AI Safety',
        region: 'invalid' as Region,
        contentType: 'blog' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Region must be one of: usa, europe, australia, morocco');
    });
    
    it('should reject invalid content type', () => {
      const input = {
        topic: 'AI Safety',
        region: 'usa' as Region,
        contentType: 'invalid' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content type must be one of: blog, article, playbook, social');
    });

    it('should reject topic that is too short', () => {
      const input = {
        topic: 'AI',
        region: 'usa' as Region,
        contentType: 'blog' as ContentType
      };
      
      const result = engine.validateInput(input);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic must be at least 3 characters');
    });
  });
  
  describe('Geographic Context', () => {
    it('should apply USA context', async () => {
      // Mock the geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const result = await engine.applyGeographicContext('AI Safety', 'usa');
      expect(result).toContain('AI Safety');
      expect(result).toContain('United States context');
      expect(result).toContain('Federal initiatives');
    });
    
    it('should apply Europe context', async () => {
      // Mock the geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const result = await engine.applyGeographicContext('AI Safety', 'europe');
      expect(result).toContain('AI Safety');
      expect(result).toContain('European context');
      expect(result).toContain('EU AI Act');
    });
    
    it('should apply Australia context', async () => {
      // Mock the geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const result = await engine.applyGeographicContext('AI Safety', 'australia');
      expect(result).toContain('AI Safety');
      expect(result).toContain('Australian context');
      expect(result).toContain('AI Ethics Framework');
    });
    
    it('should apply Morocco context', async () => {
      // Mock the geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const result = await engine.applyGeographicContext('AI Safety', 'morocco');
      expect(result).toContain('AI Safety');
      expect(result).toContain('Moroccan context');
      expect(result).toContain('Digital Morocco');
    });

    it('should use GeographicContextService when available', async () => {
      // Mock the geographicContextService with successful response
      (geographicContextService.getRegionalContext as any).mockResolvedValue({
        policyFramework: {
          description: 'Custom policy framework',
          keyPrinciples: ['Principle 1', 'Principle 2']
        },
        culturalNotes: ['Cultural note 1', 'Cultural note 2', 'Cultural note 3'],
        recentDevelopments: [
          { title: 'Development 1', description: 'Description 1' },
          { title: 'Development 2', description: 'Description 2' }
        ]
      });
      
      const result = await engine.applyGeographicContext('AI Safety', 'usa');
      expect(result).toContain('AI Safety');
      expect(result).toContain('Custom policy framework');
      expect(result).toContain('Principle 1');
      expect(result).toContain('Cultural note 1');
      expect(result).toContain('Development 1');
    });
  });
  
  describe('Content Type Prompts', () => {
    it('should create blog post prompt', () => {
      const result = engine.createContentTypePrompt('blog', 'AI Safety');
      expect(result).toContain('short daily blog post (500-800 words)');
      expect(result).toContain('AI Safety');
      expect(result).toContain('George Lakoff');
    });
    
    it('should create article prompt', () => {
      const result = engine.createContentTypePrompt('article', 'AI Safety');
      expect(result).toContain('comprehensive AI policy article (1200-1500 words)');
      expect(result).toContain('AI Safety');
      expect(result).toContain('storytelling elements');
    });
    
    it('should create playbook prompt', () => {
      const result = engine.createContentTypePrompt('playbook', 'AI Safety');
      expect(result).toContain('marketing playbook');
      expect(result).toContain('AI Safety');
      expect(result).toContain('Seth Godin');
      expect(result).toContain('Gary Vaynerchuk');
    });
    
    it('should create social media calendar prompt', () => {
      const result = engine.createContentTypePrompt('social', 'AI Safety');
      expect(result).toContain('one-month social media calendar');
      expect(result).toContain('AI Safety');
      expect(result).toContain('20 post ideas');
    });
  });

  describe('Document Reference Integration', () => {
    it('should find relevant documents', async () => {
      const mockDocuments = [
        { id: 'doc1', title: 'Document 1', content: 'Content 1' },
        { id: 'doc2', title: 'Document 2', content: 'Content 2' }
      ];
      
      const mockExamples = [
        { text: 'Example 1', source: 'Document 1', documentId: 'doc1' },
        { text: 'Example 2', source: 'Document 2', documentId: 'doc2' }
      ];
      
      const mockCitations = [
        { title: 'Document 1', author: 'Author 1', source: 'Source 1', accessDate: new Date() },
        { title: 'Document 2', author: 'Author 2', source: 'Source 2', accessDate: new Date() }
      ];
      
      // Mock FileReferenceService methods
      const fileServiceInstance = new FileReferenceService() as any;
      fileServiceInstance.searchDocuments.mockResolvedValue(mockDocuments);
      fileServiceInstance.findRelevantExamples.mockResolvedValue(mockExamples);
      fileServiceInstance.generateCitations.mockResolvedValue(mockCitations);
      
      const result = await engine.findRelevantDocuments('AI Safety', {
        useReferences: true,
        maxReferences: 2,
        preferSemanticSearch: true,
        includeCitations: true,
        includeExamples: true
      });
      
      expect(result.documents).toEqual(mockDocuments);
      expect(result.examples).toEqual(mockExamples);
      expect(result.citations).toEqual(mockCitations);
      expect(fileServiceInstance.searchDocuments).toHaveBeenCalledWith('AI Safety', true);
    });

    it('should return empty results when useReferences is false', async () => {
      const result = await engine.findRelevantDocuments('AI Safety', {
        useReferences: false
      });
      
      expect(result.documents).toEqual([]);
      expect(result.examples).toEqual([]);
      expect(result.citations).toEqual([]);
    });

    it('should enhance prompt with document references', () => {
      const prompt = 'Generate content about AI Safety';
      const examples = [
        { text: 'Example text 1', source: 'Document 1' },
        { text: 'Example text 2', source: 'Document 2' }
      ];
      
      const enhancedPrompt = engine.enhancePromptWithDocumentReferences(prompt, examples);
      
      expect(enhancedPrompt).toContain(prompt);
      expect(enhancedPrompt).toContain('Consider these relevant examples');
      expect(enhancedPrompt).toContain('Example 1 (from Document 1)');
      expect(enhancedPrompt).toContain('Example text 1');
      expect(enhancedPrompt).toContain('Example 2 (from Document 2)');
      expect(enhancedPrompt).toContain('Example text 2');
    });

    it('should not modify prompt when no examples are provided', () => {
      const prompt = 'Generate content about AI Safety';
      const enhancedPrompt = engine.enhancePromptWithDocumentReferences(prompt, []);
      
      expect(enhancedPrompt).toBe(prompt);
    });

    it('should add citations to content', () => {
      const content = 'Generated content about AI Safety';
      const citations = [
        {
          title: 'Document 1',
          author: 'Author 1',
          url: 'https://example.com/doc1',
          accessDate: new Date('2025-07-16')
        },
        {
          title: 'Document 2',
          author: 'Author 2',
          accessDate: new Date('2025-07-16')
        }
      ];
      
      const contentWithCitations = engine.addCitationsToContent(content, citations);
      
      expect(contentWithCitations).toContain(content);
      expect(contentWithCitations).toContain('## References');
      expect(contentWithCitations).toContain('1. Document 1 by Author 1');
      expect(contentWithCitations).toContain('Available at: https://example.com/doc1');
      expect(contentWithCitations).toContain('2. Document 2 by Author 2');
    });

    it('should not modify content when no citations are provided', () => {
      const content = 'Generated content about AI Safety';
      const contentWithCitations = engine.addCitationsToContent(content, []);
      
      expect(contentWithCitations).toBe(content);
    });
  });
  
  describe('Content Generation', () => {
    it('should generate content successfully', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(true);
      
      // Mock content generation
      (geminiService.generateContent as any).mockResolvedValue('Generated content for AI Safety');
      
      // Mock Date.now to ensure consistent generationTime
      const originalDateNow = Date.now;
      Date.now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(2000);
      
      // Mock lakoffFramingEngine
      (lakoffFramingEngine.analyzeFraming as any).mockReturnValue({
        detectedFrames: [{ name: 'Progress', values: ['innovation'] }],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 75
      });
      
      // Mock geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      const result = await engine.generateContent(request);
      
      // Restore Date.now
      Date.now = originalDateNow;
      
      expect(result.content).toBe('Generated content for AI Safety');
      expect(result.metadata.model).toBe('gemini-2.5-pro');
      expect(result.metadata.region).toBe('usa');
      expect(result.metadata.contentType).toBe('blog');
      expect(result.metadata.topic).toBe('AI Safety');
      expect(result.metadata.generationTime).toBe(1); // 2000 - 1000 = 1000ms = 1s
      expect(result.metadata.wordCount).toBe(5); // "Generated content for AI Safety"
      
      // Verify the prompt creation flow
      expect(geminiService.createOptimizedPrompt).toHaveBeenCalled();
      expect(geminiService.generateContent).toHaveBeenCalled();
    });
    
    it('should throw error when input is invalid', async () => {
      const request = {
        input: {
          topic: '', // Invalid - empty topic
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      await expect(engine.generateContent(request)).rejects.toThrow('Invalid input');
    });
    
    it('should throw error when API key is not set', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(false);
      
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      await expect(engine.generateContent(request)).rejects.toThrow('API key not set');
    });

    it('should use partial content if available', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(true);
      
      // Mock partial content
      const partialContent = 'Partial content from previous attempt';
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      // Mock getPartialContent to return matching partial content
      const contentErrorRecovery = require('../../utils/contentErrorRecovery');
      contentErrorRecovery.getPartialContent.mockReturnValue({
        content: partialContent,
        request: request,
        timestamp: Date.now(),
        recoveryAttempts: 1
      });
      
      // Mock lakoffFramingEngine
      (lakoffFramingEngine.analyzeFraming as any).mockReturnValue({
        detectedFrames: [],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 50
      });
      
      // Mock geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const result = await engine.generateContent(request);
      
      // Should use partial content instead of generating new content
      expect(geminiService.generateContent).not.toHaveBeenCalled();
      expect(result.content).toBe(partialContent);
      expect(contentErrorRecovery.clearPartialContent).toHaveBeenCalled();
    });

    it('should apply framing techniques when requested', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(true);
      
      // Mock content generation
      (geminiService.generateContent as any).mockResolvedValue('Generated content');
      
      // Mock lakoffFramingEngine
      (lakoffFramingEngine.analyzeFraming as any).mockReturnValue({
        detectedFrames: [{ name: 'Progress', values: ['innovation'] }],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 75
      });
      
      // Mock avoidNegativeFrames
      (lakoffFramingEngine.avoidNegativeFrames as any).mockReturnValue('Content with negative frames avoided');
      
      // Mock reinforcePositiveFrames
      (lakoffFramingEngine.reinforcePositiveFrames as any).mockReturnValue('Content with positive frames reinforced');
      
      // Mock geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      const framingOptions = {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: true,
        assessQuality: true
      };
      
      const result = await engine.generateContent(request, framingOptions);
      
      expect(lakoffFramingEngine.avoidNegativeFrames).toHaveBeenCalled();
      expect(lakoffFramingEngine.reinforcePositiveFrames).toHaveBeenCalled();
      expect(result.metadata.framingAnalysis).toBeDefined();
    });

    it('should apply target frame when specified', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(true);
      
      // Mock content generation
      (geminiService.generateContent as any).mockResolvedValue('Generated content');
      
      // Mock lakoffFramingEngine
      (lakoffFramingEngine.analyzeFraming as any).mockReturnValue({
        detectedFrames: [],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 50
      });
      
      // Mock reframeContent
      (lakoffFramingEngine.reframeContent as any).mockReturnValue('Content reframed with target frame');
      
      // Mock geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      const targetFrame = {
        name: 'Nurturant Parent',
        values: ['care', 'empathy'],
        metaphors: ['family'],
        keywords: ['care', 'protect']
      };
      
      const framingOptions = {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: false,
        targetFrame: targetFrame
      };
      
      const result = await engine.generateContent(request, framingOptions);
      
      expect(lakoffFramingEngine.reframeContent).toHaveBeenCalledWith(expect.any(String), targetFrame);
      expect(result.content).toBe('Content reframed with target frame');
    });
  });

  describe('Framing Techniques', () => {
    it('should apply framing techniques to content', async () => {
      // Mock lakoffFramingEngine
      (lakoffFramingEngine.analyzeFraming as any).mockReturnValue({
        detectedFrames: [{ name: 'Progress', values: ['innovation'] }],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 75
      });
      
      const content = 'Original content';
      const options = {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: true
      };
      
      const result = await engine.applyFramingTechniques(content, options);
      
      expect(lakoffFramingEngine.avoidNegativeFrames).toHaveBeenCalledWith(content);
      expect(lakoffFramingEngine.reinforcePositiveFrames).toHaveBeenCalled();
    });

    it('should optimize value-based language', () => {
      const content = 'Content about AI';
      const analysis = {
        detectedFrames: [
          {
            name: 'Progress',
            values: ['innovation', 'growth', 'improvement'],
            metaphors: [],
            keywords: []
          }
        ],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 50
      };
      
      const result = engine.optimizeValueBasedLanguage(content, analysis);
      
      // Should add value-based language
      expect(result.length).toBeGreaterThan(content.length);
      expect(result).toContain('prioritize');
      expect(result).toContain('innovation');
    });

    it('should replace conceptual metaphors', () => {
      const content = 'AI thinks like a human and we are in an AI race with other nations.';
      const analysis = {
        detectedFrames: [],
        suggestedFrames: [],
        metaphors: [
          { text: 'AI thinks', type: 'aiAsActor', context: 'AI thinks like a human' },
          { text: 'AI race', type: 'aiAsRace', context: 'AI race with other nations' }
        ],
        effectiveness: 40
      };
      
      const result = engine.replaceConceptualMetaphors(content, analysis);
      
      // Should replace problematic metaphors
      expect(result).not.toContain('AI thinks like a human');
      expect(result).not.toContain('AI race');
      expect(result).toContain('AI processes information');
      expect(result).toContain('AI development journey');
    });

    it('should assess framing quality', () => {
      // Mock lakoffFramingEngine
      (lakoffFramingEngine.analyzeFraming as any).mockReturnValue({
        detectedFrames: [
          { name: 'Progress', values: ['innovation', 'growth'], keywords: ['progress', 'advance'] },
          { name: 'Fairness', values: ['equality', 'justice'], keywords: ['fair', 'equal'] }
        ],
        suggestedFrames: [],
        metaphors: [{ text: 'AI journey', type: 'aiAsJourney', context: 'AI journey' }],
        effectiveness: 75
      });
      
      const content = 'Content with good framing about innovation, growth, equality, and justice.';
      
      const assessment = engine.assessFramingQuality(content);
      
      expect(assessment.score).toBe(75);
      expect(assessment.feedback.length).toBeGreaterThan(0);
      expect(assessment.feedback[0]).toContain('Good framing');
      expect(assessment.suggestedImprovements.length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle content generation errors', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(true);
      
      // Mock content generation to throw error
      const apiError = new ApiError('Rate limit exceeded', ApiErrorType.RATE_LIMIT, 429, undefined, true);
      (geminiService.generateContent as any).mockRejectedValue(apiError);
      
      // Mock error handling
      const contentErrorRecovery = require('../../utils/contentErrorRecovery');
      contentErrorRecovery.handleContentGenerationError.mockReturnValue({
        apiError,
        recoveryOptions: {
          canRetry: true,
          canSavePartial: false,
          suggestedAction: 'Wait and try again'
        }
      });
      
      // Mock geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      await expect(engine.generateContent(request)).rejects.toBeInstanceOf(ApiError);
      expect(contentErrorRecovery.handleContentGenerationError).toHaveBeenCalled();
    });

    it('should handle framing errors gracefully', async () => {
      // Mock API key check
      (geminiService.hasApiKey as any).mockReturnValue(true);
      
      // Mock content generation
      (geminiService.generateContent as any).mockResolvedValue('Generated content');
      
      // Mock lakoffFramingEngine to throw error
      (lakoffFramingEngine.analyzeFraming as any).mockImplementation(() => {
        throw new Error('Framing analysis failed');
      });
      
      // Mock geographicContextService
      (geographicContextService.getRegionalContext as any).mockRejectedValue(new Error('Service unavailable'));
      
      const request = {
        input: {
          topic: 'AI Safety',
          region: 'usa' as Region,
          contentType: 'blog' as ContentType
        },
        model: 'gemini-2.5-pro' as GeminiModel
      };
      
      const framingOptions = {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: true
      };
      
      // Should not throw error despite framing failure
      const result = await engine.generateContent(request, framingOptions);
      
      // Should still return content
      expect(result.content).toBe('Generated content');
      // Should not have framing analysis
      expect(result.metadata.framingAnalysis).toBeUndefined();
    });
  });
});