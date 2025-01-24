import type * as vscode from 'vscode';
/**
 * Minimal mock of VS Code's ExtensionContext
 * Only includes properties required for our tests
 */
declare class MockExtensionContext implements vscode.ExtensionContext {
    subscriptions: {
        dispose(): void;
    }[];
    extensionPath: string;
    storagePath: string | undefined;
    globalStoragePath: string;
    logPath: string;
    extensionUri: vscode.Uri;
    extension: vscode.Extension<unknown>;
    languageModelAccessInformation: vscode.LanguageModelAccessInformation;
    environmentVariableCollection: vscode.EnvironmentVariableCollection & {
        getScoped(scope: vscode.EnvironmentVariableScope): vscode.EnvironmentVariableCollection;
    };
    globalState: vscode.Memento & {
        setKeysForSync(keys: readonly string[]): void;
    };
    workspaceState: vscode.Memento;
    secrets: vscode.SecretStorage;
    globalStorageUri: vscode.Uri;
    logUri: vscode.Uri;
    extensionMode: vscode.ExtensionMode;
    storageUri: vscode.Uri;
    asAbsolutePath(relativePath: string): string;
}
declare const vscodeExports: {
    readonly ExtensionContext: typeof MockExtensionContext;
};
export = vscodeExports;
