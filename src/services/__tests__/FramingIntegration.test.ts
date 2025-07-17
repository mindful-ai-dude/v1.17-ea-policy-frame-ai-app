import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contentGenerationEngine } from '../ContentGenerationEngine';
import { FileReferenceService } from '../FileReferenceService';
import { BlogPostGenerator } from '../BlogPostGenerator';
import { Document, Citation } from '../../types';

// Mock the FileReferenceService
vi.mock('../FileReferenceService', () => {
  return {
    FileReferenceService: vi.fn().mockImplementation(() => ({
      searchDocuments: vi.fn(),
      extractContent: vi.fn(),
      findRelevantExamples: vi.fn(),
      generateCitations: vi.fn(),
      uploadFile: vi.fn(),
      extractMetaphors: vi.fn(),
      addFramingExamples: vi.fn(),
      getUserDocuments: vi.fn(),
      deleteDocument: vi.fn(),
    }))
  };
});

// Mock the GeminiService
vi.mock('../GeminiService', () => {
  return {
    geminiService: {
      hasApiKey: vi.fn().mockReturnValue(true),
      createOptimizedPrompt: vi.fn(prompt => `Optimized: ${prompt}`),
      generateContent: vi.fn().mockResolvedValue('Generated content'),
      generateContentStream: vi.fn(),
      processStream: vi.fn(),
    }
  };
});

// Mock the LakoffFramingEngine
vi.mock('../LakoffFramingEngine', () => {
  return {
    lakoffFramingEngine: {
      analyzeFraming: vi.fn().mockReturnValue({
        detectedFrames: [],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 75
      }),
      avoidNegativeFrames: vi.fn(content => content),
      reframeContent: vi.fn(content => content),
      reinforcePositiveFrames: vi.fn(content => content),
    },
    NEGATIVE_FRAMES: {
      'AI as Threat': ['AI threat', 'AI danger', 'AI risk'],
      'AI as Competitor': ['AI race', 'AI competition', 'AI dominance'],
    }
  };
});

// Mock the BlogPostGenerator
vi.mock('../BlogPostGenerator', () => {
  const mockBlogPostGenerator = {
    generateBlogPost: vi.fn().mockResolvedValue({
      content: 'Generated blog post content',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'blog',
        topic: 'AI Policy',
        generationTime: 2.5,
        wordCount: 650
      }
    }),
    generateBlogPostStream: vi.fn().mockResolvedValue(new ReadableStream()),
    formatBlogPost: vi.fn(content => `Formatted: ${content}`)
  };
  
  return {
    BlogPostGenerator: vi.fn().mockImplementation(() => mockBlogPostGenerator),
    blogPostGenerator: mockBlogPostGenerator
  };
});

describe('Framing Integration with Document References', () => {
  let fileService: FileReferenceService;
  let blogGenerator: BlogPostGenerator;
  
  const mockDocuments: Document[] = [
    {
      id: 'doc1',
      title: 'AI Policy Framework',
      content: 'This is a document about AI policy frameworks and governance.',
      metadata: {
        fileType: 'text/plain',
        fileSize: 1024,
        author: 'Test Author',
        keywords: ['AI', 'policy', 'governance'],
      },
      storageId: 'storage1',
      extractedMetaphors: [],
      framingExamples: [],
      createdAt: new Date(),
    },
    {
      id: 'doc2',
      title: 'Lakoff Framing Techniques',
      content: 'This document explains George Lakoff\'s framing techniques for policy communication.',
      metadata: {
        fileType: 'text/plain',
        fileSize: 2048,
        author: 'George Lakoff',
        keywords: ['framing', 'communication', 'policy'],
      },
      storageId: 'storage2',
      extractedMetaphors: [],
      framingExamples: [],
      createdAt: new Date(),
    }
  ];
  
  const mockExamples = [
    {
      text: 'AI policy frameworks should prioritize human values and ethical considerations.',
      source: 'AI Policy Framework',
      documentId: 'doc1',
    },
    {
      text: 'Effective framing avoids reinforcing opposition frames and uses positive, value-based language.',
      source: 'Lakoff Framing Techniques',
      documentId: 'doc2',
    }
  ];
  
  const mockCitations: Citation[] = [
    {
      source: 'AI Policy Framework',
      title: 'AI Policy Framework',
      author: 'Test Author',
      accessDate: new Date(),
    },
    {
      source: 'Lakoff Framing Techniques',
      title: 'Lakoff Framing Techniques',
      author: 'George Lakoff',
      accessDate: new Date(),
    }
  ];
  
  beforeEach(() => {
    vi.clearAllMocks();
    fileService = new FileReferenceService();
    blogGenerator = new BlogPostGenerator();
    
    // Mock FileReferenceService methods
    (fileService.searchDocuments as any).mockResolvedValue(mockDocuments);
    (fileService.findRelevantExamples as any).mockResolvedValue(mockExamples);
    (fileService.generateCitations as any).mockResolvedValue(mockCitations);
    
    // Add the fileReferenceService to the contentGenerationEngine
    (contentGenerationEngine as any).fileReferenceService = fileService;
  });
  
  describe('Blog Post Generation Integration', () => {
    it('should generate a blog post with SEO optimization and CTA', async () => {
      await blogGenerator.generateBlogPost(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          seoKeywords: ['AI ethics', 'policy framework'],
          callToAction: 'Subscribe to our newsletter',
          socialPlatforms: ['Twitter', 'LinkedIn']
        }
      );
      
      // Verify that the blog post generator was called with correct parameters
      expect(blogGenerator.generateBlogPost).toHaveBeenCalledWith(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          seoKeywords: ['AI ethics', 'policy framework'],
          callToAction: 'Subscribe to our newsletter',
          socialPlatforms: ['Twitter', 'LinkedIn']
        }
      );
    });
    
    it('should format blog post with social sharing buttons', () => {
      const content = 'This is a blog post about AI policy.';
      
      const formattedContent = blogGenerator.formatBlogPost(content, {
        seoKeywords: ['AI ethics', 'policy'],
        socialPlatforms: ['Twitter', 'Facebook', 'LinkedIn'],
        includeShareButtons: true
      });
      
      expect(blogGenerator.formatBlogPost).toHaveBeenCalledWith(
        content,
        {
          seoKeywords: ['AI ethics', 'policy'],
          socialPlatforms: ['Twitter', 'Facebook', 'LinkedIn'],
          includeShareButtons: true
        }
      );
      
      expect(formattedContent).toBe('Formatted: This is a blog post about AI policy.');
    });
    
    it('should generate a streaming blog post response', async () => {
      const stream = await blogGenerator.generateBlogPostStream(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          seoKeywords: ['AI ethics'],
          callToAction: 'Learn more'
        }
      );
      
      expect(blogGenerator.generateBlogPostStream).toHaveBeenCalledWith(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          seoKeywords: ['AI ethics'],
          callToAction: 'Learn more'
        }
      );
      
      expect(stream).toBeInstanceOf(ReadableStream);
    });
  });
});