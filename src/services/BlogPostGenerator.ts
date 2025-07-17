import type { ContentRequest, ContentResponse } from './ContentGenerationEngine';
import { ContentGenerationEngine } from './ContentGenerationEngine';
import type { Region, ContentType, GeminiModel } from '../types';

/**
 * BlogPostGenerator class for generating short daily blog posts
 * with Lakoff framing, SEO optimization, and call-to-action integration
 */
export class BlogPostGenerator {
  private contentEngine: ContentGenerationEngine;

  constructor() {
    this.contentEngine = new ContentGenerationEngine();
  }

  /**
   * Generate a short daily blog post (500-800 words)
   * 
   * @param topic - The blog post topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to generated blog post
   */
  async generateBlogPost(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      seoKeywords?: string[];
      callToAction?: string;
      socialPlatforms?: string[];
      temperature?: number;
    } = {}
  ): Promise<ContentResponse> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'blog' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 1024 // Appropriate for 500-800 word blog post
    };

    // Enhance the blog post prompt with SEO and CTA requirements
    const enhancedRequest = this.enhanceBlogPostRequest(request, options);

    // Generate content with enhanced framing options
    return this.contentEngine.generateContent(
      enhancedRequest,
      {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: true,
        assessQuality: true
      },
      {
        useReferences: true,
        maxReferences: 3,
        preferSemanticSearch: true,
        includeCitations: true,
        includeExamples: true
      }
    );
  }

  /**
   * Generate a blog post with streaming response
   * 
   * @param topic - The blog post topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to a readable stream of content chunks
   */
  async generateBlogPostStream(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      seoKeywords?: string[];
      callToAction?: string;
      socialPlatforms?: string[];
      temperature?: number;
    } = {}
  ): Promise<ReadableStream<Uint8Array>> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'blog' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 1024 // Appropriate for 500-800 word blog post
    };

    // Enhance the blog post prompt with SEO and CTA requirements
    const enhancedRequest = this.enhanceBlogPostRequest(request, options);

    // Generate content stream with enhanced framing options
    return this.contentEngine.generateContentStream(
      enhancedRequest,
      {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: true,
        assessQuality: true
      },
      {
        useReferences: true,
        maxReferences: 3,
        preferSemanticSearch: true,
        includeCitations: true,
        includeExamples: true
      }
    );
  }

  /**
   * Enhance blog post request with SEO, CTA, and social sharing optimization
   * 
   * @param request - Original content request
   * @param options - Additional blog post options
   * @returns Enhanced content request
   */
  private enhanceBlogPostRequest(
    request: ContentRequest,
    options: {
      seoKeywords?: string[];
      callToAction?: string;
      socialPlatforms?: string[];
    }
  ): ContentRequest {
    // Create a deep copy of the request to avoid modifying the original
    const enhancedRequest = JSON.parse(JSON.stringify(request)) as ContentRequest;
    
    // Add SEO keywords if provided
    if (options.seoKeywords && options.seoKeywords.length > 0) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [SEO Keywords: ${options.seoKeywords.join(', ')}]`;
    }
    
    // Add call-to-action if provided
    if (options.callToAction) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Call to Action: ${options.callToAction}]`;
    }
    
    // Add social sharing platforms if provided
    if (options.socialPlatforms && options.socialPlatforms.length > 0) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Social Platforms: ${options.socialPlatforms.join(', ')}]`;
    }
    
    return enhancedRequest;
  }

  /**
   * Format blog post with proper structure and SEO optimization
   * 
   * @param content - Raw generated content
   * @param options - Formatting options
   * @returns Formatted blog post
   */
  formatBlogPost(
    content: string,
    options: {
      seoKeywords?: string[];
      socialPlatforms?: string[];
      includeShareButtons?: boolean;
    } = {}
  ): string {
    let formattedContent = content;
    
    // Add SEO meta information as HTML comments
    if (options.seoKeywords && options.seoKeywords.length > 0) {
      const seoComment = `<!-- 
SEO Keywords: ${options.seoKeywords.join(', ')}
Meta Description: ${this.extractFirstParagraph(content).substring(0, 155)}...
-->`;
      
      formattedContent = `${seoComment}\n\n${formattedContent}`;
    }
    
    // Add social sharing buttons if requested
    if (options.includeShareButtons && options.socialPlatforms && options.socialPlatforms.length > 0) {
      const shareButtons = this.generateSocialShareButtons(options.socialPlatforms);
      formattedContent = `${formattedContent}\n\n${shareButtons}`;
    }
    
    // Ensure proper blog post structure with headings
    formattedContent = this.ensureBlogStructure(formattedContent);
    
    return formattedContent;
  }

  /**
   * Extract the first paragraph from content
   * 
   * @param content - The content to extract from
   * @returns First paragraph text
   */
  private extractFirstParagraph(content: string): string {
    const paragraphs = content.split('\n\n');
    
    // Find the first non-heading, non-empty paragraph
    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed;
      }
    }
    
    return content.substring(0, 155); // Fallback
  }

  /**
   * Generate social share button HTML
   * 
   * @param platforms - Social media platforms
   * @returns HTML for social share buttons
   */
  private generateSocialShareButtons(platforms: string[]): string {
    const buttons = platforms.map(platform => {
      const platformLower = platform.toLowerCase();
      
      switch (platformLower) {
        case 'twitter':
        case 'x':
          return '<!-- Twitter/X Share Button -->\n<button class="share-button twitter">Share on X</button>';
        case 'facebook':
          return '<!-- Facebook Share Button -->\n<button class="share-button facebook">Share on Facebook</button>';
        case 'linkedin':
          return '<!-- LinkedIn Share Button -->\n<button class="share-button linkedin">Share on LinkedIn</button>';
        case 'reddit':
          return '<!-- Reddit Share Button -->\n<button class="share-button reddit">Share on Reddit</button>';
        default:
          return `<!-- ${platform} Share Button -->\n<button class="share-button ${platformLower}">Share on ${platform}</button>`;
      }
    });
    
    return `<div class="social-share-container">\n${buttons.join('\n')}\n</div>`;
  }

  /**
   * Ensure proper blog post structure with headings
   * 
   * @param content - The content to structure
   * @returns Properly structured content
   */
  private ensureBlogStructure(content: string): string {
    // If content already has a heading, return as is
    if (content.includes('# ')) {
      return content;
    }
    
    // Extract title from first line
    const lines = content.split('\n');
    let title = lines[0];
    let body = lines.slice(1).join('\n');
    
    // Format with proper heading
    return `# ${title}\n\n${body}`;
  }
}

// Export singleton instance
export const blogPostGenerator = new BlogPostGenerator();