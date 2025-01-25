import * as vscode from 'vscode';
import { ContextProvider } from './providers/ContextProvider';
import { withErrorHandling } from './utils/errorUtils';
import { WebviewProvider } from './webview/WebviewProvider';

export async function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel('VSCode Context');
  context.subscriptions.push(outputChannel);

  const contextProvider = new ContextProvider();

  // Start terminal tracking
  const terminalTracking: { disposable: vscode.Disposable } =
    (await withErrorHandling(
      async () => {
        const disposable = await contextProvider.startTrackingTerminals();
        return { disposable: disposable ?? { dispose: () => {} } };
      },
      { operation: 'startTrackingTerminals' },
      outputChannel,
    )) ?? { disposable: { dispose: () => {} } };

  const terminalDisposable = terminalTracking.disposable;

  const webviewProvider = new WebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'vscodeContext.webview',
      webviewProvider,
    ),
  );

  context.subscriptions.push(terminalDisposable);
}

export function deactivate() {
  // Clean up resources on deactivation
}
