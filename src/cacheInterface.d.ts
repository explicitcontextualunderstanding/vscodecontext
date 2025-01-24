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
export declare class ContextCache {
    private readonly cache;
    private readonly metrics;
    constructor(maxSize?: number);
    /**
     * Get cached context
     * @param key Cache key
     * @returns Cached context data or undefined if not found
     */
    get(key: string): ContextData | undefined;
    /**
     * Set context in cache
     * @param key Cache key
     * @param value Context data to cache
     * @returns true if set successfully
     */
    set(key: string, value: ContextData): boolean;
    /**
     * Delete context from cache
     * @param key Cache key
     * @returns 1 if item was deleted, 0 if item didn't exist
     */
    del(key: string): number;
    /**
     * Flush all cached contexts
     */
    flush(): void;
    /**
     * Get cache statistics
     * @returns Cache statistics including hits, misses, and size
     */
    stats(): {
        hits: number;
        misses: number;
        sets: number;
        deletes: number;
        size: number;
    };
    /**
     * Optional: Peek at a cached value without marking it as recently used
     * @param key Cache key
     * @returns Cached context data or undefined if not found
     */
    peek(key: string): ContextData | undefined;
    /**
     * Optional: Check if a key exists in the cache
     * @param key Cache key
     * @returns true if key exists, false otherwise
     */
    has(key: string): boolean;
}
export declare const contextCache: ContextCache;
