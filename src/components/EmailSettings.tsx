import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { toast } from 'sonner';

export function EmailSettings() {
  const user = useQuery(api.users.getUserProfile);
  const updateProfile = useMutation(api.users.updateUserProfile);
  
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when user data loads
  useState(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  });

  const handleUpdateEmail = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        email: email.trim(),
      });

      toast.success('Email updated successfully! 📧');
    } catch (error) {
      console.error('Failed to update email:', error);
      toast.error('Failed to update email. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <GlassCard>
        <div className="text-center py-8">
          <div className="text-white/60">Loading email settings...</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <h2 className="text-xl font-bold text-white mb-6">📧 Email Notifications</h2>
      
      <div className="space-y-6">
        {/* Email Address */}
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Email Address
          </label>
          <div className="flex space-x-3">
            <GlassInput
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <GlassButton
              onClick={handleUpdateEmail}
              disabled={isUpdating || email === user.email}
              className="bg-blue-600/80 hover:bg-blue-700/80"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </GlassButton>
          </div>
          <p className="text-gray-700 text-sm mt-2">
            We'll send you notifications when your content is ready and other important updates.
          </p>
        </div>

        {/* Notification Types */}
        <div>
          <h3 className="text-white font-medium mb-4">What you'll receive:</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
              <div className="text-green-400">✅</div>
              <div>
                <div className="text-white font-medium">Content Generation Complete</div>
                <div className="text-gray-700 text-sm">Get notified when your AI-generated content is ready for review</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
              <div className="text-blue-400">📧</div>
              <div>
                <div className="text-white font-medium">Content Sharing</div>
                <div className="text-gray-700 text-sm">Professional emails when you share content with colleagues</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
              <div className="text-purple-400">🎉</div>
              <div>
                <div className="text-white font-medium">Welcome & Onboarding</div>
                <div className="text-gray-700 text-sm">Helpful tips and guides to get the most out of PolicyFrame</div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Status */}
        <div className="bg-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-300 mt-0.5">ℹ️</div>
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-2">Email Delivery Status:</p>
              {user.email ? (
                <div className="space-y-1">
                  <p className="text-green-300">✅ Email configured: {user.email}</p>
                  <p className="text-blue-200/80">You'll receive notifications at this address</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-yellow-300">⚠️ No email configured</p>
                  <p className="text-blue-200/80">Add your email to receive notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="border-t border-white/20 pt-4">
          <h4 className="text-white font-medium mb-2">🔒 Privacy & Security</h4>
          <ul className="text-gray-700 text-sm space-y-1">
            <li>• We never share your email with third parties</li>
            <li>• All emails are sent securely via Resend</li>
            <li>• You can update or remove your email anytime</li>
            <li>• Unsubscribe links included in all emails</li>
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}