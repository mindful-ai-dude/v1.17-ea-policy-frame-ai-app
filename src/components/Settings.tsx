import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { ApiKeyManager } from './ApiKeyManager';
import { EmailSettings } from './EmailSettings';
import { toast } from 'sonner';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'api' | 'usage' | 'email'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Profile settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Preferences
  const [defaultModel, setDefaultModel] = useState('gemini-2.5-pro');
  const [defaultRegion, setDefaultRegion] = useState('USA');
  const [defaultContentType, setDefaultContentType] = useState('blog');
  const [theme, setTheme] = useState('system');

  const user = useQuery(api.auth.loggedInUser);
  const updateUser = useMutation(api.users.updateUserProfile);
  const apiKeys = useQuery(api.apiKeys.listApiKeys);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      if (user.preferences) {
        setDefaultModel(user.preferences.defaultModel || 'gemini-2.5-pro');
        setDefaultRegion(user.preferences.defaultRegion || 'USA');
        setDefaultContentType(user.preferences.defaultContentType || 'blog');
        setTheme(user.preferences.theme || 'system');
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateUser({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsLoading(true);
    try {
      await updateUser({
        preferences: {
          defaultModel,
          defaultRegion,
          defaultContentType,
          theme,
        },
      });
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'preferences' as const, label: 'Preferences', icon: '⚙️' },
    { id: 'api' as const, label: 'API Keys', icon: '🔑' },
    { id: 'email' as const, label: 'Email', icon: '📧' },
    { id: 'usage' as const, label: 'Usage', icon: '📊' },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Display Name
            </label>
            <GlassInput
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Email Address
            </label>
            <GlassInput
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <p className="text-white/60 text-xs mt-1">
              Used for account recovery and notifications
            </p>
          </div>
        </div>
        <div className="mt-6">
          <GlassButton
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="bg-blue-600/80 hover:bg-blue-700/80"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </GlassButton>
        </div>
      </div>

      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{user?.usage?.totalGenerations || 0}</div>
            <div className="text-white/70 text-sm">Total Generations</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{(user?.usage?.totalTokens || 0).toLocaleString()}</div>
            <div className="text-white/70 text-sm">Total Tokens</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {user?.usage?.lastGeneration 
                ? new Date(user.usage.lastGeneration).toLocaleDateString()
                : 'Never'
              }
            </div>
            <div className="text-white/70 text-sm">Last Generation</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Default Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Default AI Model
            </label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Best Quality)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Balanced)</option>
              <option value="gemma-3-12b-it">Gemma 3 12B IT (Cost Effective)</option>
            </select>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Default Region
            </label>
            <select
              value={defaultRegion}
              onChange={(e) => setDefaultRegion(e.target.value)}
              className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="USA">🇺🇸 United States</option>
              <option value="Europe">🇪🇺 Europe</option>
              <option value="Australia">🇦🇺 Australia</option>
              <option value="Morocco">🇲🇦 Morocco</option>
            </select>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Default Content Type
            </label>
            <select
              value={defaultContentType}
              onChange={(e) => setDefaultContentType(e.target.value)}
              className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="blog">Short Daily Blog Post</option>
              <option value="article">AI Policy Article</option>
              <option value="playbook">Marketing Playbook</option>
              <option value="social">Social Media Calendar</option>
            </select>
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="system">System Default</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <GlassButton
            onClick={handleSavePreferences}
            disabled={isLoading}
            className="bg-green-600/80 hover:bg-green-700/80"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </GlassButton>
        </div>
      </div>

      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Content Generation Settings</h3>
        <div className="space-y-4">
          <div className="bg-blue-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium text-sm mb-2">🎯 Lakoff Framing</h4>
            <p className="text-white/80 text-sm">
              All content generation uses George Lakoff's cognitive framing principles to create 
              positive, value-based messaging that avoids reinforcing opposition frames.
            </p>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium text-sm mb-2">🌍 Regional Context</h4>
            <p className="text-white/80 text-sm">
              Content is automatically adapted with region-specific policy context, cultural 
              considerations, and regulatory frameworks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">API Key Management</h3>
        <ApiKeyManager onApiKeyConfigured={setHasApiKey} />
      </div>

      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Usage Guidelines</h3>
        <div className="space-y-4">
          <div className="bg-green-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium text-sm mb-2">✅ Best Practices</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Keep your API key secure and never share it</li>
              <li>• Monitor your usage to avoid unexpected charges</li>
              <li>• Use appropriate models for your content needs</li>
              <li>• Review generated content before publishing</li>
            </ul>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-4">
            <h4 className="text-white font-medium text-sm mb-2">⚠️ Rate Limits</h4>
            <p className="text-white/80 text-sm">
              Google Gemini API has rate limits. If you encounter errors, wait a moment before 
              trying again. Consider upgrading your API plan for higher limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Usage Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">{user?.usage?.totalGenerations || 0}</div>
            <div className="text-white/70 text-sm">Total Generations</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">{(user?.usage?.totalTokens || 0).toLocaleString()}</div>
            <div className="text-white/70 text-sm">Total Tokens</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">
              {user?.usage?.totalTokens ? Math.round((user.usage.totalTokens || 0) / (user.usage.totalGenerations || 1)) : 0}
            </div>
            <div className="text-white/70 text-sm">Avg. Tokens/Gen</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-3xl font-bold text-white mb-2">
              {user?.createdAt ? Math.ceil((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </div>
            <div className="text-white/70 text-sm">Days Active</div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Content Breakdown</h3>
        <div className="bg-white/5 rounded-lg p-6">
          <div className="text-center text-white/60">
            <div className="text-4xl mb-4">📊</div>
            <p>Detailed usage analytics coming soon!</p>
            <p className="text-sm mt-2">
              Track your content generation patterns, model usage, and performance metrics.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20 pt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Export Data</h3>
        <div className="space-y-4">
          <p className="text-white/80 text-sm">
            Export your usage data and generated content for backup or analysis.
          </p>
          <div className="flex space-x-3">
            <GlassButton
              onClick={() => toast.info('Export feature coming soon!')}
              className="bg-blue-600/80 hover:bg-blue-700/80"
            >
              📥 Export Usage Data
            </GlassButton>
            <GlassButton
              onClick={() => toast.info('Export feature coming soon!')}
              className="bg-green-600/80 hover:bg-green-700/80"
            >
              📦 Export All Content
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/80">
              Manage your account, preferences, and API configuration
            </p>
          </div>
          <GlassButton onClick={onBack} className="bg-white/20 hover:bg-white/30">
            ← Back
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <GlassCard>
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </GlassCard>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <GlassCard>
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'preferences' && renderPreferencesTab()}
              {activeTab === 'api' && renderApiTab()}
              {activeTab === 'email' && <EmailSettings />}
              {activeTab === 'usage' && renderUsageTab()}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}