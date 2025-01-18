import * as vscode from 'vscode';

let extensionContext: vscode.ExtensionContext;

export function activate(context: vscode.ExtensionContext): void {
  extensionContext = context;
  console.log('Congratulations, your extension "vscode-context" is now active!');

  // Event subscriptions
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
    console.log('Active editor changed:', editor?.document.uri.toString());
  });

  const onDidChangeWindowState = vscode.window.onDidChangeWindowState((state) => {
    console.log('Window state changed:', {
      focused: state.focused,
      activeTerminal: vscode.window.activeTerminal?.name,
    });
  });

  // Command registration
  const extractContextCommand = vscode.commands.registerCommand(
    'vscode-context.extractContext',
    async () => {
      const contextData = await getAllContext();
      const outputChannel = vscode.window.createOutputChannel('VSCode Context');
      outputChannel.clear();
      outputChannel.appendLine('VSCode Context Data:');
      outputChannel.appendLine(JSON.stringify(contextData, null, 2));
      outputChannel.show(true);
    }
  );

  const executeSampleCommand = vscode.commands.registerCommand(
    'vscode-context.executeSample',
    async () => {
      await vscode.commands.executeCommand('workbench.action.quickOpen');
    }
  );

  const createTerminalCommand = vscode.commands.registerCommand(
    'vscode-context.createTerminal',
    () => {
      const terminal = vscode.window.createTerminal('Cline Terminal');
      terminal.show();
      terminal.sendText('echo "Hello from Cline Terminal"');
    }
  );

  context.subscriptions.push(
    extractContextCommand,
    executeSampleCommand,
    createTerminalCommand,
    onDidChangeActiveTextEditor,
    onDidChangeWindowState
  );
}

export function deactivate(): void {}

async function getAllContext(): Promise<Record<string, unknown>> {
  return {
    workspace: await getWorkspaceContext(),
    window: getWindowContext(),
    language: getLanguageContext(),
    debug: getDebugContext(),
    sourceControl: getSourceControlContext(),
    tasks: await getTasksContext(),
    extension: getExtensionContext(extensionContext),
    extensionHost: getExtensionHostContext(),
    settings: getSettingsContext(),
    keybindings: getKeybindingsContext(),
    theme: getThemeContext(),
    views: getViewsContext(),
    customEditors: getCustomEditorsContext(),
  };
}

