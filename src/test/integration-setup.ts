// Integration test setup
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { api } from '../utils/api';
import { geminiService } from '../services/GeminiService';

// Mock the API for integration tests
vi.mock('../utils/api', () => ({
  api: {
    query: {
      files: {
        fullTextSearch: vi.fn(),
      },
      documents: {
        getDocumentById: vi.fn(),
        getUserDocuments: vi.fn(),
      },
      auth: {
        getUser: vi.fn(),
      },
    },
    mutation: {
      files: {
        generateUploadUrl: vi.fn(),
        saveFileMetadata: vi.fn(),
        deleteFile: vi.fn(),
      },
      documents: {
        extractMetaphors: vi.fn(),
        addFramingExamples: vi.fn(),
      },
    },
    action: {
      files: {
        semanticSearch: vi.fn(),
        extractTextFromFile: vi.fn(),
        generateEmbeddings: vi.fn(),
      },
    },
  },
}));

// Mock localStorage for browser environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

// Mock fetch for API calls
global.fetch = vi.fn();

// Setup and teardown for integration tests
beforeAll(() => {
  // Set up global mocks
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  
  // Mock API key check to return true by default
  vi.spyOn(geminiService, 'hasApiKey').mockReturnValue(true);
  
  // Mock user authentication
  (api.query.auth.getUser as any).mockResolvedValue({ _id: 'test-user-id' });
});

beforeEach(() => {
  // Clear localStorage before each test
  localStorageMock.clear();
});

afterEach(() => {
  // Reset all mocks after each test
  vi.resetAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  vi.restoreAllMocks();
});