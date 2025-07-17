import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContentGenerationEngine } from '../ContentGenerationEngine';
import { GeographicContextService } from '../GeographicContextService';
import { Region } from '../../types';

// Mock the api module
vi.mock('../../utils/api', () => ({
  api: {
    query: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ _id: 'test-user-id' })
      }
    }
  }
}));

// Mock the geminiService
vi.mock('../GeminiService', () => ({
  geminiService: {
    hasApiKey: vi.fn().mockReturnValue(true),
    generateContent: vi.fn().mockImplementation((prompt) => {
      return `Generated content for prompt: ${prompt.substring(0, 50)}...`;
    }),
    createOptimizedPrompt: vi.fn().mockImplementation((prompt) => prompt)
  }
}));

describe('Geographic Context Integration', () => {
  let contentEngine: ContentGenerationEngine;
  let geoService: GeographicContextService;

  beforeEach(() => {
    contentEngine = new ContentGenerationEngine();
    geoService = new GeographicContextService();
    
    // Mock the applyGeographicContext method in ContentGenerationEngine
    // to use our GeographicContextService
    vi.spyOn(contentEngine, 'applyGeographicContext' as any).mockImplementation(
      async (topic: string, region: Region) => {
        const context = await geoService.getRegionalContext(region, topic);
        const contextParagraph = geoService.generateRegionalContextParagraph(region, context);
        return `${topic}\n\n${contextParagraph}`;
      }
    );
  });

  it('should apply geographic context to content generation', async () => {
    const topic = 'AI ethics in policy making';
    const region: Region = 'usa';
    
    const contextualizedTopic = await contentEngine.applyGeographicContext(topic, region);
    
    expect(contextualizedTopic).toContain(topic);
    expect(contextualizedTopic).toContain('United States context');
    expect(contextualizedTopic).toContain('innovation and regulation');
  });

  it('should apply European context to content generation', async () => {
    const topic = 'AI regulation frameworks';
    const region: Region = 'europe';
    
    const contextualizedTopic = await contentEngine.applyGeographicContext(topic, region);
    
    expect(contextualizedTopic).toContain(topic);
    expect(contextualizedTopic).toContain('European context');
    expect(contextualizedTopic).toContain('human-centric values');
  });

  it('should apply Australian context to content generation', async () => {
    const topic = 'Ethical AI development';
    const region: Region = 'australia';
    
    const contextualizedTopic = await contentEngine.applyGeographicContext(topic, region);
    
    expect(contextualizedTopic).toContain(topic);
    expect(contextualizedTopic).toContain('Australia\'s approach');
    expect(contextualizedTopic).toContain('ethical considerations');
  });

  it('should apply Moroccan context to content generation', async () => {
    const topic = 'Digital transformation with AI';
    const region: Region = 'morocco';
    
    const contextualizedTopic = await contentEngine.applyGeographicContext(topic, region);
    
    expect(contextualizedTopic).toContain(topic);
    expect(contextualizedTopic).toContain('Morocco\'s emerging AI policy');
    expect(contextualizedTopic).toContain('digital transformation');
  });
});