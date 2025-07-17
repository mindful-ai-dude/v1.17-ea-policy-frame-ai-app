import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

// Get connection status
export const getConnectionStatus = query({
  args: {},
  handler: async (ctx) => {
    try {
      // Simple ping to check if we can connect to the database
      await ctx.db.query("users").take(1);
      return "connected";
    } catch (error) {
      return "error";
    }
  },
});

// Get the currently authenticated user
export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find the user by their auth provider issued subject identifier
    const email = identity.email || '';
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return null;
    }

    return {
      ...user,
      _id: user._id.toString(),
    };
  },
});

// Create or update a user based on their authentication
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Check if user already exists
    const email = identity.email || '';
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    const now = new Date().toISOString();

    if (user) {
      // Update existing user's information
      await ctx.db.patch(user._id, {
        name: identity.name || user.name,
        updatedAt: now,
      });
      return user._id;
    }

    // Create a new user
    const userId = await ctx.db.insert("users", {
      name: identity.name || "User",
      email: email,
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

    return userId;
  },
});

// Encrypt and store API key
export const encryptAndStoreApiKey = mutation({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the user
    const email = identity.email || '';
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // In a real implementation, you would encrypt the API key here
    // For this example, we'll use a simple base64 encoding as a placeholder
    // In production, use proper encryption methods
    const encryptedKey = Buffer.from(args.apiKey).toString('base64');

    await ctx.db.patch(user._id, {
      apiKeys: {
        gemini: encryptedKey,
      },
      updatedAt: new Date().toISOString(),
    });

    return true;
  },
});

// Get the encrypted API key
export const getApiKey = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find the user
    const email = identity.email || '';
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user || !user.apiKeys || !user.apiKeys.gemini) {
      return null;
    }

    // In a real implementation, you would decrypt the API key here
    // For this example, we'll use a simple base64 decoding as a placeholder
    // In production, use proper decryption methods
    const decryptedKey = Buffer.from(user.apiKeys.gemini, 'base64').toString();

    // Return only the first and last 4 characters for display purposes
    const maskedKey = decryptedKey.length > 8 
      ? `${decryptedKey.substring(0, 4)}...${decryptedKey.substring(decryptedKey.length - 4)}`
      : "****";

    return {
      maskedKey,
      hasKey: true,
    };
  },
});

// Delete the stored API key
export const deleteApiKey = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the user
    const email = identity.email || '';
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      apiKeys: {},
      updatedAt: new Date().toISOString(),
    });

    return true;
  },
});

// Update user session
export const updateSession = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    // Find the user
    const email = identity.email || '';
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Update last activity timestamp
    await ctx.db.patch(user._id, {
      updatedAt: new Date().toISOString(),
    });

    return true;
  },
});