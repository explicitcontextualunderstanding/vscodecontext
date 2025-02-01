import * as vscode from 'vscode';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { TerminalService } from '../../src/services/TerminalService';
import { VSCodeLanguageModelOutput } from '../../src/outputManagers/VSCodeLanguageModelOutput';
import type { LanguageModelTool, Event, Disposable } from 'vscode';

// Mock event disposable
const mockDisposable: Disposable = {
  dispose: jest.fn(),
};

// Mock event
const mockEvent: Event<void> = (listener: () => void): Disposable => {
  listener();
  return mockDisposable;
};

// Mock cancellation token
const mockCancellationToken: vscode.CancellationToken = {
  isCancellationRequested: false,
  onCancellationRequested: mockEvent,
};

// Mock vscode namespace
jest.mock('vscode', () => {
  const LanguageModelToolResult = jest.fn(function(this: { content: unknown[] }, content: unknown[]) {
    this.content = content;
    return this;
  });
  
  return {
    lm: {
      registerTool: jest.fn(),
    },
    MarkdownString: jest.fn(function (this: { value: string }, text: string) {
      this.value = text;
    }),
    LanguageModelToolResult,
  };
});

describe('VSCodeLanguageModelOutput', () => {
  let output: VSCodeLanguageModelOutput;
  let mockTerminalService: TerminalService;
  let mockToolResult: vscode.LanguageModelToolResult;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock tool result
    mockToolResult = new (vscode.LanguageModelToolResult as any)([]);

    // Create mock terminal service
    mockTerminalService = {
      getActiveTerminalContext: jest.fn().mockReturnValue(null),
      getActiveTerminalContextForTool: jest.fn().mockResolvedValue(mockToolResult),
      outputChannel: {
        appendLine: jest.fn(),
      },
    } as unknown as TerminalService;

    // Create output manager instance
    output = new VSCodeLanguageModelOutput(mockTerminalService);
  });

  describe('register', () => {
    it('should register tool with VS Code LM API', async () => {
      await output.register();

      expect(vscode.lm.registerTool).toHaveBeenCalledWith(
        'vscode-context.getActiveTerminal',
        expect.objectContaining({
          prepareInvocation: expect.any(Function),
          invoke: expect.any(Function),
        }),
      );
    });

    it('should create tool with proper invocation messages', async () => {
      await output.register();

      const tool = (vscode.lm.registerTool as jest.Mock).mock.calls[0][1] as LanguageModelTool<
        Record<string, never>
      >;

      const options = {
        input: {},
        toolInvocationToken: undefined,
      };

      const invocation = await tool.prepareInvocation?.(options, mockCancellationToken);

      expect(invocation).toEqual({
        confirmationMessages: {
          title: 'Get Active Terminal Info',
          message: expect.any(vscode.MarkdownString),
        },
        invocationMessage: 'Retrieving active terminal information...',
      });
    });

    it('should create tool that calls terminal service on invoke', async () => {
      await output.register();

      const tool = (vscode.lm.registerTool as jest.Mock).mock.calls[0][1] as LanguageModelTool<
        Record<string, never>
      >;

      const options = {
        input: {},
        toolInvocationToken: undefined,
      };

      const result = await tool.invoke?.(options, mockCancellationToken);

      expect(result).toBe(mockToolResult);
      expect(mockTerminalService.getActiveTerminalContextForTool).toHaveBeenCalled();
    });
  });

  describe('invoke', () => {
    it('should call terminal service and return result', async () => {
      const result = await output.invoke();

      expect(result).toBe(mockToolResult);
      expect(mockTerminalService.getActiveTerminalContextForTool).toHaveBeenCalled();
    });
  });
});