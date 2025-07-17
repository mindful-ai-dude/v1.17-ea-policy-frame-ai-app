import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import GlassButton from '../components/GlassButton';
import { useAppStore } from '../store/useAppStore';
import type { GeminiModel, Region, ContentType } from '../types';
import useGeminiApi from '../hooks/useGeminiApi';
import ModelSelector from '../components/ModelSelector';
import { validateApiKeyFormat } from '../utils/encryption';
// We're not using Convex queries/mutations directly in this component anymore

/**
 * Settings page component
 */
const Settings: React.FC = () => {
  const { user, actions } = useAppStore();
  const { 
    setApiKey: setGeminiApiKey, 
    clearApiKey: clearGeminiApiKey,
    isApiKeyValid,
    isValidating,
    error: apiKeyError,
    hasStoredKey,
    maskedKey,
    selectedModel,
    changeModel,
    getModelCapabilities
  } = useGeminiApi();
  
  // State for API key management
  const [apiKey, setApiKey] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  
  // State for model optimization settings
  const [temperature, setTemperature] = useState(0.7);
  const [topK, setTopK] = useState(40);
  const [topP, setTopP] = useState(0.95);
  const [maxOutputTokens, setMaxOutputTokens] = useState(1024);
  
  // State for profile management
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Convex queries and mutations - using mock data since API endpoints don't exist
  const userContent = [];
  // Mock update profile function
  const updateUserProfile = async () => Promise.resolve();
  
  // Load user preferences on mount
  useEffect(() => {
    if (user?.name) {
      setDisplayName(user.name || '');
    }
  }, [user]);
  
  // Usage metrics - mocked for now since they don't exist in the user object
  const totalGenerations = 0;
  const totalTokens = 0;
  const lastGeneration = 'Never';
  
  // Content type distribution
  const contentCounts = {
    blog: 0,
    article: 0,
    playbook: 0,
    social: 0
  };
  
  if (userContent) {
    userContent.forEach((content: any) => {
      if (content.type && content.type in contentCounts) {
        contentCounts[content.type as keyof typeof contentCounts]++;
      }
    });
  }
  
  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;
    
    // Clear previous messages
    setSuccessMessage('');
    setValidationError('');
    
    // Validate format first
    if (!validateApiKeyFormat(apiKey)) {
      setValidationError('Invalid API key format. Google API keys typically start with "AIza" and are 39 characters long.');
      return;
    }
    
    try {
      const success = await setGeminiApiKey(apiKey);
      
      if (success) {
        setApiKey('');
        setSuccessMessage('API key validated and stored successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setValidationError(apiKeyError || 'Failed to validate API key');
      }
    } catch (error) {
      console.error('Failed to store API key:', error);
      setValidationError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const handleDeleteApiKey = async () => {
    setSuccessMessage('');
    setValidationError('');
    
    try {
      await clearGeminiApiKey();
      setSuccessMessage('API key deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to delete API key:', error);
      setValidationError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value as GeminiModel;
    actions.updateSettings({ defaultModel: model });
  };
  
  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const region = e.target.value as Region;
    actions.updateSettings({ defaultRegion: region });
  };
  
  const handleContentTypeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contentType = e.target.value as ContentType;
    actions.updateSettings({ defaultContentType: contentType });
  };
  
  const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const theme = e.target.value as 'light' | 'dark' | 'system';
    actions.setTheme(theme);
  };
  
  const handleSaveProfile = async () => {
    try {
      await updateUserProfile();
      actions.setUser({ name: displayName });
      setIsEditingProfile(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setValidationError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  const handleSaveModelSettings = async () => {
    try {
      // Store model settings in local state since we don't have a dedicated place in the store
      // In a real app, you would update this in the store
      setSuccessMessage('Model settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save model settings:', error);
      setValidationError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };  

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      
      {/* Global success/error messages */}
      {successMessage && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {validationError && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg">
          {validationError}
        </div>
      )}
      
      {/* API Key Management */}
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">API Key Management</h2>
        <p className="text-blue-200 mb-4">
          Your API key is encrypted and stored securely. We never store your API key in plain text.
        </p>
        
        {hasStoredKey && (
          <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span>Current API Key: {maskedKey}</span>
              <GlassButton 
                variant="outline" 
                onClick={handleDeleteApiKey}
                isLoading={isValidating}
              >
                Delete Key
              </GlassButton>
            </div>
          </div>
        )}
        
        <form onSubmit={handleApiKeySubmit} className="space-y-4">
          <GlassInput
            label="Google Gemini API Key"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            helperText="Your API key is encrypted and stored securely"
          />
          
          <div className="flex flex-wrap gap-4">
            <GlassButton type="submit" isLoading={isValidating}>
              {hasStoredKey ? 'Update API Key' : 'Save API Key'}
            </GlassButton>
          </div>
        </form>
        
        <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
          <h3 className="text-white font-medium mb-2">How to get a Google Gemini API key:</h3>
          <ol className="list-decimal list-inside text-blue-200 space-y-1">
            <li>Visit <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google AI Studio</a></li>
            <li>Sign in with your Google account</li>
            <li>Navigate to the API keys section</li>
            <li>Create a new API key</li>
            <li>Copy and paste it here</li>
          </ol>
        </div>
      </GlassCard>
      
      {/* Model Selection */}
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">Model Selection</h2>
        <p className="text-blue-200 mb-6">
          Choose which Gemini model to use for content generation. Each model has different capabilities, 
          speeds, and costs.
        </p>
        
        <ModelSelector
          models={getModelCapabilities()}
          selectedModel={selectedModel}
          onSelectModel={changeModel}
          isApiKeyValid={isApiKeyValid}
        />
      </GlassCard>
            
{/* Model Optimization Settings */}
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">Model Optimization Settings</h2>
        <p className="text-blue-200 mb-6">
          Fine-tune how the AI generates content by adjusting these parameters.
        </p>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">Temperature: {temperature}</label>
              <span className="text-blue-200 text-sm">
                {temperature < 0.3 ? 'More focused' : temperature > 0.7 ? 'More creative' : 'Balanced'}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-blue-200 text-xs mt-1">
              Controls randomness: Lower values are more deterministic, higher values are more creative.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">Top-K: {topK}</label>
              <span className="text-blue-200 text-sm">
                {topK < 20 ? 'More focused' : topK > 60 ? 'More diverse' : 'Balanced'}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              step="1" 
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-blue-200 text-xs mt-1">
              Limits token selection to the K most likely tokens.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">Top-P: {topP}</label>
              <span className="text-blue-200 text-sm">
                {topP < 0.5 ? 'More focused' : topP > 0.9 ? 'More diverse' : 'Balanced'}
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-blue-200 text-xs mt-1">
              Limits token selection to tokens with cumulative probability P.
            </p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-white">Max Output Tokens: {maxOutputTokens}</label>
              <span className="text-blue-200 text-sm">
                {maxOutputTokens < 512 ? 'Shorter' : maxOutputTokens > 1536 ? 'Longer' : 'Standard'}
              </span>
            </div>
            <input 
              type="range" 
              min="256" 
              max="2048" 
              step="256" 
              value={maxOutputTokens}
              onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
              className="w-full h-2 bg-blue-500/20 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-blue-200 text-xs mt-1">
              Maximum number of tokens the model can generate in a response.
            </p>
          </div>
          
          <div className="pt-4">
            <GlassButton onClick={handleSaveModelSettings}>
              Save Model Settings
            </GlassButton>
          </div>
        </div>
      </GlassCard>
            
{/* Default Preferences */}
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">Default Preferences</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white mb-2">Default Model</label>
            <select 
              className="glass-input"
              value={useAppStore.getState().settings.defaultModel}
              onChange={handleModelChange}
            >
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemma-3-12b-it">Gemma 3 12B IT</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white mb-2">Default Region</label>
            <select 
              className="glass-input"
              value={useAppStore.getState().settings.defaultRegion}
              onChange={handleRegionChange}
            >
              <option value="usa">USA</option>
              <option value="europe">Europe</option>
              <option value="australia">Australia</option>
              <option value="morocco">Morocco</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white mb-2">Default Content Type</label>
            <select 
              className="glass-input"
              value={useAppStore.getState().settings.defaultContentType}
              onChange={handleContentTypeChange}
            >
              <option value="blog">Short Daily Blog Post</option>
              <option value="article">AI Policy Article</option>
              <option value="playbook">Marketing Playbook</option>
              <option value="social">Social Media Calendar</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white mb-2">Theme</label>
            <select 
              className="glass-input"
              value={useAppStore.getState().ui.theme}
              onChange={handleThemeChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </GlassCard>
      
      {/* Usage Statistics */}
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">Usage Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-500/10 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Total Generations</h3>
            <p className="text-3xl font-bold text-blue-300">{totalGenerations}</p>
          </div>
          
          <div className="bg-blue-500/10 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Total Tokens</h3>
            <p className="text-3xl font-bold text-blue-300">{totalTokens.toLocaleString()}</p>
          </div>
          
          <div className="bg-blue-500/10 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Last Generation</h3>
            <p className="text-xl font-medium text-blue-300">{lastGeneration}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-4">Content Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-white mb-1">Blog Posts</h4>
              <p className="text-2xl font-bold text-blue-300">{contentCounts.blog}</p>
            </div>
            
            <div className="bg-blue-500/10 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-white mb-1">Articles</h4>
              <p className="text-2xl font-bold text-blue-300">{contentCounts.article}</p>
            </div>
            
            <div className="bg-blue-500/10 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-white mb-1">Playbooks</h4>
              <p className="text-2xl font-bold text-blue-300">{contentCounts.playbook}</p>
            </div>
            
            <div className="bg-blue-500/10 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-white mb-1">Social Media</h4>
              <p className="text-2xl font-bold text-blue-300">{contentCounts.social}</p>
            </div>
          </div>
        </div>
      </GlassCard>
            {
/* Profile Management */}
      <GlassCard>
        <h2 className="text-2xl font-semibold text-white mb-4">Profile Management</h2>
        
        {isEditingProfile ? (
          <div className="space-y-4">
            <GlassInput
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            
            <div className="flex gap-4">
              <GlassButton onClick={handleSaveProfile}>
                Save Profile
              </GlassButton>
              <GlassButton 
                variant="outline" 
                onClick={() => {
                  setIsEditingProfile(false);
                  setDisplayName(user?.name || '');
                }}
              >
                Cancel
              </GlassButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm">Name</label>
              <p className="text-white">{user?.name || 'User'}</p>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm">Email</label>
              <p className="text-white">{user?.email || 'user@example.com'}</p>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm">Account Created</label>
              <p className="text-white">N/A</p>
            </div>
            
            <GlassButton onClick={() => setIsEditingProfile(true)}>
              Edit Profile
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Settings;