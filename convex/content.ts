import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Save generated content to user's library
export const saveGeneratedContent = mutation({
  args: {
    type: v.string(), // blog, article, playbook, social
    topic: v.string(),
    region: v.string(), // USA, Europe, Australia, Morocco
    model: v.string(), // gemini-2.5-pro, etc.
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
    referenceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = new Date().toISOString();

    // Save the generated content
    const contentId = await ctx.db.insert("generatedContent", {
      userId,
      type: args.type,
      topic: args.topic,
      region: args.region,
      model: args.model,
      content: args.content,
      metadata: args.metadata,
      citations: args.citations,
      createdAt: now,
      updatedAt: now,
    });

    // Update user usage statistics
    const user = await ctx.db.get(userId);
    if (user) {
      const currentUsage = user.usage || {
        totalGenerations: 0,
        totalTokens: 0,
        lastGeneration: now,
      };

      await ctx.db.patch(userId, {
        usage: {
          totalGenerations: currentUsage.totalGenerations + 1,
          totalTokens: currentUsage.totalTokens + args.metadata.wordCount,
          lastGeneration: now,
        },
        updatedAt: now,
      });
    }

    return contentId;
  },
});

// Get user's generated content library
export const getUserContent = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit || 20;
    const offset = args.offset || 0;

    const content = await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit + offset);

    return content.slice(offset).map(item => ({
      id: item._id,
      type: item.type,
      topic: item.topic,
      region: item.region,
      model: item.model,
      content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''), // Preview
      metadata: item.metadata,
      citations: item.citations,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  },
});

// Get specific content by ID
export const getContentById = query({
  args: {
    contentId: v.id("generatedContent"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const content = await ctx.db.get(args.contentId);
    if (!content || content.userId !== userId) {
      return null;
    }

    return content;
  },
});

// Update existing content
export const updateContent = mutation({
  args: {
    contentId: v.id("generatedContent"),
    content: v.string(),
    metadata: v.optional(v.object({
      wordCount: v.number(),
      readingTime: v.number(),
      framesUsed: v.array(v.string()),
      metaphorsUsed: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingContent = await ctx.db.get(args.contentId);
    if (!existingContent || existingContent.userId !== userId) {
      throw new Error("Content not found or access denied");
    }

    const updateData: any = {
      content: args.content,
      updatedAt: new Date().toISOString(),
    };

    if (args.metadata) {
      updateData.metadata = args.metadata;
    }

    await ctx.db.patch(args.contentId, updateData);
    return args.contentId;
  },
});

// Delete content
export const deleteContent = mutation({
  args: {
    contentId: v.id("generatedContent"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const content = await ctx.db.get(args.contentId);
    if (!content || content.userId !== userId) {
      throw new Error("Content not found or access denied");
    }

    await ctx.db.delete(args.contentId);
    return true;
  },
});

// Search content
export const searchContent = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let results = await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by type if specified
    if (args.type) {
      results = results.filter(item => item.type === args.type);
    }

    // Filter by region if specified
    if (args.region) {
      results = results.filter(item => item.region === args.region);
    }

    // Simple text search in topic and content
    if (args.query.trim()) {
      const searchTerm = args.query.toLowerCase();
      results = results.filter(item => 
        item.topic.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm)
      );
    }

    return results
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(item => ({
        id: item._id,
        type: item.type,
        topic: item.topic,
        region: item.region,
        model: item.model,
        content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''),
        metadata: item.metadata,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
  },
});