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
      // Decrypt the API key
      const decryptedApiKey = ApiKeyEncryption.decrypt(apiKeyData);
      
      // Set up the content engine with the API key
      contentEngine.setApiKey(decryptedApiKey);

      // Validate the request
      const validation = contentEngine.validateInput(request);
      if (!validation.valid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      // ** NEW STEP: Perform Tavily web search **
      setCurrentStep('Searching for current information...');
      setProgress(15);
      const searchResults = await performTavilySearch({ query: request.topic });

      // Generate content using the real AI service
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

  const generateMockContent = (req: GenerationRequest, model: GeminiModel, step: number): string => {
    const snippets = [
      `\n\n## Understanding ${req.topic}\n\nIn the rapidly evolving landscape of artificial intelligence policy...`,
      `\n\nThe ${req.region === 'USA' ? 'American' : req.region === 'Europe' ? 'European' : req.region === 'Australia' ? 'Australian' : 'Moroccan'} approach to ${req.topic} reflects a nuanced understanding...`,
      `\n\n### Key Considerations\n\n1. **Stakeholder Alignment**: Ensuring all parties understand the implications...\n2. **Regulatory Framework**: Building upon existing ${req.region === 'Europe' ? 'GDPR and AI Act' : 'governance structures'}...`,
      `\n\n### Strategic Recommendations\n\nBased on George Lakoff's framing principles, we must avoid reinforcing negative frames...`
    ];
    
    return step < snippets.length ? snippets[step] : '';
  };

  const generateFinalContent = (req: GenerationRequest, model: GeminiModel): string => {
    return `# ${contentTypeLabels[req.contentType]}: ${req.topic}

## Executive Summary

This ${contentTypeLabels[req.contentType].toLowerCase()} addresses ${req.topic} through the lens of strategic cognitive framing, incorporating George Lakoff's "Don't Think of an Elephant" principles with regional policy context for ${regionLabels[req.region]}.

## Introduction

In today's complex policy landscape, how we frame artificial intelligence discussions determines their impact. Rather than reinforcing opposition narratives, we must establish positive, value-based language that resonates with stakeholders across the political spectrum.

## Core Framework

### 1. Cognitive Framing Approach
- **Positive Language**: Focus on benefits and opportunities rather than risks and limitations
- **Value-Based Messaging**: Connect AI policy to shared values like safety, prosperity, and innovation
- **Metaphorical Thinking**: Use conceptual metaphors that support our policy objectives

### 2. Regional Context (${regionLabels[req.region]})
${req.region === 'USA' ? 
  '- Federal AI initiatives and state-level implementations\n- Bipartisan support for AI safety and innovation\n- Integration with existing regulatory frameworks' :
  req.region === 'Europe' ?
  '- GDPR compliance and AI Act implementation\n- Digital sovereignty and ethical AI principles\n- Cross-border coordination and standards harmonization' :
  req.region === 'Australia' ?
  '- AI governance frameworks and digital transformation\n- Public-private partnerships in AI development\n- Regional leadership in responsible AI adoption' :
  '- Digital transformation strategy and AI readiness\n- Economic diversification through technology\n- International cooperation and knowledge transfer'
}

## Strategic Recommendations

### Immediate Actions
1. **Stakeholder Engagement**: Build coalitions using shared values and common ground
2. **Narrative Development**: Create compelling stories that illustrate policy benefits
3. **Communication Strategy**: Deploy multi-channel approach with consistent messaging

### Long-term Vision
- Establish ${req.region} as a leader in responsible AI governance
- Create sustainable frameworks that adapt to technological evolution
- Foster innovation while maintaining public trust and safety

## Implementation Roadmap

### Phase 1: Foundation Building (Months 1-3)
- Stakeholder mapping and engagement
- Message testing and refinement
- Coalition building activities

### Phase 2: Advocacy Launch (Months 4-6)
- Public campaign deployment
- Policy maker engagement
- Media and thought leadership

### Phase 3: Policy Integration (Months 7-12)
- Legislative advocacy
- Regulatory engagement
- Implementation support

## Conclusion

By applying Lakoff's cognitive framing principles to ${req.topic}, we can create more effective policy advocacy that builds bridges rather than walls. The key is consistent, value-based messaging that connects with people's fundamental beliefs about technology, society, and progress.

---

*Generated using ${models.find(m => m.id === model)?.name} with Lakoff framing optimization*
*Regional context: ${regionLabels[req.region]}*
${req.url ? `*Reference material: ${req.url}*` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Content Generation</h1>
            <p className="text-gray-700">
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
                        <p className="text-gray-700 text-sm mb-2">{model.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {model.capabilities.map((cap) => (
                            <span key={cap} className="px-2 py-1 bg-white/20 rounded text-gray-800 text-xs">
                              {cap}
                            </span>
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-700">
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
                    <span className="text-gray-800 text-sm">{currentStep}</span>
                    <span className="text-gray-800 text-sm">{Math.round(progress)}%</span>
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
              <div className="bg-white/90 rounded-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                {!isGenerating && !generatedContent && !streamingContent && (
                  <div className="text-center text-gray-600 py-20">
                    <div className="text-4xl mb-4">📝</div>
                    <p>Select a model and click "Generate Content" to begin</p>
                  </div>
                )}
                
                {(streamingContent || generatedContent) && (
                  <div className="text-gray-800 whitespace-pre-wrap">
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