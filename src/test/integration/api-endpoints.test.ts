import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../utils/api';
import { ContentGenerationEngine } from '../../services/ContentGenerationEngine';
import { FileReferenceService } from '../../services/FileReferenceService';
import { lakoffFramingEngine } from '../../services/LakoffFramingEngine';
import { geminiService } from '../../services/GeminiService';

// Import the integration test setup
import '../integration-setup';

describe('API Integration Tests', () => {
  // Test the integration between ContentGenerationEngine and GeminiService
  describe('Content Generation API Integration', () => {
    let engine: ContentGenerationEngine;
    
    beforeEach(() => {
      engine = new ContentGenerationEngine();
      
      // Mock GeminiService generateContent
      vi.spyOn(geminiService, 'generateContent').mockResolvedValue(
        'Generated content for integration test'
      );
      
      // Mock GeminiService createOptimizedPrompt
      vi.spyOn(geminiService, 'createOptimizedPrompt').mockReturnValue(
        'Optimized prompt for integration test'
      );
    });
    
    it('should generate content through the API', async () => {
      const request = {
        input: {
          topic: 'AI Policy Integration',
          region: 'usa',
          contentType: 'blog'
        },
        model: 'gemini-2.5-pro'
      };
      
      const result = await engine.generateContent(request);
      
      // Verify the API integration
      expect(geminiService.createOptimizedPrompt).toHaveBeenCalled();
      expect(geminiService.generateContent).toHaveBeenCalled();
      expect(result.content).toBe('Generated content for integration test');
      expect(result.metadata.topic).toBe('AI Policy Integration');
    });
    
    it('should apply framing through the API', async () => {
      // Mock LakoffFramingEngine methods
      vi.spyOn(lakoffFramingEngine, 'analyzeFraming').mockReturnValue({
        detectedFrames: [{ name: 'Progress', values: ['innovation'] }],
        suggestedFrames: [],
        metaphors: [],
        effectiveness: 75
      });
      
      vi.spyOn(lakoffFramingEngine, 'avoidNegativeFrames').mockReturnValue(
        'Content with negative frames avoided'
      );
      
      const request = {
        input: {
          topic: 'AI Policy Integration',
          region: 'usa',
          contentType: 'blog'
        },
        model: 'gemini-2.5-pro'
      };
      
      const framingOptions = {
        applyFraming: true,
        avoidNegativeFrames: true,
        reinforcePositiveFrames: false
      };
      
      const result = await engine.generateContent(request, framingOptions);
      
      // Verify the framing integration
      expect(lakoffFramingEngine.analyzeFraming).toHaveBeenCalled();
      expect(lakoffFramingEngine.avoidNegativeFrames).toHaveBeenCalled();
      expect(result.metadata.framingAnalysis).toBeDefined();
    });
  });
  
  // Test the integration between FileReferenceService and Convex API
  describe('File Reference API Integration', () => {
    let fileService: FileReferenceService;
    
    beforeEach(() => {
      fileService = new FileReferenceService();
      
      // Mock Convex API responses
      (api.query.files.fullTextSearch as any).mockResolvedValue([
        {
          id: 'doc1',
          title: 'Test Document',
          content: 'This is a test document for integration testing.',
          metadata: {
            author: 'Test Author',
            fileType: 'text/plain'
          }
        }
      ]);
      
      (api.action.files.semanticSearch as any).mockResolvedValue({
        results: [
          {
            id: 'doc2',
            title: 'Semantic Test Document',
            content: 'This is a semantic search test document.',
            metadata: {
              author: 'Semantic Author',
              fileType: 'text/plain'
            }
          }
        ],
        message: 'Semantic search results'
      });
    });
    
    it('should search documents through the API', async () => {
      const results = await fileService.searchDocuments('integration test');
      
      // Verify the API integration
      expect(api.query.files.fullTextSearch).toHaveBeenCalledWith({
        userId: 'test-user-id',
        searchTerm: 'integration test'
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Document');
    });
    
    it('should perform semantic search through the API', async () => {
      const results = await fileService.searchDocuments('semantic test', true);
      
      // Verify the API integration
      expect(api.action.files.semanticSearch).toHaveBeenCalledWith({
        userId: 'test-user-id',
        query: 'semantic test'
      });
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Semantic Test Document');
    });
    
    it('should upload files through the API', async () => {
      // Mock the necessary functions
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockUploadUrl = 'https://example.com/upload';
      const mockStorageId = 'storage123';
      const mockDocumentId = 'doc123';
      
      // Mock fetch
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ storageId: mockStorageId }),
      });
      
      (api.mutation.files.generateUploadUrl as any).mockResolvedValue(mockUploadUrl);
      (api.mutation.files.saveFileMetadata as any).mockResolvedValue(mockDocumentId);
      
      const result = await fileService.uploadFile(mockFile);
      
      // Verify the API integration
      expect(api.mutation.files.generateUploadUrl).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(mockUploadUrl, expect.any(Object));
      expect(api.mutation.files.saveFileMetadata).toHaveBeenCalled();
      expect(api.action.files.extractTextFromFile).toHaveBeenCalled();
      expect(api.action.files.generateEmbeddings).toHaveBeenCalled();
      expect(result).toBe(mockDocumentId);
    });
  });
});