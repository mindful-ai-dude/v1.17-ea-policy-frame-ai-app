import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogPostGenerator } from '../BlogPostGenerator';
import { ContentGenerationEngine } from '../ContentGenerationEngine';
import type { ContentResponse } from '../ContentGenerationEngine';

// Mock ContentGenerationEngine
vi.mock('../ContentGenerationEngine', () => {
  const ContentGenerationEngineMock = vi.fn().mockImplementation(() => ({
    generateContent: vi.fn().mockResolvedValue({
      content: 'Mock blog post content with 500-800 words',
      metadata: {
        model: 'gemini-2.5-pro',
        region: 'usa',
        contentType: 'blog',
        topic: 'AI Policy',
        generationTime: 2.5,
        wordCount: 650
      }
    }),
    generateContentStream: vi.fn().mockResolvedValue(new ReadableStream())
  }));
  
  return {
    ContentGenerationEngine: ContentGenerationEngineMock
  };
});

describe('BlogPostGenerator', () => {
  let blogPostGenerator: BlogPostGenerator;
  
  beforeEach(() => {
    vi.clearAllMocks();
    blogPostGenerator = new BlogPostGenerator();
  });
  
  describe('generateBlogPost', () => {
    it('should generate a blog post with the specified parameters', async () => {
      const result = await blogPostGenerator.generateBlogPost(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          seoKeywords: ['AI ethics', 'policy framework'],
          callToAction: 'Subscribe to our newsletter',
          socialPlatforms: ['Twitter', 'LinkedIn']
        }
      );
      
      expect(result).toBeDefined();
      expect(result.content).toContain('Mock blog post content');
      expect(result.metadata.contentType).toBe('blog');
      
      // Verify ContentGenerationEngine was called with correct parameters
      const contentEngine = (blogPostGenerator as any).contentEngine;
      expect(contentEngine.generateContent).toHaveBeenCalledTimes(1);
      
      const [request, framingOptions, documentOptions] = contentEngine.generateContent.mock.calls[0];
      
      // Check request parameters
      expect(request.input.topic).toContain('AI Policy');
      expect(request.input.topic).toContain('AI ethics');
      expect(request.input.topic).toContain('Subscribe to our newsletter');
      expect(request.input.topic).toContain('Twitter, LinkedIn');
      expect(request.input.region).toBe('usa');
      expect(request.input.contentType).toBe('blog');
      expect(request.model).toBe('gemini-2.5-pro');
      
      // Check framing options
      expect(framingOptions.applyFraming).toBe(true);
      expect(framingOptions.avoidNegativeFrames).toBe(true);
      expect(framingOptions.reinforcePositiveFrames).toBe(true);
      
      // Check document options
      expect(documentOptions.useReferences).toBe(true);
      expect(documentOptions.includeCitations).toBe(true);
    });
    
    it('should use default options when none are provided', async () => {
      await blogPostGenerator.generateBlogPost('AI Policy', 'usa', 'gemini-2.5-pro');
      
      const contentEngine = (blogPostGenerator as any).contentEngine;
      const [request] = contentEngine.generateContent.mock.calls[0];
      
      expect(request.input.topic).toBe('AI Policy');
      expect(request.temperature).toBe(0.7);
    });
  });
  
  describe('generateBlogPostStream', () => {
    it('should generate a streaming blog post with the specified parameters', async () => {
      const stream = await blogPostGenerator.generateBlogPostStream(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          seoKeywords: ['AI ethics', 'policy framework'],
          callToAction: 'Subscribe to our newsletter'
        }
      );
      
      expect(stream).toBeInstanceOf(ReadableStream);
      
      // Verify ContentGenerationEngine was called with correct parameters
      const contentEngine = (blogPostGenerator as any).contentEngine;
      expect(contentEngine.generateContentStream).toHaveBeenCalledTimes(1);
      
      const [request, framingOptions, documentOptions] = contentEngine.generateContentStream.mock.calls[0];
      
      // Check request parameters
      expect(request.input.topic).toContain('AI Policy');
      expect(request.input.topic).toContain('AI ethics');
      expect(request.input.topic).toContain('Subscribe to our newsletter');
      expect(request.input.region).toBe('usa');
      expect(request.input.contentType).toBe('blog');
    });
  });
  
  describe('formatBlogPost', () => {
    it('should format blog post with SEO metadata', () => {
      const content = 'This is a sample blog post.\n\nIt has multiple paragraphs.';
      const formatted = blogPostGenerator.formatBlogPost(content, {
        seoKeywords: ['AI', 'policy'],
        includeShareButtons: false
      });
      
      expect(formatted).toContain('<!-- ');
      expect(formatted).toContain('SEO Keywords: AI, policy');
      expect(formatted).toContain('Meta Description:');
    });
    
    it('should add social share buttons when requested', () => {
      const content = 'This is a sample blog post.';
      const formatted = blogPostGenerator.formatBlogPost(content, {
        socialPlatforms: ['Twitter', 'LinkedIn', 'Facebook'],
        includeShareButtons: true
      });
      
      expect(formatted).toContain('<div class="social-share-container">');
      expect(formatted).toContain('Share on X');
      expect(formatted).toContain('Share on LinkedIn');
      expect(formatted).toContain('Share on Facebook');
    });
    
    it('should ensure proper blog structure with headings', () => {
      const content = 'Blog Title\n\nThis is the content.';
      const formatted = blogPostGenerator.formatBlogPost(content);
      
      expect(formatted).toContain('# Blog Title');
      
      // Should not modify content that already has headings
      const contentWithHeading = '# Existing Heading\n\nContent';
      const formattedWithHeading = blogPostGenerator.formatBlogPost(contentWithHeading);
      expect(formattedWithHeading).toBe(contentWithHeading);
    });
  });
});