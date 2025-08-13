// Search metrics and observability for Phase 2

export interface SearchQueryMetrics {
  id: string;
  query: string;
  timestamp: number;
  durationMs: number;
  resultCount: number;
  cacheHit: boolean;
  usedSemantic: boolean;
  usedFilters: boolean;
  language: 'th' | 'en' | 'auto';
  userAgent?: string;
  source: 'web' | 'mobile' | 'api';
}

export interface SearchAggregateMetrics {
  totalQueries: number;
  averageDurationMs: number;
  averageResultCount: number;
  cacheHitRate: number;
  semanticUsageRate: number;
  filterUsageRate: number;
  languageDistribution: {
    th: number;
    en: number;
    auto: number;
  };
  popularQueries: Array<{
    query: string;
    count: number;
    lastSeen: number;
  }>;
  timeRange: {
    start: number;
    end: number;
  };
}

interface QueryFrequency {
  query: string;
  count: number;
  lastSeen: number;
}

/**
 * In-memory search metrics store with rolling window
 */
class SearchMetricsStore {
  private queries: SearchQueryMetrics[] = [];
  private queryFrequency: Map<string, QueryFrequency> = new Map();
  private maxQueries: number;

  constructor(maxQueries: number = 50) {
    this.maxQueries = maxQueries;
  }

