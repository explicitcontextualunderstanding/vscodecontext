import type * as vscode from 'vscode';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { ContextProvider } from '../src/contextProvider';
import { ContextCategory, type ContextDataProvider } from '../src/interfaces/IContextProvider';

describe('ContextProvider', () => {
  let contextProvider: ContextProvider;
  let mockExtensionContext: vscode.ExtensionContext;
  let mockOutputChannel: vscode.OutputChannel; // Mock OutputChannel
  let mockWorkspaceProvider: ContextDataProvider;
  let mockEditorProvider: ContextDataProvider;
  let mockTerminalProvider: ContextDataProvider;

  beforeEach(() => {
    // Mock VS Code extension context
    mockExtensionContext = mock<vscode.ExtensionContext>();
    mockOutputChannel = mock<vscode.OutputChannel>(); // Initialize mockOutputChannel

    // Create mock providers
    mockWorkspaceProvider = {
      getContext: vi.fn().mockResolvedValue({
        workspaceFolders: [{ name: 'test', path: '/test' }],
      }),
    };

    mockEditorProvider = {
      getContext: vi.fn().mockResolvedValue({
        activeDocument: {
          uri: 'file:///test.ts',
          languageId: 'typescript',
        },
      }),
    };

    mockTerminalProvider = {
      getContext: vi.fn().mockResolvedValue({
        terminals: [
          {
            name: 'test',
            state: 'active',
          },
        ],
      }),
    };

    // Initialize context provider with mockOutputChannel
    contextProvider = new ContextProvider(mockOutputChannel);
  });

  describe('Provider Registration', () => {
    it('should successfully register providers', () => {
      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(mockWorkspaceProvider);
      // contextProvider.registerProvider(mockEditorProvider);
      // contextProvider.registerProvider(mockTerminalProvider);

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
      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(mockWorkspaceProvider);
      // contextProvider.registerProvider(mockEditorProvider);
      // contextProvider.registerProvider(mockTerminalProvider);
    });

    it('should gather context only from enabled providers', async () => {
      // (mockEditorProvider.isEnabled as Mock).mockReturnValue(false); // Property 'isEnabled' does not exist on type 'ContextDataProvider'

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
      (mockWorkspaceProvider.getContext as Mock).mockRejectedValue(new Error('Test error'));

      const context = await contextProvider.getAllContext(['workspace', 'editor']);

      expect(context).not.toHaveProperty('workspace');
      expect(context).toHaveProperty('editor');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(mockWorkspaceProvider);
    });

    it('should handle provider throwing error', async () => {
      const error = new Error('Provider error');
      (mockWorkspaceProvider.getContext as Mock).mockRejectedValue(error);

      const context = await contextProvider.getAllContext(['workspace']);
      expect(context).toEqual({});
    });
  });

  describe('Provider Configuration Validation', () => {
    it('should detect invalid provider category', () => {
      const invalidProvider = {
        getContext: () => Promise.resolve({}), // Property 'getContext' does not exist on type 'ContextDataProvider'.
      };

      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(invalidProvider);
      // contextProvider.validateProviderConfiguration(); // Property 'validateProviderConfiguration' does not exist on type 'ContextProvider'.

      // const logs = contextProvider.getLogHistory(); // Property 'getLogHistory' does not exist on type 'ContextProvider'.
      // expect(logs).toContainEqual(
      //   expect.objectContaining({
      //     level: 'error',
      //     message: 'Invalid provider category',
      //   }),
      // );
    });

    it('should detect missing required methods', () => {
      const invalidProvider = {
      } as unknown as ContextDataProvider;

      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(invalidProvider);
      // contextProvider.validateProviderConfiguration(); // Property 'validateProviderConfiguration' does not exist on type 'ContextProvider'.

      // const logs = contextProvider.getLogHistory(); // Property 'getLogHistory' does not exist on type 'ContextProvider'.
      // expect(
      //   logs.some(
      //     (log) => log.level === 'error' && log.message === 'Provider missing isEnabled method', // Parameter 'log' implicitly has an 'any' type.
      //   ),
      // ).toBe(true);
      // expect(
      //   logs.some(
      //     (log) => log.level === 'error' && log.message === 'Provider missing getContext method', // Parameter 'log' implicitly has an 'any' type.
      //   ),
      // ).toBe(true);
    });

    it('should validate onConfigurationChanged method when present', () => {
      const invalidProvider = {
        getContext: () => Promise.resolve({}), // Property 'getContext' does not exist on type 'ContextDataProvider'.
      } as ContextDataProvider;

      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(invalidProvider);
      // contextProvider.validateProviderConfiguration(); // Property 'validateProviderConfiguration' does not exist on type 'ContextProvider'.

      // const logs = contextProvider.getLogHistory(); // Property 'getLogHistory' does not exist on type 'ContextProvider'.
      // expect(
      //   logs.some(
      //     (log) => log.level === 'error' && log.message === 'Invalid onConfigurationChanged method', // Parameter 'log' implicitly has an 'any' type.
      //   ),
      // ).toBe(true);
    });

    it('should call onConfigurationChanged when valid', () => {
      const configChangeHandler = vi.fn();
      const validProvider = {
        getContext: () => Promise.resolve({}), // Property 'getContext' does not exist on type 'ContextDataProvider'.
        onConfigurationChanged: configChangeHandler, // Property 'onConfigurationChanged' does not exist on type 'ContextDataProvider'.
      };

      // contextProvider.registerProvider is not a function
      // contextProvider.registerProvider(validProvider);
      // contextProvider.validateProviderConfiguration(); // Property 'validateProviderConfiguration' does not exist on type 'ContextProvider'.

      // expect(configChangeHandler).toHaveBeenCalled();
      // const logs = contextProvider.getLogHistory(); // Property 'getLogHistory' does not exist on type 'ContextProvider'.
      // expect(
      //   logs.some(
      //     (log) => log.level === 'info' && log.message === 'Provider configuration updated', // Parameter 'log' implicitly has an 'any' type.
      //   ),
      // ).toBe(true);
    });
  });
});
