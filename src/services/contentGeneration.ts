import { GoogleGenerativeAI } from '@google/generative-ai';

export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemma-3-12b-it';
export type Region = 'USA' | 'Europe' | 'Australia' | 'Morocco';
export type ContentType = 'blog' | 'article' | 'playbook' | 'social';

export interface GenerationRequest {
  topic: string;
  url?: string;
  region: Region;
  contentType: ContentType;
  model: GeminiModel;
  apiKey: string;
  searchResults?: { title: string; link: string; content: string; raw_content?: string; score: number }[];
}

export interface GenerationProgress {
  step: string;
  progress: number;
  content?: string;
}

export class ContentGenerationEngine {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async *generateContent(request: GenerationRequest): AsyncGenerator<GenerationProgress> {
    if (!this.genAI) {
      throw new Error('API key not configured');
    }

    const steps = [
      'Analyzing topic and context...',
      'Applying Lakoff framing principles...',
      'Gathering regional policy context...',
      'Generating content structure...',
      'Creating compelling narrative...',
      'Optimizing for target audience...',
      'Finalizing content...'
    ];

    // Step 1: Input validation and analysis
    yield { step: steps[0], progress: 10 };
    await this.delay(500);

    // Step 2: Apply Lakoff framing
    yield { step: steps[1], progress: 20 };
    const framingContext = this.getLakoffFramingContext(request.topic);
    await this.delay(500);

    // Step 3: Regional context
    yield { step: steps[2], progress: 30 };
    const regionalContext = this.getRegionalContext(request.region);
    await this.delay(500);

    // Step 4: Generate structure
    yield { step: steps[3], progress: 40 };
    const contentStructure = this.getContentStructure(request.contentType);
    await this.delay(500);

    // Step 5: Create the prompt
    yield { step: steps[4], progress: 50 };
    const prompt = this.buildPrompt(request, framingContext, regionalContext, contentStructure);

    try {
      // Step 6: Generate with AI
      yield { step: steps[5], progress: 70 };
      
      const model = this.genAI.getGenerativeModel({ 
        model: this.getModelName(request.model),
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: this.getMaxTokens(request.contentType),
        }
      });

      const result = await model.generateContentStream(prompt);
      let fullContent = '';

      // Stream the response
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullContent += chunkText;
        yield { 
          step: steps[5], 
          progress: Math.min(70 + (fullContent.length / 100), 90),
          content: fullContent 
        };
      }

