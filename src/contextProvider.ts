import * as vscode from 'vscode';

import type {
  ContextDataProvider,
  IContextProvider,
  LogEntry,
} from './interfaces/IContextProvider';

export class ContextProvider implements IContextProvider {
  private readonly context: vscode.ExtensionContext;
  private readonly providers: ContextDataProvider[] = [];
  private readonly logEntries: LogEntry[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
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
    // TODO: Implement configuration validation
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
