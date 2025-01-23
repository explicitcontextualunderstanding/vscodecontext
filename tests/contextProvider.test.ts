import * as vscode from 'vscode';
import { mock } from 'jest-mock-extended';
import { ContextProvider } from '../src/contextProvider';
import { ContextCategory, ContextDataProvider } from '../src/interfaces/IContextProvider';

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
      isEnabled: jest.fn().mockReturnValue(true),
      getContext: jest.fn().mockResolvedValue({
        workspaceFolders: [{ name: 'test', path: '/test' }]
      })
    };

    mockEditorProvider = {
      category: ContextCategory.Editor,
      isEnabled: jest.fn().mockReturnValue(true),
      getContext: jest.fn().mockResolvedValue({
        activeDocument: { uri: 'file:///test.ts', languageId: 'typescript' }
      })
    };

    mockTerminalProvider = {
      category: ContextCategory.Terminal,
      isEnabled: jest.fn().mockReturnValue(true),
      getContext: jest.fn().mockResolvedValue({
        terminals: [{ name: 'test', state: 'active' }]
      })
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
      return contextProvider.getAllContext(['workspace', 'editor', 'terminal'])
        .then(context => {
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
      (mockEditorProvider.isEnabled as jest.Mock).mockReturnValue(false);

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
});