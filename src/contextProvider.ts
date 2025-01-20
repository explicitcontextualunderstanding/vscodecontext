import * as vscode from 'vscode';
import { Logger } from './loggingInterface';
import { ProductionLogger } from './productionLogger';
import { DevelopmentLogger } from './developmentLogger';
import { errorMonitor } from './monitoring/errorMonitor';
import { withErrorHandling, validateInput } from './utils/errorUtils';
import { ContextProviderError } from './errors/VSCodeContextError';

/**
 * Tracks information about an active terminal instance
 */
export interface TerminalInfo {
  terminal: vscode.Terminal;
  creationTime: string;
  lastActivity: string;
  inputCount: number;
  outputCount: number;
}

/**
 * Records historical data about a terminal session
 */
export interface TerminalHistoryRecord {
  name: string;
  creationTime: string;
  lastActivity: string;
  inputCount: number;
  outputCount: number;
  lifetimeMs: number;
}

/**
 * Represents a recently accessed file
 */
export interface RecentFile {
  uri: string;
  languageId: string;
  isDirty: boolean;
}

/**
 * Represents the context data which is returned from the context provider
 */
export interface ContextData {
  workspace?: Record<string, unknown>;
  window?: Record<string, unknown>;
  language?: Record<string, unknown>;
  debug?: Record<string, unknown>;
  sourceControl?: Record<string, unknown>;
  tasks?: Record<string, unknown>;
  extension?: Record<string, unknown>;
  extensionHost?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  keybindings?: unknown[];
  theme?: Record<string, unknown>;
  views?: Record<string, unknown>;
  customEditors?: Record<string, unknown>[];
}

export class ContextProvider {
  logger: Logger =
    process.env.NODE_ENV === 'production' ? new ProductionLogger() : new DevelopmentLogger();
  terminalTracker = {
    active: new Map<string, TerminalInfo>(),
    history: [] as TerminalHistoryRecord[],
  };

