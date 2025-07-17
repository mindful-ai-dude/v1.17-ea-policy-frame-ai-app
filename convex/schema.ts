import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    name: v.string(),
    email: v.string(),
    preferences: v.object({
      defaultModel: v.string(),
      defaultRegion: v.string(),
      defaultContentType: v.string(),
      theme: v.string(),
    }),
    apiKeys: v.optional(v.object({
      gemini: v.optional(v.string()),
    })),
    usage: v.object({
      totalGenerations: v.number(),
      totalTokens: v.number(),
      lastGeneration: v.string(), // ISO date string
    }),
    createdAt: v.string(), // ISO date string
    updatedAt: v.string(), // ISO date string
  }).index("by_email", ["email"]),

  // Generated content table
  generatedContent: defineTable({
    userId: v.id("users"),
    type: v.string(), // blog, article, playbook, social
    topic: v.string(),
    region: v.string(), // usa, europe, australia, morocco
    model: v.string(), // gemini-2.5-pro, gemini-2.5-flash, gemma-3-12b-it
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
      accessDate: v.string(), // ISO date string
    })),
    createdAt: v.string(), // ISO date string
    updatedAt: v.string(), // ISO date string
  }).index("by_user", ["userId"]),

  // Documents table
  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    metadata: v.object({
      fileType: v.string(),
      fileSize: v.number(),
      author: v.optional(v.string()),
      creationDate: v.optional(v.string()), // ISO date string
      keywords: v.array(v.string()),
    }),
    storageId: v.string(), // Convex file storage ID
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
    createdAt: v.string(), // ISO date string
    updatedAt: v.string(), // ISO date string
  }).index("by_user", ["userId"]),
});