import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Create or update a user with default values
export const createOrUpdateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, email, name, isAnonymous } = args;
    
    // Check if user already exists
    const existingUser = await ctx.db.get(userId);
    
    const now = new Date().toISOString();
    
    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(userId, {
        name: name || existingUser.name,
        email: email || existingUser.email,
        isAnonymous: isAnonymous !== undefined ? isAnonymous : existingUser.isAnonymous,
        updatedAt: now,
      });
    }
    
    // Create new user with default values
    const result = await ctx.db.patch(userId, {
      name: name || "User",
      email: email || "",
      isAnonymous: isAnonymous || false,
      preferences: {
        defaultModel: "gemini-2.5-pro",
        defaultRegion: "usa",
        defaultContentType: "blog",
        theme: "system",
      },
      usage: {
        totalGenerations: 0,
        totalTokens: 0,
        lastGeneration: now,
      },
      createdAt: now,
      updatedAt: now,
    });

    // Send welcome email for new non-anonymous users
    if (email && !isAnonymous) {
      ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
        userEmail: email,
        userName: name || "PolicyFrame User",
      });
    }

    return result;
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    preferences: v.optional(v.object({
      defaultModel: v.string(),
      defaultRegion: v.string(),
      defaultContentType: v.string(),
      theme: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (args.name !== undefined) {
      updateData.name = args.name;
    }

    if (args.email !== undefined) {
      updateData.email = args.email;
    }

    if (args.preferences) {
      updateData.preferences = args.preferences;
    }

    await ctx.db.patch(userId, updateData);
    return userId;
  },
});

// Get user profile
export const getUserProfile = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});