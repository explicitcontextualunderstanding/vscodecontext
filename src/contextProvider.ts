import * as vscode from 'vscode';

import type { IContextProvider, LogEntry } from './interfaces/IContextProvider';

export class ContextProvider implements IContextProvider {
  private readonly context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public logger = {
    log: (entry: LogEntry): void => {
      console.log(`[${entry.level}] ${entry.message}`, entry.metadata);
    },
    info: (message: string, metadata?: object): void => {
      console.log(`[info] ${message}`, metadata);
    }
  };

  getAllContext(categories: string[]): object {
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