function getExtensionHostContext(): Record<string, unknown> {
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

function getSettingsContext(): Record<string, unknown> {
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

function getKeybindingsContext(): unknown[] {
  return [];
}

function getThemeContext(): Record<string, unknown> {
  const theme = vscode.window.activeColorTheme;
  return {
    kind:
      theme.kind === vscode.ColorThemeKind.Light
        ? 'Light'
        : theme.kind === vscode.ColorThemeKind.Dark
        ? 'Dark'
        : 'HighContrast',
    customizations: vscode.workspace
      .getConfiguration('workbench')
      .get('colorCustomizations'),
  };
}

function getViewsContext(): Record<string, unknown> {
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

function getCustomEditorsContext(): Record<string, unknown>[] {
  const customEditors = vscode.window.visibleTextEditors.filter(
    (editor) =>
      editor.document.uri.scheme !== 'file' &&
      editor.document.uri.scheme !== 'untitled'
  );
  return customEditors.map((editor) => ({
    uri: editor.document.uri.toString(),
    scheme: editor.document.uri.scheme,
    languageId: editor.document.languageId,
    viewColumn: editor.viewColumn,
  }));
}

async function getWorkspaceContext(): Promise<Record<string, unknown>> {
  const rootUri = vscode.workspace.workspaceFolders?.[0]?.uri;
  const fsContent = rootUri
    ? await vscode.workspace.fs.readDirectory(rootUri)
    : [];

  return {
    workspaceFolders: vscode.workspace.workspaceFolders?.map((folder) => ({
      uri: folder.uri.toString(),
    })),
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
    configuration: getConfig(),
  };
}

function getConfig(): Record<string, unknown> {
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

function getWindowContext(): Record<string, unknown> {
  const activeEditor = vscode.window.activeTextEditor;

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
          eol:
            activeEditor.document.eol === vscode.EndOfLine.LF ? 'LF' : 'CRLF',
          lineAt: activeEditor.document.lineAt(
            activeEditor.selection.start.line
          ).text,
        }
      : undefined,
    textEditorSelection: vscode.window.activeTextEditor
      ? {
          start: {
            line: vscode.window.activeTextEditor.selection.start.line,
            character: vscode.window.activeTextEditor.selection.start.character,
          },
          end: {
            line: vscode.window.activeTextEditor.selection.end.line,
            character: vscode.window.activeTextEditor.selection.end.character,
          },
        }
      : undefined,
    visibleTextEditors: vscode.window.visibleTextEditors.map((editor) => ({
      uri: editor.document.uri.toString(),
      languageId: editor.document.languageId,
    })),
    activeTerminal: vscode.window.activeTerminal
      ? {
          name: vscode.window.activeTerminal.name,
        }
      : undefined,
    terminals: vscode.window.terminals.map((terminal) => ({
      name: terminal.name,
    })),
    activeEditorSelections: vscode.window.activeTextEditor?.selections.map(
      (selection) => ({
        start: {
          line: selection.start.line,
          character: selection.start.character,
        },
        end: {
          line: selection.end.line,
          character: selection.end.character,
        },
      })
    ),
    onDidChangeActiveTextEditor:
      'vscode.window.onDidChangeActiveTextEditor (Subscription)',
    onDidChangeWindowState:
      'vscode.window.onDidChangeWindowState (Subscription)',
    activeEditorLanguageId: vscode.window.activeTextEditor?.document.languageId,
  };
}

function getLanguageContext(): Record<string, unknown> {
  const activeEditor = vscode.window.activeTextEditor;
  const activeDocument = activeEditor?.document;

  if (!activeDocument) {
    return {
      activeEditorLanguageId: undefined,
      availableLanguages: vscode.languages.getLanguages(),
      languageFeatures: undefined,
    };
  }

  const languageId = activeDocument.languageId;
  const diagnostics = vscode.languages.getDiagnostics(activeDocument.uri);

  const languageSelector = {
    language: languageId,
    scheme: activeDocument.uri.scheme,
  };

  return {
    activeEditorLanguageId: languageId,
    availableLanguages: vscode.languages.getLanguages(),
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
      capabilities: {
        completion: vscode.languages.match(languageSelector, activeDocument) > 0,
        hover: vscode.languages.match(languageSelector, activeDocument) > 0,
        definition: vscode.languages.match(languageSelector, activeDocument) > 0,
        references: vscode.languages.match(languageSelector, activeDocument) > 0,
        documentSymbols:
          vscode.languages.match(languageSelector, activeDocument) > 0,
        codeActions:
          vscode.languages.match(languageSelector, activeDocument) > 0,
        formatting:
          vscode.languages.match(languageSelector, activeDocument) > 0,
        rename: vscode.languages.match(languageSelector, activeDocument) > 0,
        folding: vscode.languages.match(languageSelector, activeDocument) > 0,
        documentHighlight:
          vscode.languages.match(languageSelector, activeDocument) > 0,
        documentLinks:
          vscode.languages.match(languageSelector, activeDocument) > 0,
        color: vscode.languages.match(languageSelector, activeDocument) > 0,
        linkedEditing:
          vscode.languages.match(languageSelector, activeDocument) > 0,
      },
    },
  };
}

function getDebugContext(): Record<string, unknown> {
  const activeSession = vscode.debug.activeDebugSession;
  const breakpoints = vscode.debug.breakpoints;

  if (!activeSession) {
    return {
      activeDebugSession: undefined,
      sessions: [],
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

  return {
    activeDebugSession: {
      type: activeSession.type,
      name: activeSession.name,
      configuration: activeSession.configuration,
      workspaceFolder: activeSession.workspaceFolder?.uri.toString(),
      isAttach: activeSession.configuration?.request === 'attach',
      isLaunch: activeSession.configuration?.request === 'launch',
      customRequest:
        typeof activeSession.customRequest === 'function'
          ? 'Available'
          : 'Unavailable',
    },
    sessions: [
      {
        type: activeSession.type,
        name: activeSession.name,
        configuration: activeSession.configuration,
      },
    ],
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

function getSourceControlContext(): Record<string, unknown> {
  const repo = vscode.workspace.workspaceFolders?.[0]?.uri;

  if (!repo) {
    return {
      repositories: [],
      sourceControlRootUri: undefined,
    };
  }

  return {
    repositories: [
      {
        rootUri: repo.toString(),
        providerId: 'vscode-context',
        state: {
          hasUncommittedChanges: false,
          hasStagedChanges: false,
          hasMergeConflicts: false,
          currentBranch: 'main',
        },
      },
    ],
    sourceControlRootUri: repo.toString(),
  };
}

async function getTasksContext(): Promise<Record<string, unknown>> {
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
    return {
      tasks: 'Error fetching tasks',
    };
  }
}

interface PackageJson {
  name: string;
  version: string;
  publisher: string;
  displayName: string;
  description: string;
  activationEvents: string[];
  main: string;
  engines: Record<string, string>;
}

function getExtensionContext(
  context: vscode.ExtensionContext
): Record<string, unknown> {
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
    globalStateKeys: context.globalState.keys(),
    workspaceStateKeys: context.workspaceState.keys(),
    extensionPath: context.extensionPath,
    extensionInfo: {
      id: packageJson.name,
      publisher: packageJson.publisher,
      displayName: packageJson.displayName,
      description: packageJson.description,
      activationEvents: packageJson.activationEvents,
      main: packageJson.main,
      engines: packageJson.engines,
      isActive: extension?.isActive ?? false,
      packageJSON: extension?.packageJSON,
    },
  };
}