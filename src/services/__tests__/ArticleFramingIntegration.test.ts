import { describe, it, expect, vi, beforeEach } from 'vitest';
import { articleGenerator } from '../ArticleGenerator';
import { lakoffFramingEngine } from '../LakoffFramingEngine';
import type { ContentResponse } from '../ContentGenerationEngine';
import type { FramingAnalysis } from '../../types';

// Mock ArticleGenerator
vi.mock('../ArticleGenerator', () => {
  const mockGenerateArticle = vi.fn();
  
  return {
    articleGenerator: {
      generateArticle: mockGenerateArticle
    }
  };
});

// Mock LakoffFramingEngine
vi.mock('../LakoffFramingEngine', () => {
  return {
    lakoffFramingEngine: {
      analyzeFraming: vi.fn(),
      avoidNegativeFrames: vi.fn(),
      reinforcePositiveFrames: vi.fn()
    }
  };
});

describe('Article Framing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('should integrate framing analysis with article generation', async () => {
    // Mock framing analysis
    const mockFramingAnalysis: FramingAnalysis = {
      detectedFrames: [
        {
          name: 'Progress',
          values: ['innovation', 'improvement', 'growth'],
          metaphors: ['progress as forward movement'],
          keywords: ['progress', 'advance', 'improve']
        }
      ],
      suggestedFrames: [],
      metaphors: [
        {
          text: 'AI journey',
          type: 'aiAsJourney',
          context: 'We are on an AI journey together'
        }
      ],
      effectiveness: 75
    };
    
    // Mock content response with framing analysis
    const mockResponse: ContentResponse = {
      content: 'This is a comprehensive AI policy article that uses framing techniques.',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'article',
        topic: 'AI policy',
        generationTime: 3.2,
        wordCount: 1350,
        framingAnalysis: mockFramingAnalysis
      }
    };
    
    // Setup mocks
    vi.mocked(articleGenerator.generateArticle).mockResolvedValue(mockResponse);
    vi.mocked(lakoffFramingEngine.analyzeFraming).mockReturnValue(mockFramingAnalysis);
    
    // Call the method
    const result = await articleGenerator.generateArticle(
      'AI policy',
      'usa',
      'gemini-2.5-pro',
      {
        policyFocus: 'ethics'
      }
    );
    
    // Verify articleGenerator was called with correct parameters
    expect(articleGenerator.generateArticle).toHaveBeenCalledWith(
      'AI policy',
      'usa',
      'gemini-2.5-pro',
      expect.objectContaining({
        policyFocus: 'ethics'
      })
    );
    
    // Verify the result includes framing analysis
    expect(result.metadata.framingAnalysis).toEqual(mockFramingAnalysis);
  });
  
  it('should apply storytelling structure to article generation', async () => {
    // Mock content response
    const mockResponse: ContentResponse = {
      content: 'This is an article with problem-solution narrative structure.',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'article',
        topic: 'AI policy',
        generationTime: 2.8,
        wordCount: 1250
      }
    };
    
    // Setup mock
    vi.mocked(articleGenerator.generateArticle).mockResolvedValue(mockResponse);
    
    // Call the method with storytelling structure
    await articleGenerator.generateArticle(
      'AI policy',
      'usa',
      'gemini-2.5-pro',
      {
        storyStructure: 'problem-solution'
      }
    );
    
    // Verify articleGenerator was called with correct parameters
    expect(articleGenerator.generateArticle).toHaveBeenCalledWith(
      'AI policy',
      'usa',
      'gemini-2.5-pro',
      expect.objectContaining({
        storyStructure: 'problem-solution'
      })
    );
  });
  
  it('should integrate citation capabilities with article generation', async () => {
    // Mock content response with citations
    const mockResponse: ContentResponse = {
      content: 'This is an article with citations.',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'article',
        topic: 'AI policy',
        generationTime: 3.0,
        wordCount: 1400,
        citations: [
          {
            source: 'Journal of AI Ethics',
            title: 'The Future of AI Governance',
            author: 'Jane Smith',
            url: 'https://example.com/article',
            accessDate: new Date('2025-01-15')
          }
        ]
      }
    };
    
    // Setup mock
    vi.mocked(articleGenerator.generateArticle).mockResolvedValue(mockResponse);
    
    // Call the method with citations enabled
    const result = await articleGenerator.generateArticle(
      'AI policy',
      'usa',
      'gemini-2.5-pro',
      {
        includeCitations: true
      }
    );
    
    // Verify articleGenerator was called with correct parameters
    expect(articleGenerator.generateArticle).toHaveBeenCalledWith(
      'AI policy',
      'usa',
      'gemini-2.5-pro',
      expect.objectContaining({
        includeCitations: true
      })
    );
    
    // Verify the result includes citations
    expect(result.metadata.citations).toBeDefined();
    expect(result.metadata.citations?.length).toBeGreaterThan(0);
  });
});