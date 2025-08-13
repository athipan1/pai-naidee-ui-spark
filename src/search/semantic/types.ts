// Embedding types and interfaces for semantic search

export type EmbeddingVector = number[];

export interface SemanticDocumentMeta {
  id: string;
  type: 'post' | 'location';
  content: string;
  embedding: EmbeddingVector;
  metadata: {
    title?: string;
    tags: string[];
    category?: string;
    language?: 'th' | 'en';
    lastUpdated: string;
  };
}

export interface SemanticIndex {
  documents: SemanticDocumentMeta[];
  version: string;
  createdAt: string;
  embeddingDimensions: number;
  totalDocuments: number;
}

export interface SemanticSearchResult {
  documentId: string;
  similarity: number;
  document: SemanticDocumentMeta;
}

export interface EmbeddingClientConfig {
  provider: 'mock' | 'openai' | 'cohere' | 'huggingface';
  apiKey?: string;
  model?: string;
  dimensions?: number;
}