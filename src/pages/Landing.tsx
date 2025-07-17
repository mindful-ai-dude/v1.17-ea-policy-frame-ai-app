import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import GlassNavigation from '../components/GlassNavigation';
import { Region, ContentType } from '../types';

/**
 * Landing page component with input components
 */
const Landing: React.FC = () => {
  // Form state
  const [topic, setTopic] = useState('');
  const [url, setUrl] = useState('');
  const [region, setRegion] = useState<Region>('usa');
  const [contentType, setContentType] = useState<ContentType>('blog');
  
  // Validation state
  const [topicError, setTopicError] = useState('');
  const [urlError, setUrlError] = useState('');
  
  // Navigation items
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Library', path: '/library' },
    { label: 'Settings', path: '/settings' },
  ];
  
  // Content type options
  const contentTypes = [
    { id: 'blog', title: 'Short Daily Blog Post', description: '500-800 words with SEO optimization and call-to-action' },
    { id: 'article', title: 'AI Policy Article', description: '1200-1500 words with storytelling, citations, and comprehensive framing' },
    { id: 'playbook', title: 'Marketing Playbook', description: 'Comprehensive strategy with brand story and A/B testing frameworks' },
    { id: 'social', title: 'Social Media Calendar', description: 'One-month platform-specific content with hashtags and engagement optimization' },
  ];
  
  // Handle topic input change
  const handleTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopic(value);
    
    if (value.length < 3 && value.length > 0) {
      setTopicError('Topic must be at least 3 characters');
    } else {
      setTopicError('');
    }
  };
  
  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    
    if (value && !isValidUrl(value)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError('');
    }
  };
  
  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!topic) {
      setTopicError('Please enter a topic');
      return;
    }
    
    if (url && !isValidUrl(url)) {
      setUrlError('Please enter a valid URL');
      return;
    }
    
    // Form is valid, proceed to dashboard or content generation
    console.log('Form submitted:', { topic, url, region, contentType });
    // In a real app, we would redirect to the dashboard or content generation page
  };
  
  return (
    <>
      <GlassNavigation
        title="EA PolicyFrame"
        items={navItems}
        rightContent={<Link to="/login"><GlassButton variant="outline">Sign In</GlassButton></Link>}
      />
      
      <div className="container-responsive py-12 px-4">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Frame Your AI Policy Content
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
            Combine Effective Altruism principles with George Lakoff's cognitive framing 
            to create persuasive AI policy content that advances safety and alignment.
          </p>
          <div className="flex justify-center">
            <GlassButton size="lg">Get Started</GlassButton>
          </div>
        </section>
        
        {/* Content Generation Form */}
        <GlassCard className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">Generate Content</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassInput
                label="Topic"
                placeholder="Enter your topic"
                value={topic}
                onChange={handleTopicChange}
                error={topicError}
                helperText="What would you like to write about?"
              />
              
              <GlassInput
                label="Reference URL (Optional)"
                placeholder="https://example.com/article"
                value={url}
                onChange={handleUrlChange}
                error={urlError}
                helperText="Add a URL for additional context"
              />
            </div>
            
            {/* Region Selection */}
            <div>
              <label className="block text-white mb-2">Geographic Region</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['usa', 'europe', 'australia', 'morocco'] as Region[]).map((r) => (
                  <div 
                    key={r}
                    className={`glass-card p-4 text-center cursor-pointer transition-all ${
                      region === r ? 'bg-white/20 border-primary-300' : 'hover:bg-white/15'
                    }`}
                    onClick={() => setRegion(r)}
                  >
                    <div className="font-medium text-white capitalize">{r}</div>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm mt-2">
                Select a region to apply specific policy context and cultural adaptation
              </p>
            </div>
            
            {/* Content Type Selection */}
            <div>
              <label className="block text-white mb-2">Content Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentTypes.map((type) => (
                  <div 
                    key={type.id}
                    className={`glass-card p-4 cursor-pointer transition-all ${
                      contentType === type.id ? 'bg-white/20 border-primary-300' : 'hover:bg-white/15'
                    }`}
                    onClick={() => setContentType(type.id as ContentType)}
                  >
                    <h3 className="font-medium text-white">{type.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <GlassButton 
                type="submit" 
                size="lg"
                disabled={!topic || !!topicError || !!urlError}
              >
                Generate Content
              </GlassButton>
            </div>
          </form>
        </GlassCard>
        
        {/* Features Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Powered by Cognitive Science
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard>
              <div className="text-primary-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Lakoff Framing</h3>
              <p className="text-white/80">
                Apply George Lakoff's cognitive framing principles to create persuasive content that avoids reinforcing opposition frames.
              </p>
            </GlassCard>
            
            <GlassCard>
              <div className="text-primary-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Regional Context</h3>
              <p className="text-white/80">
                Adapt content to specific regional policy environments including USA, Europe, Australia, and Morocco.
              </p>
            </GlassCard>
            
            <GlassCard>
              <div className="text-primary-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Model Selection</h3>
              <p className="text-white/80">
                Choose from multiple Google Gemini models to optimize for quality, speed, or cost-effectiveness.
              </p>
            </GlassCard>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <footer className="glass-nav py-8">
        <div className="container-responsive text-center">
          <p className="text-white/60 mb-4">
            &copy; {new Date().getFullYear()} EA PolicyFrame App • Powered by Convex
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-white/60 hover:text-white">Terms</a>
            <a href="#" className="text-white/60 hover:text-white">Privacy</a>
            <a href="#" className="text-white/60 hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Landing;