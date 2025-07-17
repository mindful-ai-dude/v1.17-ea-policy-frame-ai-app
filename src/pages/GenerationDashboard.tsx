import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import LoadingSpinner from '../components/LoadingSpinner';
import ModelSelector from '../components/ModelSelector';
import { useAppStore } from '../store/useAppStore';
import { geminiService, MODEL_CAPABILITIES } from '../services/GeminiService';
import type { GeminiModel, Region, ContentType } from '../types';

/**
 * Generation Dashboard page component
 */
const GenerationDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();
  
  // State for model selection and API key validation
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(
    user?.preferences?.defaultModel || 'gemini-2.5-pro'
  );
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // State for content generation
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [region, setRegion] = useState<Region>(
    user?.preferences?.defaultRegion || 'usa'
  );
  const [contentType, setContentType] = useState<ContentType>(
    user?.preferences?.defaultContentType || 'blog'
  );
  
  // State for generation progress
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedContent, setGeneratedContent] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // State for advanced settings
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [applyFraming, setApplyFraming] = useState(true);
  const [useReferences, setUseReferences] = useState(true);
  
  // Validate API key on component mount
  useEffect(() => {
    const validateApiKey = async () => {
      setIsValidating(true);
      try {
        // Check if API key exists in user data
        if (user?.apiKeys?.gemini) {
          // In a real app, you would decrypt and use the actual API key
          // For demo purposes, we'll just simulate validation
          const isValid = await geminiService.validateApiKey();
          setIsApiKeyValid(isValid);
        } else {
          setIsApiKeyValid(false);
        }
      } catch (error) {
        console.error('API key validation error:', error);
        setIsApiKeyValid(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    validateApiKey();
  }, [user]);
  
  // Handle model selection
  const handleModelSelect = (model: GeminiModel) => {
    setSelectedModel(model);
  };
  
  // Handle region selection
  const handleRegionSelect = (selectedRegion: Region) => {
    setRegion(selectedRegion);
  };
  
  // Handle content type selection
  const handleContentTypeSelect = (selectedType: ContentType) => {
    setContentType(selectedType);
  };
  
  // Handle content generation
  const handleGenerateContent = async () => {
    if (!topic.trim()) {
      setGenerationError('Please enter a topic');
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedContent('');
    setGenerationError(null);
    
    try {
      // In a real app, this would connect to the ContentGenerationEngine
      // For demo purposes, we'll simulate content generation with progress updates
      
      // Prepare the content request with user inputs and advanced settings
      const contentRequest = {
        input: {
          topic,
          url: url || undefined,
          region,
          contentType
        },
        model: selectedModel,
        temperature,
        maxOutputTokens: maxTokens
      };
      
      // Prepare framing options
      const framingOptions = {
        applyFraming,
        avoidNegativeFrames: applyFraming,
        reinforcePositiveFrames: applyFraming,
        assessQuality: true
      };
      
      // Prepare document reference options
      const documentOptions = {
        useReferences,
        maxReferences: 3,
        includeCitations: true,
        includeExamples: true
      };
      
      // Simulate streaming content generation
      for (let i = 0; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setGenerationProgress(i * 10);
        
        if (i > 0) {
          setGeneratedContent(prev => 
            prev + `This is simulated content chunk ${i} for topic "${topic}" using ${selectedModel} model for ${region} region in ${contentType} format.\n\n`
          );
        }
      }
      
      // In a real implementation, we would use the ContentGenerationEngine:
      // const contentEngine = new ContentGenerationEngine();
      // const result = await contentEngine.generateContent(
      //   contentRequest,
      //   framingOptions,
      //   documentOptions
      // );
      
      // For demo purposes, we'll create a simulated result
      const simulatedResult = {
        content: generatedContent,
        metadata: {
          model: selectedModel,
          region,
          contentType,
          topic,
          generationTime: 5.5, // Simulated time in seconds
          wordCount: 750, // Simulated word count
          framingAnalysis: applyFraming ? {
            effectiveness: 85,
            detectedFrames: [
              {
                name: "Progress",
                values: ["innovation", "advancement", "growth"],
                metaphors: ["journey", "building"],
                keywords: ["future", "develop", "improve"]
              }
            ],
            suggestedFrames: [],
            metaphors: []
          } : undefined
        }
      };
      
      // Navigate to output display when complete
      navigate('/output-display', { 
        state: { 
          content: simulatedResult.content,
          metadata: simulatedResult.metadata
        } 
      });
    } catch (error) {
      console.error('Content generation error:', error);
      setGenerationError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Content type options with descriptions
  const contentTypeOptions: Array<{
    id: ContentType;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'blog',
      title: 'Short Daily Blog Post',
      description: '500-800 word post with SEO optimization and call-to-action',
      icon: '📝'
    },
    {
      id: 'article',
      title: 'AI Policy Article',
      description: '1200-1500 word in-depth article with citations and analysis',
      icon: '📊'
    },
    {
      id: 'playbook',
      title: 'Marketing Playbook',
      description: 'Comprehensive strategy with brand story and A/B testing framework',
      icon: '📚'
    },
    {
      id: 'social',
      title: 'Social Media Calendar',
      description: 'One-month content calendar with platform-specific optimization',
      icon: '📅'
    }
  ];
  
  // Region options with descriptions
  const regionOptions: Array<{
    id: Region;
    title: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'usa',
      title: 'United States',
      description: 'Federal and state AI initiatives context',
      icon: '🇺🇸'
    },
    {
      id: 'europe',
      title: 'Europe',
      description: 'GDPR and AI Act compliance context',
      icon: '🇪🇺'
    },
    {
      id: 'australia',
      title: 'Australia',
      description: 'AI governance framework context',
      icon: '🇦🇺'
    },
    {
      id: 'morocco',
      title: 'Morocco',
      description: 'Digital transformation context',
      icon: '🇲🇦'
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Generation Dashboard</h1>
          <p className="text-white/80 mt-1">Create strategically framed AI policy content</p>
        </div>
      </div>
      
      {/* Model Selection Section */}
      <GlassCard>
        <ModelSelector
          models={Object.values(MODEL_CAPABILITIES)}
          selectedModel={selectedModel}
          onSelectModel={handleModelSelect}
          isApiKeyValid={isApiKeyValid}
        />
        
        {isValidating && (
          <div className="mt-4 flex items-center justify-center">
            <LoadingSpinner size="sm" />
            <span className="ml-2 text-white/80">Validating API key...</span>
          </div>
        )}
        
        {!isApiKeyValid && !isValidating && (
          <div className="mt-4">
            <div className="mb-3 p-4 rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-500/30">
              <p className="text-blue-200 mb-2">
                <span className="font-semibold">💡 Tip:</span> You need a Google API key to use the Gemini models.
              </p>
              <p className="text-blue-200 text-sm">
                Get your API key from the <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a> and add it in the Settings page.
              </p>
            </div>
            <GlassButton
              onClick={() => navigate('/settings')}
              variant="secondary"
              className="w-full"
            >
              Add API Key in Settings
            </GlassButton>
          </div>
        )}
      </GlassCard>
      
      {/* Content Input Section */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4 text-white">Content Input</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-white mb-2">Topic</label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic (e.g., AI alignment in public policy)"
              className="glass-input"
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label htmlFor="url" className="block text-white mb-2">URL (Optional)</label>
            <input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter a reference URL (optional)"
              className="glass-input"
              disabled={isGenerating}
            />
          </div>
          
          <div>
            <label className="block text-white mb-2">Geographic Region</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {regionOptions.map((regionOption) => (
                <GlassCard
                  key={regionOption.id}
                  className={`cursor-pointer transition-all duration-300 p-4 ${
                    region === regionOption.id
                      ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20'
                      : 'hover:shadow-md hover:shadow-blue-500/10'
                  }`}
                  onClick={() => handleRegionSelect(regionOption.id)}
                  interactive
                  hoverable
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{regionOption.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{regionOption.title}</h3>
                      <p className="text-white/70 text-sm">{regionOption.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-white mb-2">Content Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contentTypeOptions.map((typeOption) => (
                <GlassCard
                  key={typeOption.id}
                  className={`cursor-pointer transition-all duration-300 p-4 ${
                    contentType === typeOption.id
                      ? 'ring-2 ring-blue-400 shadow-lg shadow-blue-500/20'
                      : 'hover:shadow-md hover:shadow-blue-500/10'
                  }`}
                  onClick={() => handleContentTypeSelect(typeOption.id)}
                  interactive
                  hoverable
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{typeOption.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{typeOption.title}</h3>
                      <p className="text-white/70 text-sm">{typeOption.description}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
      
      {/* Generation Controls */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4 text-white">Generation Controls</h2>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <GlassButton
              onClick={handleGenerateContent}
              disabled={!topic.trim() || isGenerating || !isApiKeyValid}
              isLoading={isGenerating}
              className="flex-1"
            >
              Generate Content
            </GlassButton>
            
            <GlassButton
              onClick={() => {
                setTopic('');
                setUrl('');
                setGeneratedContent('');
                setGenerationError(null);
              }}
              variant="outline"
              disabled={isGenerating}
              className="flex-1"
            >
              Reset
            </GlassButton>
          </div>
          
          {generationError && (
            <div className="p-4 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/30">
              <p className="text-red-200">{generationError}</p>
            </div>
          )}
        </div>
      </GlassCard>
      
      {/* Progress and Preview */}
      {isGenerating && (
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4 text-white">Generation Progress</h2>
          
          <div className="space-y-4">
            <div className="w-full bg-white/10 rounded-full h-4">
              <div 
                className="bg-blue-gradient h-4 rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-white/80">
              <span>Generating content...</span>
              <span>{generationProgress}%</span>
            </div>
            
            {generatedContent && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2">Content Preview</h3>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 max-h-60 overflow-y-auto glass-scrollbar">
                  <pre className="text-white/90 whitespace-pre-wrap font-sans text-sm">
                    {generatedContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}
      
      {/* Settings Panel */}
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4 text-white">Advanced Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="temperature" className="block text-white mb-2">
              Temperature: <span className="text-white/80">{temperature}</span>
            </label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
            <p className="text-white/60 text-xs mt-1">
              Lower values produce more focused, deterministic output. Higher values produce more creative, varied output.
            </p>
          </div>
          
          <div>
            <label htmlFor="maxTokens" className="block text-white mb-2">
              Max Output Tokens: <span className="text-white/80">{maxTokens}</span>
            </label>
            <input
              id="maxTokens"
              type="range"
              min="256"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
            <p className="text-white/60 text-xs mt-1">
              Controls the maximum length of the generated content.
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <input
                id="applyFraming"
                type="checkbox"
                checked={applyFraming}
                onChange={(e) => setApplyFraming(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-white/10"
                disabled={isGenerating}
              />
              <label htmlFor="applyFraming" className="ml-2 block text-white">
                Apply Lakoff Framing
              </label>
            </div>
            <p className="text-white/60 text-xs ml-6">
              Uses George Lakoff's cognitive framing principles to create more persuasive content
            </p>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <input
                id="useReferences"
                type="checkbox"
                checked={useReferences}
                onChange={(e) => setUseReferences(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-white/10"
                disabled={isGenerating}
              />
              <label htmlFor="useReferences" className="ml-2 block text-white">
                Use Document References
              </label>
            </div>
            <p className="text-white/60 text-xs ml-6">
              Incorporates relevant examples from your uploaded documents
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default GenerationDashboard;