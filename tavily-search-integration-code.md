[{
	"resource": "/Users/imacbaby/Pictures/v1.17-ea-policy-frame-ai-app/convex/auth.ts",
	"owner": "typescript",
	"code": "2353",
	"severity": 8,
	"message": "Object literal may only specify known properties, and 'createUser' does not exist in type 'ConvexAuthConfig'.",
	"source": "ts",
	"startLineNumber": 9,
	"startColumn": 3,
	"endLineNumber": 9,
	"endColumn": 13
}]




### **Prerequisite: Set Up Your Tavily API Key**

1.  Go to the [Tavily AI website](https://tavily.com/) and get your API Key.
2.  In your Convex project dashboard, navigate to **Settings** > **Environment Variables**.
3.  Create a **New Variable**.
    *   **Name**: `TAVILY_API_KEY`
    *   **Value**: Paste your Tavily API key here.

***

### **Step 1: Backend - Create the Convex Search Action**

This file makes the secure API call to Tavily from your backend.

**File Path:** `convex/search.ts`
*(Create this new file inside your `convex` directory)*

**Full Code:**
```typescript
// convex/search.ts
import { action } from "./_generated/server";
import { v } from "convex/values";

// Define a consistent interface for our search results
interface SearchResult {
  title: string;
  link: string;
  content: string; // Tavily provides full content, not just a snippet
  score: number;
}

export const performTavilySearch = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, { query }): Promise<SearchResult[]> => {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      throw new Error("Tavily API key is not configured in Convex environment variables.");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "advanced", // Use "advanced" for more thorough results
        include_answer: false, // We just want the search results, not a summarized answer
        max_results: 5, // Get the top 5 results
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Tavily Search API request failed:", errorBody);
      throw new Error("Failed to fetch search results from Tavily.");
    }

    const data = await response.json();

    if (!data.results) {
      return [];
    }

    // Map the Tavily results to our consistent SearchResult interface
    return data.results.map((item: any): SearchResult => ({
      title: item.title,
      link: item.url, // Note: Tavily uses 'url' instead of 'link'
      content: item.content,
      score: item.score,
    }));
  },
});
```

***

### **Step 2: Frontend - Update the Generation Dashboard**

This file is modified to call the new Convex action before starting content generation.

**File Path:** `src/components/GenerationDashboard.tsx`
*(Modify this existing file)*

**Full Code:**
```tsx
// src/components/GenerationDashboard.tsx
import { useState, useEffect } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { ApiKeyManager } from './ApiKeyManager';
import { ContentGenerationEngine } from '../services/contentGeneration';
import { ApiKeyEncryption } from '../utils/encryption';
import { toast } from 'sonner';

type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemma-3-12b-it';

interface GenerationRequest {
  topic: string;
  url?: string;
  region: 'USA' | 'Europe' | 'Australia' | 'Morocco';
  contentType: 'blog' | 'article' | 'playbook' | 'social';
}

interface GenerationDashboardProps {
  request: GenerationRequest;
  onBack: () => void;
  onComplete: (content: string, model: string) => void;
}

interface ModelInfo {
  id: GeminiModel;
  name: string;
  description: string;
  capabilities: string[];
  speed: 'Fast' | 'Medium' | 'Slow';
  quality: 'High' | 'Very High' | 'Ultra High';
  costLevel: 'Low' | 'Medium' | 'High';
  icon: string;
}

export function GenerationDashboard({ request, onBack, onComplete }: GenerationDashboardProps) {
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [contentEngine] = useState(() => new ContentGenerationEngine());

  const apiKeyData = useQuery(api.apiKeys.getDecryptedApiKey, { provider: 'google' });
  const performTavilySearch = useAction(api.search.performTavilySearch);

  const models: ModelInfo[] = [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Most capable model with advanced reasoning and comprehensive analysis',
      capabilities: ['Advanced Reasoning', 'Long Context', 'Complex Analysis', 'Citations'],
      speed: 'Slow',
      quality: 'Ultra High',
      costLevel: 'High',
      icon: '🧠'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Balanced performance with fast generation and good quality',
      capabilities: ['Fast Generation', 'Good Quality', 'Efficient', 'Versatile'],
      speed: 'Fast',
      quality: 'High',
      costLevel: 'Medium',
      icon: '⚡'
    },
    {
      id: 'gemma-3-12b-it',
      name: 'Gemma 3 12B IT',
      description: 'Specialized for instruction following and structured content',
      capabilities: ['Instruction Following', 'Structured Output', 'Cost Effective', 'Reliable'],
      speed: 'Medium',
      quality: 'High',
      costLevel: 'Low',
      icon: '🎯'
    }
  ];

  const contentTypeLabels = {
    blog: 'Short Daily Blog Post',
    article: 'AI Policy Article',
    playbook: 'Marketing Playbook',
    social: 'Social Media Calendar'
  };

  const regionLabels = {
    USA: '🇺🇸 United States',
    Europe: '🇪🇺 Europe',
    Australia: '🇦🇺 Australia',
    Morocco: '🇲🇦 Morocco'
  };

  const generateContent = async () => {
    if (!apiKeyData) {
      toast.error('API key not configured');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStreamingContent('');
    setGeneratedContent('');

    try {
      const decryptedApiKey = ApiKeyEncryption.decrypt(apiKeyData);
      contentEngine.setApiKey(decryptedApiKey);

      const validation = contentEngine.validateInput(request);
      if (!validation.valid) {
        toast.error(validation.errors.join(', '));
        setIsGenerating(false);
        return;
      }

      // ** NEW STEP: Perform Tavily web search **
      setCurrentStep('Searching for current information...');
      setProgress(15);
      const searchResults = await performTavilySearch({ query: request.topic });

      const generationRequest = {
        ...request,
        model: selectedModel,
        apiKey: decryptedApiKey,
        searchResults: searchResults, // Pass the results
      };

      let finalContent = '';
      
      for await (const progressUpdate of contentEngine.generateContent(generationRequest)) {
        setCurrentStep(progressUpdate.step);
        setProgress(progressUpdate.progress);
        
        if (progressUpdate.content) {
          setStreamingContent(progressUpdate.content);
          finalContent = progressUpdate.content;
        }
      }

      setGeneratedContent(finalContent);
      setStreamingContent('');
      setCurrentStep('Generation complete!');
      toast.success('Content generated successfully!');
      
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setCurrentStep(`Generation failed: ${errorMessage}`);
      toast.error(`Generation failed: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Content Generation</h1>
            <p className="text-white/80">
              {contentTypeLabels[request.contentType]} • {regionLabels[request.region]} • {request.topic}
            </p>
          </div>
          <GlassButton onClick={onBack} className="bg-white/20 hover:bg-white/30">
            ← Back to Setup
          </GlassButton>
        </div>

        {/* API Key Configuration */}
        {!hasApiKey && (
          <div className="mb-8">
            <ApiKeyManager onApiKeyConfigured={setHasApiKey} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Model Selection */}
          <div className="lg:col-span-1">
            <GlassCard>
              <h2 className="text-xl font-bold text-white mb-4">Select AI Model</h2>
              <div className="space-y-4">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    disabled={isGenerating}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedModel === model.id
                        ? 'border-white bg-white/20 backdrop-blur-md'
                        : 'border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/15'
                    } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{model.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{model.name}</h3>
                        <p className="text-white/80 text-sm mb-2">{model.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {model.capabilities.map((cap) => (
                            <span key={cap} className="px-2 py-1 bg-white/20 rounded text-white/90 text-xs">
                              {cap}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Speed: {model.speed}</span>
                          <span>Quality: {model.quality}</span>
                          <span>Cost: {model.costLevel}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Generate Button */}
              <div className="mt-6">
                <GlassButton
                  onClick={generateContent}
                  disabled={isGenerating || !hasApiKey}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isGenerating ? 'Generating...' : hasApiKey ? 'Generate Content' : 'Configure API Key First'}
                </GlassButton>
              </div>
            </GlassCard>
          </div>

          {/* Content Preview */}
          <div className="lg:col-span-2">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Content Preview</h2>
                {generatedContent && (
                  <GlassButton
                    onClick={() => onComplete(generatedContent, selectedModel)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Use This Content →
                  </GlassButton>
                )}
              </div>

              {/* Progress Indicator */}
              {isGenerating && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/90 text-sm">{currentStep}</span>
                    <span className="text-white/90 text-sm">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Content Display */}
              <div className="bg-white/5 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                {!isGenerating && !generatedContent && !streamingContent && (
                  <div className="text-center text-white/60 py-20">
                    <div className="text-4xl mb-4">📝</div>
                    <p>Select a model and click "Generate Content" to begin</p>
                  </div>
                )}
                
                {(streamingContent || generatedContent) && (
                  <div className="text-white/90 whitespace-pre-wrap">
                    {generatedContent || streamingContent}
                    {isGenerating && <span className="animate-pulse">|</span>}
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
```

***

### **Step 3: Service Layer - Update the Content Generation Engine**

This file is modified to inject the search results into the prompt that gets sent to the Gemini model.

**File Path:** `src/services/contentGeneration.ts`
*(Modify this existing file)*

**Full Code:**
```typescript
// src/services/contentGeneration.ts
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
  searchResults?: { title: string; link: string; content: string; score: number }[];
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
      searchContext = "\n\n### Up-to-date Information from Web Search\n" +
                      "Use the following real-time search results to provide current and accurate information for the year 2025. Prioritize these sources for any facts, figures, or recent events. Synthesize the information from these sources in your response.\n";
      request.searchResults.forEach((result, index) => {
        searchContext += `\n[Source ${index + 1}: ${result.title}]\n` +
                         `Link: ${result.link}\n` +
                         `Content: ${result.content}\n`;
      });
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

  validateInput(request: Omit<GenerationRequest, 'apiKey' | 'searchResults'>): { valid: boolean; errors: string[] } {
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
```