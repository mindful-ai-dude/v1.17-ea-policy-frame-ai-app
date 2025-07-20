import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { GlassCard } from './ui/GlassCard';
import { GlassButton } from './ui/GlassButton';
import { GlassInput } from './ui/GlassInput';
import { toast } from 'sonner';

interface ContentLibraryProps {
  onViewContent: (contentId: string) => void;
  onNewContent: () => void;
}

interface ContentItem {
  id: string;
  type: string;
  topic: string;
  region: string;
  model: string;
  content: string; // Preview
  metadata: {
    wordCount: number;
    readingTime: number;
    framesUsed: string[];
    metaphorsUsed: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export function ContentLibrary({ onViewContent, onNewContent }: ContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'wordCount'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const userContent = useQuery(api.content.getUserContent, { limit: 50 });
  const searchResults = useQuery(api.content.searchContent, {
    query: searchQuery,
    type: selectedType || undefined,
    region: selectedRegion || undefined,
  });
  const deleteContent = useMutation(api.content.deleteContent);

  const contentTypeLabels = {
    blog: 'Blog Post',
    article: 'Policy Article',
    playbook: 'Marketing Playbook',
    social: 'Social Media'
  };

  const regionLabels = {
    USA: '🇺🇸 USA',
    Europe: '🇪🇺 Europe',
    Australia: '🇦🇺 Australia',
    Morocco: '🇲🇦 Morocco'
  };

  const contentToDisplay = searchQuery || selectedType || selectedRegion ? searchResults : userContent;

  const sortedContent = contentToDisplay ? [...contentToDisplay].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'wordCount':
        return b.metadata.wordCount - a.metadata.wordCount;
      default:
        return 0;
    }
  }) : [];

  const handleDeleteContent = async (contentId: string, topic: string) => {
    if (!confirm(`Are you sure you want to delete "${topic}"?`)) {
      return;
    }

    try {
      await deleteContent({ contentId });
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  };

  const getContentStats = () => {
    if (!userContent) return { total: 0, totalWords: 0, avgReadingTime: 0 };
    
    const total = userContent.length;
    const totalWords = userContent.reduce((sum, item) => sum + item.metadata.wordCount, 0);
    const avgReadingTime = total > 0 ? Math.round(userContent.reduce((sum, item) => sum + item.metadata.readingTime, 0) / total) : 0;
    
    return { total, totalWords, avgReadingTime };
  };

  const stats = getContentStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Content Library</h1>
            <p className="text-gray-700">
              Manage and organize your generated policy content
            </p>
          </div>
          <GlassButton 
            onClick={onNewContent}
            className="bg-green-600/80 hover:bg-green-700/80"
          >
            ✨ Create New Content
          </GlassButton>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlassCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
              <div className="text-gray-700">Total Documents</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.totalWords.toLocaleString()}</div>
              <div className="text-gray-700">Total Words</div>
            </div>
          </GlassCard>
          <GlassCard>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{stats.avgReadingTime}</div>
              <div className="text-gray-700">Avg. Reading Time (min)</div>
            </div>
          </GlassCard>
        </div>

        {/* Filters and Search */}
        <GlassCard className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <GlassInput
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Content Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="">All Types</option>
                <option value="blog">Blog Posts</option>
                <option value="article">Policy Articles</option>
                <option value="playbook">Marketing Playbooks</option>
                <option value="social">Social Media</option>
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="">All Regions</option>
                <option value="USA">🇺🇸 USA</option>
                <option value="Europe">🇪🇺 Europe</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Morocco">🇲🇦 Morocco</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'wordCount')}
                className="w-full backdrop-blur-[20px] bg-white/10 rounded-xl border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="wordCount">Most Words</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
            <div className="text-gray-700 text-sm">
              {sortedContent.length} {sortedContent.length === 1 ? 'document' : 'documents'} found
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                ⊞ Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/15'
                }`}
              >
                ☰ List
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Content Grid/List */}
        {sortedContent.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
              <p className="text-gray-700 mb-6">
                {searchQuery || selectedType || selectedRegion 
                  ? 'Try adjusting your search filters'
                  : 'Start by creating your first piece of content'
                }
              </p>
              <GlassButton 
                onClick={onNewContent}
                className="bg-blue-600/80 hover:bg-blue-700/80"
              >
                Create Your First Content
              </GlassButton>
            </div>
          </GlassCard>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {sortedContent.map((item) => (
              <GlassCard key={item.id} className={viewMode === 'list' ? 'p-4' : ''}>
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-500/30 rounded text-gray-800 text-xs">
                            {contentTypeLabels[item.type as keyof typeof contentTypeLabels]}
                          </span>
                          <span className="px-2 py-1 bg-purple-500/30 rounded text-gray-800 text-xs">
                            {regionLabels[item.region as keyof typeof regionLabels]}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
                          {item.topic}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteContent(item.id, item.topic)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete content"
                      >
                        🗑️
                      </button>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-3">
                      {item.content}
                    </p>

                    <div className="flex justify-between text-xs text-gray-700">
                      <span>{item.metadata.wordCount} words</span>
                      <span>{item.metadata.readingTime} min read</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {item.metadata.framesUsed.slice(0, 3).map((frame, index) => (
                        <span key={index} className="px-2 py-1 bg-green-500/20 rounded text-gray-800 text-xs">
                          {frame}
                        </span>
                      ))}
                      {item.metadata.framesUsed.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 rounded text-gray-700 text-xs">
                          +{item.metadata.framesUsed.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 text-xs">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <GlassButton
                        onClick={() => onViewContent(item.id)}
                        className="bg-blue-600/80 hover:bg-blue-700/80 text-sm px-3 py-1"
                      >
                        View
                      </GlassButton>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <span className="px-2 py-1 bg-blue-500/30 rounded text-gray-800 text-xs">
                            {contentTypeLabels[item.type as keyof typeof contentTypeLabels]}
                          </span>
                          <span className="px-2 py-1 bg-purple-500/30 rounded text-gray-800 text-xs">
                            {regionLabels[item.region as keyof typeof regionLabels]}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold">
                          {item.topic}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                        <span>{item.metadata.wordCount} words</span>
                        <span>{item.metadata.readingTime} min read</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>{item.metadata.framesUsed.length} frames</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <GlassButton
                        onClick={() => onViewContent(item.id)}
                        className="bg-blue-600/80 hover:bg-blue-700/80 text-sm px-3 py-1"
                      >
                        View
                      </GlassButton>
                      <button
                        onClick={() => handleDeleteContent(item.id, item.topic)}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Delete content"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}