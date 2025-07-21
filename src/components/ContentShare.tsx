import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { toast } from 'sonner';

interface ContentShareProps {
  contentId: string;
  contentTitle: string;
  onClose: () => void;
}

export function ContentShare({ contentId, contentTitle, onClose }: ContentShareProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  const shareContent = useMutation(api.content.shareContent);

  const handleShare = async () => {
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

    setIsSharing(true);
    try {
      await shareContent({
        contentId: contentId as any,
        toEmail: email,
        message: message.trim() || undefined,
      });

      toast.success('Content shared successfully! 📧');
      onClose();
    } catch (error) {
      console.error('Failed to share content:', error);
      toast.error('Failed to share content. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <GlassCard className="max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Share Content</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-2">Sharing:</h3>
            <p className="text-gray-700 text-sm bg-white/10 rounded-lg p-3">
              "{contentTitle}"
            </p>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Recipient Email *
            </label>
            <GlassInput
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Personal Message (Optional)
            </label>
            <textarea
              placeholder="Add a personal note about why you're sharing this content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
            />
          </div>

          <div className="bg-blue-500/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="text-blue-300 mt-0.5">ℹ️</div>
              <div className="text-blue-200 text-sm">
                <p className="font-medium mb-1">What happens when you share:</p>
                <ul className="text-xs space-y-1 text-blue-200/80">
                  <li>• Recipient gets a professional email with content preview</li>
                  <li>• They can view the full content without signing up</li>
                  <li>• Your email is included as reply-to for follow-up</li>
                  <li>• No spam - we only send what you request</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <GlassButton
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20"
            disabled={isSharing}
          >
            Cancel
          </GlassButton>
          <GlassButton
            onClick={handleShare}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={isSharing || !email.trim()}
          >
            {isSharing ? 'Sharing...' : 'Share Content 📧'}
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
}