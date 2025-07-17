import { geminiService } from './GeminiService';
import { lakoffFramingEngine, NEGATIVE_FRAMES } from './LakoffFramingEngine';
import { FileReferenceService } from './FileReferenceService';
import { geographicContextService } from './GeographicContextService';
import type { GeminiModel, Region, ContentType, Frame, FramingAnalysis, Citation, Document } from '../types';
import { ApiError, ApiErrorType } from '../utils/apiErrorHandling';

// Define input validation types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Define user input types
export interface UserInput {
  topic: string;
  url?: string;
  region: Region;
  contentType: ContentType;
}

// Define content request types
export interface ContentRequest {
  input: UserInput;
  model: GeminiModel;
  temperature?: number;
  maxOutputTokens?: number;
}

// Define content response types
export interface ContentResponse {
  content: string;
  metadata: {
    model: GeminiModel;
    region: Region;
    contentType: ContentType;
    topic: string;
    generationTime: number;
    wordCount: number;
    framingAnalysis?: FramingAnalysis;
    citations?: Citation[];
    referencedDocuments?: Document[];
  };
}

// Define framing options
export interface FramingOptions {
  targetFrame?: Frame;
  applyFraming: boolean;
  avoidNegativeFrames: boolean;
  reinforcePositiveFrames: boolean;
  assessQuality?: boolean;
}

// Define document reference options
export interface DocumentReferenceOptions {
  useReferences: boolean;
  maxReferences?: number;
  preferSemanticSearch?: boolean;
  includeCitations?: boolean;
  includeExamples?: boolean;
}

/**
 * ContentGenerationEngine class for handling content generation workflow
 */
export class ContentGenerationEngine {
  private fileReferenceService: FileReferenceService;
  
  constructor() {
    this.fileReferenceService = new FileReferenceService();
  }
  
