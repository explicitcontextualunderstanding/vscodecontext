import NodeCache from 'node-cache';

/**
 * Represents cached context data with timestamp and key-value pairs
 * @property {number} timestamp - Unix timestamp of when data was cached
 * @property {Record<string, unknown>} data - Key-value pairs of cached data
 */
export interface ContextData {
  timestamp: number;
  data: Record<string, unknown>;
}

// Cache interface for the vscodecontext extension
export class ContextCache {
  private cache: NodeCache;

  constructor(ttlSeconds: number = 3600) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false,
    });
  }

  // Get cached context
  public get(key: string): ContextData | undefined {
    return this.cache.get(key);
  }

  // Set context in cache
  public set(key: string, value: ContextData): boolean {
    return this.cache.set(key, value);
  }

  // Delete context from cache
  public del(key: string): number {
    return this.cache.del(key);
  }

  // Flush all cached contexts
  public flush(): void {
    this.cache.flushAll();
  }

  // Get cache statistics
  public stats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}

// Export singleton instance
export const contextCache = new ContextCache();
