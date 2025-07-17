import type { ContentRequest, ContentResponse } from './ContentGenerationEngine';
import { ContentGenerationEngine } from './ContentGenerationEngine';
import type { Region, ContentType, GeminiModel, Citation } from '../types';

/**
 * MarketingPlaybookGenerator class for generating comprehensive marketing playbooks
 * with Seth Godin's methodology, A/B testing framework, and integrated strategies
 * from Gary Vaynerchuk and Kieran Flanagan
 */
export class MarketingPlaybookGenerator {
  private contentEngine: ContentGenerationEngine;

  constructor() {
    this.contentEngine = new ContentGenerationEngine();
  }

  /**
   * Generate a comprehensive marketing playbook
   * 
   * @param topic - The playbook topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to generated marketing playbook
   */
  async generatePlaybook(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      marketingFocus?: 'brand-story' | 'content-strategy' | 'user-acquisition' | 'conversion-optimization' | 'comprehensive';
      includeABTesting?: boolean;
      includeConversionOptimization?: boolean;
      includeGaryVaynerchukStrategies?: boolean;
      includeKieranFlanaganStrategies?: boolean;
      includeSethGodinMethodology?: boolean;
      targetAudience?: string;
      industryVertical?: string;
      campaignDuration?: string;
      temperature?: number;
    } = {}
  ): Promise<ContentResponse> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'playbook' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 2048 // Appropriate for comprehensive playbook
    };

    // Enhance the playbook request with specialized options
    const enhancedRequest = this.enhancePlaybookRequest(request, options);

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
        includeCitations: true,
        includeExamples: true
      }
    );
  }

  /**
   * Generate a playbook with streaming response
   * 
   * @param topic - The playbook topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to a readable stream of content chunks
   */
  async generatePlaybookStream(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      marketingFocus?: 'brand-story' | 'content-strategy' | 'user-acquisition' | 'conversion-optimization' | 'comprehensive';
      includeABTesting?: boolean;
      includeConversionOptimization?: boolean;
      includeGaryVaynerchukStrategies?: boolean;
      includeKieranFlanaganStrategies?: boolean;
      includeSethGodinMethodology?: boolean;
      targetAudience?: string;
      industryVertical?: string;
      campaignDuration?: string;
      temperature?: number;
    } = {}
  ): Promise<ReadableStream<Uint8Array>> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'playbook' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 2048 // Appropriate for comprehensive playbook
    };

    // Enhance the playbook request with specialized options
    const enhancedRequest = this.enhancePlaybookRequest(request, options);

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
        includeCitations: true,
        includeExamples: true
      }
    );
  }

  /**
   * Enhance playbook request with specialized options for marketing playbooks
   * 
   * @param request - Original content request
   * @param options - Additional playbook options
   * @returns Enhanced content request
   */
  private enhancePlaybookRequest(
    request: ContentRequest,
    options: {
      marketingFocus?: 'brand-story' | 'content-strategy' | 'user-acquisition' | 'conversion-optimization' | 'comprehensive';
      includeABTesting?: boolean;
      includeConversionOptimization?: boolean;
      includeGaryVaynerchukStrategies?: boolean;
      includeKieranFlanaganStrategies?: boolean;
      includeSethGodinMethodology?: boolean;
      targetAudience?: string;
      industryVertical?: string;
      campaignDuration?: string;
    }
  ): ContentRequest {
    // Create a deep copy of the request to avoid modifying the original
    const enhancedRequest = JSON.parse(JSON.stringify(request)) as ContentRequest;
    
    // Add marketing focus if provided
    if (options.marketingFocus) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Marketing Focus: ${options.marketingFocus}]`;
    }
    
    // Add A/B testing requirement if requested
    if (options.includeABTesting) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include A/B Testing Framework]`;
    }
    
    // Add conversion optimization if requested
    if (options.includeConversionOptimization) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Conversion Optimization]`;
    }
    
    // Add Gary Vaynerchuk strategies if requested
    if (options.includeGaryVaynerchukStrategies) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Gary Vaynerchuk Strategies]`;
    }
    
    // Add Kieran Flanagan strategies if requested
    if (options.includeKieranFlanaganStrategies) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Kieran Flanagan Strategies]`;
    }
    
    // Add Seth Godin methodology if requested
    if (options.includeSethGodinMethodology) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Seth Godin Methodology]`;
    }
    
    // Add target audience if provided
    if (options.targetAudience) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Target Audience: ${options.targetAudience}]`;
    }
    
    // Add industry vertical if provided
    if (options.industryVertical) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Industry: ${options.industryVertical}]`;
    }
    
    // Add campaign duration if provided
    if (options.campaignDuration) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Campaign Duration: ${options.campaignDuration}]`;
    }
    
    return enhancedRequest;
  }

  /**
   * Format playbook with proper structure, sections, and frameworks
   * 
   * @param content - Raw generated content
   * @param citations - Citations to include
   * @param options - Formatting options
   * @returns Formatted playbook
   */
  formatPlaybook(
    content: string,
    citations: Citation[] = [],
    options: {
      includeBrandStoryFramework?: boolean;
      includeABTestingFramework?: boolean;
      includeActionableChecklist?: boolean;
      includeExecutiveSummary?: boolean;
    } = {}
  ): string {
    let formattedContent = content;
    
    // Add executive summary if requested and not already present
    if (options.includeExecutiveSummary && !content.includes('## Executive Summary')) {
      const summary = this.generateExecutiveSummary(content);
      formattedContent = `## Executive Summary\n\n${summary}\n\n${formattedContent}`;
    }
    
    // Add brand story framework if requested and not already present
    if (options.includeBrandStoryFramework && !content.includes('## Brand Story Framework')) {
      const brandStoryFramework = this.generateBrandStoryFramework();
      
      // Find appropriate section to insert after
      if (formattedContent.includes('## Strategy')) {
        formattedContent = formattedContent.replace(
          /## Strategy.*?\n\n/s,
          match => `${match}## Brand Story Framework\n\n${brandStoryFramework}\n\n`
        );
      } else {
        formattedContent = `${formattedContent}\n\n## Brand Story Framework\n\n${brandStoryFramework}`;
      }
    }
    
    // Add A/B testing framework if requested and not already present
    if (options.includeABTestingFramework && !content.includes('## A/B Testing Framework')) {
      const abTestingFramework = this.generateABTestingFramework();
      formattedContent = `${formattedContent}\n\n## A/B Testing Framework\n\n${abTestingFramework}`;
    }
    
    // Add actionable checklist if requested and not already present
    if (options.includeActionableChecklist && !content.includes('## Actionable Checklist')) {
      const actionableChecklist = this.generateActionableChecklist(content);
      formattedContent = `${formattedContent}\n\n## Actionable Checklist\n\n${actionableChecklist}`;
    }
    
    // Add citations if provided and not already in the content
    if (citations.length > 0 && !content.includes('## References')) {
      const citationsSection = this.formatCitations(citations);
      formattedContent = `${formattedContent}\n\n## References\n\n${citationsSection}`;
    }
    
    // Ensure proper playbook structure with headings
    formattedContent = this.ensurePlaybookStructure(formattedContent);
    
    return formattedContent;
  }

  /**
   * Generate an executive summary from content
   * 
   * @param content - The playbook content
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
    
    return 'This marketing playbook provides a comprehensive strategy for effective communication and audience engagement.';
  }

  /**
   * Generate Seth Godin's brand story framework
   * 
   * @returns Brand story framework text
   */
  private generateBrandStoryFramework(): string {
    return `### Seth Godin's Brand Story Framework

Following Seth Godin's permission marketing philosophy, your brand story should be structured around these key elements:

1. **The Promise**: What specific transformation or value do you promise to deliver?
   - Make it clear, compelling, and different from competitors
   - Focus on the change you create, not just features

2. **The Worldview**: What belief system does your audience already have?
   - Identify the worldview your ideal customers share
   - Connect your story to their existing beliefs rather than trying to change them

3. **The Values**: What principles guide your work?
   - Articulate 3-5 core values that define your approach
   - Show how these values benefit your audience

4. **The Tension**: What problem or challenge creates urgency?
   - Identify the status quo that's no longer acceptable
   - Create tension between where they are and where they could be

5. **The Resolution**: How does your solution resolve the tension?
   - Show the path from problem to solution
   - Make the resolution feel inevitable and satisfying

6. **The Permission**: How will you earn ongoing attention?
   - Define your permission asset strategy
   - Create value before extracting value

7. **The Remarkable Factor**: What makes your story worth sharing?
   - Identify the "purple cow" element that makes people talk
   - Design for word-of-mouth from the beginning

Use this framework to craft a coherent brand narrative that resonates with your audience's existing worldview and earns their ongoing attention.`;
  }

  /**
   * Generate A/B testing framework
   * 
   * @returns A/B testing framework text
   */
  private generateABTestingFramework(): string {
    return `### A/B Testing Framework for Conversion Optimization

Implement this systematic A/B testing approach to continuously improve your marketing performance:

1. **Hypothesis Development**
   - Start with a clear hypothesis: "We believe that [change] will result in [outcome] because [rationale]"
   - Base hypotheses on data, user feedback, and heuristic analysis
   - Prioritize tests using the PIE framework: Potential, Importance, Ease

2. **Test Design**
   - Define one clear variable to test (headline, CTA, image, etc.)
   - Determine appropriate sample size for statistical significance
   - Set test duration (minimum 1-2 weeks, ideally capturing full business cycles)
   - Establish primary and secondary success metrics

3. **Implementation**
   - Use reliable testing tools (Google Optimize, Optimizely, VWO, etc.)
   - Ensure proper tracking setup with event tagging
   - QA test all variants across devices and browsers
   - Document test parameters and expected outcomes

4. **Analysis**
   - Wait for statistical significance (95% confidence minimum)
   - Analyze both primary and secondary metrics
   - Segment results by traffic source, device, and user type
   - Look for unexpected patterns and insights

5. **Implementation & Iteration**
   - Document learnings regardless of outcome
   - Implement winning variants
   - Use insights to inform next round of testing
   - Build a knowledge base of test results

**Key Elements to Test:**
- Headlines and value propositions
- Call-to-action text, design, and placement
- Form fields and checkout process
- Social proof and trust indicators
- Pricing presentation and options
- Page layout and visual hierarchy
- Content length and format

**Conversion Optimization Metrics:**
- Conversion rate (primary to secondary)
- Click-through rate
- Form completion rate
- Cart abandonment rate
- Average order value
- Revenue per visitor
- Customer acquisition cost`;
  }

  /**
   * Generate actionable checklist from content
   * 
   * @param content - The playbook content
   * @returns Actionable checklist text
   */
  private generateActionableChecklist(content: string): string {
    // Extract potential action items from content
    const actionItems: string[] = [];
    
    // Look for common action verbs and phrases in the content
    const actionVerbs = [
      'implement', 'create', 'develop', 'establish', 'set up', 'build',
      'define', 'identify', 'optimize', 'launch', 'measure', 'analyze'
    ];
    
    // Extract sentences that might contain action items
    const sentences = content.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    // Find sentences with action verbs
    actionVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'i');
      sentences.forEach(sentence => {
        if (regex.test(sentence) && !actionItems.includes(sentence.trim())) {
          // Clean up the sentence to make it an action item
          let actionItem = sentence.trim()
            .replace(/^(you should|we recommend|it's important to)\s+/i, '')
            .replace(/^(and|or|but|however|therefore)\s+/i, '');
          
          // Capitalize first letter
          actionItem = actionItem.charAt(0).toUpperCase() + actionItem.slice(1);
          
          // Add to action items if not already included
          if (actionItem.length > 10 && !actionItems.includes(actionItem)) {
            actionItems.push(actionItem);
          }
        }
      });
    });
    
    // If we found action items in the content, use them
    let checklist = `Use this checklist to implement your marketing strategy:\n\n`;
    
    // Add foundation section with either extracted or default items
    checklist += `### Foundation\n`;
    if (actionItems.length >= 4) {
      // Use extracted items
      for (let i = 0; i < Math.min(4, actionItems.length); i++) {
        checklist += `- [ ] ${actionItems[i]}\n`;
      }
    } else {
      // Use default items
      checklist += `- [ ] Define clear brand positioning and unique value proposition
- [ ] Identify target audience segments and create detailed personas
- [ ] Establish brand voice and messaging guidelines
- [ ] Set up analytics and tracking infrastructure\n`;
    }
    
    // Add content creation section
    checklist += `\n### Content Creation\n`;
    if (actionItems.length >= 8) {
      // Use extracted items
      for (let i = 4; i < Math.min(8, actionItems.length); i++) {
        checklist += `- [ ] ${actionItems[i]}\n`;
      }
    } else {
      // Use default items
      checklist += `- [ ] Develop content calendar aligned with marketing objectives
- [ ] Create cornerstone content pieces for each funnel stage
- [ ] Optimize all content for SEO and conversion
- [ ] Establish content distribution workflows\n`;
    }
    
    // Add acquisition strategy section
    checklist += `\n### Acquisition Strategy\n`;
    if (actionItems.length >= 12) {
      // Use extracted items
      for (let i = 8; i < Math.min(12, actionItems.length); i++) {
        checklist += `- [ ] ${actionItems[i]}\n`;
      }
    } else {
      // Use default items
      checklist += `- [ ] Implement Kieran Flanagan's "ICE" framework for channel prioritization
- [ ] Set up initial campaigns on 2-3 highest potential channels
- [ ] Create landing pages optimized for conversion
- [ ] Develop lead magnet and opt-in strategy\n`;
    }
    
    // Add engagement & retention section
    checklist += `\n### Engagement & Retention\n`;
    if (actionItems.length >= 16) {
      // Use extracted items
      for (let i = 12; i < Math.min(16, actionItems.length); i++) {
        checklist += `- [ ] ${actionItems[i]}\n`;
      }
    } else {
      // Use default items
      checklist += `- [ ] Implement Gary Vaynerchuk's "jab, jab, jab, right hook" content approach
- [ ] Set up email nurture sequences for different segments
- [ ] Create community engagement strategy
- [ ] Develop loyalty and referral programs\n`;
    }
    
    // Add optimization section
    checklist += `\n### Optimization\n`;
    if (actionItems.length >= 20) {
      // Use extracted items
      for (let i = 16; i < Math.min(20, actionItems.length); i++) {
        checklist += `- [ ] ${actionItems[i]}\n`;
      }
    } else {
      // Use default items
      checklist += `- [ ] Set up A/B testing program for key conversion points
- [ ] Implement regular data review and insight generation
- [ ] Create feedback loops between customer service and marketing
- [ ] Establish quarterly strategy review and adjustment process`;
    }
    
    return checklist;
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
   * Ensure proper playbook structure with headings
   * 
   * @param content - The content to structure
   * @returns Properly structured content
   */
  private ensurePlaybookStructure(content: string): string {
    // If content already has a main heading, return as is
    if (content.match(/^#\s/m)) {
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
   * Generate Gary Vaynerchuk content strategy
   * 
   * @param topic - The topic to create strategy for
   * @returns Gary Vaynerchuk content strategy
   */
  generateGaryVaynerchukStrategy(topic: string): string {
    return `## Gary Vaynerchuk Content Strategy for "${topic}"

### Core Principles
1. **Document, Don't Create**: Focus on authentic documentation of your journey rather than polished production
2. **Quantity with Quality**: Produce high-volume content across platforms while maintaining quality
3. **Platform-Native Content**: Adapt content specifically for each platform's unique environment
4. **Jab, Jab, Jab, Right Hook**: Provide value multiple times before asking for anything in return

### Content Pillars
1. **Micro-Content**: Short-form, attention-grabbing content for social platforms
   - Platform-specific formats (Stories, Reels, TikToks, Tweets)
   - Behind-the-scenes glimpses
   - Quick tips and insights
   - Repurposed from long-form content

2. **Long-Form Value**: In-depth content that establishes authority
   - Podcast episodes (audio and video)
   - Blog articles and newsletters
   - YouTube videos
   - Livestreams and Q&As

3. **Community Engagement**: Direct interaction with audience
   - Comments and DM responses
   - User-generated content features
   - Community challenges and participation
   - Real-time engagement during live events

### Implementation Strategy
1. **Content Ecosystem**: Create one piece of pillar content weekly, then atomize into 30+ pieces of micro-content
2. **Day Trading Attention**: Focus on trending topics and platforms where attention is underpriced
3. **Personal Branding**: Build the personal brand alongside the business brand
4. **Distribution > Creation**: Spend 80% of time on distribution, 20% on creation

### Measurement Framework
- Engagement rate across platforms
- Community growth and participation metrics
- Content consumption depth (watch time, read time)
- Share of voice in industry conversation
- Conversion from audience to customers`;
  }

  /**
   * Generate Kieran Flanagan growth strategy
   * 
   * @param topic - The topic to create strategy for
   * @returns Kieran Flanagan growth strategy
   */
  generateKieranFlanaganStrategy(topic: string): string {
    return `## Kieran Flanagan Growth Strategy for "${topic}"

### Growth Framework
1. **ICE Prioritization**: Score all growth initiatives by Impact, Confidence, and Ease
2. **North Star Metric**: Identify the one metric that best represents customer value and business growth
3. **Growth Loops**: Design self-reinforcing systems that drive continuous growth
4. **Experimentation Engine**: Build rapid testing capabilities across the entire customer journey

### Acquisition Strategy
1. **Content-Product Fit**: Create content that attracts your ideal customer and naturally leads to product adoption
   - SEO-driven content strategy targeting high-intent keywords
   - Topic clusters organized around core business pillars
   - Distribution strategy for each content piece

2. **PLG (Product-Led Growth)**: Use the product itself as the primary acquisition channel
   - Free tools and templates that showcase product value
   - Freemium model with strategic conversion points
   - Network effects built into core product experience

3. **Ecosystem Development**: Build partnerships and integrations that expand reach
   - Integration marketplace strategy
   - Co-marketing opportunities with complementary products
   - Community-building initiatives

### Conversion Optimization
1. **Activation Framework**: Define the key actions that lead to user success
   - Clear "aha moment" identification
   - Onboarding optimization for key activation events
   - User segmentation based on use case and behavior

2. **Conversion Path Analysis**: Identify and remove friction points
   - Funnel analysis with drop-off identification
   - User session recordings and heatmaps
   - Qualitative feedback collection at abandonment points

3. **Pricing Psychology**: Optimize pricing presentation for conversion
   - Value metric alignment with customer perception
   - Packaging and tiering strategy
   - Anchoring and contrast principles

### Retention Strategy
1. **Success Gap Analysis**: Identify gaps between current and desired customer outcomes
2. **Habit Formation**: Build product usage into daily/weekly workflows
3. **Expansion Triggers**: Create natural upsell and cross-sell opportunities
4. **Proactive Engagement**: Intervene before churn signals appear

### Measurement Framework
- North Star Metric growth rate
- Acquisition channel CAC and LTV/CAC ratio
- Activation rate for key success milestones
- Net Revenue Retention
- Referral and virality coefficients`;
  }

  /**
   * Generate Seth Godin's permission marketing methodology
   * 
   * @param topic - The topic to create methodology for
   * @returns Seth Godin's permission marketing methodology
   */
  generateSethGodinMethodology(topic: string): string {
    return `## Seth Godin's Permission Marketing Methodology for "${topic}"

### Core Principles
1. **Permission-Based**: Only market to people who have explicitly given you permission
2. **Anticipated**: Create content and offers that people look forward to receiving
3. **Personal**: Customize messaging based on individual preferences and behaviors
4. **Relevant**: Deliver value that directly addresses the audience's needs and interests

### The Permission Marketing Funnel
1. **Stranger to Friend**: Offer a free "bait" piece of content with immediate value
   - Lead magnets that solve a specific problem
   - No-strings-attached tools or resources
   - Educational content that demonstrates expertise

2. **Friend to Customer**: Nurture with consistent value delivery
   - Regular, anticipated communication
   - Escalating levels of trust and engagement
   - Personalized content based on behavior and preferences

3. **Customer to Loyalist**: Transform the relationship through exceptional experience
   - Surprise and delight moments
   - Community building and belonging
   - Insider access and special privileges

### Implementation Framework
1. **Value-First Content Strategy**
   - Create "idea viruses" worth spreading
   - Focus on being remarkable ("Purple Cow")
   - Build a permission asset before monetization

2. **Trust-Building Communication**
   - Make and keep promises consistently
   - Be transparent about intentions
   - Respect privacy and preferences

3. **Storytelling Approach**
   - Tell authentic stories that resonate with worldviews
   - Create tension that your solution resolves
   - Use consistent narrative across touchpoints

### Measurement Framework
- Permission asset growth (email list, subscribers)
- Engagement depth (opens, clicks, time spent)
- Trust indicators (testimonials, reviews, referrals)
- Permission level advancement rates
- Customer lifetime value growth

### Ethical Guidelines
- Never abuse permission once granted
- Make it easy to opt out at any time
- Deliver more value than you extract
- Respect privacy and data boundaries
- Be honest about what you're offering`;
  }
}

// Export singleton instance
export const marketingPlaybookGenerator = new MarketingPlaybookGenerator();