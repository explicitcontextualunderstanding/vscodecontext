import * as vscode from 'vscode';

// Define interfaces for better type management.

/**
 * Tracks information about an active terminal instance
 * @public
 * @property {vscode.Terminal} terminal - The terminal instance
 * @property {string} creationTime - ISO timestamp when terminal was created
 * @property {string} lastActivity - ISO timestamp of last activity
 * @property {number} inputCount - Number of inputs sent to terminal
 * @property {number} outputCount - Number of outputs received from terminal
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
 * @public
 * @property {string} name - Terminal name
 * @property {string} creationTime - ISO timestamp when terminal was created
 * @property {string} lastActivity - ISO timestamp of last activity
 * @property {number} inputCount - Number of inputs sent to terminal
 * @property {number} outputCount - Number of outputs received from terminal
 * @property {number} lifetimeMs - Total lifetime of terminal session in milliseconds
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
 * @public
 */
export interface RecentFile {
  /** File URI */
  uri: string;
  /** File language ID */
  languageId: string;
  /** Whether file has unsaved changes */
  isDirty: boolean;
}

/**
 * Represents the data from package.json
 * @public
 */
export interface PackageJson {
  name: string;
  version: string;
  publisher: string;
  displayName: string;
  description: string;
  activationEvents: string[];
  main: string;
  engines: Record<string, string>;
}

