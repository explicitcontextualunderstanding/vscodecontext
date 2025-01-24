import { vi } from 'vitest';

// Mock VSCode API
vi.mock('vscode', () => ({
  window: {
    createOutputChannel: vi.fn(),
    showErrorMessage: vi.fn(),
  },
  ExtensionContext: vi.fn(),
}));
