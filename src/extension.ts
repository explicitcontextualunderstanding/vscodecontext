import * as vscode from 'vscode';
import { ContextProvider } from './contextProvider';
import { errorMonitor } from './monitoring/errorMonitor';
import { handleError, withErrorHandling } from './utils/errorUtils';

let contextProvider: ContextProvider;
let outputChannel: vscode.OutputChannel;

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason) => {
  handleError(
    reason instanceof Error ? reason : new Error(String(reason)),
    { source: 'unhandledRejection' },
    outputChannel
  );
});

export async function activate(context: Readonly<vscode.ExtensionContext>): Promise<void> {
  try {
    outputChannel = vscode.window.createOutputChannel('VSCode Context');
    
    // Initialize context provider with error handling
    await withErrorHandling(
      async () => {
        contextProvider = new ContextProvider(context);
        contextProvider.logger.log('Extension "vscode-context" is now active!');
      },
      { operation: 'initializeContextProvider' },
      outputChannel
    );

    // Event subscriptions wrapped in error handling
    const subscribeToEvent = (
      eventName: string,
      registration: () => vscode.Disposable
    ): vscode.Disposable => {
      try {
        return registration();
      } catch (error) {
        handleError(
          error instanceof Error ? error : new Error(String(error)),
          { operation: 'subscribeToEvent', event: eventName },
          outputChannel
        );
        throw error;
      }
    };

    // Editor events
    const onDidChangeActiveTextEditor = subscribeToEvent(
      'onDidChangeActiveTextEditor',
      () => vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        await withErrorHandling(
          async () => {
            contextProvider.logger.log(`Active editor changed: ${editor?.document.uri.toString()}`);
          },
          { operation: 'handleEditorChange', uri: editor?.document.uri.toString() },
          outputChannel
        );
      })
    );

    const onDidChangeWindowState = subscribeToEvent(
      'onDidChangeWindowState',
      () => vscode.window.onDidChangeWindowState(async (state) => {
        await withErrorHandling(
          async () => {
            contextProvider.logger.log(
              `Window state changed: ${JSON.stringify({
                focused: state.focused,
                activeTerminal: vscode.window.activeTerminal?.name,
              })}`
            );
          },
          { operation: 'handleWindowStateChange' },
          outputChannel
        );
      })
    );

    // Command registrations with error handling
    const extractContextCommand = vscode.commands.registerCommand(
      'vscode-context.extractContext',
      async () => {
        await withErrorHandling(async () => {
          const config = vscode.workspace.getConfiguration('vscode-context');
          const includeCategories = config.get('includeCategories', [
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

          const contextData = await contextProvider.getAllContext(includeCategories);
          outputChannel.clear();
          outputChannel.appendLine('VSCode Context Data:');
          outputChannel.appendLine(JSON.stringify(contextData, null, 2));
          outputChannel.show(true);
        }, { operation: 'extractContext' }, outputChannel);
      }
    );

    const executeSampleCommand = vscode.commands.registerCommand(
      'vscode-context.executeSample',
      async () => {
        await withErrorHandling(
          async () => vscode.commands.executeCommand('workbench.action.quickOpen'),
          { operation: 'executeSample' },
          outputChannel
        );
      }
    );

    const createTerminalCommand = vscode.commands.registerCommand(
      'vscode-context.createTerminal',
      async () => {
        await withErrorHandling(async () => {
          const terminal = vscode.window.createTerminal('Cline Terminal');
          terminal.show();
          terminal.sendText('echo "Hello from Cline Terminal"');
        }, { operation: 'createTerminal' }, outputChannel);
      }
    );

    // Debug events with error handling
    const onDidStartDebugSession = subscribeToEvent(
      'onDidStartDebugSession',
      () => vscode.debug.onDidStartDebugSession(async (session) => {
        await withErrorHandling(
          async () => contextProvider.logger.log(`Debug session started: ${session.name}`),
          { operation: 'handleDebugStart', session: session.name },
          outputChannel
        );
      })
    );

    const onDidTerminateDebugSession = subscribeToEvent(
      'onDidTerminateDebugSession',
      () => vscode.debug.onDidTerminateDebugSession(async (session) => {
        await withErrorHandling(
          async () => contextProvider.logger.log(`Debug session terminated: ${session.name}`),
          { operation: 'handleDebugTerminate', session: session.name },
          outputChannel
        );
      })
    );

    // Start terminal tracking with error handling
    await withErrorHandling(
      async () => contextProvider.startTrackingTerminals(context),
      { operation: 'startTrackingTerminals' },
      outputChannel
    );

    // Register all disposables
    context.subscriptions.push(
      outputChannel,
      extractContextCommand,
      executeSampleCommand,
      createTerminalCommand,
      onDidChangeActiveTextEditor,
      onDidChangeWindowState,
      onDidStartDebugSession,
      onDidTerminateDebugSession
      // Add remaining disposables...
    );

  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    errorMonitor.trackError(err, { phase: 'activation' });
    handleError(err, { phase: 'activation' }, outputChannel);
    throw err; // Re-throw to notify VSCode of activation failure
  }
}

export async function deactivate(): Promise<void> {
  await withErrorHandling(async () => {
    if (contextProvider) {
      contextProvider.logger.log('Extension "vscode-context" is being deactivated');
      // Perform cleanup
      contextProvider = null!;
    }
    if (outputChannel) {
      outputChannel.dispose();
    }
  }, { operation: 'deactivate' }, outputChannel);
}
