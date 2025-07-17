import type { ContentRequest, ContentResponse } from './ContentGenerationEngine';
import { ContentGenerationEngine } from './ContentGenerationEngine';
import type { Region, ContentType, GeminiModel, Citation } from '../types';

/**
 * ArticleGenerator class for generating comprehensive AI policy articles
 * with storytelling structure, narrative flow, and citation integration
 */
export class ArticleGenerator {
  private contentEngine: ContentGenerationEngine;

  constructor() {
    this.contentEngine = new ContentGenerationEngine();
  }

  /**
   * Generate a comprehensive AI policy article (1200-1500 words)
   * 
   * @param topic - The article topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to generated article
   */
  async generateArticle(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      policyFocus?: 'regulation' | 'innovation' | 'ethics' | 'governance' | 'implementation';
      includeCitations?: boolean;
      includeFactChecking?: boolean;
      storyStructure?: 'problem-solution' | 'challenge-opportunity' | 'past-present-future' | 'comparative';
      temperature?: number;
    } = {}
  ): Promise<ContentResponse> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'article' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 2048 // Appropriate for 1200-1500 word article
    };

    // Enhance the article request with specialized options
    const enhancedRequest = this.enhanceArticleRequest(request, options);

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
        maxReferences: 5,
        preferSemanticSearch: true,
        includeCitations: options.includeCitations !== false, // Default to true
        includeExamples: true
      }
    );
  }

  /**
   * Generate an article with streaming response
   * 
   * @param topic - The article topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to a readable stream of content chunks
   */
  async generateArticleStream(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      policyFocus?: 'regulation' | 'innovation' | 'ethics' | 'governance' | 'implementation';
      includeCitations?: boolean;
      includeFactChecking?: boolean;
      storyStructure?: 'problem-solution' | 'challenge-opportunity' | 'past-present-future' | 'comparative';
      temperature?: number;
    } = {}
  ): Promise<ReadableStream<Uint8Array>> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'article' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 2048 // Appropriate for 1200-1500 word article
    };

    // Enhance the article request with specialized options
    const enhancedRequest = this.enhanceArticleRequest(request, options);

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
        maxReferences: 5,
        preferSemanticSearch: true,
        includeCitations: options.includeCitations !== false, // Default to true
        includeExamples: true
      }
    );
  }

  /**
   * Enhance article request with specialized options for policy articles
   * 
   * @param request - Original content request
   * @param options - Additional article options
   * @returns Enhanced content request
   */
  private enhanceArticleRequest(
    request: ContentRequest,
    options: {
      policyFocus?: 'regulation' | 'innovation' | 'ethics' | 'governance' | 'implementation';
      includeFactChecking?: boolean;
      storyStructure?: 'problem-solution' | 'challenge-opportunity' | 'past-present-future' | 'comparative';
    }
  ): ContentRequest {
    // Create a deep copy of the request to avoid modifying the original
    const enhancedRequest = JSON.parse(JSON.stringify(request)) as ContentRequest;
    
    // Add policy focus if provided
    if (options.policyFocus) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Policy Focus: ${options.policyFocus}]`;
    }
    
    // Add fact-checking requirement if requested
    if (options.includeFactChecking) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Fact-Checking]`;
    }
    
    // Add storytelling structure if provided
    if (options.storyStructure) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Story Structure: ${options.storyStructure}]`;
    }
    
    return enhancedRequest;
  }

  /**
   * Format article with proper structure, sections, and citations
   * 
   * @param content - Raw generated content
   * @param citations - Citations to include
   * @param options - Formatting options
   * @returns Formatted article
   */
  formatArticle(
    content: string,
    citations: Citation[] = [],
    options: {
      includeExecutiveSummary?: boolean;
      includeRecommendations?: boolean;
      includeTableOfContents?: boolean;
    } = {}
  ): string {
    let formattedContent = content;
    
    // Add executive summary if requested and not already present
    if (options.includeExecutiveSummary && !content.includes('## Executive Summary')) {
      const summary = this.generateExecutiveSummary(content);
      formattedContent = `## Executive Summary\n\n${summary}\n\n${formattedContent}`;
    }
    
    // Add table of contents if requested
    if (options.includeTableOfContents) {
      const toc = this.generateTableOfContents(content);
      
      // If there's an executive summary, add TOC after it
      if (formattedContent.includes('## Executive Summary')) {
        formattedContent = formattedContent.replace(
          /## Executive Summary.*?\n\n/s,
          match => `${match}## Table of Contents\n\n${toc}\n\n`
        );
      } else {
        formattedContent = `## Table of Contents\n\n${toc}\n\n${formattedContent}`;
      }
    }
    
    // Add policy recommendations if requested and not already present
    if (options.includeRecommendations && !content.includes('## Recommendations')) {
      const recommendations = this.generatePolicyRecommendations(content);
      formattedContent = `${formattedContent}\n\n## Recommendations\n\n${recommendations}`;
    }
    
    // Add citations if provided and not already in the content
    if (citations.length > 0 && !content.includes('## References')) {
      const citationsSection = this.formatCitations(citations);
      formattedContent = `${formattedContent}\n\n## References\n\n${citationsSection}`;
    }
    
    // Ensure proper article structure with headings
    formattedContent = this.ensureArticleStructure(formattedContent);
    
    return formattedContent;
  }

  /**
   * Generate an executive summary from content
   * 
   * @param content - The article content
   * @returns Executive summary text
   */
  private generateExecutiveSummary(content: string): string {
    // Extract first few paragraphs (simplified approach)
    const paragraphs = content.split('\n\n');
    
    // Find the first non-heading, non-empty paragraphs
    const contentParagraphs = paragraphs.filter(p => {
      const trimmed = p.trim();
      return trimmed && !trimmed.startsWith('#');
    });
    
    // Use the first paragraph or two for the summary
    if (contentParagraphs.length > 0) {
      return contentParagraphs[0] + (contentParagraphs[1] ? `\n\n${contentParagraphs[1]}` : '');
    }
    
    return 'This article examines AI policy implications and provides analysis of current developments.';
  }

  /**
   * Generate a table of contents from content
   * 
   * @param content - The article content
   * @returns Table of contents text
   */
  private generateTableOfContents(content: string): string {
    const headings: { level: number; text: string }[] = [];
    const lines = content.split('\n');
    
    // Extract all headings
    lines.forEach(line => {
      const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
      if (headingMatch) {
        const level = headingMatch[1].length - 1; // Adjust so ## is level 1
        const text = headingMatch[2].trim();
        headings.push({ level, text });
      }
    });
    
    // Generate TOC with proper indentation
    let toc = '';
    headings.forEach(({ level, text }) => {
      const indent = '  '.repeat(level - 1);
      const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      toc += `${indent}- [${text}](#${slug})\n`;
    });
    
    return toc;
  }

  /**
   * Generate policy recommendations based on article content
   * 
   * @param content - The article content
   * @returns Policy recommendations text
   */
  private generatePolicyRecommendations(content: string): string {
    // In a real implementation, this would use NLP to extract key points
    // For now, return a generic set of recommendations
    return `Based on the analysis presented in this article, we recommend the following policy actions:

1. **Establish Multi-stakeholder Governance**: Create inclusive governance frameworks that involve industry, academia, civil society, and government.

2. **Implement Tiered Regulatory Approaches**: Develop risk-based regulatory frameworks that apply appropriate oversight based on AI system capabilities and potential impacts.

3. **Invest in Technical Standards**: Support the development of technical standards for AI safety, explainability, and fairness.

4. **Promote International Coordination**: Work across jurisdictions to harmonize approaches while respecting regional values and priorities.

5. **Support Ongoing Research**: Fund research into AI safety, alignment, and beneficial applications to ensure long-term positive outcomes.`;
  }

  /**
   * Format citations in a structured way
   * 
   * @param citations - Citations to format
   * @returns Formatted citations text
   */
  private formatCitations(citations: Citation[]): string {
    return citations.map((citation, index) => {
      let formattedCitation = `${index + 1}. ${citation.title}`;
      
      if (citation.author && citation.author !== 'Unknown') {
        formattedCitation += ` by ${citation.author}`;
      }
      
      if (citation.url) {
        formattedCitation += `. Available at: ${citation.url}.`;
      }
      
      if (citation.accessDate) {
        formattedCitation += ` Accessed on ${citation.accessDate.toLocaleDateString()}.`;
      }
      
      return formattedCitation;
    }).join('\n\n');
  }

  /**
   * Ensure proper article structure with headings
   * 
   * @param content - The content to structure
   * @returns Properly structured content
   */
  private ensureArticleStructure(content: string): string {
    // If content already has a main heading, return as is
    if (content.includes('# ')) {
      return content;
    }
    
    // Extract title from first line or create one
    const lines = content.split('\n');
    let title = lines[0];
    let body = lines.slice(1).join('\n');
    
    // Format with proper heading
    return `# ${title}\n\n${body}`;
  }

  /**
   * Perform fact-checking on article content
   * 
   * @param content - The article content to fact-check
   * @returns Fact-checked content with annotations
   */
  async factCheckArticle(content: string): Promise<{
    content: string;
    factCheckResults: {
      verified: { claim: string; source: string }[];
      unverified: { claim: string; suggestion: string }[];
    }
  }> {
    // In a real implementation, this would use external fact-checking APIs
    // For now, return the original content with mock fact-check results
    
    const factCheckResults = {
      verified: [
        { 
          claim: "The EU AI Act was approved in 2024", 
          source: "European Commission official website" 
        }
      ],
      unverified: [
        { 
          claim: "AI systems will replace 40% of jobs by 2030", 
          suggestion: "Research shows varied impacts across sectors, with job transformation more likely than wholesale replacement" 
        }
      ]
    };
    
    // Add fact-check annotations to content
    let annotatedContent = content;
    
    // Add verification notes
    factCheckResults.verified.forEach(item => {
      const regex = new RegExp(`\\b${item.claim}\\b`, 'i');
      if (regex.test(annotatedContent)) {
        annotatedContent = annotatedContent.replace(
          regex,
          `${item.claim} [Verified: ${item.source}]`
        );
      }
    });
    
    // Add correction suggestions
    factCheckResults.unverified.forEach(item => {
      const regex = new RegExp(`\\b${item.claim}\\b`, 'i');
      if (regex.test(annotatedContent)) {
        annotatedContent = annotatedContent.replace(
          regex,
          `${item.claim} [Note: ${item.suggestion}]`
        );
      }
    });
    
    return {
      content: annotatedContent,
      factCheckResults
    };
  }
}

// Export singleton instance
export const articleGenerator = new ArticleGenerator();