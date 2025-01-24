import * as crypto from 'crypto';
import * as vscode from 'vscode';
import { withErrorHandling } from '../utils/errorUtils';
export class WebviewProvider {
    constructor(extensionUri) {
        this._extensionUri = extensionUri;
        this._outputChannel = vscode.window.createOutputChannel('VSCode Context Webview');
    }
    resolveWebviewView(webviewView) {
        this._view = webviewView;
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage((message) => {
            void withErrorHandling(() => Promise.resolve(this.handleMessage(message)), {
                operation: 'webviewOnDidReceiveMessage',
                context: { message: message },
            }, this._outputChannel);
        });
    }
    _getHtmlForWebview(webview) {
        const scriptUri = webview
            .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src/webview/media', 'main.js'))
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
    handleMessage(message) {
        this._outputChannel.appendLine(`Received webview message: ${JSON.stringify(message)}`);
    }
}
function getNonce() {
    // Generate cryptographically secure random bytes (32 bytes = 256 bits)
    const bytes = crypto.randomBytes(32);
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(bytes)
        .map((byte) => possible[byte % possible.length])
        .join('');
}
//# sourceMappingURL=WebviewProvider.js.map