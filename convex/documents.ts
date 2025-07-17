import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all documents for a user
export const getUserDocuments = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get document by ID
export const getDocumentById = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

// Create new document
export const createDocument = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    metadata: v.object({
      fileType: v.string(),
      fileSize: v.number(),
      author: v.optional(v.string()),
      creationDate: v.optional(v.string()),
      keywords: v.array(v.string()),
    }),
    storageId: v.string(),
    extractedMetaphors: v.array(v.object({
      text: v.string(),
      type: v.string(),
      context: v.string(),
    })),
    framingExamples: v.array(v.object({
      text: v.string(),
      frame: v.string(),
      effectiveness: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Create new document
    const documentId = await ctx.db.insert("documents", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    
    return documentId;
  },
});

// Update existing document
export const updateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    metadata: v.optional(v.object({
      fileType: v.string(),
      fileSize: v.number(),
      author: v.optional(v.string()),
      creationDate: v.optional(v.string()),
      keywords: v.array(v.string()),
    })),
    extractedMetaphors: v.optional(v.array(v.object({
      text: v.string(),
      type: v.string(),
      context: v.string(),
    }))),
    framingExamples: v.optional(v.array(v.object({
      text: v.string(),
      frame: v.string(),
      effectiveness: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    const { documentId, ...updates } = args;
    
    // Only include fields that were provided
    const fieldsToUpdate: Record<string, any> = {};
    if (updates.title !== undefined) fieldsToUpdate.title = updates.title;
    if (updates.content !== undefined) fieldsToUpdate.content = updates.content;
    if (updates.metadata !== undefined) fieldsToUpdate.metadata = updates.metadata;
    if (updates.extractedMetaphors !== undefined) fieldsToUpdate.extractedMetaphors = updates.extractedMetaphors;
    if (updates.framingExamples !== undefined) fieldsToUpdate.framingExamples = updates.framingExamples;
    
    fieldsToUpdate.updatedAt = new Date().toISOString();
    
    await ctx.db.patch(documentId, fieldsToUpdate);
    return true;
  },
});

// Delete document
export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    // Note: In a real implementation, you would also delete the file from storage
    await ctx.db.delete(args.documentId);
    return true;
  },
});

// Search documents by title or content
export const searchDocuments = query({
  args: { 
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    // This is a simple implementation. In a real app, you might want to use
    // a more sophisticated search mechanism or a third-party search service.
    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const searchTermLower = args.searchTerm.toLowerCase();
    
    return allDocuments.filter(document => 
      document.title.toLowerCase().includes(searchTermLower) || 
      document.content.toLowerCase().includes(searchTermLower)
    );
  },
});

// Get documents by keyword
export const getDocumentsByKeyword = query({
  args: { 
    userId: v.id("users"),
    keyword: v.string(),
  },
  handler: async (ctx, args) => {
    const allDocuments = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const keywordLower = args.keyword.toLowerCase();
    
    return allDocuments.filter(document => 
      document.metadata.keywords.some(k => k.toLowerCase().includes(keywordLower))
    );
  },
});

// Extract metaphors from document content
export const extractMetaphors = mutation({
  args: {
    documentId: v.id("documents"),
    metaphors: v.array(v.object({
      text: v.string(),
      type: v.string(),
      context: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      extractedMetaphors: args.metaphors,
      updatedAt: new Date().toISOString(),
    });
    return true;
  },
});

// Add framing examples to document
export const addFramingExamples = mutation({
  args: {
    documentId: v.id("documents"),
    framingExamples: v.array(v.object({
      text: v.string(),
      frame: v.string(),
      effectiveness: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    
    const updatedExamples = [
      ...document.framingExamples,
      ...args.framingExamples,
    ];
    
    await ctx.db.patch(args.documentId, {
      framingExamples: updatedExamples,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  },
});