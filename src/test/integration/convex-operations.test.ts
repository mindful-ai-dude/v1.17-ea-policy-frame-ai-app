import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../utils/api';
import { ApiError, ApiErrorType } from '../../utils/apiErrorHandling';

// Import the integration test setup
import '../integration-setup';

describe('Convex Database Operations', () => {
  // Mock user data
  const mockUser = {
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    preferences: {},
    apiKeys: { gemini: 'encrypted-key' },
    usage: { requests: 0, tokens: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock document data
  const mockDocument = {
    _id: 'doc123',
    id: 'doc123',
    title: 'Test Document',
    content: 'This is a test document for Convex operations.',
    metadata: {
      fileType: 'text/plain',
      fileSize: 1024,
      author: 'Test Author',
      keywords: ['test', 'convex', 'integration']
    },
    storageId: 'storage123',
    extractedMetaphors: [],
    framingExamples: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Mock content data
  const mockContent = {
    _id: 'content123',
    userId: 'user123',
    type: 'blog',
    topic: 'Convex Integration',
    region: 'usa',
    model: 'gemini-2.5-pro',
    content: 'This is generated content for testing Convex operations.',
    metadata: {
      generationTime: 1.5,
      wordCount: 10
    },
    citations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  describe('Authentication Operations', () => {
    beforeEach(() => {
      // Mock authentication functions
      (api.query.auth.getUser as any).mockResolvedValue(mockUser);
    });

    it('should retrieve authenticated user', async () => {
      const user = await api.query.auth.getUser();
      
      expect(user).toEqual(mockUser);
      expect(user._id).toBe('user123');
      expect(user.email).toBe('test@example.com');
    });

    it('should handle authentication errors', async () => {
      // Mock authentication failure
      (api.query.auth.getUser as any).mockRejectedValue(
        new ApiError('Authentication failed', ApiErrorType.AUTHENTICATION)
      );
      
      await expect(api.query.auth.getUser()).rejects.toThrow('Authentication failed');
    });
  });

  describe('Document Operations', () => {
    beforeEach(() => {
      // Mock document functions
      (api.query.documents.getDocumentById as any).mockResolvedValue(mockDocument);
      (api.query.documents.getUserDocuments as any).mockResolvedValue([mockDocument]);
    });

    it('should retrieve document by ID', async () => {
      const document = await api.query.documents.getDocumentById({ documentId: 'doc123' });
      
      expect(document).toEqual(mockDocument);
      expect(document.title).toBe('Test Document');
      expect(document.content).toContain('test document');
    });

    it('should retrieve user documents', async () => {
      const documents = await api.query.documents.getUserDocuments({ userId: 'user123' });
      
      expect(documents).toHaveLength(1);
      expect(documents[0]).toEqual(mockDocument);
    });

    it('should extract metaphors from document', async () => {
      // Mock extractMetaphors function
      (api.mutation.documents.extractMetaphors as any).mockResolvedValue(true);
      
      const metaphors = [
        { text: 'AI thinks', type: 'aiAsActor', context: 'AI thinks like humans' }
      ];
      
      const result = await api.mutation.documents.extractMetaphors({
        documentId: 'doc123',
        metaphors
      });
      
      expect(result).toBe(true);
      expect(api.mutation.documents.extractMetaphors).toHaveBeenCalledWith({
        documentId: 'doc123',
        metaphors
      });
    });
  });

  describe('File Operations', () => {
    beforeEach(() => {
      // Mock file functions
      (api.query.files.fullTextSearch as any).mockResolvedValue([mockDocument]);
      (api.mutation.files.generateUploadUrl as any).mockResolvedValue('https://example.com/upload');
      (api.mutation.files.saveFileMetadata as any).mockResolvedValue('doc123');
      (api.mutation.files.deleteFile as any).mockResolvedValue(true);
    });

    it('should search files with full text search', async () => {
      const results = await api.query.files.fullTextSearch({
        userId: 'user123',
        searchTerm: 'test'
      });
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(mockDocument);
    });

    it('should generate upload URL', async () => {
      const url = await api.mutation.files.generateUploadUrl({});
      
      expect(url).toBe('https://example.com/upload');
    });

    it('should save file metadata', async () => {
      const documentId = await api.mutation.files.saveFileMetadata({
        userId: 'user123',
        storageId: 'storage123',
        title: 'New Document',
        fileType: 'text/plain',
        fileSize: 2048
      });
      
      expect(documentId).toBe('doc123');
    });

    it('should delete file', async () => {
      const result = await api.mutation.files.deleteFile({
        documentId: 'doc123'
      });
      
      expect(result).toBe(true);
    });
  });

  describe('Semantic Search Operations', () => {
    beforeEach(() => {
      // Mock semantic search function
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [mockDocument],
        message: 'Semantic search results'
      });
    });

    it('should perform semantic search', async () => {
      const result = await api.action.files.semanticSearch({
        userId: 'user123',
        query: 'test'
      });
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toEqual(mockDocument);
      expect(result.message).toBe('Semantic search results');
    });
  });
});