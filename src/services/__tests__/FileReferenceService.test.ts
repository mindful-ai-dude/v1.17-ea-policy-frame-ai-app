import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FileReferenceService } from '../FileReferenceService';
import { api } from '../../utils/api';

// Mock the API
vi.mock('../../utils/api', () => ({
  api: {
    query: {
      files: {
        fullTextSearch: vi.fn(),
      },
      documents: {
        getDocumentById: vi.fn(),
        getUserDocuments: vi.fn(),
      },
      auth: {
        getUser: vi.fn(),
      },
    },
    mutation: {
      files: {
        generateUploadUrl: vi.fn(),
        saveFileMetadata: vi.fn(),
        deleteFile: vi.fn(),
      },
      documents: {
        extractMetaphors: vi.fn(),
        addFramingExamples: vi.fn(),
      },
    },
    action: {
      files: {
        semanticSearch: vi.fn(),
        extractTextFromFile: vi.fn(),
        generateEmbeddings: vi.fn(),
      },
    },
  },
}));

describe('FileReferenceService', () => {
  let service: FileReferenceService;
  const mockUserId = 'user123';
  const mockDocument = {
    _id: 'doc123',
    id: 'doc123',
    title: 'Test Document',
    content: 'This is a test document with some content about AI policy and framing.',
    metadata: {
      fileType: 'text/plain',
      fileSize: 1024,
      author: 'Test Author',
      keywords: ['AI', 'policy', 'framing'],
    },
    storageId: 'storage123',
    extractedMetaphors: [],
    framingExamples: [],
    createdAt: '2025-07-16T12:00:00Z',
    updatedAt: '2025-07-16T12:00:00Z',
  };

  beforeEach(() => {
    service = new FileReferenceService();
    vi.resetAllMocks();
    
    // Mock getUser to return a user
    (api.query.auth.getUser as any).mockResolvedValue({ _id: mockUserId });
  });

  describe('searchDocuments', () => {
    it('should search documents using full-text search', async () => {
      // Mock the fullTextSearch function
      (api.query.files.fullTextSearch as any).mockResolvedValue([mockDocument]);

      const results = await service.searchDocuments('policy');
      
      expect(api.query.files.fullTextSearch).toHaveBeenCalledWith({
        userId: mockUserId,
        searchTerm: 'policy',
      });
      expect(results).toEqual([mockDocument]);
    });

    it('should search documents using semantic search', async () => {
      // Mock the semanticSearch function
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [mockDocument],
        message: 'Semantic search results',
      });

      const results = await service.searchDocuments('policy', true);
      
      expect(api.action.files.semanticSearch).toHaveBeenCalledWith({
        userId: mockUserId,
        query: 'policy',
      });
      expect(results).toEqual([mockDocument]);
    });

    it('should handle errors during search', async () => {
      // Mock the fullTextSearch function to throw an error
      (api.query.files.fullTextSearch as any).mockRejectedValue(new Error('Search failed'));

      await expect(service.searchDocuments('policy')).rejects.toThrow('Failed to search documents: Search failed');
    });

    it('should handle empty search results', async () => {
      // Mock the fullTextSearch function to return empty array
      (api.query.files.fullTextSearch as any).mockResolvedValue([]);

      const results = await service.searchDocuments('nonexistent');
      
      expect(results).toEqual([]);
      expect(api.query.files.fullTextSearch).toHaveBeenCalled();
    });
  });

  describe('extractContent', () => {
    it('should extract content from a document', async () => {
      // Mock the getDocumentById function
      (api.query.documents.getDocumentById as any).mockResolvedValue(mockDocument);

      const content = await service.extractContent('doc123');
      
      expect(api.query.documents.getDocumentById).toHaveBeenCalledWith({
        documentId: 'doc123',
      });
      expect(content).toEqual(mockDocument.content);
    });

    it('should throw an error if document is not found', async () => {
      // Mock the getDocumentById function to return null
      (api.query.documents.getDocumentById as any).mockResolvedValue(null);

      await expect(service.extractContent('doc123')).rejects.toThrow('Failed to extract document content: Document not found');
    });

    it('should handle API errors during content extraction', async () => {
      // Mock the getDocumentById function to throw an error
      (api.query.documents.getDocumentById as any).mockRejectedValue(new Error('API error'));

      await expect(service.extractContent('doc123')).rejects.toThrow('Failed to extract document content: API error');
    });
  });

  describe('findRelevantExamples', () => {
    it('should find relevant examples based on a topic', async () => {
      // Mock the searchDocuments function
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [mockDocument],
        message: 'Semantic search results',
      });

      const examples = await service.findRelevantExamples('policy');
      
      expect(api.action.files.semanticSearch).toHaveBeenCalledWith({
        userId: mockUserId,
        query: 'policy',
      });
      expect(examples).toHaveLength(1);
      expect(examples[0].text).toContain('policy');
      expect(examples[0].source).toEqual(mockDocument.title);
    });

    it('should handle documents without matching content', async () => {
      // Mock document with no matching content
      const noMatchDocument = {
        ...mockDocument,
        content: 'This document has no relevant content.',
      };
      
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [noMatchDocument],
        message: 'Semantic search results',
      });

      const examples = await service.findRelevantExamples('policy');
      
      // Should find no examples since content doesn't match
      expect(examples).toHaveLength(0);
    });

    it('should extract snippets with partial word matches', async () => {
      // Mock document with partial match
      const partialMatchDocument = {
        ...mockDocument,
        content: 'This document discusses policies for AI governance.',
      };
      
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [partialMatchDocument],
        message: 'Semantic search results',
      });

      const examples = await service.findRelevantExamples('policy');
      
      // Should find example with partial match (policy/policies)
      expect(examples).toHaveLength(1);
      expect(examples[0].text).toContain('policies');
    });

    it('should handle errors during example search', async () => {
      // Mock semanticSearch to throw error
      (api.action.files.semanticSearch as any).mockRejectedValue(new Error('Search failed'));

      await expect(service.findRelevantExamples('policy')).rejects.toThrow('Failed to find relevant examples: Search failed');
    });
  });

  describe('generateCitations', () => {
    it('should generate citations for documents', async () => {
      const citations = await service.generateCitations([mockDocument as any]);
      
      expect(citations).toHaveLength(1);
      expect(citations[0].source).toEqual(mockDocument.title);
      expect(citations[0].author).toEqual(mockDocument.metadata.author);
    });

    it('should handle documents without author metadata', async () => {
      const noAuthorDocument = {
        ...mockDocument,
        metadata: {
          ...mockDocument.metadata,
          author: undefined,
        },
      };

      const citations = await service.generateCitations([noAuthorDocument as any]);
      
      expect(citations).toHaveLength(1);
      expect(citations[0].author).toEqual('Unknown');
    });

    it('should handle empty document array', async () => {
      const citations = await service.generateCitations([]);
      
      expect(citations).toHaveLength(0);
    });
  });

  describe('uploadFile', () => {
    it('should upload a file and process it', async () => {
      // Mock the necessary functions
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockUploadUrl = 'https://example.com/upload';
      const mockStorageId = 'storage123';
      const mockDocumentId = 'doc123';
      
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ storageId: mockStorageId }),
      } as any);
      
      (api.mutation.files.generateUploadUrl as any).mockResolvedValue(mockUploadUrl);
      (api.mutation.files.saveFileMetadata as any).mockResolvedValue(mockDocumentId);
      
      const result = await service.uploadFile(mockFile);
      
      expect(api.mutation.files.generateUploadUrl).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(mockUploadUrl, expect.any(Object));
      expect(api.mutation.files.saveFileMetadata).toHaveBeenCalledWith({
        userId: mockUserId,
        storageId: mockStorageId,
        title: mockFile.name,
        fileType: mockFile.type,
        fileSize: mockFile.size,
        author: undefined,
        creationDate: undefined,
        keywords: [],
      });
      expect(api.action.files.extractTextFromFile).toHaveBeenCalledWith({
        storageId: mockStorageId,
        documentId: mockDocumentId,
        fileType: mockFile.type,
      });
      expect(api.action.files.generateEmbeddings).toHaveBeenCalledWith({
        documentId: mockDocumentId,
      });
      expect(result).toEqual(mockDocumentId);
    });

    it('should handle upload errors', async () => {
      // Mock fetch to fail
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        statusText: 'Upload failed',
      } as any);
      
      (api.mutation.files.generateUploadUrl as any).mockResolvedValue('https://example.com/upload');
      
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      
      await expect(service.uploadFile(mockFile)).rejects.toThrow('Failed to upload file: Upload failed');
    });

    it('should upload file with additional metadata', async () => {
      // Mock the necessary functions
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockUploadUrl = 'https://example.com/upload';
      const mockStorageId = 'storage123';
      const mockDocumentId = 'doc123';
      const mockMetadata = {
        author: 'Test Author',
        creationDate: new Date('2025-07-16'),
        keywords: ['test', 'document'],
      };
      
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ storageId: mockStorageId }),
      } as any);
      
      (api.mutation.files.generateUploadUrl as any).mockResolvedValue(mockUploadUrl);
      (api.mutation.files.saveFileMetadata as any).mockResolvedValue(mockDocumentId);
      
      const result = await service.uploadFile(mockFile, mockMetadata);
      
      expect(api.mutation.files.saveFileMetadata).toHaveBeenCalledWith({
        userId: mockUserId,
        storageId: mockStorageId,
        title: mockFile.name,
        fileType: mockFile.type,
        fileSize: mockFile.size,
        author: mockMetadata.author,
        creationDate: mockMetadata.creationDate.toISOString(),
        keywords: mockMetadata.keywords,
      });
      expect(result).toEqual(mockDocumentId);
    });
  });

  describe('getUserDocuments', () => {
    it('should get all documents for the current user', async () => {
      // Mock the getUserDocuments function
      (api.query.documents.getUserDocuments as any).mockResolvedValue([mockDocument]);

      const documents = await service.getUserDocuments();
      
      expect(api.query.documents.getUserDocuments).toHaveBeenCalledWith({
        userId: mockUserId,
      });
      expect(documents).toEqual([mockDocument]);
    });

    it('should handle errors when getting user documents', async () => {
      // Mock getUserDocuments to throw error
      (api.query.documents.getUserDocuments as any).mockRejectedValue(new Error('Failed to get documents'));

      await expect(service.getUserDocuments()).rejects.toThrow('Failed to get user documents: Failed to get documents');
    });

    it('should handle empty document list', async () => {
      // Mock getUserDocuments to return empty array
      (api.query.documents.getUserDocuments as any).mockResolvedValue([]);

      const documents = await service.getUserDocuments();
      
      expect(documents).toEqual([]);
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      // Mock the deleteFile function
      (api.mutation.files.deleteFile as any).mockResolvedValue(true);

      const result = await service.deleteDocument('doc123');
      
      expect(api.mutation.files.deleteFile).toHaveBeenCalledWith({
        documentId: 'doc123',
      });
      expect(result).toBe(true);
    });

    it('should handle errors when deleting a document', async () => {
      // Mock deleteFile to throw error
      (api.mutation.files.deleteFile as any).mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteDocument('doc123')).rejects.toThrow('Failed to delete document: Delete failed');
    });
  });

  describe('extractMetaphors', () => {
    it('should extract metaphors from a document', async () => {
      // Mock the extractMetaphors function
      (api.mutation.documents.extractMetaphors as any).mockResolvedValue(true);

      const metaphors = [
        { text: 'AI thinks', type: 'aiAsActor', context: 'AI thinks like humans' },
      ];

      const result = await service.extractMetaphors('doc123', metaphors);
      
      expect(api.mutation.documents.extractMetaphors).toHaveBeenCalledWith({
        documentId: 'doc123',
        metaphors,
      });
      expect(result).toBe(true);
    });

    it('should handle errors when extracting metaphors', async () => {
      // Mock extractMetaphors to throw error
      (api.mutation.documents.extractMetaphors as any).mockRejectedValue(new Error('Extraction failed'));

      await expect(service.extractMetaphors('doc123', [])).rejects.toThrow('Failed to extract metaphors: Extraction failed');
    });
  });

  describe('addFramingExamples', () => {
    it('should add framing examples to a document', async () => {
      // Mock the addFramingExamples function
      (api.mutation.documents.addFramingExamples as any).mockResolvedValue(true);

      const framingExamples = [
        { text: 'Example text', frame: 'Nurturant Parent', context: 'Full context' },
      ];

      const result = await service.addFramingExamples('doc123', framingExamples);
      
      expect(api.mutation.documents.addFramingExamples).toHaveBeenCalledWith({
        documentId: 'doc123',
        framingExamples,
      });
      expect(result).toBe(true);
    });

    it('should handle errors when adding framing examples', async () => {
      // Mock addFramingExamples to throw error
      (api.mutation.documents.addFramingExamples as any).mockRejectedValue(new Error('Adding examples failed'));

      await expect(service.addFramingExamples('doc123', [])).rejects.toThrow('Failed to add framing examples: Adding examples failed');
    });
  });

  describe('Private methods', () => {
    it('should throw error when user is not authenticated', async () => {
      // Mock getUser to return null
      (api.query.auth.getUser as any).mockResolvedValue(null);

      await expect(service.searchDocuments('test')).rejects.toThrow('User not authenticated');
    });

    it('should extract snippets correctly', () => {
      // This is testing a private method indirectly through findRelevantExamples
      const content = 'This is a long document with some content about AI policy in the middle and more text at the end.';
      const mockDocWithContent = {
        ...mockDocument,
        content,
      };
      
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [mockDocWithContent],
        message: 'Semantic search results',
      });

      return service.findRelevantExamples('policy').then(examples => {
        expect(examples).toHaveLength(1);
        expect(examples[0].text).toContain('AI policy');
        // Should include context around the match
        expect(examples[0].text.length).toBeGreaterThan(10);
        // Should have ellipsis for truncated content
        expect(examples[0].text).toContain('...');
      });
    });
  });
});