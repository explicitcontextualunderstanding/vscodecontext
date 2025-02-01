import * as vscode from 'vscode';
import type {
  CancellationToken,
  LanguageModelToolResult,
  PreparedToolInvocation,
  LanguageModelToolInvocationPrepareOptions,
  LanguageModelToolInvocationOptions,
} from 'vscode';
import type { TerminalService } from '../services/TerminalService';
import type { OutputManager } from './OutputManager';

/**
 * Implementation of OutputManager for VS Code Language Model API.
 * Handles registration and invocation of language model tools.
 */
export class VSCodeLanguageModelOutput implements OutputManager {
  constructor(private readonly terminalService: TerminalService) {}

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async register(): Promise<void> {
    const terminalService = this.terminalService;
    const tool: vscode.LanguageModelTool<Record<string, never>> = {
      async prepareInvocation(
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _options: LanguageModelToolInvocationPrepareOptions<Record<string, never>>,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _token: CancellationToken,
      ): Promise<PreparedToolInvocation> {
        return {
          confirmationMessages: {
            title: 'Get Active Terminal Info',
            message: new vscode.MarkdownString('Get information about the active terminal'),
          },
          invocationMessage: 'Retrieving active terminal information...',
        };
      },

      async invoke(
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _options: LanguageModelToolInvocationOptions<Record<string, never>>,
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        _token: CancellationToken,
      ): Promise<LanguageModelToolResult> {
        return terminalService.getActiveTerminalContextForTool();
      },
    };

    vscode.lm.registerTool('vscode-context.getActiveTerminal', tool);
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  public async invoke(): Promise<LanguageModelToolResult> {
    return this.terminalService.getActiveTerminalContextForTool();
  }
}
