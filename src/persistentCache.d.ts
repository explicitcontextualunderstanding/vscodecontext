import type { ExtensionContext, OutputChannel } from 'vscode';
import type { ContextData } from './cacheInterface';
import { ContextCache } from './cacheInterface';
/**
 * Error types for persistent cache operations
 */
export declare class PersistentCacheError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown);
}
/**
 * Extends the ContextCache with persistent storage capabilities using VSCode's extension storage
 */
export declare class PersistentContextCache extends ContextCache {
  private readonly persistPath;
  private persistenceEnabled;
  private readonly logger;
  constructor(
    context: ExtensionContext,
    maxSize?: number,
    filename?: string,
    logger?: OutputChannel,
  );
  /**
   * Load cached data from disk
   */
  loadFromDisk(): Promise<void>;
  /**
   * Save current cache state to disk
   */
  persistToDisk(): Promise<void>;
  /**
   * Get all cache keys
   */
  private getCacheKeys;
  /**
   * Override set to automatically persist changes
   */
  set(key: string, value: ContextData): boolean;
  /**
   * Override delete to automatically persist changes
   */
  del(key: string): number;
  /**
   * Override flush to clear persistent storage
   */
  flush(): void;
  /**
   * Enable or disable persistence
   */
  setPersistenceEnabled(enabled: boolean): void;
  /**
   * Get the path where cache is persisted
   */
  getPersistPath(): string;
  dispose(): void;
}
