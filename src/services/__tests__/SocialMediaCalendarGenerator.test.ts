import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socialMediaCalendarGenerator } from '../SocialMediaCalendarGenerator';
import { ContentGenerationEngine } from '../ContentGenerationEngine';
import type { ContentResponse } from '../ContentGenerationEngine';

// Mock ContentGenerationEngine
vi.mock('../ContentGenerationEngine', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    content: '# Social Media Calendar for AI Policy\n\n## Week 1\n\n**Monday**\n- [Twitter] Introduction to our AI policy series #AIPolicy #AIEthics\n- [LinkedIn] Detailed analysis of recent AI policy developments',
    metadata: {
      model: 'gemini-2.5-pro',
      region: 'usa',
      contentType: 'social',
      topic: 'AI Policy',
      generationTime: 2.5,
      wordCount: 500
    }
  });

  const mockGenerateContentStream = vi.fn().mockResolvedValue(new ReadableStream());

  return {
    ContentGenerationEngine: vi.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream,
      validateInput: vi.fn().mockReturnValue({ isValid: true, errors: [] })
    }))
  };
});

describe('SocialMediaCalendarGenerator', () => {
  let mockContentEngine: ContentGenerationEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContentEngine = new ContentGenerationEngine();
  });

  describe('generateCalendar', () => {
    it('should generate a social media calendar with default options', async () => {
      const result = await socialMediaCalendarGenerator.generateCalendar(
        'AI Policy',
        'usa',
        'gemini-2.5-pro'
      );

      expect(mockContentEngine.generateContent).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.content).toContain('Social Media Calendar for AI Policy');
      expect(result.metadata.contentType).toBe('social');
    });

    it('should generate a calendar with platform-specific options', async () => {
      await socialMediaCalendarGenerator.generateCalendar(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          platforms: ['twitter', 'linkedin'],
          postFrequency: 'daily',
          includeHashtagResearch: true,
          includeTrendingTopics: true
        }
      );

      const generateContentCall = vi.mocked(mockContentEngine.generateContent).mock.calls[0][0];
      
      expect(generateContentCall.input.topic).toContain('[Platforms: twitter, linkedin]');
      expect(generateContentCall.input.topic).toContain('[Post Frequency: daily]');
      expect(generateContentCall.input.topic).toContain('[Include Hashtag Research]');
      expect(generateContentCall.input.topic).toContain('[Include Trending Topics]');
    });

    it('should generate a calendar with engagement and analytics options', async () => {
      await socialMediaCalendarGenerator.generateCalendar(
        'AI Policy',
        'usa',
        'gemini-2.5-pro',
        {
          includeEngagementStrategies: true,
          includeAnalytics: true,
          targetAudience: 'Policy professionals',
          campaignGoals: 'Awareness and education'
        }
      );

      const generateContentCall = vi.mocked(mockContentEngine.generateContent).mock.calls[0][0];
      
      expect(generateContentCall.input.topic).toContain('[Include Engagement Strategies]');
      expect(generateContentCall.input.topic).toContain('[Include Analytics Framework]');
      expect(generateContentCall.input.topic).toContain('[Target Audience: Policy professionals]');
      expect(generateContentCall.input.topic).toContain('[Campaign Goals: Awareness and education]');
    });
  });

  describe('generateCalendarStream', () => {
    it('should generate a streaming response for a social media calendar', async () => {
      const result = await socialMediaCalendarGenerator.generateCalendarStream(
        'AI Policy',
        'usa',
        'gemini-2.5-pro'
      );

      expect(mockContentEngine.generateContentStream).toHaveBeenCalled();
      expect(result).toBeInstanceOf(ReadableStream);
    });
  });

  describe('formatCalendar', () => {
    it('should format a calendar with hashtag library', () => {
      const content = '# Social Media Calendar\n\nContent with #AIPolicy #AIEthics hashtags';
      const formatted = socialMediaCalendarGenerator.formatCalendar(content, [], {
        includeHashtagLibrary: true
      });

      expect(formatted).toContain('## Hashtag Library');
      expect(formatted).toContain('#AIPolicy');
      expect(formatted).toContain('#AIEthics');
    });

    it('should format a calendar with content templates', () => {
      const content = '# Social Media Calendar\n\nBasic content';
      const formatted = socialMediaCalendarGenerator.formatCalendar(content, [], {
        includeContentTemplates: true
      });

      expect(formatted).toContain('## Content Templates');
      expect(formatted).toContain('Twitter/X Templates');
      expect(formatted).toContain('LinkedIn Templates');
    });

    it('should format a calendar with scheduling recommendations', () => {
      const content = '# Social Media Calendar\n\nBasic content';
      const formatted = socialMediaCalendarGenerator.formatCalendar(content, [], {
        includeSchedulingRecommendations: true
      });

      expect(formatted).toContain('## Scheduling Recommendations');
      expect(formatted).toContain('Optimal Posting Times by Platform');
    });

    it('should format a calendar with performance metrics', () => {
      const content = '# Social Media Calendar\n\nBasic content';
      const formatted = socialMediaCalendarGenerator.formatCalendar(content, [], {
        includePerformanceMetrics: true
      });

      expect(formatted).toContain('## Performance Metrics');
      expect(formatted).toContain('Key Performance Indicators by Platform');
    });

    it('should add citations when provided', () => {
      const content = '# Social Media Calendar\n\nBasic content';
      const citations = [
        {
          source: 'Journal',
          title: 'Social Media Best Practices',
          author: 'John Doe',
          url: 'https://example.com',
          accessDate: new Date('2025-01-01')
        }
      ];
      
      const formatted = socialMediaCalendarGenerator.formatCalendar(content, citations);

      expect(formatted).toContain('## References');
      expect(formatted).toContain('Social Media Best Practices');
      expect(formatted).toContain('John Doe');
    });
  });

  describe('researchTrendingHashtags', () => {
    it('should return trending hashtags for specified platforms', async () => {
      const hashtags = await socialMediaCalendarGenerator.researchTrendingHashtags(
        'AI Policy Framework',
        ['twitter', 'linkedin']
      );

      expect(hashtags.twitter).toBeDefined();
      expect(hashtags.linkedin).toBeDefined();
      expect(hashtags.twitter).toContain('#AIPolicy');
      expect(hashtags.linkedin).toContain('#ArtificialIntelligence');
      expect(hashtags.twitter).toContain('#ai');
      expect(hashtags.twitter).toContain('#policy');
      expect(hashtags.twitter).toContain('#framework');
    });
  });

  describe('generatePlatformSpecificIdeas', () => {
    it('should generate content ideas for Twitter', () => {
      const ideas = socialMediaCalendarGenerator.generatePlatformSpecificIdeas(
        'AI Ethics',
        'twitter',
        3
      );

      expect(ideas).toHaveLength(3);
      expect(ideas[0]).toContain('AI Ethics');
      expect(ideas[0]).toContain('#');
    });

    it('should generate content ideas for LinkedIn', () => {
      const ideas = socialMediaCalendarGenerator.generatePlatformSpecificIdeas(
        'AI Ethics',
        'linkedin',
        3
      );

      expect(ideas).toHaveLength(3);
      expect(ideas[0]).toContain('AI Ethics');
      expect(ideas[0]).toContain('#');
    });
  });
});