/**
 * Minimal mock of VS Code's ExtensionContext
 * Only includes properties required for our tests
 */
class MockExtensionContext {
  constructor() {
    this.subscriptions = [];
    this.extensionPath = '/test/path';
    this.storagePath = '/test/storage';
    this.globalStoragePath = '/test/global-storage';
    this.logPath = '/test/log';
    this.extensionUri = {};
    this.extension = {};
    this.languageModelAccessInformation = {};
    this.environmentVariableCollection = {
      persistent: true,
      description: 'Mock environment variables',
      replace: () => undefined,
      append: () => undefined,
      prepend: () => undefined,
      get: () => undefined,
      forEach: () => undefined,
      delete: () => undefined,
      clear: () => undefined,
      getScoped: () => ({}),
      [Symbol.iterator]: function* () {
        yield [
          'TEST_VAR',
          {
            value: 'test',
            type: 1,
            options: {
              applyAtProcessCreation: true,
              applyAtShellIntegration: true,
            },
          },
        ];
      },
    };
    this.globalState = {
      get: () => undefined,
      update: () => Promise.resolve(),
      setKeysForSync: () => undefined,
      keys: () => [],
    };
    this.workspaceState = {
      get: () => undefined,
      update: () => Promise.resolve(),
      keys: () => [],
    };
    this.secrets = {
      store: () => Promise.resolve(),
      get: () => Promise.resolve(undefined),
      delete: () => Promise.resolve(),
      onDidChange: {},
    };
    this.globalStorageUri = {};
    this.logUri = {};
    this.extensionMode = 1;
    this.storageUri = {};
  }
  asAbsolutePath(relativePath) {
    return `/test/path/${relativePath}`;
  }
}
const vscodeExports = {
  ExtensionContext: MockExtensionContext,
};
export {};
//# sourceMappingURL=vscode.js.map
