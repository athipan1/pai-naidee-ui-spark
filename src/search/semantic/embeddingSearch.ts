// Semantic search functionality with cosine similarity

import type { 
  EmbeddingVector, 
  SemanticDocumentMeta, 
  SemanticIndex, 
  SemanticSearchResult 
} from './types';

/**
 * Calculate cosine similarity between two vectors
 * Formula: (Σ Ai*Bi) / (sqrt(Σ Ai^2) * sqrt(Σ Bi^2))
 */
export function cosineSimilarity(vectorA: EmbeddingVector, vectorB: EmbeddingVector): number {
  if (vectorA.length !== vectorB.length) {
    console.warn('[semantic] Vector length mismatch:', vectorA.length, 'vs', vectorB.length);
    return 0;
  }

  if (vectorA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Search documents using semantic similarity
 */
export async function semanticSearch(
  queryEmbedding: EmbeddingVector,
  semanticIndex: SemanticIndex,
  options: {
    limit?: number;
    minSimilarity?: number;
    documentType?: 'post' | 'location';
  } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 20, minSimilarity = 0.1, documentType } = options;

  if (!semanticIndex.documents || semanticIndex.documents.length === 0) {
    console.warn('[semantic] Empty semantic index');
    return [];
  }

  // Filter by document type if specified
  let documentsToSearch = semanticIndex.documents;
  if (documentType) {
    documentsToSearch = semanticIndex.documents.filter(doc => doc.type === documentType);
  }

  // Calculate similarities
  const results: SemanticSearchResult[] = documentsToSearch
    .map(document => ({
      documentId: document.id,
      similarity: cosineSimilarity(queryEmbedding, document.embedding),
      document
    }))
    .filter(result => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return results;
}

/**
 * Find similar documents to a given document
 */
export async function findSimilarDocuments(
  targetDocumentId: string,
  semanticIndex: SemanticIndex,
  options: {
    limit?: number;
    minSimilarity?: number;
    excludeTarget?: boolean;
  } = {}
): Promise<SemanticSearchResult[]> {
  const { limit = 5, minSimilarity = 0.3, excludeTarget = true } = options;

  const targetDocument = semanticIndex.documents.find(doc => doc.id === targetDocumentId);
  if (!targetDocument) {
    console.warn('[semantic] Target document not found:', targetDocumentId);
    return [];
  }

  let documentsToSearch = semanticIndex.documents;
  if (excludeTarget) {
    documentsToSearch = semanticIndex.documents.filter(doc => doc.id !== targetDocumentId);
  }

  // Calculate similarities to target document
  const results: SemanticSearchResult[] = documentsToSearch
    .map(document => ({
      documentId: document.id,
      similarity: cosineSimilarity(targetDocument.embedding, document.embedding),
      document
    }))
    .filter(result => result.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return results;
}

/**
 * Get documents similar to a set of query terms using semantic search
 */
export async function semanticSearchMultiQuery(
  queryEmbeddings: EmbeddingVector[],
  semanticIndex: SemanticIndex,
  options: {
    limit?: number;
    minSimilarity?: number;
    aggregationMethod?: 'max' | 'average' | 'weighted';
    weights?: number[];
  } = {}
): Promise<SemanticSearchResult[]> {
  const { 
    limit = 20, 
    minSimilarity = 0.1, 
    aggregationMethod = 'max',
    weights 
  } = options;

  if (queryEmbeddings.length === 0) {
    return [];
  }

  // Single query case
  if (queryEmbeddings.length === 1) {
    return semanticSearch(queryEmbeddings[0], semanticIndex, { limit, minSimilarity });
  }

  // Multiple queries - calculate aggregate similarity
  const documentSimilarities = new Map<string, number>();

  for (const document of semanticIndex.documents) {
    const similarities = queryEmbeddings.map(queryEmbedding => 
      cosineSimilarity(queryEmbedding, document.embedding)
    );

    let aggregatedSimilarity: number;

    switch (aggregationMethod) {
      case 'max':
        aggregatedSimilarity = Math.max(...similarities);
        break;
      
      case 'average':
        aggregatedSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
        break;
      
      case 'weighted':
        if (weights && weights.length === similarities.length) {
          const weightedSum = similarities.reduce((sum, sim, i) => sum + sim * weights[i], 0);
          const totalWeight = weights.reduce((sum, w) => sum + w, 0);
          aggregatedSimilarity = weightedSum / totalWeight;
        } else {
          // Fallback to average if weights don't match
          aggregatedSimilarity = similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
        }
        break;
      
      default:
        aggregatedSimilarity = Math.max(...similarities);
    }

    documentSimilarities.set(document.id, aggregatedSimilarity);
  }

  // Create and sort results
  const results: SemanticSearchResult[] = Array.from(documentSimilarities.entries())
    .filter(([_, similarity]) => similarity >= minSimilarity)
    .sort(([_a, simA], [_b, simB]) => simB - simA)
    .slice(0, limit)
    .map(([documentId, similarity]) => {
      const document = semanticIndex.documents.find(doc => doc.id === documentId)!;
      return {
        documentId,
        similarity,
        document
      };
    });

  return results;
}

/**
 * Load semantic index from storage (mock implementation)
 */
export async function loadSemanticIndex(): Promise<SemanticIndex | null> {
  try {
    // In a real implementation, this would load from file system or remote storage
    // For now, return null to trigger fallback behavior
    console.info('[semantic] Semantic index not found, using fallback search');
    return null;
  } catch (error) {
    console.warn('[semantic] Failed to load semantic index:', error);
    return null;
  }
}

/**
 * Save semantic index to storage (mock implementation) 
 */
export async function saveSemanticIndex(index: SemanticIndex): Promise<boolean> {
  try {
    // In a real implementation, this would save to file system or remote storage
    console.info('[semantic] Saving semantic index with', index.totalDocuments, 'documents');
    return true;
  } catch (error) {
    console.error('[semantic] Failed to save semantic index:', error);
    return false;
  }
}