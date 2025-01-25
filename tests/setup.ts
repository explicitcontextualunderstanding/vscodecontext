import { vi } from 'vitest';
import type { ExtensionContext, Memento, OutputChannel } from 'vscode';

// Mock VSCode API
const mockOutputChannel: Partial<OutputChannel> = {
  appendLine: vi.fn(),
  append: vi.fn(),
  clear: vi.fn(),
  dispose: vi.fn(),
  show: vi.fn(),
};

const createMockMemento = (): Memento & {
  setKeysForSync(keys: readonly string[]): void;
} => ({
  get: vi.fn(),
  update: vi.fn(),
  keys: vi.fn(() => []),
  setKeysForSync: vi.fn(),
});

const mockContext: Partial<ExtensionContext> = {
  subscriptions: [],
  workspaceState: createMockMemento(),
  globalState: createMockMemento(),
  extensionMode: 1, // Development mode
  extensionUri: {
    fsPath: '/test/extension/path',
    scheme: 'file',
  } as any,
  extensionPath: '/test/extension/path',
  storagePath: '/test/storage/path',
  logPath: '/test/log/path',
};

vi.mock('vscode', async () => {
  const vscode = await vi.importActual<typeof import('vscode')>('vscode');
  return {
    ...vscode,
    window: {
      createOutputChannel: vi.fn(() => mockOutputChannel),
      showErrorMessage: vi.fn(),
      showInformationMessage: vi.fn(),
      showWarningMessage: vi.fn(),
    },
    ExtensionContext: vi.fn(() => mockContext),
  };
});

export { mockOutputChannel, mockContext };
