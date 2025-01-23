import type * as vscode from 'vscode';

/**
 * Minimal mock of VS Code's ExtensionContext
 * Only includes properties required for our tests
 */
class MockExtensionContext implements vscode.ExtensionContext {
  subscriptions: { dispose(): void }[] = [];
  extensionPath: string = '/test/path';
  storagePath: string | undefined = '/test/storage';
  globalStoragePath: string = '/test/global-storage';
  logPath: string = '/test/log';

  extensionUri: vscode.Uri = {} as vscode.Uri;

  extension: vscode.Extension<unknown> = {} as vscode.Extension<unknown>;

  languageModelAccessInformation: vscode.LanguageModelAccessInformation = {} as vscode.LanguageModelAccessInformation;

  environmentVariableCollection: vscode.EnvironmentVariableCollection & {
    getScoped(scope: vscode.EnvironmentVariableScope): vscode.EnvironmentVariableCollection;
  } = {
    persistent: true,
    description: 'Mock environment variables',
    replace: () => undefined,
    append: () => undefined,
    prepend: () => undefined,
    get: () => undefined,
    forEach: () => undefined,
    delete: () => undefined,
    clear: () => undefined,
    getScoped: () => ({}) as vscode.EnvironmentVariableCollection,
    [Symbol.iterator]: function* () {
      yield [
        'TEST_VAR',
        {
          value: 'test',
          type: 1 as vscode.EnvironmentVariableMutatorType,
          options: {
            applyAtProcessCreation: true,
            applyAtShellIntegration: true,
          },
        } as vscode.EnvironmentVariableMutator,
      ];
    },
  };

  globalState: vscode.Memento & { setKeysForSync(keys: readonly string[]): void } = {
    get: () => undefined,
    update: () => Promise.resolve(),
    setKeysForSync: () => undefined,
    keys: () => [],
  };

  workspaceState: vscode.Memento = {
    get: () => undefined,
    update: () => Promise.resolve(),
    keys: () => [],
  };

  secrets: vscode.SecretStorage = {
    store: () => Promise.resolve(),
    get: () => Promise.resolve(undefined),
    delete: () => Promise.resolve(),
    onDidChange: {} as vscode.Event<vscode.SecretStorageChangeEvent>,
  };

  globalStorageUri: vscode.Uri = {} as vscode.Uri;
  logUri: vscode.Uri = {} as vscode.Uri;
  extensionMode: vscode.ExtensionMode = 1;
  storageUri: vscode.Uri = {} as vscode.Uri;

  asAbsolutePath(relativePath: string): string {
    return `/test/path/${relativePath}`;
  }
}

const vscodeExports = {
  ExtensionContext: MockExtensionContext,
} as const;

export = vscodeExports;