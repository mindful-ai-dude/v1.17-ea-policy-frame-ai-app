import type { ContentRequest, ContentResponse } from './ContentGenerationEngine';
import { ContentGenerationEngine } from './ContentGenerationEngine';
import type { Region, ContentType, GeminiModel, Citation } from '../types';

/**
 * SocialMediaCalendarGenerator class for generating one-month social media calendars
 * with platform-specific content optimization, hashtag research, and engagement strategies
 */
export class SocialMediaCalendarGenerator {
  private contentEngine: ContentGenerationEngine;

  constructor() {
    this.contentEngine = new ContentGenerationEngine();
  }

  /**
   * Generate a one-month social media calendar
   * 
   * @param topic - The calendar topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to generated social media calendar
   */
  async generateCalendar(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok')[];
      postFrequency?: 'daily' | 'weekday-only' | 'three-per-week' | 'twice-weekly';
      includeHashtagResearch?: boolean;
      includeTrendingTopics?: boolean;
      includeEngagementStrategies?: boolean;
      includeAnalytics?: boolean;
      targetAudience?: string;
      campaignGoals?: string;
      temperature?: number;
    } = {}
  ): Promise<ContentResponse> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'social' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 2048 // Appropriate for comprehensive social media calendar
    };

    // Enhance the calendar request with specialized options
    const enhancedRequest = this.enhanceCalendarRequest(request, options);

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
   * Generate a social media calendar with streaming response
   * 
   * @param topic - The calendar topic
   * @param region - Geographic region for context
   * @param model - Gemini model to use
   * @param options - Additional generation options
   * @returns Promise resolving to a readable stream of content chunks
   */
  async generateCalendarStream(
    topic: string,
    region: Region,
    model: GeminiModel,
    options: {
      url?: string;
      platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok')[];
      postFrequency?: 'daily' | 'weekday-only' | 'three-per-week' | 'twice-weekly';
      includeHashtagResearch?: boolean;
      includeTrendingTopics?: boolean;
      includeEngagementStrategies?: boolean;
      includeAnalytics?: boolean;
      targetAudience?: string;
      campaignGoals?: string;
      temperature?: number;
    } = {}
  ): Promise<ReadableStream<Uint8Array>> {
    // Create content request
    const request: ContentRequest = {
      input: {
        topic,
        url: options.url,
        region,
        contentType: 'social' as ContentType
      },
      model,
      temperature: options.temperature || 0.7,
      maxOutputTokens: 2048 // Appropriate for comprehensive social media calendar
    };

    // Enhance the calendar request with specialized options
    const enhancedRequest = this.enhanceCalendarRequest(request, options);

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
   * Enhance calendar request with specialized options for social media calendars
   * 
   * @param request - Original content request
   * @param options - Additional calendar options
   * @returns Enhanced content request
   */
  private enhanceCalendarRequest(
    request: ContentRequest,
    options: {
      platforms?: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok')[];
      postFrequency?: 'daily' | 'weekday-only' | 'three-per-week' | 'twice-weekly';
      includeHashtagResearch?: boolean;
      includeTrendingTopics?: boolean;
      includeEngagementStrategies?: boolean;
      includeAnalytics?: boolean;
      targetAudience?: string;
      campaignGoals?: string;
    }
  ): ContentRequest {
    // Create a deep copy of the request to avoid modifying the original
    const enhancedRequest = JSON.parse(JSON.stringify(request)) as ContentRequest;
    
    // Add platforms if provided
    if (options.platforms && options.platforms.length > 0) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Platforms: ${options.platforms.join(', ')}]`;
    }
    
    // Add post frequency if provided
    if (options.postFrequency) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Post Frequency: ${options.postFrequency}]`;
    }
    
    // Add hashtag research requirement if requested
    if (options.includeHashtagResearch) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Hashtag Research]`;
    }
    
    // Add trending topics requirement if requested
    if (options.includeTrendingTopics) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Trending Topics]`;
    }
    
    // Add engagement strategies if requested
    if (options.includeEngagementStrategies) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Engagement Strategies]`;
    }
    
    // Add analytics if requested
    if (options.includeAnalytics) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Include Analytics Framework]`;
    }
    
    // Add target audience if provided
    if (options.targetAudience) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Target Audience: ${options.targetAudience}]`;
    }
    
    // Add campaign goals if provided
    if (options.campaignGoals) {
      enhancedRequest.input.topic = `${enhancedRequest.input.topic} [Campaign Goals: ${options.campaignGoals}]`;
    }
    
    return enhancedRequest;
  }

  /**
   * Format calendar with proper structure, sections, and platform-specific content
   * 
   * @param content - Raw generated content
   * @param citations - Citations to include
   * @param options - Formatting options
   * @returns Formatted social media calendar
   */
  formatCalendar(
    content: string,
    citations: Citation[] = [],
    options: {
      includeHashtagLibrary?: boolean;
      includeContentTemplates?: boolean;
      includeSchedulingRecommendations?: boolean;
      includePerformanceMetrics?: boolean;
      exportFormat?: 'markdown' | 'csv' | 'html';
    } = {}
  ): string {
    let formattedContent = content;
    
    // Add hashtag library if requested and not already present
    if (options.includeHashtagLibrary && !content.includes('## Hashtag Library')) {
      const hashtagLibrary = this.generateHashtagLibrary(content);
      formattedContent = `${formattedContent}\n\n## Hashtag Library\n\n${hashtagLibrary}`;
    }
    
    // Add content templates if requested and not already present
    if (options.includeContentTemplates && !content.includes('## Content Templates')) {
      const contentTemplates = this.generateContentTemplates();
      formattedContent = `${formattedContent}\n\n## Content Templates\n\n${contentTemplates}`;
    }
    
    // Add scheduling recommendations if requested and not already present
    if (options.includeSchedulingRecommendations && !content.includes('## Scheduling Recommendations')) {
      const schedulingRecommendations = this.generateSchedulingRecommendations();
      formattedContent = `${formattedContent}\n\n## Scheduling Recommendations\n\n${schedulingRecommendations}`;
    }
    
    // Add performance metrics if requested and not already present
    if (options.includePerformanceMetrics && !content.includes('## Performance Metrics')) {
      const performanceMetrics = this.generatePerformanceMetrics();
      formattedContent = `${formattedContent}\n\n## Performance Metrics\n\n${performanceMetrics}`;
    }
    
    // Add citations if provided and not already in the content
    if (citations.length > 0 && !content.includes('## References')) {
      const citationsSection = this.formatCitations(citations);
      formattedContent = `${formattedContent}\n\n## References\n\n${citationsSection}`;
    }
    
    // Format for export if specified
    if (options.exportFormat && options.exportFormat !== 'markdown') {
      formattedContent = this.formatForExport(formattedContent, options.exportFormat);
    }
    
    // Ensure proper calendar structure with headings
    formattedContent = this.ensureCalendarStructure(formattedContent);
    
    return formattedContent;
  }

  /**
   * Generate hashtag library based on content
   * 
   * @param content - The calendar content
   * @returns Hashtag library text
   */
  private generateHashtagLibrary(content: string): string {
    // Extract hashtags from content
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = content.match(hashtagRegex) || [];
    
    // Count and sort hashtags by frequency
    const hashtagCounts: Record<string, number> = {};
    matches.forEach(hashtag => {
      hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
    });
    
    // Sort hashtags by frequency
    const sortedHashtags = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([hashtag]) => hashtag);
    
    // If no hashtags found, create default ones based on common topics
    if (sortedHashtags.length === 0) {
      return `### Primary Hashtags (Use in most posts)
- #AIPolicy
- #AIEthics
- #AIGovernance
- #ResponsibleAI
- #AIForGood

### Secondary Hashtags (Rotate through these)
- #MachineLearning
- #AIRegulation
- #TechPolicy
- #DigitalEthics
- #AIAlignment
- #FutureTech
- #TechForGood
- #AIResearch

### Trending Hashtags (Research current trends before using)
- #AIAct
- #AIInnovation
- #TechForHumanity
- #DigitalRights
- #AITransparency`;
    }
    
    // Group hashtags by category (simplified approach)
    const primaryHashtags = sortedHashtags.slice(0, 5);
    const secondaryHashtags = sortedHashtags.slice(5, 15);
    const trendingHashtags = sortedHashtags.slice(15, 25);
    
    // Format hashtag library
    let hashtagLibrary = `### Primary Hashtags (Use in most posts)\n`;
    primaryHashtags.forEach(hashtag => {
      hashtagLibrary += `- ${hashtag}\n`;
    });
    
    hashtagLibrary += `\n### Secondary Hashtags (Rotate through these)\n`;
    secondaryHashtags.forEach(hashtag => {
      hashtagLibrary += `- ${hashtag}\n`;
    });
    
    if (trendingHashtags.length > 0) {
      hashtagLibrary += `\n### Trending Hashtags (Research current trends before using)\n`;
      trendingHashtags.forEach(hashtag => {
        hashtagLibrary += `- ${hashtag}\n`;
      });
    }
    
    return hashtagLibrary;
  }

  /**
   * Generate content templates for different platforms
   * 
   * @returns Content templates text
   */
  private generateContentTemplates(): string {
    return `### Twitter/X Templates

**Question Post**
[Thought-provoking question about AI policy]
#AIPolicy #AIEthics

**Statistic Post**
[Surprising statistic] about AI adoption in [industry/region].
Source: [Source]
#AIStats #AITrends

**Quote Post**
"[Quote about AI or policy]" - [Source]
What's your take?
#AIQuotes #AIWisdom

---

### LinkedIn Templates

**Insight Post**
[Headline]

[2-3 paragraphs of analysis on an AI policy development]

[Question to encourage comments]

#AIPolicy #ProfessionalInsights

**Case Study Teaser**
How [Organization] is implementing responsible AI governance:

✅ [Key point 1]
✅ [Key point 2]
✅ [Key point 3]

Read our full analysis: [Link]
#ResponsibleAI #AIGovernance

---

### Facebook Templates

**Discussion Starter**
[Headline question]

[Context paragraph]

What do you think? Share your perspective in the comments!

**Resource Share**
NEW RESOURCE: [Title]

[Brief description of resource and why it's valuable]

Download/Read here: [Link]

---

### Instagram Templates

**Carousel Post**
Slide 1: [Eye-catching title/question]
Slide 2: [Key point 1 with visual]
Slide 3: [Key point 2 with visual]
Slide 4: [Key point 3 with visual]
Slide 5: [Call to action]

Caption: [Expanded context with hashtags]

**Quote Graphic**
[Visual with quote overlay]

Caption: [Context for quote, attribution, and your organization's perspective]
`;
  }

  /**
   * Generate scheduling recommendations for optimal posting times
   * 
   * @returns Scheduling recommendations text
   */
  private generateSchedulingRecommendations(): string {
    return `### Optimal Posting Times by Platform

**Twitter/X**
- Primary: Tuesday & Wednesday, 9-11am
- Secondary: Monday-Friday, 1-3pm
- Weekend: Saturday 9-11am
- Avoid: Sunday evenings, weekdays after 6pm

**LinkedIn**
- Primary: Tuesday, Wednesday & Thursday, 8-10am
- Secondary: Monday-Friday, 12-1pm
- Avoid: Weekends, after 5pm on weekdays

**Facebook**
- Primary: Wednesday 11am-1pm
- Secondary: Monday-Friday, 9-10am
- Weekend: Saturday 12-1pm
- Avoid: Early mornings, late evenings

**Instagram**
- Primary: Wednesday 11am-1pm, Friday 10-11am
- Secondary: Tuesday & Thursday, 7-9pm
- Weekend: Saturday 8-11pm
- Avoid: Sunday

### Frequency Recommendations

**High-Engagement Strategy**
- Twitter/X: 3-5 posts per day
- LinkedIn: 1-2 posts per day
- Facebook: 1 post per day
- Instagram: 4-5 posts per week

**Moderate-Engagement Strategy**
- Twitter/X: 1-2 posts per day
- LinkedIn: 3-4 posts per week
- Facebook: 3-4 posts per week
- Instagram: 2-3 posts per week

**Minimum-Viable Strategy**
- Twitter/X: 3-5 posts per week
- LinkedIn: 2 posts per week
- Facebook: 2 posts per week
- Instagram: 1-2 posts per week

### Content Distribution

Maintain a balanced mix of content types:
- 40% Educational/Informative
- 25% Engagement/Conversation
- 20% Promotional/Call-to-action
- 15% Curated/Third-party content`;
  }

  /**
   * Generate performance metrics framework for social media
   * 
   * @returns Performance metrics text
   */
  private generatePerformanceMetrics(): string {
    return `### Key Performance Indicators by Platform

**Twitter/X**
- Engagement Rate = (Likes + Retweets + Replies) / Impressions
- Click-Through Rate = Clicks / Impressions
- Follower Growth Rate = (New Followers / Total Followers) × 100
- Amplification Rate = Retweets / Total Posts

**LinkedIn**
- Engagement Rate = (Reactions + Comments + Shares + Clicks) / Impressions
- Click-Through Rate = Clicks / Impressions
- Follower Growth Rate = (New Followers / Total Followers) × 100
- Comment Rate = Comments / Total Posts

**Facebook**
- Engagement Rate = (Reactions + Comments + Shares) / Reach
- Click-Through Rate = Link Clicks / Reach
- Video Completion Rate = Number of Video Views at 95% / Total Video Views
- Share Rate = Shares / Total Posts

**Instagram**
- Engagement Rate = (Likes + Comments) / Followers
- Reach Rate = Reach / Followers
- Save Rate = Saves / Reach
- Story Completion Rate = Last Frame Views / First Frame Views

### Tracking Framework

**Weekly Metrics**
- Track engagement rates across all platforms
- Monitor hashtag performance
- Review top and bottom performing posts
- Analyze optimal posting times based on engagement

**Monthly Metrics**
- Follower growth across platforms
- Content theme performance analysis
- Conversion from social to website/landing pages
- Sentiment analysis of comments and replies

**Quarterly Metrics**
- Channel ROI assessment
- Audience demographic changes
- Competitive benchmark analysis
- Content strategy effectiveness review`;
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
   * Ensure proper calendar structure with headings
   * 
   * @param content - The content to structure
   * @returns Properly structured content
   */
  private ensureCalendarStructure(content: string): string {
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
   * Format calendar for export in different formats
   * 
   * @param content - The calendar content in markdown
   * @param format - The export format
   * @returns Formatted content for export
   */
  private formatForExport(content: string, format: 'csv' | 'html'): string {
    if (format === 'csv') {
      // Extract calendar entries and convert to CSV
      // This is a simplified implementation
      const lines = content.split('\n');
      let csv = 'Date,Platform,Content,Hashtags,Media Type,Notes\n';
      
      // Look for date patterns and calendar entries
      const datePattern = /\*\*(.*?)\*\*/;
      let currentDate = '';
      
      lines.forEach(line => {
        const dateMatch = line.match(datePattern);
        
        if (dateMatch) {
          currentDate = dateMatch[1];
        } else if (currentDate && line.includes('-') && !line.startsWith('#')) {
          // Assume this is a calendar entry
          const parts = line.split('-').map(part => part.trim());
          
          if (parts.length >= 2) {
            // Try to extract platform, content, and hashtags
            let platform = 'All';
            let content = parts[1];
            let hashtags = '';
            
            // Check if platform is specified at the beginning
            if (parts[0].match(/\[(Twitter|LinkedIn|Facebook|Instagram|TikTok)\]/i)) {
              platform = parts[0].replace(/[\[\]]/g, '');
            }
            
            // Extract hashtags
            const hashtagMatch = content.match(/(#[a-zA-Z0-9_]+\s*)+$/);
            if (hashtagMatch) {
              hashtags = hashtagMatch[0];
              content = content.replace(hashtagMatch[0], '').trim();
            }
            
            // Add to CSV
            csv += `"${currentDate}","${platform}","${content}","${hashtags}","",""\n`;
          }
        }
      });
      
      return csv;
    } else if (format === 'html') {
      // Convert markdown to simple HTML
      let html = '<!DOCTYPE html>\n<html>\n<head>\n<title>Social Media Calendar</title>\n';
      html += '<style>\n';
      html += 'body { font-family: Arial, sans-serif; line-height: 1.6; }\n';
      html += 'h1 { color: #2c3e50; }\n';
      html += 'h2 { color: #3498db; margin-top: 20px; }\n';
      html += 'h3 { color: #2980b9; }\n';
      html += 'table { border-collapse: collapse; width: 100%; margin: 20px 0; }\n';
      html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n';
      html += 'th { background-color: #f2f2f2; }\n';
      html += 'tr:nth-child(even) { background-color: #f9f9f9; }\n';
      html += '.hashtag { color: #3498db; }\n';
      html += '</style>\n';
      html += '</head>\n<body>\n';
      
      // Convert markdown headings
      let htmlContent = content
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/(#[a-zA-Z0-9_]+)/g, '<span class="hashtag">$1</span>');
      
      html += htmlContent;
      html += '\n</body>\n</html>';
      
      return html;
    }
    
    // Default to original content if format not supported
    return content;
  }

  /**
   * Research trending hashtags for a topic
   * 
   * @param topic - The topic to research hashtags for
   * @param platforms - Social media platforms to focus on
   * @returns Trending hashtags by platform
   */
  async researchTrendingHashtags(
    topic: string,
    platforms: ('twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok')[] = ['twitter', 'linkedin']
  ): Promise<Record<string, string[]>> {
    // In a real implementation, this would use social media APIs or third-party services
    // For now, return mock trending hashtags based on topic
    
    // Generate topic-specific hashtags
    const topicWords = topic.toLowerCase().split(/\s+/);
    const topicHashtags = topicWords.map(word => {
      // Remove non-alphanumeric characters
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      return cleanWord ? `#${cleanWord}` : '';
    }).filter(Boolean);
    
    // Create platform-specific hashtag recommendations
    const trendingHashtags: Record<string, string[]> = {};
    
    if (platforms.includes('twitter')) {
      trendingHashtags.twitter = [
        ...topicHashtags,
        '#AIPolicy',
        '#TechPolicy',
        '#AIEthics',
        '#AIGovernance',
        '#ResponsibleAI',
        '#AIRegulation'
      ];
    }
    
    if (platforms.includes('linkedin')) {
      trendingHashtags.linkedin = [
        ...topicHashtags,
        '#ArtificialIntelligence',
        '#MachineLearning',
        '#AIStrategy',
        '#DigitalTransformation',
        '#FutureOfWork',
        '#TechTrends'
      ];
    }
    
    if (platforms.includes('facebook')) {
      trendingHashtags.facebook = [
        ...topicHashtags,
        '#AIInnovation',
        '#TechnologyTrends',
        '#DigitalFuture',
        '#TechForGood',
        '#InnovationMatters'
      ];
    }
    
    if (platforms.includes('instagram')) {
      trendingHashtags.instagram = [
        ...topicHashtags,
        '#TechLife',
        '#InnovationNation',
        '#FutureTech',
        '#AIRevolution',
        '#DigitalWorld',
        '#TechTalk'
      ];
    }
    
    if (platforms.includes('tiktok')) {
      trendingHashtags.tiktok = [
        ...topicHashtags,
        '#TechTok',
        '#LearnOnTikTok',
        '#AIExplained',
        '#FutureTech',
        '#TechTrends',
        '#AITok'
      ];
    }
    
    return trendingHashtags;
  }

  /**
   * Generate platform-specific content ideas
   * 
   * @param topic - The topic to generate ideas for
   * @param platform - The social media platform
   * @param count - Number of ideas to generate
   * @returns Array of content ideas
   */
  generatePlatformSpecificIdeas(
    topic: string,
    platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok',
    count: number = 5
  ): string[] {
    // Platform-specific content ideas
    const platformIdeas: Record<string, string[]> = {
      twitter: [
        `Poll: What's the most important aspect of ${topic}? #AIPolicy`,
        `Thread: 5 key insights about ${topic} that policymakers need to understand. #AIGovernance`,
        `"[Quote about ${topic}]" - What's your take? #AIEthics`,
        `Breaking down the latest development in ${topic} in 280 characters. #AIPolicy`,
        `Myth vs. Reality: Common misconceptions about ${topic}. #FactCheck #AIFacts`,
        `Question: How would you approach ${topic} differently? #AIDiscussion`,
        `The one thing everyone gets wrong about ${topic}. #AIInsights`,
        `ICYMI: Our latest research on ${topic} reveals surprising findings. #AIResearch`
      ],
      linkedin: [
        `[Headline statistic] about ${topic} is changing how organizations approach AI policy. Here's what you need to know... #AIStrategy`,
        `I've been thinking about ${topic} lately, and here are 3 insights for policy professionals... #AIGovernance`,
        `New research on ${topic} challenges conventional wisdom. Here's my analysis... #AIPolicy`,
        `Case study: How [Organization] is addressing ${topic} with innovative approaches. #AILeadership`,
        `5 questions every leader should ask about ${topic} before implementing AI systems. #ResponsibleAI`,
        `The business implications of ${topic} extend beyond compliance. Here's why... #AIStrategy`,
        `Lessons from my experience working with ${topic} that could help your organization. #ProfessionalInsights`,
        `[Contrarian take] on ${topic} that might change how you think about AI governance. #AIThought`
      ],
      facebook: [
        `We're curious: How has ${topic} affected your organization? Share your experience below.`,
        `NEW GUIDE: Everything you need to know about ${topic} in one comprehensive resource.`,
        `WATCH: Our expert panel discusses the implications of ${topic} for businesses and policymakers.`,
        `Quiz: How much do you know about ${topic}? Test your knowledge!`,
        `Infographic: The evolution of ${topic} over the past decade.`,
        `Today's discussion topic: Is ${topic} being adequately addressed in current policy frameworks?`,
        `Meet the experts working on innovative solutions for ${topic}.`,
        `Weekend reading: Our top 5 articles about ${topic} that you might have missed.`
      ],
      instagram: [
        `Swipe through ➡️ to learn 5 key facts about ${topic} that might surprise you.`,
        `The human side of ${topic}: Stories from people affected by AI policy decisions.`,
        `Visual explanation: Breaking down ${topic} into understandable concepts.`,
        `Behind the scenes: Our team working on solutions for ${topic}.`,
        `Quote of the day about ${topic} from [Industry Leader].`,
        `Data visualization: The impact of ${topic} across different regions.`,
        `Explainer video: ${topic} in 60 seconds.`,
        `This or That: Two approaches to ${topic}. Which do you prefer?`
      ],
      tiktok: [
        `#Explainer: ${topic} in 30 seconds! #LearnOnTikTok #AITok`,
        `POV: You're trying to explain ${topic} to someone who knows nothing about AI. #TechTok`,
        `3 things about ${topic} that will blow your mind! #AIFacts #DidYouKnow`,
        `Debunking myths about ${topic} one by one. #MythBusters #AITruths`,
        `When people talk about ${topic} but don't understand the basics... #AIHumor`,
        `Green screen explainer: The real story behind ${topic}. #AIEducation`,
        `Transition challenge: From problem to solution in ${topic}. #AIChallenge`,
        `Duet with me if you work in ${topic}! Let's share perspectives. #AICommunity`
      ]
    };
    
    // Return requested number of ideas
    return platformIdeas[platform].slice(0, count);
  }
}

// Export singleton instance
export const socialMediaCalendarGenerator = new SocialMediaCalendarGenerator();