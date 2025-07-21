import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { ContentShare } from './ContentShare';

interface ContentViewerProps {
  contentId: string;
  onBack: () => void;
  onEdit: (content: string, request: any, model: string) => void;
}

export function ContentViewer({ contentId, onBack, onEdit }: ContentViewerProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  
  const content = useQuery(api.content.getContentById, { 
    contentId: contentId as any
  });

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard>
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Content not found</h3>
              <p className="text-gray-700 mb-6">
                The content you're looking for doesn't exist or has been deleted.
              </p>
              <GlassButton onClick={onBack} className="bg-blue-600/80 hover:bg-blue-700/80">
                ← Back to Library
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

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

  const handleEdit = () => {
    const request = {
      topic: content.topic,
      region: content.region as 'USA' | 'Europe' | 'Australia' | 'Morocco',
      contentType: content.type as 'blog' | 'article' | 'playbook' | 'social',
    };
    onEdit(content.content, request, content.model);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{content.topic}</h1>
            <p className="text-gray-700">
              {contentTypeLabels[content.type as keyof typeof contentTypeLabels]} • {regionLabels[content.region as keyof typeof regionLabels]}
            </p>
          </div>
          <div className="flex space-x-3">
            <GlassButton onClick={onBack} className="bg-white/20 hover:bg-white/30">
              ← Back to Library
            </GlassButton>
            <GlassButton onClick={() => setShowShareModal(true)} className="bg-green-600/80 hover:bg-green-700/80">
              📧 Share
            </GlassButton>
            <GlassButton onClick={handleEdit} className="bg-blue-600/80 hover:bg-blue-700/80">
              ✏️ Edit
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content Display */}
          <div className="lg:col-span-3">
            <GlassCard>
              <div className="bg-white/90 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                <pre className="text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {content.content}
                </pre>
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Stats */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Content Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Words:</span>
                  <span className="text-gray-800 font-medium">{content.metadata.wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Reading Time:</span>
                  <span className="text-gray-800 font-medium">{content.metadata.readingTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Model:</span>
                  <span className="text-gray-800 font-medium text-sm">{content.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Created:</span>
                  <span className="text-gray-800 font-medium text-sm">{new Date(content.createdAt).toLocaleDateString()}</span>
                </div>
                {content.updatedAt !== content.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Updated:</span>
                    <span className="text-gray-800 font-medium text-sm">{new Date(content.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Framing Analysis */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Lakoff Analysis</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-gray-800 text-sm font-medium mb-2">Frames Used:</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.metadata.framesUsed.map((frame, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/30 rounded text-gray-800 text-xs">
                        {frame}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-gray-800 text-sm font-medium mb-2">Metaphors:</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.metadata.metaphorsUsed.map((metaphor, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/30 rounded text-gray-800 text-xs">
                        {metaphor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Citations */}
            {content.citations && content.citations.length > 0 && (
              <GlassCard>
                <h3 className="text-lg font-semibold text-white mb-4">Citations</h3>
                <div className="space-y-2">
                  {content.citations.map((citation, index) => (
                    <div key={index} className="bg-white/80 rounded-lg p-3">
                      <div className="text-gray-800 text-sm font-medium">{citation.title}</div>
                      <div className="text-gray-700 text-xs">{citation.source}</div>
                      {citation.url && (
                        <a 
                          href={citation.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                        >
                          View Source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ContentShare
          contentId={contentId}
          contentTitle={content.topic}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}