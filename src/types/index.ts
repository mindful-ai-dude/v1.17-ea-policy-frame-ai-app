// Region types
export type Region = 'usa' | 'europe' | 'australia' | 'morocco';

// Content types
export type ContentType = 'blog' | 'article' | 'playbook' | 'social';

// AI Model types
export type GeminiModel = 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemma-3-12b-it';

// User related types
export interface UserPreferences {
  defaultModel: GeminiModel;
  defaultRegion: Region;
  defaultContentType: ContentType;
  theme: 'light' | 'dark' | 'system';
}

export interface EncryptedApiKeys {
  gemini?: string; // Encrypted API key
}

export interface UsageMetrics {
  totalGenerations: number;
  totalTokens: number;
  lastGeneration: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  apiKeys: EncryptedApiKeys;
  usage: UsageMetrics;
  createdAt: Date;
  updatedAt: Date;
}

// Content related types
export interface ContentMetadata {
  wordCount: number;
  readingTime: number;
  framesUsed: string[];
  metaphorsUsed: string[];
}

export interface Citation {
  source: string;
  title: string;
  author?: string;
  url?: string;
  accessDate: Date;
}

export interface GeneratedContent {
  id: string;
  userId: string;
  type: ContentType;
  topic: string;
  region: Region;
  model: GeminiModel;
  content: string;
  metadata: ContentMetadata;
  citations: Citation[];
  createdAt: Date;
  updatedAt: Date;
}

// Document related types
export interface DocumentMetadata {
  fileType: string;
  fileSize: number;
  author?: string;
  creationDate?: Date;
  keywords: string[];
}

export interface Metaphor {
  text: string;
  type: string;
  context: string;
}

export interface FramingExample {
  text: string;
  frame: string;
  effectiveness: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  metadata: DocumentMetadata;
  storageId: string;
  extractedMetaphors: Metaphor[];
  framingExamples: FramingExample[];
  createdAt: Date;
}

// Framing related types
export interface Frame {
  name: string;
  values: string[];
  metaphors: string[];
  keywords: string[];
}

export interface FramingAnalysis {
  detectedFrames: Frame[];
  suggestedFrames: Frame[];
  metaphors: Metaphor[];
  effectiveness: number;
}

// Geographic context types
export interface PolicyFramework {
  name: string;
  description: string;
  keyPrinciples: string[];
  relevantLegislation: string[];
}

export interface PolicyUpdate {
  title: string;
  description: string;
  date: Date;
  source: string;
  url?: string;
}

export interface RegionalContext {
  region: Region;
  policyFramework: PolicyFramework;
  culturalNotes: string[];
  recentDevelopments: PolicyUpdate[];
}