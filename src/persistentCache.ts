import * as vscode from 'vscode';
import type { ExtensionContext, OutputChannel } from 'vscode';
import type { ContextData } from './cacheInterface.js';
import { ContextCache } from './cacheInterface.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export class PersistentCacheError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PersistentCacheError';
  }
}

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
    this.logger =
      logger || vscode.window.createOutputChannel('Persistent Cache');
  }

  public async loadFromDisk(): Promise<void> {
    try {
      const data = await fs.readFile(this.persistPath, 'utf-8');
      const cached: Record<string, ContextData> = JSON.parse(data);

      Object.entries(cached).forEach(([key, value]) => {
        super.set(key, value);
      });
    } catch (error) {
      if ((error as { code?: string }).code !== 'ENOENT') {
        this.logger.appendLine(`Failed to load cache from disk: ${error}`);
      }
    }
  }

  public async persistToDisk(): Promise<void> {
    if (!this.persistenceEnabled) return;

    try {
      await fs.mkdir(path.dirname(this.persistPath), { recursive: true });
      const snapshot: Record<string, ContextData> = {};

      for (const key of this.getCacheKeys()) {
        const value = super.get(key);
        if (value) snapshot[key] = value;
      }

      await fs.writeFile(
        this.persistPath,
        JSON.stringify(snapshot, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.appendLine(`Failed to persist cache to disk: ${error}`);
      throw new PersistentCacheError('Failed to persist cache', error);
    }
  }

  private getCacheKeys(): string[] {
    const keys: string[] = [];
    return keys;
  }

  public set(key: string, value: ContextData): boolean {
    const result = super.set(key, value);
    if (result) void this.persistToDisk();
    return result;
  }

  public del(key: string): number {
    const result = super.del(key);
    if (result > 0) void this.persistToDisk();
    return result;
  }

  public flush(): void {
    super.flush();
    void this.persistToDisk();
  }

  public setPersistenceEnabled(enabled: boolean): void {
    this.persistenceEnabled = enabled;
  }

  public getPersistPath(): string {
    return this.persistPath;
  }

  public dispose(): void {
    this.logger.dispose();
  }
}
