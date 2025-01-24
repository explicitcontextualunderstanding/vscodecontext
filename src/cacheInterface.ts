import QuickLRU from 'quick-lru';

/**
 * Represents cached context data with timestamp and key-value pairs
 * @property {number} timestamp - Unix timestamp of when data was cached
 * @property {Record<string, unknown>} data - Key-value pairs of cached data
 */
export interface ContextData {
  timestamp: number;
  data: Record<string, unknown>;
}

/**
 * Cache interface for the vscodecontext extension using LRU caching strategy
 */
export class ContextCache {
  private readonly cache: QuickLRU<string, ContextData>;
  private readonly metrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(maxSize: number = 1000) {
    this.cache = new QuickLRU({
      maxSize,
      onEviction: () => {
        // Handled silently - eviction is expected LRU behavior
      },
    });
  }

  /**
   * Get cached context
   * @param key Cache key
   * @returns Cached context data or undefined if not found
   */
  public get(key: string): ContextData | undefined {
    const value = this.cache.get(key);
    if (value) {
      this.metrics.hits++;
      return value;
    }
    this.metrics.misses++;
    return undefined;
  }

  /**
   * Set context in cache
   * @param key Cache key
   * @param value Context data to cache
   * @returns true if set successfully
   */
  public set(key: string, value: ContextData): boolean {
    this.cache.set(key, value);
    this.metrics.sets++;
    return true;
  }

  /**
   * Delete context from cache
   * @param key Cache key
   * @returns 1 if item was deleted, 0 if item didn't exist
   */
  public del(key: string): number {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.metrics.deletes++;
      return 1;
    }
    return 0;
  }

  /**
   * Flush all cached contexts
   */
  public flush(): void {
    this.cache.clear();
    // Reset metrics on flush
    Object.assign(this.metrics, {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    });
  }

  /**
   * Get cache statistics
   * @returns Cache statistics including hits, misses, and size
   */
  public stats(): {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    size: number;
  } {
    return {
      ...this.metrics,
      size: this.cache.size,
    };
  }

  /**
   * Optional: Peek at a cached value without marking it as recently used
   * @param key Cache key
   * @returns Cached context data or undefined if not found
   */
  public peek(key: string): ContextData | undefined {
    return this.cache.peek(key);
  }

  /**
   * Optional: Check if a key exists in the cache
   * @param key Cache key
   * @returns true if key exists, false otherwise
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }
}

// Export singleton instance
export const contextCache = new ContextCache();
