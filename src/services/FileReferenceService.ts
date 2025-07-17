import { api } from "../utils/api";
import { Document, DocumentMetadata, Metaphor, FramingExample, Citation } from "../types";

/**
 * FileReferenceService handles document management, search, and content extraction
 * from both local and cloud sources.
 */
export class FileReferenceService {
  /**
   * Search for documents based on a query string
   * @param query The search query
   * @param useSemanticSearch Whether to use semantic search (embeddings) or basic full-text search
   * @returns Promise resolving to an array of matching documents
   */
  async searchDocuments(query: string, useSemanticSearch = false): Promise<Document[]> {
    try {
      if (useSemanticSearch) {
        // Use semantic search for more contextual results
        const result = await api.action.files.semanticSearch({
          userId: await this.getCurrentUserId(),
          query,
        });
        return result.results;
      } else {
        // Use basic full-text search
        return await api.query.files.fullTextSearch({
          userId: await this.getCurrentUserId(),
          searchTerm: query,
        });
      }
    } catch (error) {
      console.error("Error searching documents:", error);
      throw new Error(`Failed to search documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract content from a specific document
   * @param documentId The ID of the document to extract content from
   * @returns Promise resolving to the document content
   */
  async extractContent(documentId: string): Promise<string> {
    try {
      const document = await api.query.documents.getDocumentById({
        documentId,
      });
      
      if (!document) {
        throw new Error("Document not found");
      }
      
      return document.content;
    } catch (error) {
      console.error("Error extracting document content:", error);
      throw new Error(`Failed to extract document content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Find relevant examples from documents based on a topic
   * @param topic The topic to find examples for
   * @returns Promise resolving to an array of relevant examples
   */
  async findRelevantExamples(topic: string): Promise<{ 
    text: string; 
    source: string; 
    documentId: string;
  }[]> {
    try {
      // Search for documents related to the topic
      const documents = await this.searchDocuments(topic, true);
      
      // Extract relevant snippets from each document
      const examples = [];
      
      for (const doc of documents) {
        // Get content snippets that match the topic
        const snippet = this.extractSnippet(doc.content, topic);
        
        if (snippet) {
          examples.push({
            text: snippet,
            source: doc.title,
            documentId: doc.id,
          });
        }
      }
      
      return examples;
    } catch (error) {
      console.error("Error finding relevant examples:", error);
      throw new Error(`Failed to find relevant examples: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate citations for a list of documents
   * @param documents The documents to generate citations for
   * @returns Promise resolving to an array of citations
   */
  async generateCitations(documents: Document[]): Promise<Citation[]> {
    try {
      return documents.map(doc => ({
        source: doc.title,
        title: doc.title,
        author: doc.metadata.author || "Unknown",
        url: undefined,
        accessDate: new Date(),
      }));
    } catch (error) {
      console.error("Error generating citations:", error);
      throw new Error(`Failed to generate citations: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Upload a file to Convex storage
   * @param file The file to upload
   * @param metadata Additional metadata for the file
   * @returns Promise resolving to the document ID
   */
  async uploadFile(file: File, metadata: Partial<DocumentMetadata> = {}): Promise<string> {
    try {
      // Generate an upload URL
      const uploadUrl = await api.mutation.files.generateUploadUrl({});
      
      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error(`Failed to upload file: ${result.statusText}`);
      }
      
      const { storageId } = await result.json();
      
      // Save file metadata
      const documentId = await api.mutation.files.saveFileMetadata({
        userId: await this.getCurrentUserId(),
        storageId,
        title: file.name,
        fileType: file.type,
        fileSize: file.size,
        author: metadata.author,
        creationDate: metadata.creationDate?.toISOString(),
        keywords: metadata.keywords || [],
      });
      
      // Extract text from the file
      await api.action.files.extractTextFromFile({
        storageId,
        documentId,
        fileType: file.type,
      });
      
      // Generate embeddings for semantic search
      await api.action.files.generateEmbeddings({
        documentId,
      });
      
      return documentId;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Extract metaphors from a document
   * @param documentId The ID of the document to extract metaphors from
   * @param metaphors The metaphors to extract
   * @returns Promise resolving to a boolean indicating success
   */
  async extractMetaphors(documentId: string, metaphors: Metaphor[]): Promise<boolean> {
    try {
      await api.mutation.documents.extractMetaphors({
        documentId,
        metaphors,
      });
      
      return true;
    } catch (error) {
      console.error("Error extracting metaphors:", error);
      throw new Error(`Failed to extract metaphors: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Add framing examples to a document
   * @param documentId The ID of the document to add framing examples to
   * @param framingExamples The framing examples to add
   * @returns Promise resolving to a boolean indicating success
   */
  async addFramingExamples(documentId: string, framingExamples: FramingExample[]): Promise<boolean> {
    try {
      await api.mutation.documents.addFramingExamples({
        documentId,
        framingExamples,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding framing examples:", error);
      throw new Error(`Failed to add framing examples: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all documents for the current user
   * @returns Promise resolving to an array of documents
   */
  async getUserDocuments(): Promise<Document[]> {
    try {
      return await api.query.documents.getUserDocuments({
        userId: await this.getCurrentUserId(),
      });
    } catch (error) {
      console.error("Error getting user documents:", error);
      throw new Error(`Failed to get user documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete a document
   * @param documentId The ID of the document to delete
   * @returns Promise resolving to a boolean indicating success
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      await api.mutation.files.deleteFile({
        documentId,
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the current user ID
   * @returns Promise resolving to the current user ID
   * @private
   */
  private async getCurrentUserId(): Promise<string> {
    // In a real implementation, this would get the current user ID from auth
    // For now, we'll use a placeholder
    const user = await api.query.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user._id;
  }

  /**
   * Extract a snippet of text from content based on a topic
   * @param content The content to extract from
   * @param topic The topic to extract for
   * @returns The extracted snippet or undefined if no match
   * @private
   */
  private extractSnippet(content: string, topic: string): string | undefined {
    const lowerContent = content.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    const index = lowerContent.indexOf(lowerTopic);
    
    if (index === -1) {
      // Try to find partial matches
      const words = lowerTopic.split(/\s+/);
      for (const word of words) {
        if (word.length > 3) { // Only consider words longer than 3 characters
          const wordIndex = lowerContent.indexOf(word);
          if (wordIndex !== -1) {
            // Found a partial match
            const start = Math.max(0, wordIndex - 100);
            const end = Math.min(content.length, wordIndex + word.length + 100);
            
            let snippet = content.substring(start, end);
            
            // Add ellipsis if needed
            if (start > 0) {
              snippet = "..." + snippet;
            }
            
            if (end < content.length) {
              snippet = snippet + "...";
            }
            
            return snippet;
          }
        }
      }
      
      return undefined;
    }
    
    // Get a snippet around the topic
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + lowerTopic.length + 100);
    
    let snippet = content.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) {
      snippet = "..." + snippet;
    }
    
    if (end < content.length) {
      snippet = snippet + "...";
    }
    
    return snippet;
  }
}

export default FileReferenceService;