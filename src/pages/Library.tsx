import React, { useState, useEffect } from 'react';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import GlassModal from '../components/GlassModal';
import FileUploader from '../components/FileUploader';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppStore } from '../store/useAppStore';
import { FileReferenceService } from '../services/FileReferenceService';
import type { Document as DocumentType, GeneratedContent, ContentType } from '../types';
import { api } from '../utils/api';
/**
 * Co
ntent Library page component
 */
const Library: React.FC = () => {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'content' | 'documents'>('content');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [contentItems, setContentItems] = useState<GeneratedContent[]>([]);
  const [contentFilter, setContentFilter] = useState<ContentType | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    totalContent: number;
    totalDocuments: number;
    contentByType: Record<string, number>;
    contentByRegion: Record<string, number>;
    averageWordCount: number;
  }>({
    totalContent: 0,
    totalDocuments: 0,
    contentByType: {},
    contentByRegion: {},
    averageWordCount: 0,
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const fileService = new FileReferenceService();  
  
  // Fetch data on component mount
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    } else {
      fetchContentItems();
    }
  }, [activeTab]);
  
  // Update analytics when data changes
  useEffect(() => {
    calculateAnalytics();
  }, [contentItems, documents]);
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await fileService.getUserDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchContentItems = async () => {
    setIsLoading(true);
    try {
      // Fetch content from Convex
      const content = await api.query.content.getUserContent({
        userId: user?.id || '',
      });
      
      setContentItems(content as unknown as GeneratedContent[]);
    } catch (error) {
      console.error('Error fetching content:', error);
      // For demo purposes, set empty array
      setContentItems([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      if (activeTab === 'documents') {
        const results = await fileService.searchDocuments(searchQuery);
        setDocuments(results);
      } else {
        // Search content items
        const results = await api.query.content.searchContent({
          userId: user?.id || '',
          searchTerm: searchQuery,
        });
        setContentItems(results as unknown as GeneratedContent[]);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    if (activeTab === 'documents') {
      fetchDocuments();
    } else {
      fetchContentItems();
    }
  };
  
  const calculateAnalytics = () => {
    // Calculate content analytics
    const contentByType: Record<string, number> = {};
    const contentByRegion: Record<string, number> = {};
    let totalWordCount = 0;

    contentItems.forEach(item => {
      // Count by type
      contentByType[item.type] = (contentByType[item.type] || 0) + 1;
      
      // Count by region
      contentByRegion[item.region] = (contentByRegion[item.region] || 0) + 1;
      
      // Sum word counts
      totalWordCount += item.metadata.wordCount;
    });

    setAnalyticsData({
      totalContent: contentItems.length,
      totalDocuments: documents.length,
      contentByType,
      contentByRegion,
      averageWordCount: contentItems.length ? Math.round(totalWordCount / contentItems.length) : 0
    });
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await api.mutation.content.deleteContent({
        contentId,
      });
      
      // Refresh content list
      fetchContentItems();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await fileService.deleteDocument(documentId);
      
      // Refresh document list
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleArchiveContent = async (contentId: string, isArchived: boolean) => {
    try {
      // In a real implementation, you would update the content with an archived flag
      // For now, we'll just refresh the content list
      fetchContentItems();
    } catch (error) {
      console.error('Error archiving content:', error);
    }
  };  
const handleExportContent = (content: GeneratedContent, format: 'pdf' | 'word' | 'html') => {
    // In a real implementation, you would generate the appropriate file format
    // For now, we'll just log the action
    console.log(`Exporting content ${content.id} as ${format}`);
    
    // Create a simple HTML export as an example
    if (format === 'html') {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${content.topic}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #1a73e8; }
            .metadata { color: #666; font-size: 0.9em; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${content.topic}</h1>
          <div class="metadata">
            <p>Type: ${content.type} | Region: ${content.region} | Model: ${content.model}</p>
            <p>Created: ${new Date(content.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="content">
            ${content.content.replace(/\n/g, '<br>')}
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${content.topic.replace(/\s+/g, '-').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Filter content based on current filters
  const filteredContent = contentItems.filter(item => {
    // Filter by type
    if (contentFilter !== 'all' && item.type !== contentFilter) {
      return false;
    }
    
    // Filter by archive status (would need to add archived field to content model)
    // For now, we'll assume all content is not archived
    if (showArchived) {
      return true; // Show all content when showArchived is true
    } else {
      return true; // Show all content for now
    }
  });

  // Sort content based on current sort order
  const sortedContent = [...filteredContent].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      // Alphabetical
      return a.topic.localeCompare(b.topic);
    }
  });  
  
  // Render content item card
  const renderContentItem = (item: GeneratedContent) => {
    const contentTypeLabels: Record<ContentType, string> = {
      blog: 'Blog Post',
      article: 'Policy Article',
      playbook: 'Marketing Playbook',
      social: 'Social Media Calendar'
    };

    const contentTypeColors: Record<ContentType, string> = {
      blog: 'bg-blue-500',
      article: 'bg-purple-500',
      playbook: 'bg-green-500',
      social: 'bg-orange-500'
    };

    return (
      <GlassCard 
        key={item.id} 
        className="p-4 mb-4 hover:shadow-lg transition-shadow"
        hoverable
        onClick={() => {
          setSelectedContent(item);
          setShowContentModal(true);
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <span className={`${contentTypeColors[item.type]} text-white text-xs px-2 py-1 rounded-full mr-2`}>
                {contentTypeLabels[item.type]}
              </span>
              <span className="text-white/70 text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{item.topic}</h3>
            <p className="text-white/80 text-sm mb-2">
              Region: {item.region.toUpperCase()} | Model: {item.model}
            </p>
            <p className="text-white/60 text-xs">
              {item.metadata.wordCount} words • {item.metadata.readingTime} min read
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleExportContent(item, 'html');
              }}
              className="text-white/70 hover:text-white p-1 rounded transition-colors"
              title="Export"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleArchiveContent(item.id, true);
              }}
              className="text-white/70 hover:text-white p-1 rounded transition-colors"
              title="Archive"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this content?')) {
                  handleDeleteContent(item.id);
                }
              }}
              className="text-white/70 hover:text-red-400 p-1 rounded transition-colors"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </GlassCard>
    );
  };  
// Render document item card
  const renderDocumentItem = (doc: DocumentType) => {
    return (
      <GlassCard 
        key={doc.id} 
        className="p-4 mb-4 hover:shadow-lg transition-shadow"
        hoverable
        onClick={() => {
          setSelectedDocument(doc);
          setShowDocumentModal(true);
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                {doc.metadata.fileType}
              </span>
              <span className="text-white/70 text-xs">
                {new Date(doc.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{doc.title}</h3>
            <p className="text-white/60 text-xs">
              {(doc.metadata.fileSize / 1024).toFixed(1)} KB • 
              {doc.metadata.keywords.length > 0 && (
                <span className="ml-1">
                  Keywords: {doc.metadata.keywords.slice(0, 3).join(', ')}
                  {doc.metadata.keywords.length > 3 && '...'}
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this document?')) {
                  handleDeleteDocument(doc.id);
                }
              }}
              className="text-white/70 hover:text-red-400 p-1 rounded transition-colors"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </GlassCard>
    );
  }; 
 return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">Content Library</h1>
        
        <div className="flex space-x-4">
          <GlassButton
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant="outline"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </GlassButton>
          
          {activeTab === 'documents' && (
            <GlassButton
              onClick={() => setShowUploadModal(true)}
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Upload Document
            </GlassButton>
          )}
        </div>
      </div>
      
      {/* Analytics Panel */}
      {showAnalytics && (
        <GlassCard className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Content Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="text-sm font-medium text-white/70 mb-1">Total Content</h3>
              <p className="text-2xl font-bold text-white">{analyticsData.totalContent}</p>
            </div>
            
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="text-sm font-medium text-white/70 mb-1">Total Documents</h3>
              <p className="text-2xl font-bold text-white">{analyticsData.totalDocuments}</p>
            </div>
            
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="text-sm font-medium text-white/70 mb-1">Average Word Count</h3>
              <p className="text-2xl font-bold text-white">{analyticsData.averageWordCount}</p>
            </div>
            
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="text-sm font-medium text-white/70 mb-1">Most Common Type</h3>
              <p className="text-2xl font-bold text-white">
                {Object.entries(analyticsData.contentByType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Content by Type</h3>
              <div className="space-y-2">
                {Object.entries(analyticsData.contentByType).map(([type, count]) => (
                  <div key={type} className="flex items-center">
                    <div className="w-full bg-white/10 rounded-full h-4 mr-2">
                      <div 
                        className="bg-blue-500 h-4 rounded-full" 
                        style={{ 
                          width: `${(count / analyticsData.totalContent) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-white text-sm whitespace-nowrap">{type} ({count})</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Content by Region</h3>
              <div className="space-y-2">
                {Object.entries(analyticsData.contentByRegion).map(([region, count]) => (
                  <div key={region} className="flex items-center">
                    <div className="w-full bg-white/10 rounded-full h-4 mr-2">
                      <div 
                        className="bg-purple-500 h-4 rounded-full" 
                        style={{ 
                          width: `${(count / analyticsData.totalContent) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-white text-sm whitespace-nowrap">{region} ({count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}      

      {/* Tabs */}
      <div className="flex border-b border-white/20 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'content'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/70 hover:text-white'
          }`}
          onClick={() => setActiveTab('content')}
        >
          Generated Content
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'documents'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-white/70 hover:text-white'
          }`}
          onClick={() => setActiveTab('documents')}
        >
          Reference Documents
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="flex">
            <GlassInput
              placeholder={`Search ${activeTab === 'content' ? 'content' : 'documents'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              rightIcon={
                searchQuery ? (
                  <button onClick={handleClearSearch} className="text-white/70 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : null
              }
            />
            <GlassButton
              onClick={handleSearch}
              className="ml-2"
              isLoading={isSearching}
            >
              Search
            </GlassButton>
          </div>
        </div>
        
        {activeTab === 'content' && (
          <div className="flex flex-wrap gap-2">
            <select
              className="glass-input py-2 px-3"
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value as ContentType | 'all')}
            >
              <option value="all">All Types</option>
              <option value="blog">Blog Posts</option>
              <option value="article">Policy Articles</option>
              <option value="playbook">Marketing Playbooks</option>
              <option value="social">Social Media Calendars</option>
            </select>
            
            <select
              className="glass-input py-2 px-3"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showArchived"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showArchived" className="text-white text-sm">
                Show Archived
              </label>
            </div>
          </div>
        )}
      </div>      

      {/* Content List */}
      <div className="mb-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text={`Loading ${activeTab}...`} />
          </div>
        ) : activeTab === 'content' ? (
          sortedContent.length > 0 ? (
            <div>
              {sortedContent.map(renderContentItem)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">No content found</p>
              <GlassButton
                onClick={() => window.location.href = '/generation'}
              >
                Generate New Content
              </GlassButton>
            </div>
          )
        ) : (
          documents.length > 0 ? (
            <div>
              {documents.map(renderDocumentItem)}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/70 mb-4">No documents found</p>
              <GlassButton
                onClick={() => setShowUploadModal(true)}
              >
                Upload Document
              </GlassButton>
            </div>
          )
        )}
      </div>
      
      {/* Upload Document Modal */}
      <GlassModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="md"
        footer={
          <>
            <GlassButton variant="outline" onClick={() => setShowUploadModal(false)}>
              Cancel
            </GlassButton>
          </>
        }
      >
        <FileUploader
          onUploadComplete={() => {
            setShowUploadModal(false);
            fetchDocuments();
          }}
        />
      </GlassModal>  
    
      {/* Document Detail Modal */}
      <GlassModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        title={selectedDocument?.title || 'Document Details'}
        size="lg"
      >
        {selectedDocument && (
          <div>
            <div className="mb-4">
              <h3 className="text-white/70 text-sm mb-1">File Information</h3>
              <div className="bg-white/10 p-3 rounded">
                <p className="text-white text-sm mb-1">
                  <span className="font-medium">Type:</span> {selectedDocument.metadata.fileType}
                </p>
                <p className="text-white text-sm mb-1">
                  <span className="font-medium">Size:</span> {(selectedDocument.metadata.fileSize / 1024).toFixed(1)} KB
                </p>
                {selectedDocument.metadata.author && (
                  <p className="text-white text-sm mb-1">
                    <span className="font-medium">Author:</span> {selectedDocument.metadata.author}
                  </p>
                )}
                <p className="text-white text-sm">
                  <span className="font-medium">Uploaded:</span> {new Date(selectedDocument.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {selectedDocument.metadata.keywords.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white/70 text-sm mb-1">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.metadata.keywords.map((keyword, index) => (
                    <span key={index} className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedDocument.extractedMetaphors.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white/70 text-sm mb-1">Extracted Metaphors</h3>
                <div className="bg-white/10 p-3 rounded max-h-40 overflow-y-auto">
                  {selectedDocument.extractedMetaphors.map((metaphor, index) => (
                    <div key={index} className="mb-2 pb-2 border-b border-white/10 last:border-0">
                      <p className="text-white text-sm italic">"{metaphor.text}"</p>
                      <p className="text-white/70 text-xs">Type: {metaphor.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-white/70 text-sm mb-1">Content Preview</h3>
              <div className="bg-white/10 p-3 rounded max-h-60 overflow-y-auto">
                <p className="text-white text-sm whitespace-pre-line">
                  {selectedDocument.content.substring(0, 500)}
                  {selectedDocument.content.length > 500 && '...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassModal>      

      {/* Content Detail Modal */}
      <GlassModal
        isOpen={showContentModal}
        onClose={() => setShowContentModal(false)}
        title={selectedContent?.topic || 'Content Details'}
        size="lg"
        footer={
          selectedContent && (
            <div className="flex space-x-2">
              <GlassButton 
                variant="outline" 
                onClick={() => handleExportContent(selectedContent, 'pdf')}
              >
                Export as PDF
              </GlassButton>
              <GlassButton 
                variant="outline" 
                onClick={() => handleExportContent(selectedContent, 'word')}
              >
                Export as Word
              </GlassButton>
              <GlassButton 
                onClick={() => handleExportContent(selectedContent, 'html')}
              >
                Export as HTML
              </GlassButton>
            </div>
          )
        }
      >
        {selectedContent && (
          <div>
            <div className="mb-4">
              <h3 className="text-white/70 text-sm mb-1">Content Information</h3>
              <div className="bg-white/10 p-3 rounded">
                <p className="text-white text-sm mb-1">
                  <span className="font-medium">Type:</span> {selectedContent.type}
                </p>
                <p className="text-white text-sm mb-1">
                  <span className="font-medium">Region:</span> {selectedContent.region}
                </p>
                <p className="text-white text-sm mb-1">
                  <span className="font-medium">Model:</span> {selectedContent.model}
                </p>
                <p className="text-white text-sm mb-1">
                  <span className="font-medium">Word Count:</span> {selectedContent.metadata.wordCount}
                </p>
                <p className="text-white text-sm">
                  <span className="font-medium">Created:</span> {new Date(selectedContent.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            
            {selectedContent.metadata.framesUsed.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white/70 text-sm mb-1">Frames Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContent.metadata.framesUsed.map((frame, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full">
                      {frame}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedContent.metadata.metaphorsUsed.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white/70 text-sm mb-1">Metaphors Used</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedContent.metadata.metaphorsUsed.map((metaphor, index) => (
                    <span key={index} className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
                      {metaphor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedContent.citations.length > 0 && (
              <div className="mb-4">
                <h3 className="text-white/70 text-sm mb-1">Citations</h3>
                <div className="bg-white/10 p-3 rounded max-h-40 overflow-y-auto">
                  {selectedContent.citations.map((citation, index) => (
                    <div key={index} className="mb-2 pb-2 border-b border-white/10 last:border-0">
                      <p className="text-white text-sm">{citation.title}</p>
                      <p className="text-white/70 text-xs">
                        {citation.author ? `${citation.author}, ` : ''}
                        {citation.source}
                        {citation.url && (
                          <a href={citation.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-300 hover:underline">
                            Link
                          </a>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-white/70 text-sm mb-1">Content Preview</h3>
              <div className="bg-white/10 p-3 rounded max-h-60 overflow-y-auto">
                <p className="text-white text-sm whitespace-pre-line">
                  {selectedContent.content.substring(0, 500)}
                  {selectedContent.content.length > 500 && '...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
};

export default Library;