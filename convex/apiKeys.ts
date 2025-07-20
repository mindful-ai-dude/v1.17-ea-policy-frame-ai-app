import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

// Store encrypted API key for user
export const storeApiKey = mutation({
  args: {
    provider: v.string(), // "google" for Gemini API
    encryptedKey: v.string(),
    keyPreview: v.string(), // First 8 chars + "..." for display
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if user already has an API key for this provider
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();

    if (existing) {
      // Update existing key
      await ctx.db.patch(existing._id, {
        encryptedKey: args.encryptedKey,
        keyPreview: args.keyPreview,
        updatedAt: new Date().toISOString(),
      });
      return existing._id;
    } else {
      // Create new key
      return await ctx.db.insert("apiKeys", {
        userId,
        provider: args.provider,
        encryptedKey: args.encryptedKey,
        keyPreview: args.keyPreview,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  },
});

// Get user's API key for a provider
export const getApiKey = query({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();

    if (!apiKey) {
      return null;
    }

    return {
      id: apiKey._id,
      provider: apiKey.provider,
      keyPreview: apiKey.keyPreview,
      hasKey: true,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  },
});

// Get decrypted API key for use (server-side only)
export const getDecryptedApiKey = query({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();

    if (!apiKey) {
      return null;
    }

    // In a real implementation, you would decrypt the key here
    // For now, we'll assume it's stored in a way that can be used directly
    return apiKey.encryptedKey;
  },
});

// Delete API key
export const deleteApiKey = mutation({
  args: {
    provider: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .first();

    if (apiKey) {
      await ctx.db.delete(apiKey._id);
      return true;
    }
    
    return false;
  },
});

// List all API keys for user (without decrypted values)
export const listApiKeys = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return apiKeys.map(key => ({
      id: key._id,
      provider: key.provider,
      keyPreview: key.keyPreview,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));
  },
});