      // Step 7: Finalize
      yield { step: steps[6], progress: 100, content: fullContent };

    } catch (error) {
      console.error('AI Generation failed:', error);
      throw new Error(`Content generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getModelName(model: GeminiModel): string {
    const modelMap = {
      'gemini-2.5-pro': 'gemini-1.5-pro',
      'gemini-2.5-flash': 'gemini-1.5-flash',
      'gemma-3-12b-it': 'gemini-1.5-flash' // Fallback to flash for now
    };
    return modelMap[model];
  }

  private getMaxTokens(contentType: ContentType): number {
    const tokenLimits = {
      blog: 1000,
      article: 2000,
      playbook: 3000,
      social: 1500
    };
    return tokenLimits[contentType];
  }

  private getLakoffFramingContext(topic: string): string {
    return `
LAKOFF FRAMING PRINCIPLES:
- Use positive, value-based language that reinforces beneficial frames
- Avoid repeating or reinforcing negative opposition frames
- Focus on shared values: safety, prosperity, innovation, fairness
- Use conceptual metaphors that support policy objectives
- Frame AI as a tool for human flourishing, not a threat to be contained
- Emphasize opportunity and empowerment over restriction and control

TOPIC ANALYSIS: ${topic}
- Identify potential negative frames to avoid
- Establish positive conceptual metaphors
- Connect to universal human values
- Build bridges, not walls in messaging
`;
  }

  private getRegionalContext(region: Region): string {
    const contexts = {
      USA: `
UNITED STATES CONTEXT:
- Federal AI initiatives: NIST AI Risk Management Framework, Executive Orders on AI
- State-level implementations: California AI regulations, New York AI bias audits
- Bipartisan support for AI safety and American technological leadership
- Integration with existing regulatory frameworks (FDA, FTC, NHTSA)
- Focus on innovation while maintaining competitive advantage
- Public-private partnerships and industry collaboration
`,
      Europe: `
EUROPEAN CONTEXT:
- GDPR compliance and data protection principles
- AI Act implementation and risk-based approach
- Digital sovereignty and ethical AI principles
- Cross-border coordination and standards harmonization
- Fundamental rights and human-centric AI development
- Precautionary principle balanced with innovation
`,
      Australia: `
AUSTRALIAN CONTEXT:
- AI governance frameworks and responsible AI principles
- Digital transformation strategy and government AI adoption
- Public-private partnerships in AI development
- Regional leadership in responsible AI adoption
- Integration with existing privacy and consumer protection laws
- Focus on practical implementation and industry guidance
`,
      Morocco: `
MOROCCAN CONTEXT:
- Digital transformation strategy "Digital Morocco 2030"
- AI readiness and capacity building initiatives
- Economic diversification through technology adoption
- International cooperation and knowledge transfer
- Integration with African Union AI initiatives
- Focus on leapfrogging and sustainable development
`
    };
    return contexts[region];
  }

  private getContentStructure(contentType: ContentType): string {
    const structures = {
      blog: `
BLOG POST STRUCTURE (500-800 words):
1. Compelling headline with positive framing
2. Hook: Personal story or striking statistic
3. Problem identification (using positive frames)
4. Solution framework with clear benefits
5. Call-to-action with specific next steps
6. SEO optimization with relevant keywords
7. Social sharing elements
`,
      article: `
POLICY ARTICLE STRUCTURE (1200-1500 words):
1. Executive summary with key recommendations
2. Introduction with compelling narrative
3. Background and context analysis
4. Core policy framework with evidence
5. Implementation roadmap with timelines
6. Stakeholder benefits and addressing concerns
7. Conclusion with clear call-to-action
8. Citations and references
`,
      playbook: `
MARKETING PLAYBOOK STRUCTURE:
1. Executive summary and strategic overview
2. Brand story and value proposition
3. Target audience analysis and personas
4. Messaging framework with Lakoff principles
5. Channel strategy and content calendar
6. A/B testing framework and optimization
7. Metrics and success measurement
8. Implementation timeline and resources
`,
      social: `
SOCIAL MEDIA CALENDAR STRUCTURE (One Month):
1. Platform-specific content strategy
2. Daily post themes and messaging pillars
3. Hashtag research and trending topics
4. Visual content and multimedia elements
5. Engagement optimization and community building
6. Influencer collaboration opportunities
7. Performance tracking and analytics
8. Crisis communication protocols
`
    };
    return structures[contentType];
  }

  private buildPrompt(
    request: GenerationRequest, 
    framingContext: string, 
    regionalContext: string, 
    contentStructure: string
  ): string {
    const urlContext = request.url ? `\nREFERENCE URL: ${request.url}\nPlease analyze and reference relevant information from this source.` : '';

    let searchContext = '';
    if (request.searchResults && request.searchResults.length > 0) {
      searchContext = "\n\n### CURRENT INFORMATION FROM WEB SEARCH (2025)\n" +
                      "Use the following real-time search results to provide current and accurate information. These sources contain the most up-to-date information available. You MUST cite these sources properly in your response.\n\n";
      
      request.searchResults.forEach((result, index) => {
        // Use raw_content if available and longer, otherwise fall back to content
        const contentToUse = (result.raw_content && result.raw_content.length > result.content.length) 
          ? result.raw_content 
          : result.content;
        
        searchContext += `**SOURCE ${index + 1}:**\n` +
                         `Title: ${result.title}\n` +
                         `URL: ${result.link}\n` +
                         `Relevance Score: ${result.score}\n` +
                         `Content: ${contentToUse}\n` +
                         `${"=".repeat(80)}\n\n`;
      });
      
      searchContext += "**CITATION REQUIREMENTS:**\n" +
                       "1. When referencing information from these sources, use inline citations like: [Source Title](URL)\n" +
                       "2. Include a comprehensive 'Sources' section at the end with all referenced links\n" +
                       "3. Prioritize information from higher-scoring sources\n" +
                       "4. Use specific facts, dates, and quotes from the source content\n\n";
    }

    return `You are an expert policy communication strategist specializing in George Lakoff's cognitive framing methodology. Create compelling, strategically framed content that advances AI policy advocacy.

${framingContext}

${regionalContext}

${contentStructure}
${searchContext}
CONTENT REQUEST:
Topic: ${request.topic}
Content Type: ${this.getContentTypeLabel(request.contentType)}
Target Region: ${request.region}${urlContext}

INSTRUCTIONS:
1.  **Ground your response in the provided web search results.** All facts, statistics, and recent events must be based on the sources provided.
2.  Apply Lakoff framing principles throughout - use positive, value-based language.
3.  Incorporate regional policy context and cultural considerations.
4.  Follow the specified content structure and word count.
5.  Include specific, actionable recommendations.
6.  Use compelling storytelling and narrative techniques.
7.  Ensure content is accessible to both experts and general audiences.
8.  **Create accurate citations in your response based *only* on the provided search result sources.**

CRITICAL CITATION REQUIREMENTS:
- You MUST include inline citations for all facts, statistics, and claims using the format [Source Title](URL)
- You MUST include a comprehensive "Sources" section at the end listing all referenced sources
- Use specific information from the search results, not generic statements
- Prioritize higher-scoring sources for key information
- Include direct quotes where appropriate with proper attribution

Generate the content now:`;
  }

  private getContentTypeLabel(contentType: ContentType): string {
    const labels = {
      blog: 'Short Daily Blog Post',
      article: 'AI Policy Article',
      playbook: 'Marketing Playbook',
      social: 'Social Media Calendar'
    };
    return labels[contentType];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Validation methods
  validateApiKey(apiKey: string): boolean {
    return apiKey.startsWith('AIza') && apiKey.length > 30;
  }

  validateInput(request: Omit<GenerationRequest, 'apiKey'>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.topic.trim()) {
      errors.push('Topic is required');
    }

    if (request.topic.length < 3) {
      errors.push('Topic must be at least 3 characters long');
    }

    if (request.url && !this.isValidUrl(request.url)) {
      errors.push('Invalid URL format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}