// Embedding indexer for building semantic search index

import type { Post, Location } from '@/shared/types/posts';
import type { 
  SemanticDocumentMeta, 
  SemanticIndex,
  EmbeddingClientConfig
} from './types';
import { createEmbeddingClient } from './embeddingsClient';

/**
 * Build semantic index from posts and locations
 */
export async function buildIndex(
  posts: Post[],
  locations: Location[],
  config: EmbeddingClientConfig = { provider: 'mock' }
): Promise<SemanticIndex> {
  const embeddingClient = createEmbeddingClient(config);
  
  if (!embeddingClient.isReady()) {
    throw new Error('Embedding client is not ready');
  }

  console.info('[indexer] Building semantic index for', posts.length, 'posts and', locations.length, 'locations');
  
  const documents: SemanticDocumentMeta[] = [];
  
  // Process posts
  for (const post of posts) {
    try {
      const content = extractPostContent(post);
      const embedding = await embeddingClient.generateEmbedding(content);
      
      documents.push({
        id: post.id,
        type: 'post',
        content,
        embedding,
        metadata: {
          title: post.caption.substring(0, 100), // Use first 100 chars as title
          tags: post.tags,
          language: detectLanguage(content),
          lastUpdated: post.createdAt
        }
      });
    } catch (error) {
      console.warn('[indexer] Failed to process post', post.id, ':', error);
    }
  }

  // Process locations
  for (const location of locations) {
    try {
      const content = extractLocationContent(location);
      const embedding = await embeddingClient.generateEmbedding(content);
      
      documents.push({
        id: location.id,
        type: 'location',
        content,
        embedding,
        metadata: {
          title: location.nameLocal || location.name,
          tags: location.tags,
          category: location.category,
          language: location.nameLocal ? 'th' : 'en',
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.warn('[indexer] Failed to process location', location.id, ':', error);
    }
  }

  const index: SemanticIndex = {
    documents,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    embeddingDimensions: embeddingClient.getDimensions(),
    totalDocuments: documents.length
  };

  console.info('[indexer] Built semantic index with', documents.length, 'documents');
  return index;
}

/**
 * Extract searchable content from a post
 */
function extractPostContent(post: Post): string {
  const parts: string[] = [];
  
  // Add caption
  if (post.caption) {
    parts.push(post.caption);
  }
  
  // Add tags
  if (post.tags && post.tags.length > 0) {
    parts.push(post.tags.join(' '));
  }
  
  // Add location information
  if (post.location) {
    parts.push(post.location.name);
    if (post.location.nameLocal) {
      parts.push(post.location.nameLocal);
    }
    if (post.location.province) {
      parts.push(post.location.province);
    }
  }
  
  // Add user information (for context)
  if (post.user?.name) {
    parts.push(post.user.name);
  }
  
  return parts.join(' ').trim();
}

/**
 * Extract searchable content from a location
 */
function extractLocationContent(location: Location): string {
  const parts: string[] = [];
  
  // Add names
  parts.push(location.name);
  if (location.nameLocal && location.nameLocal !== location.name) {
    parts.push(location.nameLocal);
  }
  
  // Add aliases
  if (location.aliases && location.aliases.length > 0) {
    parts.push(...location.aliases);
  }
  
  // Add description
  if (location.description) {
    parts.push(location.description);
  }
  if (location.descriptionLocal && location.descriptionLocal !== location.description) {
    parts.push(location.descriptionLocal);
  }
  
  // Add geographic information
  parts.push(location.province);
  if (location.district) {
    parts.push(location.district);
  }
  
  // Add category and tags
  parts.push(location.category);
  if (location.tags && location.tags.length > 0) {
    parts.push(location.tags.join(' '));
  }
  
  return parts.join(' ').trim();
}

/**
 * Simple language detection (Thai vs English)
 */
function detectLanguage(content: string): 'th' | 'en' {
  // Count Thai characters
  const thaiCharCount = (content.match(/[\u0E00-\u0E7F]/g) || []).length;
  const totalChars = content.length;
  
  // If more than 30% Thai characters, consider it Thai
  return (thaiCharCount / totalChars) > 0.3 ? 'th' : 'en';
}

/**
 * Update existing index with new documents
 */
export async function updateIndex(
  existingIndex: SemanticIndex,
  newPosts: Post[],
  newLocations: Location[],
  config: EmbeddingClientConfig = { provider: 'mock' }
): Promise<SemanticIndex> {
  console.info('[indexer] Updating semantic index with', newPosts.length, 'new posts and', newLocations.length, 'new locations');
  
  // Build index for new documents
  const newIndex = await buildIndex(newPosts, newLocations, config);
  
  // Merge with existing index (remove duplicates by ID)
  const existingDocIds = new Set(existingIndex.documents.map(doc => doc.id));
  const uniqueNewDocs = newIndex.documents.filter(doc => !existingDocIds.has(doc.id));
  
  const mergedIndex: SemanticIndex = {
    documents: [...existingIndex.documents, ...uniqueNewDocs],
    version: existingIndex.version,
    createdAt: existingIndex.createdAt,
    embeddingDimensions: existingIndex.embeddingDimensions,
    totalDocuments: existingIndex.documents.length + uniqueNewDocs.length
  };
  
  console.info('[indexer] Updated index now contains', mergedIndex.totalDocuments, 'documents');
  return mergedIndex;
}

/**
 * Remove documents from index by IDs
 */
export function removeFromIndex(
  index: SemanticIndex,
  documentIds: string[]
): SemanticIndex {
  const idsToRemove = new Set(documentIds);
  
  const filteredDocuments = index.documents.filter(doc => !idsToRemove.has(doc.id));
  
  return {
    ...index,
    documents: filteredDocuments,
    totalDocuments: filteredDocuments.length
  };
}

/**
 * Validate semantic index structure
 */
export function validateIndex(index: SemanticIndex): boolean {
  if (!index.documents || !Array.isArray(index.documents)) {
    return false;
  }
  
  if (index.totalDocuments !== index.documents.length) {
    return false;
  }
  
  // Check that all documents have valid embeddings
  for (const doc of index.documents) {
    if (!doc.embedding || !Array.isArray(doc.embedding) || doc.embedding.length === 0) {
      return false;
    }
    
    if (doc.embedding.length !== index.embeddingDimensions) {
      return false;
    }
  }
  
  return true;
}