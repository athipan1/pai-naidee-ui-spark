// Mock embeddings client for Phase 2 scaffolding
// In future phases, this will be replaced with real embedding providers

import type { EmbeddingVector, EmbeddingClientConfig } from './types';

export interface EmbeddingClient {
  generateEmbedding(text: string): Promise<EmbeddingVector>;
  generateBatchEmbeddings(texts: string[]): Promise<EmbeddingVector[]>;
  getDimensions(): number;
  isReady(): boolean;
}

/**
 * Mock embedding client that generates deterministic vectors for testing
 * Uses simple text analysis to create consistent, test-friendly embeddings
 */
export class MockEmbeddingClient implements EmbeddingClient {
  private dimensions: number;
  private isInitialized: boolean = true;

  constructor(config: EmbeddingClientConfig = { provider: 'mock', dimensions: 384 }) {
    this.dimensions = config.dimensions || 384;
  }

  /**
   * Generate deterministic embedding vector from text
   * Uses character codes and word patterns for consistency
   */
  async generateEmbedding(text: string): Promise<EmbeddingVector> {
    if (!text || text.trim().length === 0) {
      return new Array(this.dimensions).fill(0);
    }

    const cleanText = text.toLowerCase().trim();
    const vector: number[] = new Array(this.dimensions);
    
    // Create deterministic features based on text content
    const features = this.extractTextFeatures(cleanText);
    
    // Fill vector with normalized features
    for (let i = 0; i < this.dimensions; i++) {
      // Use different text characteristics for different dimensions
      const charIndex = i % cleanText.length;
      const wordIndex = i % features.words.length;
      const char = cleanText.charCodeAt(charIndex) || 0;
      const wordLength = features.words[wordIndex]?.length || 1;
      
      // Combine multiple features for richer representation
      let value = Math.sin((char * 0.01) + (i * 0.1));
      value += Math.cos(wordLength * 0.1 + i * 0.05);
      value += features.textLength * 0.001;
      value += features.vowelRatio * Math.sin(i * 0.02);
      
      // Normalize to [-1, 1] range
      vector[i] = Math.tanh(value);
    }

    // Add some noise based on text hash for uniqueness
    const textHash = this.simpleHash(cleanText);
    for (let i = 0; i < this.dimensions; i++) {
      const noise = Math.sin(textHash + i) * 0.1;
      vector[i] = Math.tanh(vector[i] + noise);
    }

    return this.normalizeVector(vector);
  }

  /**
   * Generate batch embeddings for multiple texts
   */
  async generateBatchEmbeddings(texts: string[]): Promise<EmbeddingVector[]> {
    const embeddings: EmbeddingVector[] = [];
    
    for (const text of texts) {
      embeddings.push(await this.generateEmbedding(text));
    }
    
    return embeddings;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Extract text features for embedding generation
   */
  private extractTextFeatures(text: string) {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const chars = text.split('');
    const vowels = chars.filter(char => 'aeiouเแโใไ'.includes(char)).length;
    
    return {
      textLength: text.length,
      words,
      wordCount: words.length,
      avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1),
      vowelRatio: vowels / Math.max(chars.length, 1),
      uniqueChars: new Set(chars).size
    };
  }

  /**
   * Simple hash function for text consistency
   */
  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    
    return vector.map(val => val / magnitude);
  }
}

/**
 * Factory function to create embedding client based on configuration
 */
export function createEmbeddingClient(config: EmbeddingClientConfig = { provider: 'mock' }): EmbeddingClient {
  switch (config.provider) {
    case 'mock':
      return new MockEmbeddingClient(config);
    
    // Future implementations:
    // case 'openai':
    //   return new OpenAIEmbeddingClient(config);
    // case 'cohere':
    //   return new CohereEmbeddingClient(config);
    
    default:
      console.warn(`[embeddings] Unknown provider: ${config.provider}, falling back to mock`);
      return new MockEmbeddingClient(config);
  }
}