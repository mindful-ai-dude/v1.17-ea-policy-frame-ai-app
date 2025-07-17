import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArticleGenerator } from '../ArticleGenerator';
import { ContentGenerationEngine } from '../ContentGenerationEngine';
import type { ContentResponse } from '../ContentGenerationEngine';
import type { Citation } from '../../types';

// Mock ContentGenerationEngine
vi.mock('../ContentGenerationEngine', () => {
  const mockGenerateContent = vi.fn();
  const mockGenerateContentStream = vi.fn();
  
  return {
    ContentGenerationEngine: vi.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream
    }))
  };
});

describe('ArticleGenerator', () => {
  let articleGenerator: ArticleGenerator;
  let mockContentEngine: {
    generateContent: ReturnType<typeof vi.fn>;
    generateContentStream: ReturnType<typeof vi.fn>;
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks
    const mockGenerateContent = vi.fn().mockResolvedValue({
      content: 'Test article content',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'article',
        topic: 'AI policy',
        generationTime: 2.5,
        wordCount: 1300
      }
    });
    
    const mockGenerateContentStream = vi.fn().mockResolvedValue(new ReadableStream());
    
    vi.mocked(ContentGenerationEngine).mockImplementation(() => ({
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream
    }));
    
    articleGenerator = new ArticleGenerator();
    mockContentEngine = {
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream
    };
  });
  
  describe('generateArticle', () => {
    it('should call ContentGenerationEngine with correct parameters', async () => {
      // Mock response
      const mockResponse: ContentResponse = {
        content: 'Test article content',
        metadata: {
          model: 'gemini-2.5-pro',
          region: 'usa',
          contentType: 'article',
          topic: 'AI policy',
          generationTime: 2.5,
          wordCount: 1300
        }
      };
      
      (mockContentEngine.generateContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
      
      // Call the method
      const result = await articleGenerator.generateArticle(
        'AI policy',
        'usa',
        'gemini-2.5-pro',
        {
          policyFocus: 'ethics',
          includeCitations: true,
          storyStructure: 'problem-solution'
        }
      );
      
      // Verify ContentGenerationEngine was called with correct parameters
      expect(mockContentEngine.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            topic: expect.stringContaining('AI policy'),
            region: 'usa',
            contentType: 'article'
          }),
          model: 'gemini-2.5-pro'
        }),
        expect.objectContaining({
          applyFraming: true,
          avoidNegativeFrames: true,
          reinforcePositiveFrames: true
        }),
        expect.objectContaining({
          useReferences: true,
          includeCitations: true
        })
      );
      
      // Verify the topic was enhanced with policy focus and story structure
      const requestArg = (mockContentEngine.generateContent as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(requestArg.input.topic).toContain('[Policy Focus: ethics]');
      expect(requestArg.input.topic).toContain('[Story Structure: problem-solution]');
      
      // Verify the result
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle optional parameters correctly', async () => {
      // Mock response
      const mockResponse: ContentResponse = {
        content: 'Test article content',
        metadata: {
          model: 'gemini-2.5-pro',
          region: 'usa',
          contentType: 'article',
          topic: 'AI policy',
          generationTime: 2.5,
          wordCount: 1300
        }
      };
      
      (mockContentEngine.generateContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
      
      // Call the method with minimal parameters
      await articleGenerator.generateArticle(
        'AI policy',
        'usa',
        'gemini-2.5-pro'
      );
      
      // Verify ContentGenerationEngine was called with correct parameters
      expect(mockContentEngine.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            topic: 'AI policy',
            region: 'usa',
            contentType: 'article'
          }),
          model: 'gemini-2.5-pro'
        }),
        expect.any(Object),
        expect.any(Object)
      );
    });
  });
  
  describe('generateArticleStream', () => {
    it('should call ContentGenerationEngine.generateContentStream with correct parameters', async () => {
      // Mock response
      const mockStream = new ReadableStream();
      (mockContentEngine.generateContentStream as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream);
      
      // Call the method
      const result = await articleGenerator.generateArticleStream(
        'AI policy',
        'europe',
        'gemini-2.5-pro',
        {
          policyFocus: 'regulation',
          includeFactChecking: true
        }
      );
      
      // Verify ContentGenerationEngine was called with correct parameters
      expect(mockContentEngine.generateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            topic: expect.stringContaining('AI policy'),
            region: 'europe',
            contentType: 'article'
          }),
          model: 'gemini-2.5-pro'
        }),
        expect.any(Object),
        expect.any(Object)
      );
      
      // Verify the topic was enhanced with policy focus and fact-checking
      const requestArg = (mockContentEngine.generateContentStream as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(requestArg.input.topic).toContain('[Policy Focus: regulation]');
      expect(requestArg.input.topic).toContain('[Include Fact-Checking]');
      
      // Verify the result
      expect(result).toBe(mockStream);
    });
  });
  
  describe('formatArticle', () => {
    it('should format article with proper structure', () => {
      const rawContent = 'AI Policy Implications\n\nThis is the first paragraph.\n\nThis is the second paragraph.';
      const citations: Citation[] = [
        {
          source: 'Journal of AI Ethics',
          title: 'The Future of AI Governance',
          author: 'Jane Smith',
          url: 'https://example.com/article',
          accessDate: new Date('2025-01-15')
        }
      ];
      
      // Mock the ensureArticleStructure method to add the title properly
      const ensureArticleStructureSpy = vi.spyOn(
        ArticleGenerator.prototype as any, 
        'ensureArticleStructure'
      ).mockImplementation((content) => {
        return `# AI Policy Implications\n\n${content}`;
      });
      
      const formatted = articleGenerator.formatArticle(rawContent, citations, {
        includeExecutiveSummary: true,
        includeTableOfContents: true,
        includeRecommendations: true
      });
      
      // Check that the formatted content has the expected sections
      expect(formatted).toContain('# AI Policy Implications');
      expect(formatted).toContain('## Executive Summary');
      expect(formatted).toContain('## Table of Contents');
      expect(formatted).toContain('## Recommendations');
      expect(formatted).toContain('## References');
      expect(formatted).toContain('The Future of AI Governance by Jane Smith');
      
      // Restore the original method
      ensureArticleStructureSpy.mockRestore();
    });
    
    it('should preserve existing structure if present', () => {
      const structuredContent = '# AI Policy Article\n\n## Introduction\n\nThis is the introduction.\n\n## Analysis\n\nThis is the analysis.';
      
      const formatted = articleGenerator.formatArticle(structuredContent);
      
      // Check that the existing structure is preserved
      expect(formatted).toBe(structuredContent);
    });
  });
  
  describe('factCheckArticle', () => {
    it('should add fact-checking annotations to content', async () => {
      const content = 'The EU AI Act was approved in 2024. AI systems will replace 40% of jobs by 2030.';
      
      const result = await articleGenerator.factCheckArticle(content);
      
      // Check that annotations were added
      expect(result.content).toContain('[Verified:');
      expect(result.content).toContain('[Note:');
      expect(result.factCheckResults.verified.length).toBeGreaterThan(0);
      expect(result.factCheckResults.unverified.length).toBeGreaterThan(0);
    });
  });
});