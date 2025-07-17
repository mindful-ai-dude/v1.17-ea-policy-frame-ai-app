import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get all content for a user
export const getUserContent = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get content by ID
export const getContentById = query({
  args: { contentId: v.id("generatedContent") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contentId);
  },
});

// Create new content
export const createContent = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    topic: v.string(),
    region: v.string(),
    model: v.string(),
    content: v.string(),
    metadata: v.object({
      wordCount: v.number(),
      readingTime: v.number(),
      framesUsed: v.array(v.string()),
      metaphorsUsed: v.array(v.string()),
    }),
    citations: v.array(v.object({
      source: v.string(),
      title: v.string(),
      author: v.optional(v.string()),
      url: v.optional(v.string()),
      accessDate: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    // Create new content
    const contentId = await ctx.db.insert("generatedContent", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    
    // Update user usage metrics
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        usage: {
          totalGenerations: user.usage.totalGenerations + 1,
          totalTokens: user.usage.totalTokens + Math.floor(args.content.length / 4), // Rough estimate
          lastGeneration: now,
        },
        updatedAt: now,
      });
    }
    
    return contentId;
  },
});

// Update existing content
export const updateContent = mutation({
  args: {
    contentId: v.id("generatedContent"),
    content: v.optional(v.string()),
    metadata: v.optional(v.object({
      wordCount: v.number(),
      readingTime: v.number(),
      framesUsed: v.array(v.string()),
      metaphorsUsed: v.array(v.string()),
    })),
    citations: v.optional(v.array(v.object({
      source: v.string(),
      title: v.string(),
      author: v.optional(v.string()),
      url: v.optional(v.string()),
      accessDate: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    const { contentId, ...updates } = args;
    
    // Only include fields that were provided
    const fieldsToUpdate: Record<string, any> = {};
    if (updates.content !== undefined) fieldsToUpdate.content = updates.content;
    if (updates.metadata !== undefined) fieldsToUpdate.metadata = updates.metadata;
    if (updates.citations !== undefined) fieldsToUpdate.citations = updates.citations;
    
    fieldsToUpdate.updatedAt = new Date().toISOString();
    
    await ctx.db.patch(contentId, fieldsToUpdate);
    return true;
  },
});

// Delete content
export const deleteContent = mutation({
  args: {
    contentId: v.id("generatedContent"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contentId);
    return true;
  },
});

// Search content by topic
export const searchContent = query({
  args: { 
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    // This is a simple implementation. In a real app, you might want to use
    // a more sophisticated search mechanism or a third-party search service.
    const allContent = await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const searchTermLower = args.searchTerm.toLowerCase();
    
    return allContent.filter(content => 
      content.topic.toLowerCase().includes(searchTermLower) || 
      content.content.toLowerCase().includes(searchTermLower)
    );
  },
});

// Get content by type
export const getContentByType = query({
  args: { 
    userId: v.id("users"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();
  },
});