  constructor(private readonly context: vscode.ExtensionContext) {
    // Add configuration monitoring with error handling
    vscode.workspace.onDidChangeConfiguration(() => {
      void withErrorHandling(
        async () => {
          this.logger.log('Configuration changed');
          return Promise.resolve();
        },
        { operation: 'onDidChangeConfiguration' }
      );
    });

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
      void withErrorHandling(
        async () => {
          this.logger.log(`Text document changed: ${e.document.uri}`);
          return Promise.resolve();
        },
        { operation: 'onDidChangeTextDocument', uri: e.document.uri.toString() }
      );
    });
  }

  async getAllContext(includeCategories: string[]): Promise<ContextData> {
    try {
      // Validate input
      validateInput(
        includeCategories,
        (cats) => Array.isArray(cats) && cats.every((cat) => typeof cat === 'string'),
        'Include categories must be an array of strings'
      );

      const contextData: ContextData = {};

      // Use withErrorHandling for each context gathering operation
      if (includeCategories.includes('workspace')) {
        contextData.workspace = await withErrorHandling(
          async () => this.getWorkspaceContext(),
          { operation: 'getWorkspaceContext' }
        );
      }
      if (includeCategories.includes('window')) {
        contextData.window = await withErrorHandling(
          async () => this.getWindowContext(),
          { operation: 'getWindowContext' }
        );
      }
      // ... similar pattern for other context types

      return contextData;
    } catch (error) {
      errorMonitor.trackError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'getAllContext', categories: includeCategories }
      );
      throw new ContextProviderError(
        'Failed to get context data',
        'GET_CONTEXT_ERROR'
      );
    }
  }

  private getFileTypeString(type: vscode.FileType): string {
    switch (type) {
      case vscode.FileType.File:
        return 'file';
      case vscode.FileType.Directory:
        return 'directory';
      case vscode.FileType.SymbolicLink:
        return 'symlink';
      default:
        return 'unknown';
    }
  }

  private async getConfig(): Promise<Record<string, unknown>> {
    const editorConfig = vscode.workspace.getConfiguration('editor');
    const filesConfig = vscode.workspace.getConfiguration('files');
    const searchConfig = vscode.workspace.getConfiguration('search');

    return {
      editor: {
        fontSize: editorConfig.get('fontSize'),
        tabSize: editorConfig.get('tabSize'),
        insertSpaces: editorConfig.get('insertSpaces'),
        wordWrap: editorConfig.get('wordWrap'),
        renderWhitespace: editorConfig.get('renderWhitespace'),
      },
      files: {
        autoSave: filesConfig.get('autoSave'),
        exclude: filesConfig.get('exclude'),
        watcherExclude: filesConfig.get('watcherExclude'),
      },
      search: {
        exclude: searchConfig.get('exclude'),
        useIgnoreFiles: searchConfig.get('useIgnoreFiles'),
        followSymlinks: searchConfig.get('followSymlinks'),
      },
    };
  }

  private async getWorkspaceContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      const rootUri = workspaceFolders?.[0]?.uri;
      let fsContent: [string, vscode.FileType][] = [];

      if (rootUri) {
        try {
          fsContent = await vscode.workspace.fs.readDirectory(rootUri);
        } catch {
          throw new ContextProviderError(
            `Failed to read directory ${rootUri.toString()}`,
            'READ_DIRECTORY_ERROR'
          );
        }
      }

      const recentFiles = await withErrorHandling(
        async () => vscode.workspace.textDocuments.map(
          (doc): RecentFile => ({
            uri: doc.uri.toString(),
            languageId: doc.languageId,
            isDirty: doc.isDirty,
          })
        ),
        { operation: 'getRecentFiles' }
      );

      return {
        workspaceFolders: workspaceFolders?.map((folder) => ({
          uri: folder.uri.toString(),
          name: folder.name,
        })) || [],
        workspaceFs: {
          rootContent: fsContent.map(([name, type]) => ({
            name,
            type: this.getFileTypeString(type),
          })),
        },
        recentFiles,
        configuration: await this.getConfig(),
      };
    }, { operation: 'getWorkspaceContext' });
  }

  private async getWindowContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(async () => {
      const activeEditor = vscode.window.activeTextEditor;
      const activeTerminal = vscode.window.activeTerminal;

      // Validate critical data
      if (activeEditor?.document.uri) {
        validateInput(
          activeEditor.document.uri.toString(),
          (uri) => uri.length > 0,
          'Invalid active editor URI'
        );
      }

      return {
        activeTextEditor: activeEditor
          ? {
              uri: activeEditor.document.uri.toString(),
              languageId: activeEditor.document.languageId,
              selection: activeEditor.selection
                ? {
                    start: {
                      line: activeEditor.selection.start.line,
                      character: activeEditor.selection.start.character,
                    },
                    end: {
                      line: activeEditor.selection.end.line,
                      character: activeEditor.selection.end.character,
                    },
                  }
                : undefined,
            }
          : undefined,
        activeTerminal: activeTerminal
          ? {
              name: activeTerminal.name,
            }
          : undefined,
      };
    }, { operation: 'getWindowContext' });
  }

  async startTrackingTerminals(context: vscode.ExtensionContext): Promise<void> {
    await withErrorHandling(async () => {
      // Track terminal creation and activity
      const openDisposable = vscode.window.onDidOpenTerminal((terminal) => {
        void withErrorHandling(async () => {
          const terminalInfo: TerminalInfo = {
            terminal,
            creationTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            inputCount: 0,
            outputCount: 0,
          };
          this.terminalTracker.active.set(terminal.name, terminalInfo);
          return Promise.resolve();
        }, { operation: 'onDidOpenTerminal', terminal: terminal.name });
      });

      // Track terminal destruction with lifetime calculation
      const closeDisposable = vscode.window.onDidCloseTerminal((terminal) => {
        void withErrorHandling(async () => {
          const terminalInfo = this.terminalTracker.active.get(terminal.name);
          if (terminalInfo) {
            const creationTime = new Date(terminalInfo.creationTime);
            const closeTime = new Date();
            const lifetimeMs = closeTime.getTime() - creationTime.getTime();

            this.terminalTracker.history.push({
              name: terminal.name,
              creationTime: terminalInfo.creationTime,
              lastActivity: terminalInfo.lastActivity,
              inputCount: terminalInfo.inputCount,
              outputCount: terminalInfo.outputCount,
              lifetimeMs,
            });

            this.terminalTracker.active.delete(terminal.name);
          }
          return Promise.resolve();
        }, { operation: 'onDidCloseTerminal', terminal: terminal.name });
      });

      context.subscriptions.push(openDisposable, closeDisposable);
    }, { operation: 'startTrackingTerminals' });
  }

  /**
   * Validate a URI is valid
   */
  private validateUri(uri: vscode.Uri | undefined, operation: string): void {
    if (!uri) {
      throw new ContextProviderError(
        `Invalid URI in ${operation}`,
        'INVALID_URI'
      );
    }
  }

  /**
   * Validate a document is valid
   */
  private validateDocument(document: vscode.TextDocument | undefined, operation: string): void {
    if (!document) {
      throw new ContextProviderError(
        `Invalid document in ${operation}`,
        'INVALID_DOCUMENT'
      );
    }
  }
}
