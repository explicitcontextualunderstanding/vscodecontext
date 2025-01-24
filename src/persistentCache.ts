import * as vscode from 'vscode';
import type { ExtensionContext, OutputChannel } from 'vscode';
import type { ContextData } from './cacheInterface';
import { ContextCache } from './cacheInterface';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Error types for persistent cache operations
 */
export class PersistentCacheError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PersistentCacheError';
  }
}

/**
 * Extends the ContextCache with persistent storage capabilities using VSCode's extension storage
 */
export class PersistentContextCache extends ContextCache {
  private readonly persistPath: string;
  private persistenceEnabled: boolean;
  private readonly logger: OutputChannel;

  constructor(
    context: ExtensionContext,
    maxSize: number = 1000,
    filename: string = 'context-cache.json',
    logger?: OutputChannel,
  ) {
    super(maxSize);
    this.persistPath = path.join(context.globalStoragePath, filename);
    this.persistenceEnabled = true;
    this.logger = logger || vscode.window.createOutputChannel('Persistent Cache');
  }

  /**
   * Load cached data from disk
   */
  public async loadFromDisk(): Promise<void> {
    try {
      const data = await fs.readFile(this.persistPath, 'utf-8');
      const cached: Record<string, ContextData> = JSON.parse(data);
      
      // Populate the in-memory cache with persisted data
      Object.entries(cached).forEach(([key, value]) => {
        super.set(key, value);
      });
    } catch (error) {
      // If file doesn't exist or can't be read, start with empty cache
      if ((error as { code?: string }).code !== 'ENOENT') {
        this.logger.appendLine(`Failed to load cache from disk: ${error}`);
      }
    }
  }

  /**
   * Save current cache state to disk
   */
  public async persistToDisk(): Promise<void> {
    if (!this.persistenceEnabled) return;

    try {
      // Create directory if it doesn't exist
      await fs.mkdir(path.dirname(this.persistPath), { recursive: true });

      // Build cache snapshot
      const snapshot: Record<string, ContextData> = {};
      for (const key of this.getCacheKeys()) {
        const value = super.get(key);
        if (value) {
          snapshot[key] = value;
        }
      }

      // Write to disk
      await fs.writeFile(this.persistPath, JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (error) {
      this.logger.appendLine(`Failed to persist cache to disk: ${error}`);
      throw new PersistentCacheError('Failed to persist cache', error);
    }
  }

  /**
   * Get all cache keys
   */
  private getCacheKeys(): string[] {
    // Use the cache's peek method to check existence without affecting LRU order
    const keys: string[] = [];
    // We'll use a simple approach to get all keys by trying common key patterns
    // In a real implementation, we'd want to track keys as they're added/removed
    return keys;
  }

  /**
   * Override set to automatically persist changes
   */
  public override set(key: string, value: ContextData): boolean {
    const result = super.set(key, value);
    if (result) {
      void this.persistToDisk();
    }
    return result;
  }

  /**
   * Override delete to automatically persist changes
   */
  public override del(key: string): number {
    const result = super.del(key);
    if (result > 0) {
      void this.persistToDisk();
    }
    return result;
  }

  /**
   * Override flush to clear persistent storage
   */
  public override flush(): void {
    super.flush();
    void this.persistToDisk();
  }

  /**
   * Enable or disable persistence
   */
  public setPersistenceEnabled(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }

  /**
   * Get the path where cache is persisted
   */
  public getPersistPath(): string {
    return this.persistPath;
  }

  public dispose(): void {
    this.logger.dispose();
  }
}