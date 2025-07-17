import type { GeminiModel } from '../types';
import { ApiError, ApiErrorType, retryWithBackoff } from '../utils/apiErrorHandling';

// Define model capabilities for display
export interface ModelCapability {
  name: GeminiModel;
  displayName: string;
  description: string;
  maxTokens: number;
  costPer1KTokens: string;
  strengths: string[];
  bestFor: string[];
  speed: 'Fast' | 'Medium' | 'Slow';
}

// Define API response types
export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback?: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

// Define streaming response types
export interface GeminiStreamResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason?: string;
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  }[];
}

// Define API error types
export interface GeminiError {
  error: {
    code: number;
    message: string;
    status: string;
    details?: any;
  };
}

// Define request types
export interface GeminiRequestOptions {
  model: GeminiModel;
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  stream?: boolean;
}

export interface GeminiRequestContent {
  role: 'user' | 'model';
  parts: {
    text: string;
  }[];
}

// Model capabilities data
export const MODEL_CAPABILITIES: Record<GeminiModel, ModelCapability> = {
  'gemini-2.5-pro': {
    name: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    description: 'Most capable model for complex tasks requiring advanced reasoning',
    maxTokens: 128000,
    costPer1KTokens: '$0.0035',
    strengths: [
      'Complex reasoning',
      'Nuanced content generation',
      'Long context understanding',
      'Detailed analysis'
    ],
    bestFor: [
      'In-depth policy articles',
      'Marketing playbooks',
      'Complex framing analysis'
    ],
    speed: 'Medium'
  },
  'gemini-2.5-flash': {
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Fast and efficient model for quick content generation',
    maxTokens: 32000,
    costPer1KTokens: '$0.0015',
    strengths: [
      'Rapid response',
      'Efficient processing',
      'Cost-effective',
      'Good for iterative work'
    ],
    bestFor: [
      'Short blog posts',
      'Social media content',
      'Quick drafts and outlines'
    ],
    speed: 'Fast'
  },
  'gemma-3-12b-it': {
    name: 'gemma-3-12b-it',
    displayName: 'Gemma 3 12B IT',
    description: 'Instruction-tuned model with strong reasoning capabilities',
    maxTokens: 8192,
    costPer1KTokens: '$0.0010',
    strengths: [
      'Instruction following',
      'Balanced performance',
      'Lowest cost option',
      'Good for specific tasks'
    ],
    bestFor: [
      'Targeted content generation',
      'Specific framing tasks',
      'Budget-conscious projects'
    ],
    speed: 'Medium'
  }
};

/**
 * GeminiService class for handling interactions with Google's Gemini API
 */
