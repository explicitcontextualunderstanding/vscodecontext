import * as vscode from 'vscode';
import { IContextProvider, LogEntry } from './interfaces/IContextProvider';

export class ContextProvider implements IContextProvider {
  private readonly context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }
  public logger = {
    log: (entry: LogEntry) => {
      console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
    },
    info: (message: string, metadata?: object) => {
      console.log(`[info] ${message}`, metadata);
    }
  };

  async getAllContext(categories: string[]): Promise<object> {
    // Filter context based on requested categories
    return {
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
    };
  }

  startTrackingTerminals(context: vscode.ExtensionContext): void {
    // Terminal tracking implementation
    const disposable = vscode.window.onDidChangeTerminalState(() => {
      this.logger.info('Terminal state changed');
    });
    context.subscriptions.push(disposable);
  }
}
