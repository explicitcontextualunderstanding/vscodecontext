import * as vscode from 'vscode';
import { ContextProvider } from './contextProvider';

let contextProvider: ContextProvider;

export function activate(context: vscode.ExtensionContext): void {
  contextProvider = new ContextProvider(context);
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
      const includeCategories = vscode.workspace
        .getConfiguration('vscode-context')
        .get('includeCategories', [
          'workspace',
          'window',
          'language',
          'debug',
          'sourceControl',
          'tasks',
          'extension',
          'extensionHost',
          'settings',
          'keybindings',
          'theme',
          'views',
          'customEditors',
        ]);
      try {
        const contextData = await contextProvider.getAllContext(includeCategories);
        const outputChannel = vscode.window.createOutputChannel('VSCode Context');
        outputChannel.clear();
        outputChannel.appendLine('VSCode Context Data:');
        outputChannel.appendLine(JSON.stringify(contextData, null, 2));
        outputChannel.show(true);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to extract context: ${error}`);
      }
    },
  );

  const executeSampleCommand = vscode.commands.registerCommand(
    'vscode-context.executeSample',
    async () => {
      await vscode.commands.executeCommand('workbench.action.quickOpen');
    },
  );

  const createTerminalCommand = vscode.commands.registerCommand(
    'vscode-context.createTerminal',
    () => {
      const terminal = vscode.window.createTerminal('Cline Terminal');
      terminal.show();
      terminal.sendText('echo "Hello from Cline Terminal"');
    },
  );

  // Add debug context monitoring
  const onDidStartDebugSession = vscode.debug.onDidStartDebugSession((session) => {
    console.log('Debug session started:', session.name);
  });

  const onDidTerminateDebugSession = vscode.debug.onDidTerminateDebugSession((session) => {
    console.log('Debug session terminated:', session.name);
  });

  const onDidChangeBreakpoints = vscode.debug.onDidChangeBreakpoints((e) => {
    console.log('Breakpoints changed:', e.added, e.removed, e.changed);
  });

  // Add window state tracking
  const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(
    (e: vscode.TextEditorSelectionChangeEvent) => {
      console.log('Text editor selection changed:', e.textEditor.document.uri);
    },
  );

  const onDidChangeTextEditorVisibleRanges = vscode.window.onDidChangeTextEditorVisibleRanges(
    (e: vscode.TextEditorVisibleRangesChangeEvent) => {
      console.log('Text editor visible ranges changed:', e.textEditor.document.uri);
    },
  );

  const onDidChangeTextEditorViewColumn = vscode.window.onDidChangeTextEditorViewColumn(
    (e: vscode.TextEditorViewColumnChangeEvent) => {
      console.log('Text editor view column changed:', e.textEditor.document.uri);
    },
  );

  // Add language feature monitoring
  const onDidChangeDiagnostics = vscode.languages.onDidChangeDiagnostics(
    (e: vscode.DiagnosticChangeEvent) => {
      console.log(
        'Diagnostics changed:',
        e.uris.map((uri: vscode.Uri) => uri.toString()),
      );
    },
  );

  // Add extension context usage
  const onDidChangeExtensions = vscode.extensions.onDidChange(() => {
    console.log('Extensions changed');
  });

  // Add workspace file monitoring
  const onDidCreateFiles = vscode.workspace.onDidCreateFiles((e: vscode.FileCreateEvent) => {
    console.log(
      'Files created:',
      e.files.map((f: vscode.Uri) => f.toString()),
    );
  });

  const onDidDeleteFiles = vscode.workspace.onDidDeleteFiles((e: vscode.FileDeleteEvent) => {
    console.log(
      'Files deleted:',
      e.files.map((f: vscode.Uri) => f.toString()),
    );
  });

  const onDidRenameFiles = vscode.workspace.onDidRenameFiles((e: vscode.FileRenameEvent) => {
    console.log(
      'Files renamed:',
      e.files.map((f) => `${f.oldUri} -> ${f.newUri}`),
    );
  });

  // Add configuration monitoring
  const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(() => {
    console.log('Configuration changed');
  });

  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
    (e: vscode.TextDocumentChangeEvent) => {
      console.log('Text document changed:', e.document.uri);
    },
  );

  const onDidChangeWorkspaceFolders = vscode.workspace.onDidChangeWorkspaceFolders(
    (e: vscode.WorkspaceFoldersChangeEvent) => {
      console.log(
        'Workspace folders changed:',
        e.added.map((folder) => folder.uri.toString()),
        e.removed.map((folder) => folder.uri.toString()),
      );
    },
  );

  contextProvider.startTrackingTerminals(context);

  context.subscriptions.push(
    extractContextCommand,
    executeSampleCommand,
    createTerminalCommand,
    onDidChangeActiveTextEditor,
    onDidChangeWindowState,
    onDidStartDebugSession,
    onDidTerminateDebugSession,
    onDidChangeBreakpoints,
    onDidChangeTextEditorSelection,
    onDidChangeTextEditorVisibleRanges,
    onDidChangeTextEditorViewColumn,
    onDidChangeDiagnostics,
    onDidChangeExtensions,
    onDidCreateFiles,
    onDidDeleteFiles,
    onDidRenameFiles,
    onDidChangeConfiguration,
    onDidChangeTextDocument,
    onDidChangeWorkspaceFolders,
  );
}

export function deactivate(): void {}
