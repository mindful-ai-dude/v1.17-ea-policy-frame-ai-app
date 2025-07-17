import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import GlassModal from '../components/GlassModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppStore } from '../store/useAppStore';
import type { ContentType, Region, GeminiModel, Citation } from '../types';

interface OutputDisplayState {
  content: string;
  metadata: {
    model: GeminiModel;
    region: Region;
    contentType: ContentType;
    topic: string;
    generationTime: number;
    wordCount: number;
    framingAnalysis?: {
      effectiveness: number;
      detectedFrames: Array<{
        name: string;
        values: string[];
        metaphors: string[];
        keywords: string[];
      }>;
    };
  };
  citations?: Citation[];
}

interface ContentVersion {
  id: number;
  timestamp: Date;
  content: string;
  metadata: OutputDisplayState['metadata'];
  wordCount: number;
  author?: string;
  changeDescription?: string;
}

/**
 * Output Display page component
 */
const OutputDisplay: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const state = location.state as OutputDisplayState;
  
  // If no content is provided, redirect to generation dashboard
  if (!state?.content) {
    navigate('/generation-dashboard');
    return null;
  }
  
  const { content, metadata, citations = [] } = state;
  
  // State for version history
  const [versions, setVersions] = useState<ContentVersion[]>([
    { 
      id: 1, 
      timestamp: new Date(), 
      content, 
      metadata,
      wordCount: metadata.wordCount,
      author: user?.name || 'You',
      changeDescription: 'Initial generation'
    }
  ]);
  const [currentVersionId, setCurrentVersionId] = useState(1);
  
  // State for export options
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'word' | 'html' | 'markdown' | 'text'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCitations: true,
    includeMetadata: true,
    includeFramingAnalysis: false
  });
  
  // State for sharing
  const [isSharing, setIsSharing] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit' | 'comment'>('view');
  const [shareMessage, setShareMessage] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [editChangeDescription, setEditChangeDescription] = useState('');
  
  // State for content display
  const [showFramingAnalysis, setShowFramingAnalysis] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [contentView, setContentView] = useState<'formatted' | 'raw'>('formatted');
  
  // State for saving to library
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [contentTitle, setContentTitle] = useState(metadata.topic);
  const [contentTags, setContentTags] = useState<string[]>([]);
  
  // Handle export
  const handleExport = () => {
    setIsExporting(true);
    
    // Get current version content
    const currentContent = currentVersion.content;
    const currentMetadata = currentVersion.metadata;
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      
      // Create content based on format
      if (exportFormat === 'html') {
        // HTML export with styling based on content type
        let citationsHtml = '';
        if (exportOptions.includeCitations && citations.length > 0) {
          citationsHtml = `
          <div class="citations">
            <h2>Citations</h2>
            <ol>
              ${citations.map(citation => `
                <li>
                  <strong>${citation.title}</strong>
                  ${citation.author ? ` by ${citation.author}` : ''}
                  ${citation.url ? ` - <a href="${citation.url}" target="_blank">${citation.url}</a>` : ''}
                  ${citation.accessDate ? ` (Accessed: ${new Date(citation.accessDate).toLocaleDateString()})` : ''}
                </li>
              `).join('')}
            </ol>
          </div>
          `;
        }
        
        let framingAnalysisHtml = '';
        if (exportOptions.includeFramingAnalysis && currentMetadata.framingAnalysis) {
          framingAnalysisHtml = `
          <div class="framing-analysis">
            <h2>Framing Analysis</h2>
            <p>Effectiveness Score: ${currentMetadata.framingAnalysis.effectiveness}%</p>
            <h3>Detected Frames:</h3>
            <ul>
              ${currentMetadata.framingAnalysis.detectedFrames.map(frame => `
                <li>
                  <strong>${frame.name}</strong>
                  <p>Values: ${frame.values.join(', ')}</p>
                  <p>Metaphors: ${frame.metaphors.join(', ')}</p>
                  <p>Keywords: ${frame.keywords.join(', ')}</p>
                </li>
              `).join('')}
            </ul>
          </div>
          `;
        }
        
        // Create HTML content with appropriate styling based on content type
        let contentHtml = '';
        if (currentMetadata.contentType === 'blog') {
          // Format as blog post
          contentHtml = `<div class="blog-post">${currentContent.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>`;
        } else if (currentMetadata.contentType === 'article') {
          // Format as article with sections
          const paragraphs = currentContent.split('\n\n');
          contentHtml = paragraphs.map(p => {
            if (p.startsWith('# ')) {
              return `<h1>${p.substring(2)}</h1>`;
            } else if (p.startsWith('## ')) {
              return `<h2>${p.substring(3)}</h2>`;
            } else if (p.startsWith('### ')) {
              return `<h3>${p.substring(4)}</h3>`;
            } else {
              return `<p>${p}</p>`;
            }
          }).join('');
        } else if (currentMetadata.contentType === 'playbook') {
          // Format as playbook with sections and lists
          const paragraphs = currentContent.split('\n\n');
          contentHtml = paragraphs.map(p => {
            if (p.startsWith('# ')) {
              return `<h1>${p.substring(2)}</h1>`;
            } else if (p.startsWith('## ')) {
              return `<h2>${p.substring(3)}</h2>`;
            } else if (p.startsWith('- ')) {
              const items = p.split('\n').map(item => `<li>${item.substring(2)}</li>`).join('');
              return `<ul>${items}</ul>`;
            } else if (p.match(/^\d+\./)) {
              const items = p.split('\n').map(item => {
                const match = item.match(/^\d+\.\s*(.*)/);
                return match ? `<li>${match[1]}</li>` : `<li>${item}</li>`;
              }).join('');
              return `<ol>${items}</ol>`;
            } else {
              return `<p>${p}</p>`;
            }
          }).join('');
        } else if (currentMetadata.contentType === 'social') {
          // Format as social media calendar
          contentHtml = `<div class="social-calendar">${currentContent.replace(/\n/g, '<br>')}</div>`;
        } else {
          // Default formatting
          contentHtml = `<div class="content">${currentContent.split('\n\n').map(p => `<p>${p}</p>`).join('')}</div>`;
        }
        
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentMetadata.topic}</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 20px; 
      color: #333;
    }
    h1 { color: #1a56db; margin-top: 1.5em; margin-bottom: 0.5em; }
    h2 { color: #2563eb; margin-top: 1.2em; margin-bottom: 0.5em; }
    h3 { color: #3b82f6; margin-top: 1em; margin-bottom: 0.5em; }
    .metadata { 
      color: #666; 
      font-size: 0.9em; 
      margin-bottom: 20px; 
      background-color: #f8fafc;
      padding: 15px;
      border-radius: 8px;
    }
    .content { margin-top: 20px; }
    .blog-post p { margin-bottom: 1em; }
    .social-calendar { 
      background-color: #f0f9ff; 
      padding: 15px; 
      border-radius: 8px; 
      border-left: 4px solid #3b82f6;
    }
    .citations { 
      margin-top: 40px; 
      border-top: 1px solid #e2e8f0; 
      padding-top: 20px;
    }
    .framing-analysis {
      margin-top: 40px;
      background-color: #f0f7ff;
      padding: 15px;
      border-radius: 8px;
    }
    .footer {
      margin-top: 40px;
      font-size: 0.8em;
      color: #94a3b8;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${currentMetadata.topic}</h1>
  
  ${exportOptions.includeMetadata ? `
  <div class="metadata">
    <p><strong>Generated with:</strong> ${currentMetadata.model}</p>
    <p><strong>Region:</strong> ${getRegionName(currentMetadata.region)}</p>
    <p><strong>Content type:</strong> ${getContentTypeName(currentMetadata.contentType)}</p>
    <p><strong>Word count:</strong> ${currentMetadata.wordCount}</p>
    <p><strong>Generation time:</strong> ${currentMetadata.generationTime.toFixed(1)} seconds</p>
    <p><strong>Generated on:</strong> ${currentVersion.timestamp.toLocaleDateString()}</p>
  </div>
  ` : ''}
  
  ${contentHtml}
  
  ${exportOptions.includeCitations ? citationsHtml : ''}
  
  ${exportOptions.includeFramingAnalysis ? framingAnalysisHtml : ''}
  
  <div class="footer">
    <p>Generated using EA PolicyFrame App</p>
  </div>
</body>
</html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentMetadata.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'markdown') {
        // Create markdown content
        let markdownContent = `# ${currentMetadata.topic}\n\n`;
        
        if (exportOptions.includeMetadata) {
          markdownContent += `> Generated with ${currentMetadata.model} for ${getRegionName(currentMetadata.region)}\n`;
          markdownContent += `> Content type: ${getContentTypeName(currentMetadata.contentType)}\n`;
          markdownContent += `> Word count: ${currentMetadata.wordCount}\n\n`;
        }
        
        markdownContent += currentContent;
        
        if (exportOptions.includeCitations && citations.length > 0) {
          markdownContent += '\n\n## Citations\n\n';
          citations.forEach((citation, index) => {
            markdownContent += `${index + 1}. **${citation.title}**`;
            if (citation.author) markdownContent += ` by ${citation.author}`;
            if (citation.url) markdownContent += ` - ${citation.url}`;
            if (citation.accessDate) markdownContent += ` (Accessed: ${new Date(citation.accessDate).toLocaleDateString()})`;
            markdownContent += '\n';
          });
        }
        
        if (exportOptions.includeFramingAnalysis && currentMetadata.framingAnalysis) {
          markdownContent += '\n\n## Framing Analysis\n\n';
          markdownContent += `Effectiveness Score: ${currentMetadata.framingAnalysis.effectiveness}%\n\n`;
          markdownContent += '### Detected Frames:\n\n';
          currentMetadata.framingAnalysis.detectedFrames.forEach(frame => {
            markdownContent += `- **${frame.name}**\n`;
            markdownContent += `  - Values: ${frame.values.join(', ')}\n`;
            markdownContent += `  - Metaphors: ${frame.metaphors.join(', ')}\n`;
            markdownContent += `  - Keywords: ${frame.keywords.join(', ')}\n\n`;
          });
        }
        
        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentMetadata.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (exportFormat === 'text') {
        // Create plain text content
        let textContent = `${currentMetadata.topic.toUpperCase()}\n\n`;
        
        if (exportOptions.includeMetadata) {
          textContent += `Generated with ${currentMetadata.model} for ${getRegionName(currentMetadata.region)}\n`;
          textContent += `Content type: ${getContentTypeName(currentMetadata.contentType)}\n`;
          textContent += `Word count: ${currentMetadata.wordCount}\n\n`;
          textContent += `Generated on: ${currentVersion.timestamp.toLocaleDateString()}\n\n`;
          textContent += `${'='.repeat(80)}\n\n`;
        }
        
        textContent += currentContent;
        
        if (exportOptions.includeCitations && citations.length > 0) {
          textContent += '\n\nCITATIONS:\n\n';
          citations.forEach((citation, index) => {
            textContent += `${index + 1}. ${citation.title}`;
            if (citation.author) textContent += ` by ${citation.author}`;
            if (citation.url) textContent += ` - ${citation.url}`;
            if (citation.accessDate) textContent += ` (Accessed: ${new Date(citation.accessDate).toLocaleDateString()})`;
            textContent += '\n';
          });
        }
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentMetadata.topic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For PDF and Word, we'd normally use a library or backend service
        // For this demo, just show an alert
        alert(`Export to ${exportFormat.toUpperCase()} would happen here in a real app`);
      }
    }, 1500);
  };
  
  // Handle share
  const handleShare = () => {
    if (!shareEmail) return;
    
    setIsSharing(true);
    
    // Simulate sharing process
    setTimeout(() => {
      setIsSharing(false);
      setShareEmail('');
      setShowShareModal(false);
      
      // In a real app, this would call an API to share the content
      alert(`Content shared with ${shareEmail} with ${sharePermission} permissions (simulated)`);
    }, 1500);
  };
  
  // Handle save to library
  const handleSaveToLibrary = () => {
    if (!contentTitle) return;
    
    setIsSaving(true);
    
    // Simulate saving process
    setTimeout(() => {
      setIsSaving(false);
      setShowSaveModal(false);
      
      // In a real app, this would call an API to save the content to the library
      alert(`Content saved to library as "${contentTitle}" (simulated)`);
    }, 1500);
  };
  
  // Handle save edited content
  const handleSaveEdit = () => {
    // Calculate word count
    const wordCount = editedContent.split(/\s+/).length;
    
    // Create a new version
    const newVersion = {
      id: versions.length + 1,
      timestamp: new Date(),
      content: editedContent,
      metadata: {
        ...metadata,
        wordCount
      },
      wordCount,
      author: user?.name || 'You',
      changeDescription: editChangeDescription || 'Content edited'
    };
    
    setVersions([...versions, newVersion]);
    setCurrentVersionId(newVersion.id);
    setIsEditing(false);
    setEditChangeDescription('');
  };
  
  // Get current version
  const currentVersion = versions.find(v => v.id === currentVersionId) || versions[0];
  
  // Helper function to get content type display name
  function getContentTypeName(type: ContentType): string {
    const names = {
      blog: 'Short Daily Blog Post',
      article: 'AI Policy Article',
      playbook: 'Marketing Playbook',
      social: 'Social Media Calendar'
    };
    return names[type];
  }
  
  // Helper function to get region display name
  function getRegionName(region: Region): string {
    const names = {
      usa: 'United States',
      europe: 'Europe',
      australia: 'Australia',
      morocco: 'Morocco'
    };
    return names[region];
  }
  
  // Format content based on content type
  const formatContent = (content: string, contentType: ContentType) => {
    if (contentView === 'raw') {
      return content.split('\n').map((paragraph, i) => (
        <p key={i} className="font-mono text-sm">{paragraph}</p>
      ));
    }
    
    if (contentType === 'blog') {
      // Format as blog post
      return content.split('\n\n').map((paragraph, i) => (
        <p key={i} className="mb-4">{paragraph}</p>
      ));
    } else if (contentType === 'article') {
      // Format as article with sections
      return content.split('\n\n').map((paragraph, i) => {
        if (paragraph.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{paragraph.substring(2)}</h1>;
        } else if (paragraph.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-5 mb-3">{paragraph.substring(3)}</h2>;
        } else if (paragraph.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(4)}</h3>;
        } else {
          return <p key={i} className="mb-4">{paragraph}</p>;
        }
      });
    } else if (contentType === 'playbook') {
      // Format as playbook with sections and lists
      return content.split('\n\n').map((paragraph, i) => {
        if (paragraph.startsWith('# ')) {
          return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{paragraph.substring(2)}</h1>;
        } else if (paragraph.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-5 mb-3">{paragraph.substring(3)}</h2>;
        } else if (paragraph.includes('\n- ')) {
          const [title, ...items] = paragraph.split('\n');
          return (
            <div key={i} className="mb-4">
              <p className="mb-2 font-medium">{title}</p>
              <ul className="list-disc pl-5 space-y-1">
                {items.map((item, j) => (
                  <li key={j}>{item.substring(2)}</li>
                ))}
              </ul>
            </div>
          );
        } else if (paragraph.match(/^\d+\./)) {
          const lines = paragraph.split('\n');
          return (
            <ol key={i} className="list-decimal pl-5 space-y-1 mb-4">
              {lines.map((line, j) => {
                const match = line.match(/^\d+\.\s*(.*)/);
                return <li key={j}>{match ? match[1] : line}</li>;
              })}
            </ol>
          );
        } else {
          return <p key={i} className="mb-4">{paragraph}</p>;
        }
      });
    } else if (contentType === 'social') {
      // Format as social media calendar
      const lines = content.split('\n');
      const posts = [];
      let currentPost = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^(Day|Week) \d+:/) || line.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/)) {
          if (currentPost) {
            posts.push(currentPost);
          }
          currentPost = { header: line, content: [] };
        } else if (currentPost && line.trim()) {
          currentPost.content.push(line);
        }
      }
      
      if (currentPost) {
        posts.push(currentPost);
      }
      
      return (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div key={i} className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-lg font-medium text-blue-300 mb-2">{post.header}</h3>
              {post.content.map((line, j) => (
                <p key={j} className="text-white/90">{line}</p>
              ))}
            </div>
          ))}
        </div>
      );
    } else {
      // Default formatting
      return content.split('\n').map((paragraph, i) => (
        <p key={i} className="mb-2">{paragraph}</p>
      ));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Generated Content</h1>
          <p className="text-white/80 mt-1">{metadata.topic}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <GlassButton
            onClick={() => navigate('/generation-dashboard')}
            variant="outline"
          >
            Back to Dashboard
          </GlassButton>
          
          <GlassButton
            onClick={() => setShowSaveModal(true)}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h1a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h1v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
              </svg>
            }
          >
            Save to Library
          </GlassButton>
          
          <GlassButton
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Content'}
          </GlassButton>
        </div>
      </div>
      
      {/* Content Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <GlassCard>
            {isEditing ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Edit Content</h2>
                
                <GlassInput
                  type="text"
                  value={editChangeDescription}
                  onChange={(e) => setEditChangeDescription(e.target.value)}
                  placeholder="Describe your changes (optional)"
                  className="w-full"
                />
                
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="glass-input min-h-[400px] font-mono text-sm"
                />
                
                <div className="flex justify-end gap-2">
                  <GlassButton
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Cancel
                  </GlassButton>
                  
                  <GlassButton
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <h2 className="text-xl font-semibold text-white">
                    {getContentTypeName(metadata.contentType)}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-white/70 text-sm">
                      {currentVersion.wordCount || metadata.wordCount} words
                    </span>
                    
                    <span className="text-white/70 text-sm">
                      {getRegionName(metadata.region)}
                    </span>
                    
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-200">
                      {metadata.model}
                    </span>
                    
                    <div className="flex gap-1">
                      <button
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          contentView === 'formatted' 
                            ? 'bg-blue-500/40 text-blue-100' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        onClick={() => setContentView('formatted')}
                      >
                        Formatted
                      </button>
                      <button
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          contentView === 'raw' 
                            ? 'bg-blue-500/40 text-blue-100' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        onClick={() => setContentView('raw')}
                      >
                        Raw
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="glass-scrollbar overflow-y-auto max-h-[600px] bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
                    {formatContent(currentVersion.content, metadata.contentType)}
                  </div>
                </div>
                
                {/* Citations Section */}
                {citations.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Citations</h3>
                      <button
                        className="text-blue-300 text-sm hover:text-blue-200"
                        onClick={() => setShowCitations(!showCitations)}
                      >
                        {showCitations ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    {showCitations && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                        <ol className="list-decimal pl-5 space-y-2">
                          {citations.map((citation, index) => (
                            <li key={index} className="text-white/90">
                              <span className="font-medium">{citation.title}</span>
                              {citation.author && <span> by {citation.author}</span>}
                              {citation.url && (
                                <a 
                                  href={citation.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-300 hover:text-blue-200 ml-1"
                                >
                                  [Link]
                                </a>
                              )}
                              {citation.accessDate && (
                                <span className="text-white/60 text-sm ml-1">
                                  (Accessed: {new Date(citation.accessDate).toLocaleDateString()})
                                </span>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Framing Analysis Section */}
                {metadata.framingAnalysis && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">Framing Analysis</h3>
                      <button
                        className="text-blue-300 text-sm hover:text-blue-200"
                        onClick={() => setShowFramingAnalysis(!showFramingAnalysis)}
                      >
                        {showFramingAnalysis ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    
                    {showFramingAnalysis && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/90">Effectiveness Score</span>
                            <span className="text-blue-300 font-medium">
                              {metadata.framingAnalysis.effectiveness}%
                            </span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${metadata.framingAnalysis.effectiveness}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <h4 className="text-white font-medium mb-2">Detected Frames:</h4>
                        <div className="space-y-3">
                          {metadata.framingAnalysis.detectedFrames.map((frame, index) => (
                            <div key={index} className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                              <h5 className="text-blue-300 font-medium">{frame.name}</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                <div>
                                  <span className="text-white/60 text-xs">Values</span>
                                  <p className="text-white/90 text-sm">{frame.values.join(', ')}</p>
                                </div>
                                <div>
                                  <span className="text-white/60 text-xs">Metaphors</span>
                                  <p className="text-white/90 text-sm">{frame.metaphors.join(', ')}</p>
                                </div>
                                <div>
                                  <span className="text-white/60 text-xs">Keywords</span>
                                  <p className="text-white/90 text-sm">{frame.keywords.join(', ')}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          {/* Export Options */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <GlassButton
                  variant={exportFormat === 'pdf' ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setExportFormat('pdf')}
                  size="sm"
                >
                  PDF
                </GlassButton>
                
                <GlassButton
                  variant={exportFormat === 'word' ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setExportFormat('word')}
                  size="sm"
                >
                  Word
                </GlassButton>
                
                <GlassButton
                  variant={exportFormat === 'html' ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setExportFormat('html')}
                  size="sm"
                >
                  HTML
                </GlassButton>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <GlassButton
                  variant={exportFormat === 'markdown' ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setExportFormat('markdown')}
                  size="sm"
                >
                  Markdown
                </GlassButton>
                
                <GlassButton
                  variant={exportFormat === 'text' ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => setExportFormat('text')}
                  size="sm"
                >
                  Text
                </GlassButton>
              </div>
              
              <div className="space-y-2 mt-2">
                <div className="flex items-center">
                  <input
                    id="includeCitations"
                    type="checkbox"
                    checked={exportOptions.includeCitations}
                    onChange={(e) => setExportOptions({...exportOptions, includeCitations: e.target.checked})}
                    className="h-4 w-4 rounded border-white/30 bg-white/10"
                  />
                  <label htmlFor="includeCitations" className="ml-2 block text-white/80 text-sm">
                    Include Citations
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeMetadata"
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions({...exportOptions, includeMetadata: e.target.checked})}
                    className="h-4 w-4 rounded border-white/30 bg-white/10"
                  />
                  <label htmlFor="includeMetadata" className="ml-2 block text-white/80 text-sm">
                    Include Metadata
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="includeFramingAnalysis"
                    type="checkbox"
                    checked={exportOptions.includeFramingAnalysis}
                    onChange={(e) => setExportOptions({...exportOptions, includeFramingAnalysis: e.target.checked})}
                    className="h-4 w-4 rounded border-white/30 bg-white/10"
                  />
                  <label htmlFor="includeFramingAnalysis" className="ml-2 block text-white/80 text-sm">
                    Include Framing Analysis
                  </label>
                </div>
              </div>
              
              <GlassButton
                onClick={handleExport}
                isLoading={isExporting}
                className="w-full"
              >
                Export
              </GlassButton>
            </div>
          </GlassCard>
          
          {/* Sharing Options */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Share Content</h3>
            
            <div className="space-y-4">
              <GlassButton
                onClick={() => setShowShareModal(true)}
                className="w-full"
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                }
              >
                Share with Others
              </GlassButton>
              
              <div className="flex justify-between">
                <GlassButton
                  variant="outline"
                  className="flex-1 mr-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  }
                >
                  Copy Link
                </GlassButton>
                
                <GlassButton
                  variant="outline"
                  className="flex-1"
                  onClick={() => alert('Social sharing would be implemented here')}
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 5a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zM4 8a1 1 0 100 2h12a1 1 0 100-2H4zM8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zM4 14a1 1 0 100 2h12a1 1 0 100-2H4z" />
                    </svg>
                  }
                >
                  Social
                </GlassButton>
              </div>
            </div>
          </GlassCard>
          
          {/* Version History */}
          <GlassCard>
            <h3 className="text-lg font-semibold text-white mb-4">Version History</h3>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto glass-scrollbar">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentVersionId === version.id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => setCurrentVersionId(version.id)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Version {version.id}</span>
                    <span className="text-white/70 text-xs">
                      {version.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {version.changeDescription && (
                    <div className="text-blue-300 text-xs mt-1">
                      {version.changeDescription}
                    </div>
                  )}
                  <div className="text-white/60 text-xs mt-1">
                    {version.content.substring(0, 50)}...
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-white/50 text-xs">
                      {version.wordCount} words
                    </span>
                    <span className="text-white/50 text-xs">
                      By {version.author || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
      
      {/* Share Modal */}
      <GlassModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Content"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="shareEmail" className="block text-white mb-1">Email Address</label>
            <GlassInput
              id="shareEmail"
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter recipient's email"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-white mb-1">Permission Level</label>
            <div className="grid grid-cols-3 gap-2">
              <GlassButton
                variant={sharePermission === 'view' ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => setSharePermission('view')}
                size="sm"
              >
                View Only
              </GlassButton>
              
              <GlassButton
                variant={sharePermission === 'comment' ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => setSharePermission('comment')}
                size="sm"
              >
                Comment
              </GlassButton>
              
              <GlassButton
                variant={sharePermission === 'edit' ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => setSharePermission('edit')}
                size="sm"
              >
                Edit
              </GlassButton>
            </div>
          </div>
          
          <div>
            <label htmlFor="shareMessage" className="block text-white mb-1">Message (Optional)</label>
            <textarea
              id="shareMessage"
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              placeholder="Add a message to the recipient"
              className="glass-input min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <GlassButton
              variant="outline"
              onClick={() => setShowShareModal(false)}
            >
              Cancel
            </GlassButton>
            
            <GlassButton
              onClick={handleShare}
              isLoading={isSharing}
              disabled={!shareEmail}
            >
              Share
            </GlassButton>
          </div>
        </div>
      </GlassModal>
      
      {/* Save to Library Modal */}
      <GlassModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save to Library"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="contentTitle" className="block text-white mb-1">Title</label>
            <GlassInput
              id="contentTitle"
              type="text"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder="Enter a title for this content"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="contentTags" className="block text-white mb-1">Tags (comma separated)</label>
            <GlassInput
              id="contentTags"
              type="text"
              value={contentTags.join(', ')}
              onChange={(e) => setContentTags(e.target.value.split(',').map(tag => tag.trim()))}
              placeholder="ai, policy, framing"
              className="w-full"
            />
          </div>
          
          <div className="flex items-center">
            <input
              id="saveCurrentVersion"
              type="checkbox"
              checked={true}
              className="h-4 w-4 rounded border-white/30 bg-white/10"
            />
            <label htmlFor="saveCurrentVersion" className="ml-2 block text-white/80">
              Save current version (Version {currentVersionId})
            </label>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <GlassButton
              variant="outline"
              onClick={() => setShowSaveModal(false)}
            >
              Cancel
            </GlassButton>
            
            <GlassButton
              onClick={handleSaveToLibrary}
              isLoading={isSaving}
              disabled={!contentTitle}
            >
              Save to Library
            </GlassButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
};

// Helper function to copy content to clipboard
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export default OutputDisplay;