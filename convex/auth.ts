import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
  createUser: async (ctx, user) => {
    const now = new Date().toISOString();
    
    // Create user directly with all required fields
    const userId = await ctx.db.insert("users", {
      name: user.name || "User",
      email: user.email || "",
      isAnonymous: user.provider === "anonymous",
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

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});