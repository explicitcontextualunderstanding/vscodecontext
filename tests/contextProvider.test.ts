import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as vscode from 'vscode';
import { ContextProvider } from '../src/contextProvider';

// Interface for accessing private members in tests
interface TestableContextProvider extends ContextProvider {
  providers: Map<string, { getContext: () => Promise<unknown> }>;
  debug: (message: string, data: Record<string, unknown>) => void;
}

describe('ContextProvider', () => {
  let outputChannel: vscode.OutputChannel;
  let contextProvider: TestableContextProvider;

  beforeEach(() => {
    outputChannel = {
      appendLine: vi.fn(),
      clear: vi.fn(),
      show: vi.fn(),
      dispose: vi.fn(),
    } as unknown as vscode.OutputChannel;

    contextProvider = new ContextProvider(
      outputChannel,
    ) as TestableContextProvider;
  });

  describe('getAllContext', () => {
    it('should aggregate context from all providers', async () => {
      contextProvider.providers = new Map([
        [
          'Editor',
          {
            getContext: vi.fn().mockResolvedValue({
              activeTextEditor: null,
              selections: [],
              visibleTextEditors: [],
            }),
          },
        ],
        [
          'Terminal',
          {
            getContext: vi.fn().mockResolvedValue({
              activeTerminal: null,
              allTerminals: [],
            }),
          },
        ],
      ]);

      const context = await contextProvider.getAllContext([
        'Editor',
        'Terminal',
      ]);
      expect(context).toBeDefined();
      expect(context).toHaveProperty('Editor');
      expect(context).toHaveProperty('Terminal');
    });

    it('should handle empty category list', async () => {
      const context = await contextProvider.getAllContext([]);
      expect(context).toEqual({});
    });

    it('should handle invalid categories', async () => {
      const context = await contextProvider.getAllContext(['InvalidCategory']);
      expect(context).toEqual({});
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      const errorProvider = {
        getContext: vi.fn().mockRejectedValue(new Error('Provider error')),
      };

      contextProvider.providers = new Map([['Error', errorProvider]]);

      const context = await contextProvider.getAllContext(['Error']);
      expect(context).toEqual({});
    });
  });

  describe('logging', () => {
    it('should log info messages', () => {
      const message = 'Test info message';
      contextProvider.info(message, {});
      expect(outputChannel.appendLine).toHaveBeenCalled();
    });

    it('should log debug messages', () => {
      const message = 'Test debug message';
      contextProvider.debug(message, {});
      expect(outputChannel.appendLine).toHaveBeenCalled();
    });
  });
});
