import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    // In a real app, you would check if the user is an admin
    return await ctx.db.query("users").collect();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user preferences
export const updateUserPreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      defaultModel: v.optional(v.string()),
      defaultRegion: v.optional(v.string()),
      defaultContentType: v.optional(v.string()),
      theme: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Update only the provided preferences
    const updatedPreferences = {
      ...user.preferences,
      ...args.preferences,
    };
    
    await ctx.db.patch(args.userId, {
      preferences: updatedPreferences,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  },
});

// Update user usage metrics
export const updateUserUsage = mutation({
  args: {
    userId: v.id("users"),
    usage: v.object({
      totalGenerations: v.optional(v.number()),
      totalTokens: v.optional(v.number()),
      lastGeneration: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }
    
    // Update only the provided usage metrics
    const updatedUsage = {
      ...user.usage,
      ...args.usage,
    };
    
    await ctx.db.patch(args.userId, {
      usage: updatedUsage,
      updatedAt: new Date().toISOString(),
    });
    
    return true;
  },
});

// Delete user (for account deletion)
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // In a real app, you would also delete all user data
    // like generated content, documents, etc.
    await ctx.db.delete(args.userId);
    return true;
  },
});