  /**
   * Validate user input
   * @param input - User input to validate
   * @returns Validation result
   */
  validateInput(input: UserInput): ValidationResult {
    const errors: string[] = [];
    
    // Validate topic
    if (!input.topic || input.topic.trim() === '') {
      errors.push('Topic is required');
    } else if (input.topic.length < 3) {
      errors.push('Topic must be at least 3 characters');
    }
    
    // Validate URL if provided
    if (input.url) {
      try {
        new URL(input.url);
      } catch (e) {
        errors.push('URL is not valid');
      }
    }
    
    // Validate region
    const validRegions: Region[] = ['usa', 'europe', 'australia', 'morocco'];
    if (!validRegions.includes(input.region)) {
      errors.push('Region must be one of: usa, europe, australia, morocco');
    }
    
    // Validate content type
    const validContentTypes: ContentType[] = ['blog', 'article', 'playbook', 'social'];
    if (!validContentTypes.includes(input.contentType)) {
      errors.push('Content type must be one of: blog, article, playbook, social');
    }
    
    // Process validation results for real-time feedback
    const { processValidationResult } = require('../utils/contentErrorRecovery');
    const processedResult = processValidationResult({
      isValid: errors.length === 0,
      errors
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Apply geographic context to the prompt
   * @param topic - The topic to contextualize
   * @param region - The geographic region
   * @returns Contextualized topic
   */
  async applyGeographicContext(topic: string, region: Region): Promise<string> {
    try {
      // Get regional context from GeographicContextService
      const regionalContext = await geographicContextService.getRegionalContext(region, topic);
      
      // Generate a context paragraph
      const contextParagraph = `
Consider the following regional context for ${region.toUpperCase()}:

${regionalContext.policyFramework.description}

Key principles in this region include:
${regionalContext.policyFramework.keyPrinciples.map(principle => `- ${principle}`).join('\n')}

Cultural considerations:
${regionalContext.culturalNotes.slice(0, 3).map(note => `- ${note}`).join('\n')}

Recent developments:
${regionalContext.recentDevelopments.slice(0, 2).map(dev => `- ${dev.title} (${dev.description})`).join('\n')}
`;

      return `${topic}\n\n${contextParagraph}`;
    } catch (error) {
      console.error('Error applying geographic context:', error);
      
      // Fallback to basic region context if the service fails
      const regionContexts = {
        usa: `
Consider the United States context where AI policy is shaped by:
- Federal initiatives and executive orders
- State-level regulations and guidelines
- Strong emphasis on innovation balanced with safety
- Competitive market-driven approach to AI development
        `,
        europe: `
Consider the European context where AI policy is shaped by:
- The EU AI Act and comprehensive regulations
- GDPR implications for AI systems
- Strong emphasis on human-centric, trustworthy AI
- Precautionary principle guiding technology adoption
        `,
        australia: `
Consider the Australian context where AI policy is shaped by:
- Australia's AI Ethics Framework
- Focus on practical implementation and industry adoption
- Regulatory sandboxes and innovation support
- Balance between economic benefits and ethical considerations
        `,
        morocco: `
Consider the Moroccan context where AI policy is shaped by:
- Digital Morocco strategy and digital transformation
- Focus on economic development and AI adoption
- International partnerships and knowledge transfer
- Emphasis on skills development and capacity building
        `
      };
      
      return `${topic}\n\n${regionContexts[region]}`;
    }
  }
  
  /**
   * Create content type specific prompt
   * @param contentType - The type of content to generate
   * @param topic - The topic for content generation
   * @returns Content type specific prompt
   */
  createContentTypePrompt(contentType: ContentType, topic: string): string {
    const contentTypePrompts = {
      blog: `
Generate a short daily blog post (500-800 words) about "${topic}".

The blog post should:
- Have an engaging headline and introduction
- Include 3-4 main points with supporting evidence
- Use George Lakoff's framing principles to avoid negative frames
- Use positive, value-based language throughout
- Include a clear call-to-action at the end
- Be optimized for SEO with relevant keywords
      `,
      article: `
Generate a comprehensive AI policy article (1200-1500 words) about "${topic}".

The article should:
- Have a compelling headline and executive summary
- Include in-depth analysis with multiple perspectives
- Use George Lakoff's framing principles extensively
- Incorporate storytelling elements and narrative flow
- Include sections for background, analysis, and recommendations
- Cite relevant sources and research (placeholder citations are acceptable)
- End with actionable policy recommendations
      `,
      playbook: `
Generate a marketing playbook for "${topic}".

The playbook should:
- Follow Seth Godin's permission marketing philosophy
- Include brand story framework and positioning strategy
- Incorporate Gary Vaynerchuk's authentic content creation approach
- Add Kieran Flanagan's user acquisition strategies
- Include A/B testing framework and conversion optimization tactics
- Provide specific, actionable marketing tactics
- Use George Lakoff's framing principles for messaging
      `,
      social: `
Generate a one-month social media calendar for "${topic}".

The calendar should:
- Include 20-30 post ideas across platforms
- Provide hashtag recommendations and trending topics
- Include content strategies for different platforms
- Use George Lakoff's framing principles for messaging
- Include a mix of content types (educational, promotional, engagement)
- Suggest optimal posting times and frequency
- Include performance metrics to track
      `
    };
    
    return contentTypePrompts[contentType];
  }
  
  /**
   * Find relevant documents for a topic
   * 
   * @param topic - The topic to find documents for
   * @param options - Document reference options
   * @returns Promise resolving to relevant documents and examples
   */
  async findRelevantDocuments(
    topic: string, 
    options: DocumentReferenceOptions
  ): Promise<{
    documents: Document[];
    examples: { text: string; source: string; documentId: string }[];
    citations: Citation[];
  }> {
    if (!options.useReferences) {
      return { documents: [], examples: [], citations: [] };
    }
    
    try {
      // Search for relevant documents
      const documents = await this.fileReferenceService.searchDocuments(
        topic,
        options.preferSemanticSearch || false
      );
      
      // Limit the number of documents if specified
      const limitedDocuments = options.maxReferences 
        ? documents.slice(0, options.maxReferences) 
        : documents;
      
      // Find relevant examples if requested
      const examples = options.includeExamples 
        ? await this.fileReferenceService.findRelevantExamples(topic)
        : [];
      
      // Generate citations if requested
      const citations = options.includeCitations 
        ? await this.fileReferenceService.generateCitations(limitedDocuments)
        : [];
      
      return {
        documents: limitedDocuments,
        examples,
        citations
      };
    } catch (error) {
      console.error('Error finding relevant documents:', error);
      return { documents: [], examples: [], citations: [] };
    }
  }
  
  /**
   * Enhance prompt with document references
   * @param prompt - The original prompt
   * @param examples - Relevant examples from documents
   * @returns Enhanced prompt with references
   */
  enhancePromptWithDocumentReferences(
    prompt: string,
    examples: { text: string; source: string }[]
  ): string {
    if (examples.length === 0) {
      return prompt;
    }
    
    let enhancedPrompt = prompt + '\n\nConsider these relevant examples:\n';
    
    examples.forEach((example, index) => {
      enhancedPrompt += `\nExample ${index + 1} (from ${example.source}):\n"${example.text}"\n`;
    });
    
    enhancedPrompt += '\nUse these examples to support your content where appropriate.\n';
    
    return enhancedPrompt;
  }
  
  /**
   * Add citations to generated content
   * @param content - The generated content
   * @param citations - Citations to add
   * @returns Content with citations added
   */
  addCitationsToContent(content: string, citations: Citation[]): string {
    if (citations.length === 0) {
      return content;
    }
    
    // Add citations at the end
    let contentWithCitations = content + '\n\n## References\n';
    
    citations.forEach((citation, index) => {
      contentWithCitations += `\n${index + 1}. ${citation.title}`;
      
      if (citation.author && citation.author !== 'Unknown') {
        contentWithCitations += ` by ${citation.author}`;
      }
      
      if (citation.url) {
        contentWithCitations += `. Available at: ${citation.url}. `;
      }
      
      contentWithCitations += `Accessed on ${citation.accessDate.toLocaleDateString()}.`;
    });
    
    return contentWithCitations;
  }
  
  /**
   * Generate content based on user input
   * 
   * @param request - Content generation request
   * @param framingOptions - Options for Lakoff framing techniques
   * @param documentOptions - Options for document references
   * @returns Promise resolving to generated content
   */
  async generateContent(
    request: ContentRequest, 
    framingOptions: FramingOptions = {
      applyFraming: true,
      avoidNegativeFrames: true,
      reinforcePositiveFrames: true,
      assessQuality: true
    },
    documentOptions: DocumentReferenceOptions = {
      useReferences: false
    }
  ): Promise<ContentResponse> {
    const { input, model, temperature = 0.7, maxOutputTokens = this.getDefaultMaxTokens(input.contentType) } = request;
    
    // Import error recovery utilities
    const contentErrorRecovery = require('../utils/contentErrorRecovery');
    
    // Validate input
    const validation = this.validateInput(input);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }
    
    // Check if API key is set
    if (!geminiService.hasApiKey()) {
      throw new Error('API key not set. Please add your Google API key in settings');
    }
    
    // Check for partial content from previous failed attempts
    const partialContent = contentErrorRecovery.getPartialContent();
    let initialContent = '';
    if (partialContent && 
        partialContent.request.input.topic === input.topic && 
        partialContent.request.input.contentType === input.contentType) {
      initialContent = partialContent.content;
      console.log('Resuming from partial content');
    }
    
    try {
      // Start timing
      const startTime = Date.now();
      
      // Apply geographic context
      const contextualizedTopic = await this.applyGeographicContext(input.topic, input.region);
      
      // Create content type specific prompt
      let contentTypePrompt = this.createContentTypePrompt(input.contentType, contextualizedTopic);
      
      // Find relevant documents if requested
      let relevantDocuments = { documents: [], examples: [], citations: [] };
      if (documentOptions.useReferences) {
        try {
          relevantDocuments = await this.findRelevantDocuments(
            input.topic,
            {
              ...documentOptions,
              preferSemanticSearch: true
            }
          );
          
          // Enhance prompt with document references if examples found
          if (relevantDocuments.examples.length > 0) {
            contentTypePrompt = this.enhancePromptWithDocumentReferences(
              contentTypePrompt,
              relevantDocuments.examples
            );
          }
        } catch (docError) {
          console.error('Error finding relevant documents:', docError);
          // Continue without document references
        }
      }
      
      // Create optimized prompt for the selected model
      const optimizedPrompt = geminiService.createOptimizedPrompt(contentTypePrompt);
      
      // If we have partial content, use it as a starting point
      let content = initialContent;
      
      // If no partial content or it's too short, generate new content
      if (!content || content.length < 100) {
        try {
          content = await geminiService.generateContent(optimizedPrompt, {
            model,
            temperature,
            maxOutputTokens: maxOutputTokens,
            topP: 0.95,
            topK: 40
          });
          
          // Clear any saved partial content since we succeeded
          contentErrorRecovery.clearPartialContent();
        } catch (genError) {
          // Save partial content if we have any from streaming
          if (content && content.length > 0) {
            contentErrorRecovery.savePartialContent(content, request);
          }
          throw genError;
        }
      }
      
      // Apply Lakoff framing techniques if requested
      let framingAnalysis: FramingAnalysis | undefined;
      
      if (framingOptions.applyFraming) {
        try {
          // First analyze the content
          framingAnalysis = lakoffFramingEngine.analyzeFraming(content);
          
          // Check for framing conflicts
          const framingResult = contentErrorRecovery.resolveFramingConflicts(
            content, 
            framingAnalysis.detectedFrames
          );
          
          if ('needsManualResolution' in framingResult) {
            // Save framing conflict for manual resolution
            const alternativeSuggestions = contentErrorRecovery.generateAlternativeFrameSuggestions(
              framingResult.conflictingFrames.frame1,
              framingResult.conflictingFrames.frame2
            );
            
            contentErrorRecovery.saveFramingConflict(
              content,
              framingResult.conflictingFrames,
              alternativeSuggestions
            );
            
            console.warn('Framing conflict detected. Continuing with original content.');
          }
          
          // Apply framing techniques to the generated content
          content = await this.applyFramingTechniques(content, framingOptions);
          
          // Analyze the framed content if requested
          if (framingOptions.assessQuality) {
            framingAnalysis = lakoffFramingEngine.analyzeFraming(content);
          }
        } catch (framingError) {
          console.error('Error applying framing techniques:', framingError);
          // Continue with unframed content
        }
      }
      
      // Add citations if requested and available
      if (documentOptions.includeCitations && relevantDocuments.citations.length > 0) {
        try {
          // Validate citations before adding them
          const { validCitations, errors } = contentErrorRecovery.validateAndFixCitations(
            relevantDocuments.citations
          );
          
          // Save citation errors for manual resolution
          if (errors.length > 0) {
            errors.forEach(error => {
              contentErrorRecovery.saveCitationError(
                error.citation,
                error.errorType,
                error.suggestion
              );
            });
            
            console.warn(`${errors.length} citation errors detected. Using valid citations only.`);
          }
          
          // Add valid citations to content
          content = this.addCitationsToContent(content, validCitations);
          
          // Update citations in relevantDocuments
          relevantDocuments.citations = validCitations;
        } catch (citationError) {
          console.error('Error processing citations:', citationError);
          // Continue without citations
        }
      }
      
      // Calculate generation time
      const generationTime = (Date.now() - startTime) / 1000;
      
      // Calculate word count
      const wordCount = content.split(/\s+/).length;
      
      return {
        content,
        metadata: {
          model,
          region: input.region,
          contentType: input.contentType,
          topic: input.topic,
          generationTime,
          wordCount,
          framingAnalysis,
          citations: relevantDocuments.citations,
          referencedDocuments: relevantDocuments.documents
        }
      };
    } catch (error) {
      console.error('Content generation error:', error);
      
      // Handle error and provide recovery options
      const errorInfo = contentErrorRecovery.handleContentGenerationError(
        error,
        initialContent,
        request
      );
      
      // Rethrow as ApiError with recovery information
      throw new ApiError(
        errorInfo.apiError.getUserFriendlyMessage(),
        errorInfo.apiError.type,
        errorInfo.apiError.statusCode,
        {
          ...errorInfo.apiError.details,
          recoveryOptions: errorInfo.recoveryOptions
        },
        errorInfo.apiError.retryable
      );
    }
  }
  
  /**
   * Apply framing techniques to content
   * @param content - The content to enhance
   * @param options - Framing options
   * @returns Enhanced content with framing applied
   */
  async applyFramingTechniques(content: string, options: FramingOptions): Promise<string> {
    let framedContent = content;
    
    // First analyze the framing
    const initialAnalysis = lakoffFramingEngine.analyzeFraming(content);
    
    // Avoid negative frames if requested
    if (options.avoidNegativeFrames) {
      framedContent = lakoffFramingEngine.avoidNegativeFrames(framedContent);
    }
    
    // Apply value-based language optimization
    framedContent = this.optimizeValueBasedLanguage(framedContent, initialAnalysis);
    
    // Replace conceptual metaphors if needed
    framedContent = this.replaceConceptualMetaphors(framedContent, initialAnalysis);
    
    // Apply target frame if specified
    if (options.targetFrame) {
      framedContent = lakoffFramingEngine.reframeContent(framedContent, options.targetFrame);
    } 
    // Otherwise reinforce positive frames if requested
    else if (options.reinforcePositiveFrames) {
      framedContent = lakoffFramingEngine.reinforcePositiveFrames(framedContent);
    }
    
    return framedContent;
  }
  
  /**
   * Optimize value-based language
   * @param content - The content to optimize
   * @param analysis - Initial framing analysis
   * @returns Content with optimized value-based language
   */
  optimizeValueBasedLanguage(content: string, analysis: FramingAnalysis): string {
    let optimizedContent = content;
    
    // If no frames detected, nothing to optimize
    if (analysis.detectedFrames.length === 0) {
      return optimizedContent;
    }
    
    // Get frames to use for optimization
    const framesToUse = analysis.detectedFrames.length > 0 
      ? analysis.detectedFrames 
      : analysis.suggestedFrames;
    
    // Extract all values from the frames
    const valueTerms = new Set<string>();
    framesToUse.forEach(frame => {
      frame.values.forEach(value => valueTerms.add(value));
    });
    
    // Check if key value terms are already present
    const missingValues = [];
    for (const value of valueTerms) {
      if (!content.toLowerCase().includes(value.toLowerCase())) {
        missingValues.push(value);
      }
    }
    
    // If there are missing values, add value-based sentences
    if (missingValues.length > 0) {
      // Add a concluding paragraph
      optimizedContent += `\n\nIn conclusion, our approach to AI policy must prioritize ${missingValues.slice(0, 3).join(', ')}`;
      
      if (missingValues.length > 3) {
        optimizedContent += `, and other core values`;
      }
      
      optimizedContent += ` to ensure that technology serves humanity's highest aspirations.`;
    }
    
    return optimizedContent;
  }
  
  /**
   * Replace conceptual metaphors
   * @param content - The content to modify
   * @param analysis - Initial framing analysis
   * @returns Content with improved conceptual metaphors
   */
  replaceConceptualMetaphors(content: string, analysis: FramingAnalysis): string {
    let modifiedContent = content;
    
    // Define metaphor replacements
    const metaphorReplacements: Record<string, string> = {
      // AI as Actor metaphors
      'AI thinks': 'AI processes information',
      'AI understands': 'AI analyzes patterns',
      'AI decides': 'AI follows programmed criteria',
      'AI wants': 'AI is designed to',
      'AI tries to': 'AI is programmed to',
      
      // AI as Race metaphors
      'AI race': 'AI development journey',
      'winning AI': 'beneficial AI development',
      'ahead in AI': 'advancing AI responsibly',
      'AI competition': 'AI collaboration',
      'AI leadership': 'AI stewardship',
      
      // AI as Weapon metaphors
      'weaponized AI': 'misused AI',
      'AI arms race': 'AI safety research',
      'AI arsenal': 'AI capabilities',
      'AI defense': 'AI safeguards',
      'AI attack': 'AI security',
      
      // AI Replacement metaphors
      'AI replacing humans': 'AI complementing human work',
      'AI taking jobs': 'AI transforming jobs',
      'AI substituting workers': 'AI augmenting workers',
      'AI eliminating positions': 'AI changing role requirements'
    };
    
    // Apply replacements
    Object.entries(metaphorReplacements).forEach(([problematic, improved]) => {
      modifiedContent = modifiedContent.replace(
        new RegExp(`\\b${problematic}\\b`, 'gi'),
        improved
      );
    });
    
    // For detected metaphors, apply specific replacements
    analysis.metaphors.forEach(metaphor => {
      if (metaphor.type === 'aiAsActor') {
        const context = metaphor.context;
        const regex = new RegExp(`\\b${metaphor.text}\\b`, 'gi');
        
        if (context.includes('think') || context.includes('understand')) {
          modifiedContent = modifiedContent.replace(regex, 'AI processes information');
        }
      }
    });
    
    return modifiedContent;
  }
  
  /**
   * Assess framing quality and provide feedback
   * @param content - The content to assess
   * @returns Framing quality assessment
   */
  assessFramingQuality(content: string): {
    score: number;
    feedback: string[];
    suggestedImprovements: string[];
  } {
    // Analyze the framing
    const analysis = lakoffFramingEngine.analyzeFraming(content);
    
    const feedback: string[] = [];
    const suggestedImprovements: string[] = [];
    
    // Evaluate effectiveness score
    const score = analysis.effectiveness;
    
    // Generate feedback based on score
    if (score >= 80) {
      feedback.push('Excellent framing with strong value-based language.');
    } else if (score >= 60) {
      feedback.push('Good framing with some room for improvement.');
    } else if (score >= 40) {
      feedback.push('Moderate framing that could benefit from more value-based language.');
    } else {
      feedback.push('Weak framing that needs significant improvement.');
    }
    
    // Check for negative frames
    const normalizedContent = content.toLowerCase();
    let hasNegativeFrames = false;
    
    Object.entries(NEGATIVE_FRAMES).forEach(([category, terms]) => {
      terms.forEach(term => {
        if (normalizedContent.includes(term.toLowerCase())) {
          hasNegativeFrames = true;
          suggestedImprovements.push(`Replace negative frame "${term}" with more positive language.`);
        }
      });
    });
    
    if (!hasNegativeFrames) {
      feedback.push('Successfully avoids negative frames.');
    } else {
      feedback.push('Contains negative frames that could reinforce opposition messaging.');
    }
    
    // Check for metaphor usage
    if (analysis.metaphors.length > 3) {
      feedback.push('Good use of conceptual metaphors.');
    } else if (analysis.metaphors.length > 0) {
      feedback.push('Some use of conceptual metaphors, could benefit from more.');
      suggestedImprovements.push('Add more conceptual metaphors to strengthen framing.');
    } else {
      feedback.push('Limited use of conceptual metaphors weakens framing.');
      suggestedImprovements.push('Incorporate conceptual metaphors to strengthen framing.');
    }
    
    // Check for value-based language
    const valueTermCount = this.countValueTerms(content, analysis.detectedFrames);
    if (valueTermCount > 5) {
      feedback.push('Strong use of value-based language.');
    } else if (valueTermCount > 2) {
      feedback.push('Moderate use of value-based language, could be strengthened.');
      suggestedImprovements.push('Incorporate more value terms to strengthen messaging.');
    } else {
      feedback.push('Limited use of value-based language weakens messaging.');
      suggestedImprovements.push('Add more value-based language to strengthen messaging.');
    }
    
    // Check for frame consistency
    if (analysis.detectedFrames.length > 1) {
      const frameNames = analysis.detectedFrames.map(frame => frame.name);
      
      // Check for potentially conflicting frames
      const conflictingPairs: [string, string][] = [
        ['Strict Father', 'Nurturant Parent'],
        ['Freedom', 'Security'],
        ['Progress', 'Sustainability']
      ];
      
      let hasConflictingFrames = false;
      conflictingPairs.forEach(([frame1, frame2]) => {
        if (frameNames.includes(frame1) && frameNames.includes(frame2)) {
          hasConflictingFrames = true;
          suggestedImprovements.push(`Resolve tension between "${frame1}" and "${frame2}" frames by prioritizing one.`);
        }
      });
      
      if (!hasConflictingFrames) {
        feedback.push('Consistent frame usage throughout content.');
      } else {
        feedback.push('Contains potentially conflicting frames that may weaken the message.');
      }
    }
    
    return {
      score,
      feedback,
      suggestedImprovements
    };
  }
  
  /**
   * Count value terms used in content
   * @param content - The content to analyze
   * @param frames - Frames to check for values from
   * @returns Number of value terms used
   */
  private countValueTerms(content: string, frames: Frame[]): number {
    const normalizedContent = content.toLowerCase();
    const valueTerms = new Set<string>();
    
    // Collect all value terms from frames
    frames.forEach(frame => {
      frame.values.forEach(value => valueTerms.add(value.toLowerCase()));
    });
    
    // Count occurrences
    let count = 0;
    valueTerms.forEach(value => {
      // Count occurrences of each value term
      const regex = new RegExp(`\\b${value}\\b`, 'gi');
      const matches = content.match(regex);
      if (matches) {
        count += matches.length;
      }
    });
    
    return count;
  }
  
  /**
   * Generate content with streaming response
   * @param request - Content generation request
   * @param framingOptions - Options for Lakoff framing techniques
   * @param documentOptions - Options for document references
   * @returns Readable stream of content chunks
   */
  async generateContentStream(
    request: ContentRequest,
    framingOptions: FramingOptions = {
      applyFraming: true,
      avoidNegativeFrames: true,
      reinforcePositiveFrames: true,
      assessQuality: true
    },
    documentOptions: DocumentReferenceOptions = {
      useReferences: false
    }
  ): Promise<ReadableStream<Uint8Array>> {
    const { input, model, temperature = 0.7, maxOutputTokens = this.getDefaultMaxTokens(input.contentType) } = request;
    
    // Import error recovery utilities
    const contentErrorRecovery = require('../utils/contentErrorRecovery');
    
    // Validate input
    const validation = this.validateInput(input);
    if (!validation.isValid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }
    
    // Check if API key is set
    if (!geminiService.hasApiKey()) {
      throw new Error('API key not set. Please add your Google API key in settings');
    }
    
    // Check for partial content from previous failed attempts
    const partialContent = contentErrorRecovery.getPartialContent();
    if (partialContent && 
        partialContent.request.input.topic === input.topic && 
        partialContent.request.input.contentType === input.contentType) {
      console.log('Partial content available. Consider using non-streaming generateContent method to resume.');
    }
    
    try {
      // Apply geographic context
      const contextualizedTopic = await this.applyGeographicContext(input.topic, input.region);
      
      // Create content type specific prompt
      let contentTypePrompt = this.createContentTypePrompt(input.contentType, contextualizedTopic);
      
      // Find relevant documents if requested
      if (documentOptions.useReferences) {
        try {
          const relevantDocuments = await this.findRelevantDocuments(
            input.topic,
            {
              ...documentOptions,
              preferSemanticSearch: true
            }
          );
          
          // Enhance prompt with document references if examples found
          if (relevantDocuments.examples.length > 0) {
            contentTypePrompt = this.enhancePromptWithDocumentReferences(
              contentTypePrompt,
              relevantDocuments.examples
            );
          }
          
          // Validate citations if available
          if (documentOptions.includeCitations && relevantDocuments.citations.length > 0) {
            const { validCitations, errors } = contentErrorRecovery.validateAndFixCitations(
              relevantDocuments.citations
            );
            
            // Save citation errors for manual resolution
            if (errors.length > 0) {
              errors.forEach(error => {
                contentErrorRecovery.saveCitationError(
                  error.citation,
                  error.errorType,
                  error.suggestion
                );
              });
              
              console.warn(`${errors.length} citation errors detected. They will need manual resolution.`);
            }
          }
        } catch (docError) {
          console.error('Error finding relevant documents:', docError);
          // Continue without document references
        }
      }
      
      // Enhance the prompt with framing guidance if framing is enabled
      if (framingOptions.applyFraming) {
        contentTypePrompt = this.enhancePromptWithFramingGuidance(contentTypePrompt, framingOptions);
      }
      
      // Create optimized prompt for the selected model
      const optimizedPrompt = geminiService.createOptimizedPrompt(contentTypePrompt);
      
      // Generate content stream
      const stream = await geminiService.generateContentStream(optimizedPrompt, {
        model,
        temperature,
        maxOutputTokens: maxOutputTokens,
        topP: 0.95,
        topK: 40
      });
      
      // Create a transformed stream that captures content for error recovery
      let contentSoFar = '';
      
      const transformStream = new TransformStream({
        transform(chunk, controller) {
          // Decode the chunk and add to accumulated content
          const decoder = new TextDecoder();
          const text = decoder.decode(chunk);
          contentSoFar += text;
          
          // Pass the chunk through
          controller.enqueue(chunk);
        },
        flush() {
          // If we have content, clear any partial content since we succeeded
          if (contentSoFar.length > 0) {
            contentErrorRecovery.clearPartialContent();
          }
        }
      });
      
      // Return the transformed stream
      return stream.pipeThrough(transformStream).pipeThrough(new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk);
        },
        flush() {
          // This will be called if the stream completes normally
        }
      }));
      
    } catch (error) {
      console.error('Content streaming error:', error);
      
      // Handle error and provide recovery options
      const errorInfo = contentErrorRecovery.handleContentGenerationError(
        error,
        '', // No content to save for streaming errors at this point
        request
      );
      
      // Rethrow as ApiError with recovery information
      throw new ApiError(
        errorInfo.apiError.getUserFriendlyMessage(),
        errorInfo.apiError.type,
        errorInfo.apiError.statusCode,
        {
          ...errorInfo.apiError.details,
          recoveryOptions: errorInfo.recoveryOptions
        },
        errorInfo.apiError.retryable
      );
    }
  }
  
  /**
   * Enhance prompt with framing guidance
   * @param prompt - The original prompt
   * @param options - Framing options
   * @returns Enhanced prompt with framing guidance
   */
  enhancePromptWithFramingGuidance(prompt: string, options: FramingOptions): string {
    let enhancedPrompt = prompt;
    
    // Add guidance for avoiding negative frames
    if (options.avoidNegativeFrames) {
      enhancedPrompt += `\n\nImportant framing guidance:
- Avoid negative frames that reinforce opposition messaging
- Replace terms like "AI threat", "AI danger", "AI risk" with more neutral terms like "AI consideration", "AI implication", "AI development"
- Don't use phrases like "control AI", "contain AI", "restrict AI" and instead use "guide AI development", "establish AI boundaries", "define AI parameters"
- Don't use phrases like "AI replacing humans", "AI taking jobs", "AI substituting workers" and instead use "AI transforming work", "AI augmenting human capabilities", "AI changing job requirements"`;
    }
    
    // Add guidance for target frame if specified
    if (options.targetFrame) {
      const frame = options.targetFrame;
      enhancedPrompt += `\n\nUse the following frame throughout your content:
- Frame name: ${frame.name}
- Core values to emphasize: ${frame.values.join(', ')}
- Metaphors to incorporate: ${frame.metaphors.join(', ')}
- Key language to use: ${frame.keywords.join(', ')}`;
    }
    
    // Add guidance for reinforcing positive frames
    if (options.reinforcePositiveFrames) {
      enhancedPrompt += `\n\nReinforce positive frames by:
- Focusing on opportunities and benefits while acknowledging challenges
- Emphasizing human agency and collaboration with AI systems rather than competition or threat
- Incorporating metaphors that frame AI as a tool, assistant, or journey rather than a competitor
- Using value-based language that emphasizes care, fairness, progress, freedom, and sustainability`;
    }
    
    return enhancedPrompt;
  }
  
  /**
   * Handle fallback when primary model fails
   * @param error - The error from the original request
   * @param request - The original request
   * @param framingOptions - Options for Lakoff framing techniques
   * @param documentOptions - Options for document references
   * @returns Generated content response from fallback model
   */
  async handleModelFallback(
    error: Error, 
    request: ContentRequest,
    framingOptions: FramingOptions,
    documentOptions: DocumentReferenceOptions
  ): Promise<ContentResponse> {
    console.warn('Primary model failed, attempting fallback:', error);
    
    // Determine fallback model
    let fallbackModel: GeminiModel;
    
    if (request.model === 'gemini-2.5-pro') {
      fallbackModel = 'gemini-2.5-flash';
    } else if (request.model === 'gemini-2.5-flash') {
      fallbackModel = 'gemma-3-12b-it';
    } else {
      // If the model was already gemma-3-12b-it, we can't fall back further
      throw new Error('Content generation failed with all available models');
    }
    
    // Create fallback request
    const fallbackRequest: ContentRequest = {
      ...request,
      model: fallbackModel,
      // Reduce complexity for fallback
      temperature: Math.max(0.5, (request.temperature || 0.7) - 0.1)
    };
    
    // Use the same framing options for the fallback
    try {
      return await this.generateContent(fallbackRequest, framingOptions, documentOptions);
    } catch (fallbackError) {
      console.error('Fallback model also failed:', fallbackError);
      throw new Error('Content generation failed with all available models');
    }
  }
  
  /**
   * Get default max tokens based on content type
   * @param contentType - The type of content
   * @returns Default max tokens
   */
  private getDefaultMaxTokens(contentType: ContentType): number {
    const tokenMap: Record<ContentType, number> = {
      blog: 1500,    // ~750 words
      article: 3000,  // ~1500 words
      playbook: 4000, // ~2000 words
      social: 2000    // ~1000 words
    };
    
    return tokenMap[contentType];
  }
  
  /**
   * Process a streaming response into a more usable format
   * @param stream - The stream from generateContentStream
   * @returns AsyncGenerator yielding content chunks
   */
  async *processStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        yield decoder.decode(value, { stream: true });
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  /**
   * Extract sentences containing specific keywords from content
   * @param content - The content to extract from
   * @param keywords - Keywords to search for
   * @returns Array of sentences containing keywords
   */
  private extractSentencesWithKeywords(content: string, keywords: string[]): string[] {
    // Split content into sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    
    // Filter sentences that contain any of the keywords
    return sentences.filter(sentence => {
      const lowerSentence = sentence.toLowerCase();
      return keywords.some(keyword => lowerSentence.includes(keyword.toLowerCase()));
    });
  }
}

// Export singleton instance
export const contentGenerationEngine = new ContentGenerationEngine();