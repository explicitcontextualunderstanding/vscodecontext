import * as vscode from 'vscode';
import type { IExtensionContext } from './interfaces/IExtensionContext';
import type { IContextProvider, LogEntry, ContextDataProvider } from './interfaces/IContextProvider';

export class ContextProvider implements IContextProvider {
  private readonly context: vscode.ExtensionContext;
  private providers: ContextDataProvider[] = [];
  private logEntries: LogEntry[] = [];

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: 'info',
      message,
      context: metadata
    });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: 'warn',
      message,
      context: metadata
    });
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date(),
      level: 'error',
      message,
      context: metadata
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
    const safeEntry = entry as {
      level?: string;
      message?: string;
      metadata?: unknown;
    };
    console.log(`[${safeEntry.level}] ${safeEntry.message}`, safeEntry.metadata);
  }

  getLogHistory(): LogEntry[] {
    return [...this.logEntries];
  }

  async getAllContext(categories: string[]): Promise<Record<string, unknown>> {
    return Promise.resolve({
      workspace: categories.includes('workspace') ? {
        name: vscode.workspace.name,
        folders: vscode.workspace.workspaceFolders?.map(f => f.uri.fsPath) || []
      } : {},
      editor: categories.includes('editor') ? {
        activeDocument: vscode.window.activeTextEditor?.document.fileName,
        language: vscode.window.activeTextEditor?.document.languageId
      } : {},
      environment: categories.includes('environment') ? {
        vscodeVersion: vscode.version,
        os: process.platform
      } : {}
    });
  }

  startTrackingTerminals(): void {
    const disposable = vscode.window.onDidChangeTerminalState(() => {
      console.log('Terminal state changed');
    });
    this.context.subscriptions.push(disposable);
  }
}
