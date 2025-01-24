import * as crypto from 'crypto';

import * as vscode from 'vscode';

import { withErrorHandling } from '../utils/errorUtils.js';

export class WebviewProvider implements vscode.WebviewViewProvider {
  private readonly _extensionUri: vscode.Uri;
  private readonly _outputChannel: vscode.OutputChannel;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
    this._outputChannel = vscode.window.createOutputChannel(
      'VSCode Context Webview',
    );
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message: unknown) => {
      void withErrorHandling(
        () => Promise.resolve(this.handleMessage(message)),
        {
          operation: 'webviewOnDidReceiveMessage',
          context: { message: message },
        },
        this._outputChannel,
      );
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview
      .asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'src/webview/media', 'main.js'),
      )
      .toString();

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cat Coding</title>
    </head>
    <body>
        <div class="container">
            <h1>Context Data</h1>
        </div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
    </html>`;
  }

  public handleMessage(message: unknown): void {
    this._outputChannel.appendLine(
      `Received webview message: ${JSON.stringify(message)}`,
    );
  }
}

function getNonce(): string {
  // Generate cryptographically secure random bytes (32 bytes = 256 bits)
  const bytes = crypto.randomBytes(32);
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(bytes)
    .map((byte) => possible[byte % possible.length])
    .join('');
}
