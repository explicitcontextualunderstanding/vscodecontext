import * as vscode from 'vscode';
import { ContextProvider } from './contextProvider';

let contextProvider: ContextProvider;

export function activate(context: vscode.ExtensionContext): void {
  contextProvider = new ContextProvider(context);
  contextProvider.logger.log('Congratulations, your extension "vscode-context" is now active!');

  // Event subscriptions
  const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor((editor) => {
    contextProvider.logger.log(`Active editor changed: ${editor?.document.uri.toString()}`);
  });

  const onDidChangeWindowState = vscode.window.onDidChangeWindowState((state) => {
    contextProvider.logger.log(
      `Window state changed: ${JSON.stringify({
        focused: state.focused,
        activeTerminal: vscode.window.activeTerminal?.name,
      })}`,
    );
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
    contextProvider.logger.log(`Debug session started: ${session.name}`);
  });

  const onDidTerminateDebugSession = vscode.debug.onDidTerminateDebugSession((session) => {
    contextProvider.logger.log(`Debug session terminated: ${session.name}`);
  });

  const onDidChangeBreakpoints = vscode.debug.onDidChangeBreakpoints((e) => {
    contextProvider.logger.log(
      `Breakpoints changed: added=${e.added}, removed=${e.removed}, changed=${e.changed}`,
    );
  });

  // Add window state tracking
  const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(
    (e: vscode.TextEditorSelectionChangeEvent) => {
      contextProvider.logger.log(`Text editor selection changed: ${e.textEditor.document.uri}`);
    },
  );

  const onDidChangeTextEditorVisibleRanges = vscode.window.onDidChangeTextEditorVisibleRanges(
    (e: vscode.TextEditorVisibleRangesChangeEvent) => {
      contextProvider.logger.log(
        `Text editor visible ranges changed: ${e.textEditor.document.uri}`,
      );
    },
  );

  const onDidChangeTextEditorViewColumn = vscode.window.onDidChangeTextEditorViewColumn(
    (e: vscode.TextEditorViewColumnChangeEvent) => {
      contextProvider.logger.log(`Text editor view column changed: ${e.textEditor.document.uri}`);
    },
  );

  // Add language feature monitoring
  const onDidChangeDiagnostics = vscode.languages.onDidChangeDiagnostics(
    (e: vscode.DiagnosticChangeEvent) => {
      contextProvider.logger.log(
        `Diagnostics changed: ${e.uris.map((uri: vscode.Uri) => uri.toString()).join(', ')}`,
      );
    },
  );

  // Add extension context usage
  const onDidChangeExtensions = vscode.extensions.onDidChange(() => {
    contextProvider.logger.log('Extensions changed');
  });

  // Add workspace file monitoring
  const onDidCreateFiles = vscode.workspace.onDidCreateFiles((e: vscode.FileCreateEvent) => {
    contextProvider.logger.log(
      `Files created: ${e.files.map((f: vscode.Uri) => f.toString()).join(', ')}`,
    );
  });

  const onDidDeleteFiles = vscode.workspace.onDidDeleteFiles((e: vscode.FileDeleteEvent) => {
    contextProvider.logger.log(
      `Files deleted: ${e.files.map((f: vscode.Uri) => f.toString()).join(', ')}`,
    );
  });

  const onDidRenameFiles = vscode.workspace.onDidRenameFiles((e: vscode.FileRenameEvent) => {
    const renameMessages = e.files.map((f) => `${f.oldUri} -> ${f.newUri}`);
    contextProvider.logger.log(`Files renamed: ${renameMessages.join(', ')}`);
  });

  // Add configuration monitoring
  const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration(() => {
    contextProvider.logger.log('Configuration changed');
  });

  const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument(
    (e: vscode.TextDocumentChangeEvent) => {
      contextProvider.logger.log(`Text document changed: ${e.document.uri}`);
    },
  );

  const onDidChangeWorkspaceFolders = vscode.workspace.onDidChangeWorkspaceFolders(
    (e: vscode.WorkspaceFoldersChangeEvent) => {
      contextProvider.logger.log(
        `Workspace folders changed: added=${e.added.map((folder) => folder.uri.toString()).join(', ')}, removed=${e.removed.map((folder) => folder.uri.toString()).join(', ')}`,
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

export function deactivate(): void {
  if (contextProvider) {
    contextProvider.logger.log('Extension "vscode-context" is being deactivated');
    // Perform any necessary cleanup
    contextProvider = null!;
  }
}