  /**
   * Record a search query with metrics
   */
  recordQuery(metrics: Omit<SearchQueryMetrics, 'id' | 'timestamp'>): void {
    const queryMetrics: SearchQueryMetrics = {
      ...metrics,
      id: this.generateId(),
      timestamp: Date.now()
    };

    // Add to rolling window
    this.queries.push(queryMetrics);
    
    // Maintain rolling window size
    if (this.queries.length > this.maxQueries) {
      this.queries.shift();
    }

    // Update query frequency tracking
    this.updateQueryFrequency(metrics.query);

    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.info('[metrics] Recorded query:', {
        query: metrics.query,
        duration: metrics.durationMs,
        results: metrics.resultCount,
        semantic: metrics.usedSemantic
      });
    }
  }

  /**
   * Get current aggregate metrics
   */
  getAggregateMetrics(): SearchAggregateMetrics {
    if (this.queries.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalQueries = this.queries.length;
    const totalDuration = this.queries.reduce((sum, q) => sum + q.durationMs, 0);
    const totalResults = this.queries.reduce((sum, q) => sum + q.resultCount, 0);
    const cacheHits = this.queries.filter(q => q.cacheHit).length;
    const semanticQueries = this.queries.filter(q => q.usedSemantic).length;
    const filterQueries = this.queries.filter(q => q.usedFilters).length;

    // Language distribution
    const languageCounts = this.queries.reduce(
      (acc, q) => {
        acc[q.language]++;
        return acc;
      },
      { th: 0, en: 0, auto: 0 }
    );

    // Popular queries (top 10)
    const popularQueries = Array.from(this.queryFrequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Time range
    const timestamps = this.queries.map(q => q.timestamp);
    const timeRange = {
      start: Math.min(...timestamps),
      end: Math.max(...timestamps)
    };

    return {
      totalQueries,
      averageDurationMs: totalDuration / totalQueries,
      averageResultCount: totalResults / totalQueries,
      cacheHitRate: cacheHits / totalQueries,
      semanticUsageRate: semanticQueries / totalQueries,
      filterUsageRate: filterQueries / totalQueries,
      languageDistribution: {
        th: languageCounts.th / totalQueries,
        en: languageCounts.en / totalQueries,
        auto: languageCounts.auto / totalQueries
      },
      popularQueries,
      timeRange
    };
  }

  /**
   * Get recent queries for debugging
   */
  getRecentQueries(limit: number = 10): SearchQueryMetrics[] {
    return this.queries
      .slice(-limit)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.queries = [];
    this.queryFrequency.clear();
  }

  /**
   * Get performance insights
   */
  getPerformanceInsights(): {
    slowQueries: SearchQueryMetrics[];
    frequentQueries: QueryFrequency[];
    semanticPerformance: {
      averageDuration: number;
      averageResults: number;
    };
    recommendations: string[];
  } {
    const slowQueries = this.queries
      .filter(q => q.durationMs > 1000) // Queries taking more than 1 second
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 5);

    const frequentQueries = Array.from(this.queryFrequency.values())
      .filter(q => q.count >= 3)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const semanticQueries = this.queries.filter(q => q.usedSemantic);
    const semanticPerformance = {
      averageDuration: semanticQueries.reduce((sum, q) => sum + q.durationMs, 0) / Math.max(semanticQueries.length, 1),
      averageResults: semanticQueries.reduce((sum, q) => sum + q.resultCount, 0) / Math.max(semanticQueries.length, 1)
    };

    const recommendations: string[] = [];
    
    if (slowQueries.length > 0) {
      recommendations.push('Consider optimizing slow queries or implementing caching');
    }
    
    if (this.getAggregateMetrics().cacheHitRate < 0.3) {
      recommendations.push('Cache hit rate is low, consider adjusting cache strategy');
    }
    
    if (frequentQueries.length > 0) {
      recommendations.push('Frequent queries detected, consider precomputing results');
    }

    return {
      slowQueries,
      frequentQueries,
      semanticPerformance,
      recommendations
    };
  }

  private updateQueryFrequency(query: string): void {
    const normalizedQuery = query.toLowerCase().trim();
    const existing = this.queryFrequency.get(normalizedQuery);
    
    if (existing) {
      existing.count++;
      existing.lastSeen = Date.now();
    } else {
      this.queryFrequency.set(normalizedQuery, {
        query: normalizedQuery,
        count: 1,
        lastSeen: Date.now()
      });
    }

    // Limit frequency tracking size
    if (this.queryFrequency.size > 100) {
      // Remove oldest entries
      const entries = Array.from(this.queryFrequency.entries())
        .sort(([_a, a], [_b, b]) => a.lastSeen - b.lastSeen);
      
      const toRemove = entries.slice(0, 20); // Remove 20 oldest
      toRemove.forEach(([key]) => this.queryFrequency.delete(key));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private getEmptyMetrics(): SearchAggregateMetrics {
    return {
      totalQueries: 0,
      averageDurationMs: 0,
      averageResultCount: 0,
      cacheHitRate: 0,
      semanticUsageRate: 0,
      filterUsageRate: 0,
      languageDistribution: { th: 0, en: 0, auto: 0 },
      popularQueries: [],
      timeRange: { start: 0, end: 0 }
    };
  }
}

// Global metrics store instance
const metricsStore = new SearchMetricsStore();

/**
 * Record a search query with metrics
 */
export function recordQuery(metrics: Omit<SearchQueryMetrics, 'id' | 'timestamp'>): void {
  metricsStore.recordQuery(metrics);
}

/**
 * Get current search metrics
 */
export function getSearchMetrics(): SearchAggregateMetrics {
  return metricsStore.getAggregateMetrics();
}

/**
 * Get recent search queries for debugging
 */
export function getRecentQueries(limit?: number): SearchQueryMetrics[] {
  return metricsStore.getRecentQueries(limit);
}

/**
 * Get performance insights and recommendations
 */
export function getPerformanceInsights() {
  return metricsStore.getPerformanceInsights();
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics(): void {
  metricsStore.clear();
}

/**
 * Export metrics data for external analysis
 */
export function exportMetrics(): {
  aggregate: SearchAggregateMetrics;
  recent: SearchQueryMetrics[];
  insights: ReturnType<typeof getPerformanceInsights>;
} {
  return {
    aggregate: getSearchMetrics(),
    recent: getRecentQueries(50),
    insights: getPerformanceInsights()
  };
}