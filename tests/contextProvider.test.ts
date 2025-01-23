import type * as vscode from 'vscode';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { ContextProvider } from '../src/contextProvider';
import { ContextCategory, type ContextDataProvider } from '../src/interfaces/IContextProvider';

describe('ContextProvider', () => {
  let contextProvider: ContextProvider;
  let mockExtensionContext: vscode.ExtensionContext;
  let mockWorkspaceProvider: ContextDataProvider;
  let mockEditorProvider: ContextDataProvider;
  let mockTerminalProvider: ContextDataProvider;

  beforeEach(() => {
    // Mock VS Code extension context
    mockExtensionContext = mock<vscode.ExtensionContext>();

    // Create mock providers
    mockWorkspaceProvider = {
      category: ContextCategory.Workspace,
      isEnabled: vi.fn().mockReturnValue(true),
      getContext: vi.fn().mockResolvedValue({
        workspaceFolders: [{ name: 'test', path: '/test' }],
      }),
    };

    mockEditorProvider = {
      category: ContextCategory.Editor,
      isEnabled: vi.fn().mockReturnValue(true),
      getContext: vi.fn().mockResolvedValue({
        activeDocument: {
          uri: 'file:///test.ts',
          languageId: 'typescript',
        },
      }),
    };

    mockTerminalProvider = {
      category: ContextCategory.Terminal,
      isEnabled: vi.fn().mockReturnValue(true),
      getContext: vi.fn().mockResolvedValue({
        terminals: [
          {
            name: 'test',
            state: 'active',
          },
        ],
      }),
    };

    // Initialize context provider
    contextProvider = new ContextProvider(mockExtensionContext);
  });

  describe('Provider Registration', () => {
    it('should successfully register providers', () => {
      contextProvider.registerProvider(mockWorkspaceProvider);
      contextProvider.registerProvider(mockEditorProvider);
      contextProvider.registerProvider(mockTerminalProvider);

      // Test registration by getting context
      return contextProvider.getAllContext(['workspace', 'editor', 'terminal']).then((context) => {
        expect(context).toHaveProperty('workspace');
        expect(context).toHaveProperty('editor');
        expect(context).toHaveProperty('terminal');
      });
    });
  });

  describe('Context Gathering', () => {
    beforeEach(() => {
      contextProvider.registerProvider(mockWorkspaceProvider);
      contextProvider.registerProvider(mockEditorProvider);
      contextProvider.registerProvider(mockTerminalProvider);
    });

    it('should gather context only from enabled providers', async () => {
      (mockEditorProvider.isEnabled as Mock).mockReturnValue(false);

      const context = await contextProvider.getAllContext(['workspace', 'editor', 'terminal']);

      expect(context).toHaveProperty('workspace');
      expect(context).not.toHaveProperty('editor');
      expect(context).toHaveProperty('terminal');
    });

    it('should gather context only for requested categories', async () => {
      const context = await contextProvider.getAllContext(['workspace']);

      expect(context).toHaveProperty('workspace');
      expect(context).not.toHaveProperty('editor');
      expect(context).not.toHaveProperty('terminal');
    });

    it('should handle provider errors gracefully', async () => {
      (mockWorkspaceProvider.getContext as jest.Mock).mockRejectedValue(new Error('Test error'));

      const context = await contextProvider.getAllContext(['workspace', 'editor']);

      expect(context).not.toHaveProperty('workspace');
      expect(context).toHaveProperty('editor');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      contextProvider.registerProvider(mockWorkspaceProvider);
    });

    it('should handle provider throwing error', async () => {
      const error = new Error('Provider error');
      (mockWorkspaceProvider.getContext as jest.Mock).mockRejectedValue(error);

      const context = await contextProvider.getAllContext(['workspace']);
      expect(context).toEqual({});
    });
  });

  describe('Provider Configuration Validation', () => {
    it('should detect invalid provider category', () => {
      const invalidProvider = {
        category: 'invalid' as ContextCategory,
        isEnabled: () => true,
        getContext: () => Promise.resolve({}),
      };

      contextProvider.registerProvider(invalidProvider);
      contextProvider.validateProviderConfiguration();

      const logs = contextProvider.getLogHistory();
      expect(logs).toContainEqual(
        expect.objectContaining({
          level: 'error',
          message: 'Invalid provider category',
        }),
      );
    });

    it('should detect missing required methods', () => {
      const invalidProvider = {
        category: ContextCategory.Workspace,
      } as unknown as ContextDataProvider;

      contextProvider.registerProvider(invalidProvider);
      contextProvider.validateProviderConfiguration();

      const logs = contextProvider.getLogHistory();
      expect(
        logs.some(
          (log) => log.level === 'error' && log.message === 'Provider missing isEnabled method',
        ),
      ).toBe(true);
      expect(
        logs.some(
          (log) => log.level === 'error' && log.message === 'Provider missing getContext method',
        ),
      ).toBe(true);
    });

    it('should validate onConfigurationChanged method when present', () => {
      const invalidProvider = {
        category: ContextCategory.Workspace,
        isEnabled: () => true,
        getContext: () => Promise.resolve({}),
        onConfigurationChanged: 'not a function' as unknown as () => void,
      } as ContextDataProvider;

      contextProvider.registerProvider(invalidProvider);
      contextProvider.validateProviderConfiguration();

      const logs = contextProvider.getLogHistory();
      expect(
        logs.some(
          (log) => log.level === 'error' && log.message === 'Invalid onConfigurationChanged method',
        ),
      ).toBe(true);
    });

    it('should call onConfigurationChanged when valid', () => {
      const configChangeHandler = jest.fn();
      const validProvider = {
        category: ContextCategory.Workspace,
        isEnabled: () => true,
        getContext: () => Promise.resolve({}),
        onConfigurationChanged: configChangeHandler,
      };

      contextProvider.registerProvider(validProvider);
      contextProvider.validateProviderConfiguration();

      expect(configChangeHandler).toHaveBeenCalled();
      const logs = contextProvider.getLogHistory();
      expect(
        logs.some(
          (log) => log.level === 'info' && log.message === 'Provider configuration updated',
        ),
      ).toBe(true);
    });
  });
});
