import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { ApiKeyEncryption } from '../utils/encryption';
import { toast } from 'sonner';

interface ApiKeyManagerProps {
  onApiKeyConfigured: (hasKey: boolean) => void;
}

export function ApiKeyManager({ onApiKeyConfigured }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const existingKey = useQuery(api.apiKeys.getApiKey, { provider: 'google' });
  const storeApiKey = useMutation(api.apiKeys.storeApiKey);
  const deleteApiKey = useMutation(api.apiKeys.deleteApiKey);

  useEffect(() => {
    onApiKeyConfigured(!!existingKey?.hasKey);
  }, [existingKey, onApiKeyConfigured]);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!ApiKeyEncryption.validateGoogleApiKey(apiKey)) {
      toast.error('Invalid Google API key format. Key should start with "AIza"');
      return;
    }

    setIsLoading(true);
    try {
      const encryptedKey = ApiKeyEncryption.encrypt(apiKey);
      const keyPreview = ApiKeyEncryption.createPreview(apiKey);

      await storeApiKey({
        provider: 'google',
        encryptedKey,
        keyPreview,
      });

      toast.success('API key saved successfully');
      setApiKey('');
      setIsEditing(false);
      onApiKeyConfigured(true);
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm('Are you sure you want to delete your API key?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteApiKey({ provider: 'google' });
      toast.success('API key deleted successfully');
      onApiKeyConfigured(false);
    } catch (error) {
      console.error('Failed to delete API key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Google Gemini API Key</h3>
        {existingKey?.hasKey && !isEditing && (
          <div className="flex space-x-2">
            <GlassButton
              onClick={() => setIsEditing(true)}
              className="bg-blue-600/80 hover:bg-blue-700/80 text-sm px-3 py-1"
            >
              Update
            </GlassButton>
            <GlassButton
              onClick={handleDeleteApiKey}
              disabled={isLoading}
              className="bg-red-600/80 hover:bg-red-700/80 text-sm px-3 py-1"
            >
              Delete
            </GlassButton>
          </div>
        )}
      </div>

      {existingKey?.hasKey && !isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="text-green-400">✓</div>
            <div>
              <p className="text-white/90">API Key configured</p>
              <p className="text-white/60 text-sm">Key: {existingKey.keyPreview}</p>
            </div>
          </div>
          <p className="text-white/70 text-sm">
            Your API key is securely stored and ready to use for content generation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Enter your Google Gemini API Key
            </label>
            <GlassInput
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-white/60 text-xs mt-1">
              Get your API key from{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <div className="flex space-x-3">
            <GlassButton
              onClick={handleSaveApiKey}
              disabled={isLoading || !apiKey.trim()}
              className="bg-green-600/80 hover:bg-green-700/80"
            >
              {isLoading ? 'Saving...' : 'Save API Key'}
            </GlassButton>
            {isEditing && (
              <GlassButton
                onClick={() => {
                  setIsEditing(false);
                  setApiKey('');
                }}
                className="bg-gray-600/80 hover:bg-gray-700/80"
              >
                Cancel
              </GlassButton>
            )}
          </div>

          <div className="bg-blue-500/20 rounded-lg p-3">
            <h4 className="text-white font-medium text-sm mb-2">🔒 Security Notice</h4>
            <p className="text-white/80 text-xs">
              Your API key is encrypted before storage and never transmitted in plain text. 
              Only you can access your generated content.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
}