export class GeminiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  
  /**
   * Set the API key for Gemini API calls
   * @param apiKey - The API key to use for authentication
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Clear the stored API key
   */
  clearApiKey(): void {
    this.apiKey = null;
  }
  
  /**
   * Check if an API key is set
   */
  hasApiKey(): boolean {
    return this.apiKey !== null && this.apiKey.trim() !== '';
  }
  
  /**
   * Validate the API key by making a test request
   * @returns Promise resolving to a boolean indicating if the key is valid
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.hasApiKey()) {
      return false;
    }
    
    try {
      // Make a simple test request to validate the API key
      const response = await fetch(
        `${this.baseUrl}/models/gemini-2.5-flash?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        const errorData = await response.json() as GeminiError;
        // Log the specific error but return false rather than throwing
        console.error('API key validation failed:', errorData.error.message);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    }
  }
  
  /**
   * Get available models and their capabilities
   * @returns Array of model capabilities
   */
  getModelCapabilities(): ModelCapability[] {
    return Object.values(MODEL_CAPABILITIES);
  }
  
  /**
   * Get capabilities for a specific model
   * @param model - The model to get capabilities for
   * @returns Model capability information
   */
  getModelCapability(model: GeminiModel): ModelCapability {
    return MODEL_CAPABILITIES[model];
  }
  
  /**
   * Generate content using the Gemini API
   * @param prompt - The prompt to send to the model
   * @param options - Request options including model selection and parameters
   * @returns Promise resolving to the generated content
   */
  async generateContent(
    prompt: string,
    options: GeminiRequestOptions
  ): Promise<string> {
    if (!this.hasApiKey()) {
      throw new ApiError(
        'API key not set. Please add your Google API key in settings.',
        ApiErrorType.AUTHENTICATION
      );
    }
    
    const { model, temperature = 0.7, topK = 40, topP = 0.95, maxOutputTokens = 1024 } = options;
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature,
        topK,
        topP,
        maxOutputTokens,
        stopSequences: options.stopSequences || []
      }
    };
    
    // Use retry with backoff for retryable errors
    return retryWithBackoff(async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json() as GeminiError;
          throw ApiError.fromGeminiError(errorData);
        }
        
        const data = await response.json() as GeminiResponse;
        
        // Check for safety ratings that might have blocked content
        if (data.promptFeedback?.safetyRatings?.some(rating => 
          rating.probability === 'HIGH' || rating.probability === 'MEDIUM_HIGH'
        )) {
          console.warn('Content may have been filtered due to safety concerns');
        }
        
        // Extract the generated text from the response
        if (data.candidates && data.candidates.length > 0) {
          const candidate = data.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            return candidate.content.parts[0].text;
          }
        }
        
        throw new ApiError(
          'No content generated. The model returned an empty response.',
          ApiErrorType.UNKNOWN
        );
      } catch (error) {
        // Convert to ApiError if it's not already
        const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
        console.error('Content generation error:', apiError);
        throw apiError;
      }
    }, 3, 1000); // 3 retries with 1s initial delay
  }
  
  /**
   * Generate content with streaming response
   * @param prompt - The prompt to send to the model
   * @param options - Request options including model selection and parameters
   * @returns ReadableStream for processing streaming responses
   */
  async generateContentStream(
    prompt: string,
    options: GeminiRequestOptions
  ): Promise<ReadableStream<Uint8Array>> {
    if (!this.hasApiKey()) {
      throw new ApiError(
        'API key not set. Please add your Google API key in settings.',
        ApiErrorType.AUTHENTICATION
      );
    }
    
    const { model, temperature = 0.7, topK = 40, topP = 0.95, maxOutputTokens = 1024 } = options;
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature,
        topK,
        topP,
        maxOutputTokens,
        stopSequences: options.stopSequences || []
      }
    };
    
    // Use retry with backoff for streaming
    return retryWithBackoff(async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json() as GeminiError;
          throw ApiError.fromGeminiError(errorData);
        }
        
        return response.body!;
      } catch (error) {
        // Convert to ApiError if it's not already
        const apiError = error instanceof ApiError ? error : ApiError.fromError(error);
        console.error('Content streaming error:', apiError);
        throw apiError;
      }
    }, 2, 500); // 2 retries with 500ms initial delay for streaming (faster response needed)
  }
  
  /**
   * Process a streaming response into a more usable format
   * @param stream - The ReadableStream from generateContentStream
   * @returns AsyncGenerator yielding content chunks
   */
  async *processStream(
    stream: ReadableStream<Uint8Array>
  ): AsyncGenerator<string, void, unknown> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete JSON objects from the buffer
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line) as GeminiStreamResponse;
            if (
              data.candidates &&
              data.candidates.length > 0 &&
              data.candidates[0].content &&
              data.candidates[0].content.parts &&
              data.candidates[0].content.parts.length > 0
            ) {
              yield data.candidates[0].content.parts[0].text;
            }
          } catch (e) {
            console.error('Error parsing stream chunk:', e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
  
  /**
   * Create optimized prompts based on the selected model
   * @param basePrompt - The original prompt
   * @param model - The model to optimize for
   * @returns Optimized prompt for the specific model
   */
  createOptimizedPrompt(basePrompt: string, model: GeminiModel): string {
    // Base instructions for all models
    const baseInstructions = `
You are an AI assistant specializing in creating strategically framed AI policy content using George Lakoff's cognitive framing principles.
Your task is to generate content that uses positive, value-based language and avoids reinforcing opposition frames.

${basePrompt}
    `.trim();
    
    // Model-specific optimizations
    switch (model) {
      case 'gemini-2.5-pro':
        return `${baseInstructions}
        
Additional instructions for Gemini 2.5 Pro:
- Leverage your advanced reasoning capabilities for nuanced framing analysis
- Provide comprehensive content with detailed examples and metaphors
- Incorporate complex policy considerations and multiple perspectives
- Use your long context understanding to maintain coherence throughout`;
        
      case 'gemini-2.5-flash':
        return `${baseInstructions}
        
Additional instructions for Gemini 2.5 Flash:
- Focus on clarity and conciseness
- Prioritize the most important framing elements
- Keep examples brief but impactful
- Optimize for quick, actionable content`;
        
      case 'gemma-3-12b-it':
        return `${baseInstructions}
        
Additional instructions for Gemma 3:
- Follow these instructions precisely
- Focus on the specific framing task requested
- Provide targeted examples that directly support the main points
- Maintain consistent quality throughout the response`;
        
      default:
        return baseInstructions;
    }
  }
}

// Export singleton instance
export const geminiService = new GeminiService();