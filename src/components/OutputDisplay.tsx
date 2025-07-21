import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { ContentShare } from './ContentShare';
import { toast } from 'sonner';

interface OutputDisplayProps {
  content: string;
  request: {
    topic: string;
    url?: string;
    region: 'USA' | 'Europe' | 'Australia' | 'Morocco';
    contentType: 'blog' | 'article' | 'playbook' | 'social';
  };
  model: string;
  onBack: () => void;
  onNewContent: () => void;
}

export function OutputDisplay({ content, request, model, onBack, onNewContent }: OutputDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);

  const saveContent = useMutation(api.content.saveGeneratedContent);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const contentId = await saveContent({
        type: request.contentType,
        topic: request.topic,
        region: request.region,
        model: model,
        content: editedContent,
        metadata: {
          wordCount: editedContent.split(/\s+/).length,
          readingTime: Math.ceil(editedContent.split(/\s+/).length / 200), // ~200 words per minute
          framesUsed: extractFrames(editedContent),
          metaphorsUsed: extractMetaphors(editedContent),
        },
        citations: extractCitations(editedContent),
        referenceUrl: request.url,
      });
      
      setSavedContentId(contentId);
      toast.success('Content saved to your library');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: 'html' | 'pdf' | 'txt') => {
    setIsExporting(true);
    try {
      const filename = `${request.topic.replace(/[^a-zA-Z0-9]/g, '_')}_${request.contentType}`;
      
      switch (format) {
        case 'html':
          exportAsHtml(editedContent, filename);
          break;
        case 'pdf':
          await exportAsPdf(editedContent, filename);
          break;
        case 'txt':
          exportAsText(editedContent, filename);
          break;
      }
      
      toast.success(`Content exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsHtml = (content: string, filename: string) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${request.topic} - ${contentTypeLabels[request.contentType]}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #2563eb; }
        .metadata { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="metadata">
        <h1>${request.topic}</h1>
        <p><strong>Type:</strong> ${contentTypeLabels[request.contentType]}</p>
        <p><strong>Region:</strong> ${regionLabels[request.region]}</p>
        <p><strong>Model:</strong> ${model}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
        ${request.url ? `<p><strong>Reference:</strong> <a href="${request.url}">${request.url}</a></p>` : ''}
    </div>
    <div class="content">${content.replace(/\n/g, '<br>')}</div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = async (content: string, filename: string) => {
    // For PDF export, we'll use the browser's print functionality
    // In a production app, you might use a library like jsPDF or Puppeteer
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
              h1, h2, h3 { color: #2563eb; }
              .metadata { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <div class="metadata">
              <h1>${request.topic}</h1>
              <p><strong>Type:</strong> ${contentTypeLabels[request.contentType]}</p>
              <p><strong>Region:</strong> ${regionLabels[request.region]}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="content">${content.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const exportAsText = (content: string, filename: string) => {
    const textContent = `${request.topic}
${contentTypeLabels[request.contentType]} - ${regionLabels[request.region]}
Generated: ${new Date().toLocaleDateString()}
${request.url ? `Reference: ${request.url}` : ''}

${content}`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const extractFrames = (content: string): string[] => {
    // Simple frame extraction - in production, use more sophisticated NLP
    const frames: string[] = [];
    if (content.includes('opportunity')) frames.push('Opportunity Frame');
    if (content.includes('safety') || content.includes('secure')) frames.push('Safety Frame');
    if (content.includes('innovation')) frames.push('Innovation Frame');
    if (content.includes('collaboration')) frames.push('Collaboration Frame');
    if (content.includes('progress')) frames.push('Progress Frame');
    return frames;
  };

  const extractMetaphors = (content: string): string[] => {
    // Simple metaphor extraction
    const metaphors: string[] = [];
    if (content.includes('bridge') || content.includes('pathway')) metaphors.push('Bridge/Pathway');
    if (content.includes('foundation') || content.includes('building')) metaphors.push('Building/Foundation');
    if (content.includes('journey') || content.includes('roadmap')) metaphors.push('Journey/Navigation');
    if (content.includes('ecosystem') || content.includes('landscape')) metaphors.push('Ecosystem/Landscape');
    return metaphors;
  };

  const extractCitations = (content: string) => {
    // Simple citation extraction - in production, use more sophisticated parsing
    const citations: Array<{
      source: string;
      title: string;
      url: string;
      accessDate: string;
    }> = [];
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];
    
    urls.forEach((url, index) => {
      citations.push({
        source: `Reference ${index + 1}`,
        title: `External Source`,
        url: url,
        accessDate: new Date().toISOString(),
      });
    });
    
    return citations;
  };

  const getWordCount = (text: string) => text.split(/\s+/).filter(word => word.length > 0).length;
  const getReadingTime = (text: string) => Math.ceil(getWordCount(text) / 200);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Generated Content</h1>
            <p className="text-white/80">
              {contentTypeLabels[request.contentType]} • {regionLabels[request.region]} • {request.topic}
            </p>
          </div>
          <div className="flex space-x-3">
            <GlassButton onClick={onBack} className="bg-white/20 hover:bg-white/30">
              ← Back
            </GlassButton>
            <GlassButton onClick={onNewContent} className="bg-green-600/80 hover:bg-green-700/80">
              New Content
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Content Display */}
          <div className="lg:col-span-3">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Content</h2>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <GlassButton
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600/80 hover:bg-blue-700/80 text-sm px-3 py-2"
                    >
                      ✏️ Edit
                    </GlassButton>
                  ) : (
                    <>
                      <GlassButton
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-green-600/80 hover:bg-green-700/80 text-sm px-3 py-2"
                      >
                        {isSaving ? 'Saving...' : '💾 Save'}
                      </GlassButton>
                      <GlassButton
                        onClick={() => {
                          setIsEditing(false);
                          setEditedContent(content);
                        }}
                        className="bg-gray-600/80 hover:bg-gray-700/80 text-sm px-3 py-2"
                      >
                        Cancel
                      </GlassButton>
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-[600px] bg-white/5 rounded-xl p-6 text-white/90 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20"
                  placeholder="Edit your content here..."
                />
              ) : (
                <div className="bg-white/5 rounded-xl p-6 max-h-[600px] overflow-y-auto">
                  <pre className="text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
                    {editedContent}
                  </pre>
                </div>
              )}
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Stats */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Content Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Words:</span>
                  <span className="text-white font-medium">{getWordCount(editedContent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Reading Time:</span>
                  <span className="text-white font-medium">{getReadingTime(editedContent)} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Model:</span>
                  <span className="text-white font-medium text-sm">{model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Generated:</span>
                  <span className="text-white font-medium text-sm">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </GlassCard>

            {/* Export Options */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
              <div className="space-y-3">
                <GlassButton
                  onClick={() => handleExport('html')}
                  disabled={isExporting}
                  className="w-full bg-orange-600/80 hover:bg-orange-700/80 text-sm"
                >
                  📄 Export as HTML
                </GlassButton>
                <GlassButton
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                  className="w-full bg-red-600/80 hover:bg-red-700/80 text-sm"
                >
                  📑 Export as PDF
                </GlassButton>
                <GlassButton
                  onClick={() => handleExport('txt')}
                  disabled={isExporting}
                  className="w-full bg-gray-600/80 hover:bg-gray-700/80 text-sm"
                >
                  📝 Export as Text
                </GlassButton>
              </div>
            </GlassCard>

            {/* Framing Analysis */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Lakoff Analysis</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-white/90 text-sm font-medium mb-2">Frames Used:</h4>
                  <div className="flex flex-wrap gap-1">
                    {extractFrames(editedContent).map((frame, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/30 rounded text-white/80 text-xs">
                        {frame}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white/90 text-sm font-medium mb-2">Metaphors:</h4>
                  <div className="flex flex-wrap gap-1">
                    {extractMetaphors(editedContent).map((metaphor, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/30 rounded text-white/80 text-xs">
                        {metaphor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Sharing */}
            <GlassCard>
              <h3 className="text-lg font-semibold text-white mb-4">Share & Collaborate</h3>
              <div className="space-y-3">
                <GlassButton
                  onClick={() => {
                    navigator.clipboard.writeText(editedContent);
                    toast.success('Content copied to clipboard');
                  }}
                  className="w-full bg-indigo-600/80 hover:bg-indigo-700/80 text-sm"
                >
                  📋 Copy to Clipboard
                </GlassButton>
                <GlassButton
                  onClick={() => {
                    if (savedContentId) {
                      setShowShareModal(true);
                    } else {
                      toast.info('Please save the content first to share it');
                    }
                  }}
                  className="w-full bg-green-600/80 hover:bg-green-700/80 text-sm"
                >
                  📧 Share via Email
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && savedContentId && (
        <ContentShare
          contentId={savedContentId}
          contentTitle={request.topic}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}