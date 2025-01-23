/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-floating-promises, @typescript-eslint/await-thenable */
import * as vscode from 'vscode';

import { ContextProvider } from './contextProvider';
import { errorMonitor } from './monitoring/errorMonitor';
import { handleError, withErrorHandling } from './utils/errorUtils';
import { WebviewProvider } from './webview/WebviewProvider';

let contextProvider: ContextProvider;
let outputChannel: vscode.OutputChannel;

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  handleError(
    err,
    {
      operation: 'unhandledRejectionHandler',
      source: 'process',
    },
    outputChannel,
  );
});

async function initializeContextProvider(context: vscode.ExtensionContext): Promise<void> {
  contextProvider = new ContextProvider(context);
  contextProvider.info('Extension activated');
}

function subscribeToEvent(
  eventName: string,
  registration: () => vscode.Disposable,
): vscode.Disposable {
  try {
    return registration();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    handleError(err, { operation: 'subscribeToEvent', event: eventName }, outputChannel);
    throw err;
  }
}

async function handleEditorChange(editor: vscode.TextEditor | undefined): Promise<void> {
  await withErrorHandling(
    () => {
      contextProvider.info(`Active editor changed: ${editor?.document.uri.toString()}`, {
        uri: editor?.document.uri.toString(),
        language: editor?.document.languageId,
      });
      return Promise.resolve();
    },
    { operation: 'handleEditorChange', uri: editor?.document.uri.toString() },
    outputChannel,
  );
}

async function handleWindowStateChange(state: vscode.WindowState): Promise<void> {
  await withErrorHandling(
    () => {
      return Promise.resolve().then(() => {
        contextProvider.info('Window state changed', {
          focused: state.focused,
          activeTerminal: vscode.window.activeTerminal?.name,
        });
      });
    },
    { operation: 'handleWindowStateChange' },
    outputChannel,
  );
}

async function extractContext(): Promise<void> {
  if (!contextProvider) {
    vscode.window.showErrorMessage('Context provider not initialized');
    return;
  }

  try {
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
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    outputChannel.appendLine(`ERROR: ${err.message}`);
    outputChannel.show(true);
    vscode.window.showErrorMessage(`Failed to extract context: ${err.message}`);
  }
}

async function executeSampleCommand(): Promise<void> {
  await withErrorHandling(
    async () => vscode.commands.executeCommand('workbench.action.quickOpen'),
    { operation: 'executeSample' },
    outputChannel,
  );
}

async function createTerminal(): Promise<void> {
  await withErrorHandling(
    async () => {
      const terminal = vscode.window.createTerminal('Cline Terminal');
      terminal.show();
      terminal.sendText('echo "Hello from Cline Terminal"');
    },
    { operation: 'createTerminal' },
    outputChannel,
  );
}

async function handleDebugStart(session: vscode.DebugSession): Promise<void> {
  await withErrorHandling(
    async () =>
      contextProvider.info(`Debug session started: ${session.name}`, {
        type: session.type,
        name: session.name,
      }),
    { operation: 'handleDebugStart', session: session.name },
    outputChannel,
  );
}

async function handleDebugTerminate(session: vscode.DebugSession): Promise<void> {
  await withErrorHandling(
    async () =>
      contextProvider.info(`Debug session terminated: ${session.name}`, {
        type: session.type,
        name: session.name,
      }),
    { operation: 'handleDebugTerminate', session: session.name },
    outputChannel,
  );
}

async function registerWebview(
  context: vscode.ExtensionContext,
): Promise<{ provider: WebviewProvider; registration: vscode.Disposable }> {
  return (await withErrorHandling(
    async () => {
      const provider = new WebviewProvider(context.extensionUri);
      const registration = vscode.window.registerWebviewViewProvider(
        'vscode-context.webview',
        provider,
      );
      return { provider, registration };
    },
    { operation: 'registerWebview' },
    outputChannel,
  )) as { provider: WebviewProvider; registration: vscode.Disposable };
}

export async function activate(context: Readonly<vscode.ExtensionContext>): Promise<void> {
  try {
    outputChannel = vscode.window.createOutputChannel('VSCode Context');

    await withErrorHandling(
      () => initializeContextProvider(context),
      { operation: 'initializeContextProvider' },
      outputChannel,
    );

    const onDidChangeActiveTextEditor = subscribeToEvent('onDidChangeActiveTextEditor', () =>
      vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        await handleEditorChange(editor);
      }),
    );

    const onDidChangeWindowState = subscribeToEvent('onDidChangeWindowState', () =>
      vscode.window.onDidChangeWindowState((state) => {
        void handleWindowStateChange(state);
      }),
    );

    const extractContextCommand = vscode.commands.registerCommand(
      'vscode-context.extractContext',
      async () => {
        if (!contextProvider) {
          vscode.window.showErrorMessage(
            'Context provider not initialized - extension activation failed',
          );
          return;
        }
        await extractContext();
      },
    );

    const executeSampleCommandRegistration = vscode.commands.registerCommand(
      'vscode-context.executeSample',
      async () => {
        await executeSampleCommand();
      },
    );

    const createTerminalCommand = vscode.commands.registerCommand(
      'vscode-context.createTerminal',
      async () => {
        await createTerminal();
      },
    );

    const onDidStartDebugSession = subscribeToEvent('onDidStartDebugSession', () =>
      vscode.debug.onDidStartDebugSession(async (session) => {
        await handleDebugStart(session);
      }),
    );

    const onDidTerminateDebugSession = subscribeToEvent('onDidTerminateDebugSession', () =>
      vscode.debug.onDidTerminateDebugSession(async (session) => {
        await handleDebugTerminate(session);
      }),
    );

    await withErrorHandling(
      async () => contextProvider.startTrackingTerminals(),
      { operation: 'startTrackingTerminals' },
      outputChannel,
    );

    const webviewProvider = await registerWebview(context);

    context.subscriptions.push(
      outputChannel,
      extractContextCommand,
      executeSampleCommandRegistration,
      createTerminalCommand,
      onDidChangeActiveTextEditor,
      onDidChangeWindowState,
      onDidStartDebugSession,
      onDidTerminateDebugSession,
      webviewProvider.registration,
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    errorMonitor.trackError(err, { phase: 'activation' });
    handleError(
      err,
      {
        operation: 'extensionActivation',
        phase: 'activation',
      },
      outputChannel,
    );
    throw err;
  }
}

export async function deactivate(): Promise<void> {
  await withErrorHandling(
    async () => {
      if (contextProvider) {
        contextProvider.info('Extension "vscode-context" is being deactivated', {
          timestamp: new Date().toISOString(),
        });
        contextProvider = null!;
      }
      if (outputChannel) {
        outputChannel.dispose();
      }
    },
    { operation: 'deactivate' },
    outputChannel,
  );
}