/**
 * Represents the context data which is returned from the context provider.
 * @public
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

import { Logger } from './loggingInterface';
import { ProductionLogger } from './productionLogger';
import { DevelopmentLogger } from './developmentLogger';

export class ContextProvider {
  logger: Logger =
    process.env.NODE_ENV === 'production' ? new ProductionLogger() : new DevelopmentLogger();
  terminalTracker = {
    active: new Map<string, TerminalInfo>(),
    history: [] as TerminalHistoryRecord[],
  };

  constructor(private context: vscode.ExtensionContext) {}

  async getAllContext(includeCategories: string[]): Promise<ContextData> {
    const contextData: ContextData = {};

    if (includeCategories.includes('workspace')) {
      contextData.workspace = await this.getWorkspaceContext();
    }
    if (includeCategories.includes('window')) {
      contextData.window = this.getWindowContext();
    }
    if (includeCategories.includes('language')) {
      contextData.language = this.getLanguageContext();
    }
    if (includeCategories.includes('debug')) {
      contextData.debug = this.getDebugContext();
    }
    if (includeCategories.includes('sourceControl')) {
      contextData.sourceControl = await this.getSourceControlContext();
    }
    if (includeCategories.includes('tasks')) {
      contextData.tasks = await this.getTasksContext();
    }
    if (includeCategories.includes('extension')) {
      contextData.extension = this.getExtensionContext();
    }
    if (includeCategories.includes('extensionHost')) {
      contextData.extensionHost = this.getExtensionHostContext();
    }
    if (includeCategories.includes('settings')) {
      contextData.settings = this.getSettingsContext();
    }
    if (includeCategories.includes('keybindings')) {
      contextData.keybindings = this.getKeybindingsContext();
    }
    if (includeCategories.includes('theme')) {
      contextData.theme = this.getThemeContext();
    }
    if (includeCategories.includes('views')) {
      contextData.views = this.getViewsContext();
    }
    if (includeCategories.includes('customEditors')) {
      contextData.customEditors = this.getCustomEditorsContext();
    }

    return contextData;
  }

  getExtensionHostContext(): Record<string, unknown> {
    return {
      processId: process.pid,
      execPath: process.execPath,
      argv: process.argv,
      execArgv: process.execArgv,
      env: Object.keys(process.env),
      platform: process.platform,
      arch: process.arch,
      versions: process.versions,
    };
  }

  getSettingsContext(): Record<string, unknown> {
    const settings = vscode.workspace.getConfiguration();
    return {
      workspace: settings.get('workspace'),
      editor: settings.get('editor'),
      files: settings.get('files'),
      search: settings.get('search'),
      debug: settings.get('debug'),
      terminal: settings.get('terminal'),
      window: settings.get('window'),
      extensions: settings.get('extensions'),
    };
  }

  getKeybindingsContext(): unknown[] {
    return [];
  }

  getThemeContext(): Record<string, unknown> {
    const theme = vscode.window.activeColorTheme;
    return {
      kind:
        theme.kind === vscode.ColorThemeKind.Light
          ? 'Light'
          : theme.kind === vscode.ColorThemeKind.Dark
            ? 'Dark'
            : 'HighContrast',
      customizations: vscode.workspace.getConfiguration('workbench').get('colorCustomizations'),
    };
  }

  getViewsContext(): Record<string, unknown> {
    const editors = vscode.window.visibleTextEditors;
    return {
      viewColumns: [...new Set(editors.map((editor) => editor.viewColumn))],
      views: editors.map((editor) => ({
        viewColumn: editor.viewColumn,
        document: {
          uri: editor.document.uri.toString(),
          languageId: editor.document.languageId,
        },
      })),
      activeViewColumn: vscode.window.activeTextEditor?.viewColumn,
    };
  }

  getCustomEditorsContext(): Record<string, unknown>[] {
    const customEditors = vscode.window.visibleTextEditors.filter(
      (editor) =>
        editor.document.uri.scheme !== 'file' && editor.document.uri.scheme !== 'untitled',
    );
    return customEditors.map((editor) => ({
      uri: editor.document.uri.toString(),
      scheme: editor.document.uri.scheme,
      languageId: editor.document.languageId,
      viewColumn: editor.viewColumn,
    }));
  }

  async getWorkspaceContext(): Promise<Record<string, unknown>> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const rootUri = workspaceFolders?.[0]?.uri;
    let fsContent: [string, vscode.FileType][] = [];
    if (rootUri) {
      try {
        fsContent = await vscode.workspace.fs.readDirectory(rootUri);
      } catch (error) {
        console.error(`Error reading directory ${rootUri.toString()}:`, error);
        fsContent = [];
      }
    }

    const recentFiles = vscode.workspace.textDocuments.map(
      (doc): RecentFile => ({
        uri: doc.uri.toString(),
        languageId: doc.languageId,
        isDirty: doc.isDirty,
      }),
    );

    return {
      workspaceFolders:
        workspaceFolders?.map((folder) => ({
          uri: folder.uri.toString(),
          name: folder.name,
        })) || [],
      workspaceFs: {
        rootContent: fsContent.map(([name, type]) => ({
          name,
          type:
            type === vscode.FileType.File
              ? 'file'
              : type === vscode.FileType.Directory
                ? 'directory'
                : type === vscode.FileType.SymbolicLink
                  ? 'symlink'
                  : 'unknown',
        })),
      },
      recentFiles,
      configuration: this.getConfig(),
    };
  }

  getConfig(): Record<string, unknown> {
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

  getWindowContext(): Record<string, unknown> {
    const activeEditor = vscode.window.activeTextEditor;
    const activeTerminal = vscode.window.activeTerminal;

    return {
      activeTextEditor: activeEditor
        ? {
            uri: activeEditor.document.uri.toString(),
            languageId: activeEditor.document.languageId,
            selection: {
              start: {
                line: activeEditor.selection.start.line,
                character: activeEditor.selection.start.character,
              },
              end: {
                line: activeEditor.selection.end.line,
                character: activeEditor.selection.end.character,
              },
              isReversed: activeEditor.selection.isReversed,
              isEmpty: activeEditor.selection.isEmpty,
              anchor: {
                line: activeEditor.selection.anchor.line,
                character: activeEditor.selection.anchor.character,
              },
              active: {
                line: activeEditor.selection.active.line,
                character: activeEditor.selection.active.character,
              },
            },
          }
        : undefined,
      textEditorDocument: activeEditor?.document
        ? {
            uri: activeEditor.document.uri.toString(),
            fileName: activeEditor.document.fileName,
            isDirty: activeEditor.document.isDirty,
            isUntitled: activeEditor.document.isUntitled,
            languageId: activeEditor.document.languageId,
            lineCount: activeEditor.document.lineCount,
            version: activeEditor.document.version,
            isClosed: activeEditor.document.isClosed,
            eol: activeEditor.document.eol === vscode.EndOfLine.LF ? 'LF' : 'CRLF',
            lineAt: activeEditor.document.lineAt(activeEditor.selection.start.line).text,
          }
        : undefined,
      textEditorSelection: activeEditor
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
      visibleTextEditors: vscode.window.visibleTextEditors.map((editor) => ({
        uri: editor.document.uri.toString(),
        languageId: editor.document.languageId,
      })),
      activeTerminal: activeTerminal
        ? {
            name: activeTerminal.name,
          }
        : undefined,
      terminals: vscode.window.terminals.map((terminal) => ({
        name: terminal.name,
      })),
      activeEditorSelections: activeEditor?.selections.map((selection) => ({
        start: {
          line: selection.start.line,
          character: selection.start.character,
        },
        end: {
          line: selection.end.line,
          character: selection.end.character,
        },
      })),
      onDidChangeActiveTextEditor: 'vscode.window.onDidChangeActiveTextEditor (Subscription)',
      onDidChangeWindowState: {
        isFocused: vscode.window.state.focused,
        // You can add more window state details here if needed
      },
      activeEditorLanguageId: activeEditor?.document.languageId,
    };
  }

  getLanguageContext(): Record<string, unknown> {
    const activeEditor = vscode.window.activeTextEditor;
    const activeDocument = activeEditor?.document;

    const availableLanguages = vscode.languages.getLanguages();
    let diagnostics: vscode.Diagnostic[] = [];
    if (activeDocument) {
      try {
        diagnostics = vscode.languages.getDiagnostics(activeDocument.uri);
      } catch (error) {
        console.error(`Error reading diagnostics ${activeDocument.uri.toString()}:`, error);
        diagnostics = [];
      }
    }
    const languageId = activeDocument?.languageId;

    const languageSelector = activeDocument
      ? {
          language: languageId,
          scheme: activeDocument.uri.scheme,
        }
      : null;

    return {
      activeEditorLanguageId: languageId,
      availableLanguages: availableLanguages,
      languageFeatures: {
        diagnostics: {
          count: diagnostics.length,
          items: diagnostics.map((d) => ({
            message: d.message,
            severity:
              d.severity === vscode.DiagnosticSeverity.Error
                ? 'Error'
                : d.severity === vscode.DiagnosticSeverity.Warning
                  ? 'Warning'
                  : d.severity === vscode.DiagnosticSeverity.Information
                    ? 'Information'
                    : d.severity === vscode.DiagnosticSeverity.Hint
                      ? 'Hint'
                      : 'Unknown',
            range: {
              start: {
                line: d.range.start.line,
                character: d.range.start.character,
              },
              end: {
                line: d.range.end.line,
                character: d.range.end.character,
              },
            },
          })),
        },
        capabilities: languageSelector
          ? {
              completion: vscode.languages.match(languageSelector, activeDocument!) > 0,
              hover: vscode.languages.match(languageSelector, activeDocument!) > 0,
              definition: vscode.languages.match(languageSelector, activeDocument!) > 0,
              references: vscode.languages.match(languageSelector, activeDocument!) > 0,
              documentSymbols: vscode.languages.match(languageSelector, activeDocument!) > 0,
              codeActions: vscode.languages.match(languageSelector, activeDocument!) > 0,
              formatting: vscode.languages.match(languageSelector, activeDocument!) > 0,
              rename: vscode.languages.match(languageSelector, activeDocument!) > 0,
              folding: vscode.languages.match(languageSelector, activeDocument!) > 0,
              documentHighlight: vscode.languages.match(languageSelector, activeDocument!) > 0,
              documentLinks: vscode.languages.match(languageSelector, activeDocument!) > 0,
              color: vscode.languages.match(languageSelector, activeDocument!) > 0,
              linkedEditing: vscode.languages.match(languageSelector, activeDocument!) > 0,
            }
          : null,
      },
    };
  }

  getDebugContext(): Record<string, unknown> {
    const activeSession = vscode.debug.activeDebugSession;
    const breakpoints = vscode.debug.breakpoints;

    return {
      activeDebugSession: activeSession
        ? {
            type: activeSession.type,
            name: activeSession.name,
            configuration: activeSession.configuration,
            workspaceFolder: activeSession.workspaceFolder?.uri.toString(),
            isAttach: activeSession.configuration?.request === 'attach',
            isLaunch: activeSession.configuration?.request === 'launch',
            customRequest:
              typeof activeSession.customRequest === 'function' ? 'Available' : 'Unavailable',
          }
        : undefined,
      breakpoints: {
        count: breakpoints.length,
        types: {
          source: breakpoints.filter((bp) => 'location' in bp).length,
          function: breakpoints.filter((bp) => 'functionName' in bp).length,
          log: breakpoints.filter((bp) => 'logMessage' in bp).length,
        },
      },
    };
  }

  async getSourceControlContext(): Promise<Record<string, unknown>> {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    const repositories = gitExtension?.exports.getAPI(1).repositories || [];
    return {
      repositories: repositories.map((repo: vscode.SourceControl) => ({
        id: repo.id,
        label: repo.label,
        rootUri: repo.rootUri?.toString(),
        count: repo.count,
        commitTemplate: repo.commitTemplate,
        acceptInputCommand: repo.acceptInputCommand?.command,
        statusBarCommands: repo.statusBarCommands?.map((cmd: vscode.Command) => cmd.command),
      })),
      sourceControlRootUri: vscode.workspace.workspaceFolders?.[0]?.uri.toString(),
    };
  }

  async getTasksContext(): Promise<Record<string, unknown>> {
    try {
      const tasks = await vscode.tasks.fetchTasks();
      return {
        tasks: tasks.map((task) => ({
          name: task.name,
          source: task.source,
          type: task.definition.type,
          scope: task.scope
            ? typeof task.scope === 'string'
              ? task.scope
              : (task.scope as vscode.WorkspaceFolder).uri.toString()
            : 'Global',
          execution:
            task.execution instanceof vscode.ShellExecution
              ? {
                  type: 'ShellExecution',
                  command: task.execution.command,
                  args: task.execution.args,
                }
              : task.execution instanceof vscode.ProcessExecution
                ? {
                    type: 'ProcessExecution',
                    process: task.execution.process,
                    args: task.execution.args,
                  }
                : {
                    type: 'Other',
                  },
          problemMatchers: task.problemMatchers,
          group: task.group ? task.group.id : undefined,
          presentationOptions: {
            echo: task.presentationOptions.echo,
            reveal: task.presentationOptions.reveal,
            focus: task.presentationOptions.focus,
            panel: task.presentationOptions.panel,
          },
        })),
      };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return {
        tasks: 'Error fetching tasks',
      };
    }
  }

  getExtensionContext(): Record<string, unknown> {
    const packageJson: PackageJson = {
      name: 'vscode-context',
      version: '0.0.6',
      publisher: 'your-name',
      displayName: 'VSCode Context',
      description: 'Provides VSCode context information',
      activationEvents: ['onCommand:vscode-context.extractContext'],
      main: './out/extension.js',
      engines: {
        vscode: '^1.96.0',
      },
    };
    const extension = vscode.extensions.getExtension(packageJson.name);

    return {
      version: packageJson.version,
      globalStateKeys: this.context.globalState.keys(),
      workspaceStateKeys: this.context.workspaceState.keys(),
      extensionPath: this.context.extensionPath,
      extensionInfo: {
        id: packageJson.name,
        publisher: packageJson.publisher,
        displayName: packageJson.displayName,
        description: packageJson.description,
        activationEvents: packageJson.activationEvents,
        main: packageJson.main,
        engines: packageJson.engines,
        isActive: extension?.isActive ?? false,
        packageJSON: extension?.packageJSON as Record<string, unknown>,
      },
    };
  }

  startTrackingTerminals(context: vscode.ExtensionContext) {
    // Track terminal creation and activity
    vscode.window.onDidOpenTerminal((terminal) => {
      const terminalInfo: TerminalInfo = {
        terminal,
        creationTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        inputCount: 0,
        outputCount: 0,
      };
      this.terminalTracker.active.set(terminal.name, terminalInfo);

      // Track terminal closing
      const closeDisposable = vscode.window.onDidCloseTerminal((closedTerminal) => {
        if (closedTerminal.name === terminal.name) {
          const info = this.terminalTracker.active.get(terminal.name);
          if (info) {
            const creationTime = new Date(info.creationTime);
            const closeTime = new Date();
            const lifetimeMs = closeTime.getTime() - creationTime.getTime();

            this.terminalTracker.history.push({
              name: terminal.name,
              creationTime: info.creationTime,
              lastActivity: info.lastActivity,
              inputCount: info.inputCount,
              outputCount: info.outputCount,
              lifetimeMs,
            });

            this.terminalTracker.active.delete(terminal.name);
          }
        }
      });

      context.subscriptions.push(closeDisposable);
    });
    // Track terminal destruction with lifetime calculation
    const onDidCloseTerminal = vscode.window.onDidCloseTerminal((terminal) => {
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
    });
    context.subscriptions.push(onDidCloseTerminal);
  }
}
