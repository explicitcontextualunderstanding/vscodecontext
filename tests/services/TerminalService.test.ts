import * as vscode from 'vscode';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TerminalService } from '../../src/services/TerminalService';
import { MockTerminal } from '../__mocks__/mockTerminal';
import { MockTerminalFactory } from '../__mocks__/mockTerminalFactory';

interface MockVSCode {
  window: {
    createOutputChannel: jest.Mock;
    activeTerminal: vscode.Terminal | undefined;
  };
  Uri: {
    file: (path: string) => { scheme: string; path: string };
  };
  MarkdownString: jest.Mock;
  LanguageModelToolResult: jest.Mock;
  LanguageModelTextPart: jest.Mock;
  __setActiveTerminal: (terminal: vscode.Terminal | undefined) => void;
}

// Mock vscode namespace
jest.mock('vscode', () => {
  let currentTerminal: vscode.Terminal | undefined;
  const mockWindow = {
    createOutputChannel: jest.fn(),
    get activeTerminal() {
      return currentTerminal;
    },
  };

  return {
    window: mockWindow,
    Uri: {
      file: (path: string) => ({ scheme: 'file', path }),
    },
    MarkdownString: jest.fn(function (this: { value: string }, text: string) {
      this.value = text;
    }),
    LanguageModelToolResult: jest.fn(function (this: { parts: unknown[] }, parts: unknown[]) {
      this.parts = parts;
      return this;
    }),
    LanguageModelTextPart: jest.fn(function (this: { text: string }, text: string) {
      this.text = text;
      return this;
    }),
    // Helper for tests to set the terminal
    __setActiveTerminal: (terminal: vscode.Terminal | undefined) => {
      currentTerminal = terminal;
    },
  };
});

describe('TerminalService', () => {
  let terminalService: TerminalService;
  let mockOutputChannel: {
    appendLine: jest.Mock;
    clear: jest.Mock;
    dispose: jest.Mock;
    hide: jest.Mock;
    name: string;
    show: jest.Mock;
  };
  let mockedVSCode: MockVSCode;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock output channel
    mockOutputChannel = {
      appendLine: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn(),
      hide: jest.fn(),
      name: 'Terminal Service',
      show: jest.fn(),
    };

    // Set up mocked VS Code module
    mockedVSCode = vscode as unknown as MockVSCode;

    // Mock createOutputChannel
    mockedVSCode.window.createOutputChannel = jest.fn().mockReturnValue(mockOutputChannel);

    // Reset active terminal
    mockedVSCode.__setActiveTerminal(undefined);

    terminalService = new TerminalService();
  });

  describe('getActiveTerminalContext', () => {
    it('should return null when no active terminal exists', () => {
      const result = terminalService.getActiveTerminalContext();
      expect(result).toBeNull();
    });

    it('should return terminal metadata when active terminal exists', async () => {
      // Create mock active terminal
      const mockTerminal = MockTerminalFactory.createActive();
      mockedVSCode.__setActiveTerminal(mockTerminal);

      const result = terminalService.getActiveTerminalContext();

      expect(result).toEqual({
        name: 'Active Terminal',
        creationOptions: {},
        state: { isActive: true, isInteractedWith: true },
        processId: '12345',
        shellPath: '/bin/bash',
      });
    });
  });

  describe('getActiveTerminalContextForTool', () => {
    it('should return "no terminal" message when no active terminal', async () => {
      const result = await terminalService.getActiveTerminalContextForTool();
      const toolResult = result as unknown as { parts: Array<{ text: string }> };

      expect(toolResult.parts[0].text).toBe('No active terminal found.');
    });

    it('should return formatted terminal details when active terminal exists', async () => {
      const mockTerminal = MockTerminalFactory.createWithCustomState(
        'Test Terminal',
        98765,
        true,
        '/usr/bin/zsh',
      );
      mockedVSCode.__setActiveTerminal(mockTerminal);

      const result = await terminalService.getActiveTerminalContextForTool();
      const toolResult = result as unknown as { parts: Array<{ text: string }> };
      const text = toolResult.parts[0].text;

      expect(text).toContain('Active Terminal Details:');
      expect(text).toContain('Name: Test Terminal');
      expect(text).toContain('Process ID: 98765');
      expect(text).toContain('Shell Path: /usr/bin/zsh');
      expect(text).toContain('State: Active');
    });
  });

  describe('error handling', () => {
    it('should handle errors when getting shell path', () => {
      const mockTerminal = new MockTerminal('Error Terminal');
      // Force an error when accessing shellPath
      Object.defineProperty(mockTerminal, 'shellPath', {
        get: () => {
          throw new Error('Shell path access error');
        },
      });

      mockedVSCode.__setActiveTerminal(mockTerminal);

      const result = terminalService.getActiveTerminalContext();

      expect(result).not.toBeNull();
      expect(result?.shellPath).toBeNull();
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('Error getting shell path: Shell path access error'),
      );
    });
  });
});
