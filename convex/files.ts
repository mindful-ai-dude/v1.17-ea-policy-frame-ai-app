import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api } from "./_generated/api";

// Generate a URL for uploading a file
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Store file metadata after upload
export const saveFileMetadata = mutation({
  args: {
    userId: v.id("users"),
    storageId: v.string(),
    title: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    author: v.optional(v.string()),
    creationDate: v.optional(v.string()),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify the file exists in storage
    try {
      await ctx.storage.getUrl(args.storageId);
    } catch (error) {
      throw new ConvexError("File not found in storage");
    }
    
    const now = new Date().toISOString();
    
    // Create document record with file metadata
    const documentId = await ctx.db.insert("documents", {
      userId: args.userId,
      title: args.title,
      content: "", // Will be populated after processing
      metadata: {
        fileType: args.fileType,
        fileSize: args.fileSize,
        author: args.author,
        creationDate: args.creationDate,
        keywords: args.keywords,
      },
      storageId: args.storageId,
      extractedMetaphors: [],
      framingExamples: [],
      createdAt: now,
      updatedAt: now,
    });
    
    return documentId;
  },
});

// Get URL for accessing a file
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      return await ctx.storage.getUrl(args.storageId);
    } catch (error) {
      throw new ConvexError("File not found in storage");
    }
  },
});

// Delete a file from storage
export const deleteFile = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new ConvexError("Document not found");
    }
    
    // Delete the file from storage
    try {
      await ctx.storage.delete(document.storageId);
    } catch (error) {
      // Log the error but continue with document deletion
      console.error("Error deleting file from storage:", error);
    }
    
    // Delete the document record
    await ctx.db.delete(args.documentId);
    
    return true;
  },
});

// Process file content (extract text, analyze, etc.)
export const processFileContent = mutation({
  args: {
    documentId: v.id("documents"),
    extractedContent: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      content: args.extractedContent,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  },
});

// Extract text from uploaded file (PDF, DOCX, etc.)
export const extractTextFromFile = action({
  args: {
    storageId: v.string(),
    documentId: v.id("documents"),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the file URL
    const fileUrl = await ctx.runQuery(api.files.getFileUrl, { 
      storageId: args.storageId 
    });
    
    if (!fileUrl) {
      throw new ConvexError("Could not get file URL");
    }
    
    // Fetch the file content
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new ConvexError(`Failed to fetch file: ${response.statusText}`);
    }
    
    let extractedText = "";
    
    // Extract text based on file type
    if (args.fileType.includes("pdf")) {
      // For PDF files, we would use a PDF parsing library
      // This is a simplified example - in a real app, you'd use a proper PDF parser
      const buffer = await response.arrayBuffer();
      // Simulating PDF text extraction
      extractedText = "Extracted PDF text would go here";
      
      // In a real implementation, you would use a library like pdf.js or pdfjs-dist
      // const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      // extractedText = await extractTextFromPdf(pdf);
    } 
    else if (args.fileType.includes("docx") || args.fileType.includes("doc")) {
      // For Word documents
      const buffer = await response.arrayBuffer();
      // Simulating DOCX text extraction
      extractedText = "Extracted DOCX text would go here";
      
      // In a real implementation, you would use a library like mammoth.js
      // const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      // extractedText = result.value;
    }
    else if (args.fileType.includes("text") || args.fileType.includes("txt")) {
      // For plain text files
      extractedText = await response.text();
    }
    else {
      // For other file types, we might need specialized parsers
      extractedText = `File type ${args.fileType} is not supported for text extraction`;
    }
    
    // Update the document with the extracted text
    await ctx.runMutation(api.files.processFileContent, {
      documentId: args.documentId,
      extractedContent: extractedText,
    });
    
    return { success: true, textLength: extractedText.length };
  },
});

// Generate embeddings for semantic search
export const generateEmbeddings = action({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    // Get the document content
    const document = await ctx.runQuery(api.documents.getDocumentById, { 
      documentId: args.documentId 
    });
    
    if (!document || !document.content) {
      throw new ConvexError("Document not found or has no content");
    }
    
    // In a real implementation, you would call an embedding API like OpenAI or Gemini
    // This is a simplified example
    
    // Simulate calling an embedding API
    // const embeddings = await generateEmbeddingsFromAPI(document.content);
    
    // For now, we'll just update the document with a placeholder
    // In a real implementation, you would store the embeddings in a vector database
    // or in a special field in the document
    
    // Update the document with a note in the content indicating embeddings were generated
    // Since we can't modify the metadata schema, we'll store this information elsewhere
    await ctx.runMutation(api.documents.updateDocument, {
      documentId: args.documentId,
      // We'll just update the document content to indicate embeddings were generated
      content: document.content + "\n\n[Embeddings generated at " + new Date().toISOString() + "]"
    });
    
    return { success: true };
  },
});

// Full-text search across documents
export const fullTextSearch = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all documents for the user
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Perform full-text search
    // In a production app, you would use a proper full-text search engine
    // This is a simplified implementation
    const searchTermLower = args.searchTerm.toLowerCase();
    
    const results = documents.filter(doc => {
      // Search in title
      if (doc.title.toLowerCase().includes(searchTermLower)) {
        return true;
      }
      
      // Search in content
      if (doc.content.toLowerCase().includes(searchTermLower)) {
        return true;
      }
      
      // Search in keywords
      if (doc.metadata.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTermLower)
      )) {
        return true;
      }
      
      // Search in extracted metaphors
      if (doc.extractedMetaphors.some(metaphor => 
        metaphor.text.toLowerCase().includes(searchTermLower) ||
        metaphor.context.toLowerCase().includes(searchTermLower)
      )) {
        return true;
      }
      
      // Search in framing examples
      if (doc.framingExamples.some(example => 
        example.text.toLowerCase().includes(searchTermLower) ||
        example.frame.toLowerCase().includes(searchTermLower)
      )) {
        return true;
      }
      
      return false;
    });
    
    return results.map(doc => ({
      id: doc._id,
      title: doc.title,
      snippet: getContentSnippet(doc.content, searchTermLower),
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    }));
  },
});

// Helper function to get a snippet of content around the search term
function getContentSnippet(content: string, searchTerm: string): string {
  const lowerContent = content.toLowerCase();
  const index = lowerContent.indexOf(searchTerm);
  
  if (index === -1) {
    // If the term is not found in the content, return the beginning
    return content.substring(0, 150) + "...";
  }
  
  // Get a snippet around the search term
  const start = Math.max(0, index - 75);
  const end = Math.min(content.length, index + searchTerm.length + 75);
  
  let snippet = content.substring(start, end);
  
  // Add ellipsis if we're not at the beginning or end
  if (start > 0) {
    snippet = "..." + snippet;
  }
  
  if (end < content.length) {
    snippet = snippet + "...";
  }
  
  return snippet;
}

// Semantic search using embeddings (simulated)
export const semanticSearch = action({
  args: {
    userId: v.id("users"),
    query: v.string(),
  },
  handler: async (ctx, args): Promise<{ results: any[]; message: string }> => {
    // In a real implementation, you would:
    // 1. Generate embeddings for the query
    // 2. Compare with stored document embeddings
    // 3. Return the most similar documents
    
    // For now, we'll simulate this with a basic search
    const documents = await ctx.runQuery(api.files.fullTextSearch, {
      userId: args.userId,
      searchTerm: args.query,
    });
    
    // In a real implementation, you would rank by similarity score
    return {
      results: documents,
      message: "Semantic search results (simulated)",
    };
  },
});