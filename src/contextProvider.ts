import * as vscode from 'vscode';
import { EventEmitter } from 'events'; // Used in events property

import { ContextCategory } from './interfaces/IContextProvider';

export const ContextEvents = {
  EXTRACT_REQUEST: 'context-extract-request',
} as const;
import type {
  ContextDataProvider,
  IContextProvider,
  LogEntry,
} from './interfaces/IContextProvider';

export class ContextProvider implements IContextProvider {
  public readonly events = new EventEmitter();
  private readonly context: vscode.ExtensionContext;
  private readonly providers: ContextDataProvider[] = [];
  private readonly logEntries: LogEntry[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  triggerContextExtraction(categories?: ContextCategory[]): void {
    const target = categories || Object.values(ContextCategory);
    this.events.emit(ContextEvents.EXTRACT_REQUEST, {
      timestamp: Date.now(),
      categories: target,
    });
    this.info(`Context extraction triggered for: ${target.join(', ')}`);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: 'info',
      message,
      context: metadata,
    });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: 'warn',
      message,
      context: metadata,
    });
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: 'error',
      message,
      context: metadata,
    });
  }

  registerProvider(provider: ContextDataProvider): void {
    this.providers.push(provider);
  }

  validateProviderConfiguration(): void {
    for (const provider of this.providers) {
      try {
        this.validateCategory(provider);
        this.validateMethods(provider);

        // Notify provider of configuration changes if supported
        if (provider.onConfigurationChanged) {
          provider.onConfigurationChanged();
          this.info('Provider configuration updated', { category: provider.category });
        }
      } catch (error) {
        this.error('Provider validation failed', {
          category: provider.category,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private validateCategory(provider: ContextDataProvider): void {
    if (!Object.values(ContextCategory).includes(provider.category)) {
      this.error('Invalid provider category', {
        category: provider.category,
        validCategories: Object.values(ContextCategory),
      });
    }
  }

  private validateMethods(provider: ContextDataProvider): void {
    if (typeof provider.isEnabled !== 'function') {
      this.error('Provider missing isEnabled method', { category: provider.category });
      return;
    }

    if (typeof provider.getContext !== 'function') {
      this.error('Provider missing getContext method', { category: provider.category });
      return;
    }

    if (provider.onConfigurationChanged && typeof provider.onConfigurationChanged !== 'function') {
      this.error('Invalid onConfigurationChanged method', { category: provider.category });
    }
  }

  log(entry: LogEntry): void {
    this.logEntries.push(entry);
    // Preserve existing logging behavior
    if (typeof entry !== 'object' || entry === null) return;
    // Logging handled through class methods
  }

  getLogHistory(): LogEntry[] {
    return [...this.logEntries];
  }

  async getAllContext(categories: string[]): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};
    for (const provider of this.providers) {
      if (categories.includes(provider.category) && provider.isEnabled()) {
        try {
          results[provider.category] = await provider.getContext();
          this.info(`Retrieved context from ${provider.category} provider`);
        } catch (error) {
          this.error(`Failed to get context from ${provider.category} provider`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
    return results;
  }

  startTrackingTerminals(): void {
    const disposable = vscode.window.onDidChangeTerminalState(() => {
      this.info('Terminal state changed');
    });
    this.context.subscriptions.push(disposable);
  }
}
