import { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';

type Region = 'USA' | 'Europe' | 'Australia' | 'Morocco';
type ContentType = 'blog' | 'article' | 'playbook' | 'social';

interface LandingProps {
  onGenerate: (data: {
    topic: string;
    url?: string;
    region: Region;
    contentType: ContentType;
  }) => void;
}

export function Landing({ onGenerate }: LandingProps) {
  console.log('Landing component rendering...');
  
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('USA');
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);

  const regions = [
    { id: 'USA' as Region, name: 'United States', flag: '🇺🇸', description: 'Federal and state AI initiatives' },
    { id: 'Europe' as Region, name: 'Europe', flag: '🇪🇺', description: 'GDPR and AI Act compliance' },
    { id: 'Australia' as Region, name: 'Australia', flag: '🇦🇺', description: 'AI governance frameworks' },
    { id: 'Morocco' as Region, name: 'Morocco', flag: '🇲🇦', description: 'Digital transformation strategy' }
  ];

  const contentTypes = [
    {
      id: 'blog' as ContentType,
      title: 'Short Daily Blog Post',
      description: '500-800 words with Lakoff framing and SEO optimization',
      icon: '📝',
      features: ['SEO Optimized', 'Call-to-Action', 'Social Sharing']
    },
    {
      id: 'article' as ContentType,
      title: 'AI Policy Article',
      description: '1200-1500 words with comprehensive framing and citations',
      icon: '📄',
      features: ['In-depth Analysis', 'Citations', 'Storytelling']
    },
    {
      id: 'playbook' as ContentType,
      title: 'Marketing Playbook',
      description: 'Comprehensive strategy with brand story and A/B testing',
      icon: '📊',
      features: ['Brand Strategy', 'A/B Testing', 'Conversion Optimization']
    },
    {
      id: 'social' as ContentType,
      title: 'Social Media Calendar',
      description: 'One-month platform-specific content with hashtags',
      icon: '📅',
      features: ['Platform-Specific', 'Hashtag Research', 'Engagement Optimization']
    }
  ];

  const handleGenerate = () => {
    if (!topic.trim() || !selectedContentType) return;
    
    onGenerate({
      topic: topic.trim(),
      url: url.trim() || undefined,
      region: selectedRegion,
      contentType: selectedContentType
    });
  };

  const isFormValid = topic.trim() && selectedContentType;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            EA PolicyFrame
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            Generate strategically framed AI policy content using cognitive framing techniques
          </p>

        </div>

        {/* Topic Input Section */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">What would you like to create content about?</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-2">
                Topic or Subject
              </label>
              <GlassInput
                type="text"
                placeholder="e.g., AI Risk, AI Research, Effective Altruism..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-2">
                Reference URL (Optional)
              </label>
              <GlassInput
                type="url"
                placeholder="https://example.com/article-to-reference"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
              <p className="text-gray-700 text-sm mt-1">
                Provide a URL to reference specific content or research
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Geographic Selector */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Select Geographic Context</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRegion === region.id
                    ? 'border-white bg-white/20 backdrop-blur-md'
                    : 'border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/15'
                }`}
              >
                <div className="text-3xl mb-2">{region.flag}</div>
                <div className="text-white font-semibold mb-1">{region.name}</div>
                <div className="text-gray-700 text-sm">{region.description}</div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Content Type Selection */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Choose Content Type</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedContentType(type.id)}
                className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedContentType === type.id
                    ? 'border-white bg-white/20 backdrop-blur-md'
                    : 'border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/15'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{type.title}</h3>
                    <p className="text-gray-700 text-sm mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-white/20 rounded-lg text-gray-800 text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Generate Button */}
        <div className="text-center">
          <GlassButton
            onClick={handleGenerate}
            disabled={!isFormValid}
            className={`px-8 py-4 text-lg font-semibold ${
              isFormValid
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-500/50 cursor-not-allowed'
            }`}
          >
            Generate Content with AI
          </GlassButton>
          
          {!isFormValid && (
            <p className="text-gray-700 text-sm mt-2">
              Please enter a topic and select a content type to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}