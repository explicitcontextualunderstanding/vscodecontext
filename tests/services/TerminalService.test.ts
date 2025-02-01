import * as vscode from 'vscode';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TerminalService } from '../../src/services/TerminalService';
import { MockTerminal } from '../__mocks__/mockTerminal';
import { MockTerminalFactory } from '../__mocks__/mockTerminalFactory';

// Mock vscode namespace
jest.mock('vscode', () => ({
  Uri: {
    file: (path: string) => ({ scheme: 'file', path }),
  },
  window: {
    createOutputChannel: jest.fn(),
    activeTerminal: undefined,
  },
  LanguageModelToolResult: jest.fn(function (this: { parts: unknown[] }, parts: unknown[]) {
    this.parts = parts;
  }),
  LanguageModelTextPart: jest.fn(function (this: { text: string }, text: string) {
    this.text = text;
  }),
}));

describe('TerminalService', () => {
  let terminalService: TerminalService;
  let mockOutputChannel: {
    appendLine: jest.MockedFunction<(value: string) => void>;
    clear: jest.MockedFunction<() => void>;
    dispose: jest.MockedFunction<() => void>;
    hide: jest.MockedFunction<() => void>;
    name: string;
    show: jest.MockedFunction<() => void>;
  };

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

    // Mock createOutputChannel
    (vscode.window.createOutputChannel as jest.Mock).mockReturnValue(mockOutputChannel);

    terminalService = new TerminalService();
  });

  describe('getActiveTerminalContext', () => {
    it('should return null when no active terminal exists', () => {
      // Mock no active terminal
      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(undefined);

      const result = terminalService.getActiveTerminalContext();
      expect(result).toBeNull();
    });

    it('should return terminal metadata when active terminal exists', async () => {
      // Create mock active terminal
      const mockTerminal = MockTerminalFactory.createActive();
      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(mockTerminal);

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
      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(undefined);

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
      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(mockTerminal);

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

      jest.spyOn(vscode.window, 'activeTerminal', 'get').mockReturnValue(mockTerminal);

      const result = terminalService.getActiveTerminalContext();

      expect(result).not.toBeNull();
      expect(result?.shellPath).toBeNull();
      expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
        expect.stringContaining('Error getting shell path: Shell path access error'),
      );
    });
  });
});
