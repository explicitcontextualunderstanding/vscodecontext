import * as vscode from 'vscode';
import { withErrorHandling } from '../utils/errorUtils';
import { VSCodeContextError } from '../errors/VSCodeContextError';

import { errorMonitor } from '../monitoring/errorMonitor';

interface WebviewError {
  message?: string;
  stack?: string;
  componentStack?: string;
}

interface WebviewMessage {
  command: string;
  text?: string;
  error?: WebviewError;
}

export class WebviewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: vscode.WebviewViewResolveContext<unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _token: vscode.CancellationToken,
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await withErrorHandling(async () => this.handleMessage(message));
    });
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    if (!this._view) {
      throw new VSCodeContextError('Webview not initialized', 'WEBVIEW_ERROR');
    }

    try {
      switch (message.command) {
        case 'alert':
          if (message.text) {
            vscode.window.showErrorMessage(message.text);
          }
          return;
        case 'error': {
          // Track webview errors
          const error = new VSCodeContextError(
            message.error?.message || 'Unknown webview error',
            'WEBVIEW_ERROR',
          );
          errorMonitor.trackError(error, {
            stack: message.error?.stack,
            componentStack: message.error?.componentStack,
            source: 'webview',
          });
          return;
        }
        default:
          throw new VSCodeContextError(`Unknown command: ${message.command}`, 'WEBVIEW_ERROR');
      }
    } catch (error) {
      errorMonitor.trackError(error instanceof Error ? error : new Error(String(error)), {
        source: 'webview',
        command: message.command,
      });
      throw error;
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'),
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Webview</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}

export class WebviewErrorBoundary extends Error {
  constructor(
    message: string,
    public componentStack: string,
  ) {
    super(message);
    this.name = 'WebviewErrorBoundary';
  }
}
