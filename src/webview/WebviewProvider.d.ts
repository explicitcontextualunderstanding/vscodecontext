import * as vscode from 'vscode';
export declare class WebviewProvider implements vscode.WebviewViewProvider {
  private readonly _extensionUri;
  private readonly _outputChannel;
  constructor(extensionUri: vscode.Uri);
  resolveWebviewView(webviewView: vscode.WebviewView): void;
  private _getHtmlForWebview;
  handleMessage(message: unknown): void;
}
