import { describe, it, expect, vi, beforeEach } from 'vitest';
import { marketingPlaybookGenerator } from '../MarketingPlaybookGenerator';
import { ContentGenerationEngine } from '../ContentGenerationEngine';

// Mock the ContentGenerationEngine
vi.mock('../ContentGenerationEngine', () => {
  const mockGenerateContent = vi.fn().mockResolvedValue({
    content: 'Mock playbook content',
    metadata: {
      model: 'gemini-2.5-pro',
      region: 'usa',
      contentType: 'playbook',
      topic: 'AI Ethics',
      generationTime: 2.5,
      wordCount: 1500
    }
  });

  const mockGenerateContentStream = vi.fn().mockResolvedValue(
    new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Mock playbook content stream'));
        controller.close();
      }
    })
  );

  return {
    ContentGenerationEngine: vi.fn().mockImplementation(() => ({
      generateContent: mockGenerateContent,
      generateContentStream: mockGenerateContentStream
    }))
  };
});

describe('MarketingPlaybookGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generatePlaybook', () => {
    it('should generate a marketing playbook', async () => {
      const result = await marketingPlaybookGenerator.generatePlaybook(
        'AI Ethics',
        'usa',
        'gemini-2.5-pro',
        {
          marketingFocus: 'brand-story',
          includeABTesting: true,
          includeConversionOptimization: true
        }
      );

      expect(result).toBeDefined();
      expect(result.content).toBe('Mock playbook content');
      expect(result.metadata.contentType).toBe('playbook');
      
      // Verify the ContentGenerationEngine was called with correct parameters
      const mockContentEngine = new ContentGenerationEngine();
      expect(mockContentEngine.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            topic: expect.stringContaining('AI Ethics'),
            region: 'usa',
            contentType: 'playbook'
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
    });
  });

  describe('generatePlaybookStream', () => {
    it('should generate a marketing playbook stream', async () => {
      const stream = await marketingPlaybookGenerator.generatePlaybookStream(
        'AI Ethics',
        'usa',
        'gemini-2.5-pro',
        {
          marketingFocus: 'user-acquisition',
          includeGaryVaynerchukStrategies: true,
          includeKieranFlanaganStrategies: true
        }
      );

      expect(stream).toBeDefined();
      expect(stream).toBeInstanceOf(ReadableStream);
      
      // Verify the ContentGenerationEngine was called with correct parameters
      const mockContentEngine = new ContentGenerationEngine();
      expect(mockContentEngine.generateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            topic: expect.stringContaining('AI Ethics'),
            region: 'usa',
            contentType: 'playbook'
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
    });
  });

  describe('formatPlaybook', () => {
    it('should format a playbook with proper structure', () => {
      const rawContent = 'Marketing Playbook for AI Ethics\n\nThis is a sample playbook content.';
      const citations = [
        {
          source: 'Book',
          title: 'Permission Marketing',
          author: 'Seth Godin',
          url: 'https://example.com/book',
          accessDate: new Date('2025-07-16')
        }
      ];
      
      const formattedContent = marketingPlaybookGenerator.formatPlaybook(
        rawContent,
        citations,
        {
          includeBrandStoryFramework: true,
          includeABTestingFramework: true,
          includeActionableChecklist: true
        }
      );
      
      expect(formattedContent).toContain('# Marketing Playbook for AI Ethics');
      expect(formattedContent).toContain('## Brand Story Framework');
      expect(formattedContent).toContain('## A/B Testing Framework');
      expect(formattedContent).toContain('## Actionable Checklist');
      expect(formattedContent).toContain('## References');
      expect(formattedContent).toContain('Seth Godin');
    });
  });

  describe('generateGaryVaynerchukStrategy', () => {
    it('should generate a Gary Vaynerchuk content strategy', () => {
      const strategy = marketingPlaybookGenerator.generateGaryVaynerchukStrategy('AI Ethics');
      
      expect(strategy).toContain('Gary Vaynerchuk Content Strategy');
      expect(strategy).toContain('Document, Don\'t Create');
      expect(strategy).toContain('Jab, Jab, Jab, Right Hook');
      expect(strategy).toContain('AI Ethics');
    });
  });

  describe('generateKieranFlanaganStrategy', () => {
    it('should generate a Kieran Flanagan growth strategy', () => {
      const strategy = marketingPlaybookGenerator.generateKieranFlanaganStrategy('AI Ethics');
      
      expect(strategy).toContain('Kieran Flanagan Growth Strategy');
      expect(strategy).toContain('ICE Prioritization');
      expect(strategy).toContain('North Star Metric');
      expect(strategy).toContain('AI Ethics');
    });
  });
});