import * as vscode from 'vscode';

import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';

export class TerminalContextProvider implements ContextDataProvider {
  readonly category = ContextCategory.Terminal;
  private terminals: vscode.Terminal[] = [];

  constructor(private readonly channel: vscode.OutputChannel) {
    this.terminals = [...vscode.window.terminals];
    vscode.window.onDidOpenTerminal(this.handleTerminalOpened);
    vscode.window.onDidCloseTerminal(this.handleTerminalClosed);
  }

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('vscode-context');
    return config.get('enableTerminalContext', true);
  }

  async getContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      () => ({
        activeTerminal: this.getActiveTerminalContext(),
        allTerminals: this.terminals.map((terminal) => this.getTerminalMetadata(terminal)),
      }),
      {
        operation: 'getTerminalContext',
        category: this.category,
      },
      this.channel,
    );
  }

  private readonly handleTerminalOpened = (terminal: vscode.Terminal): void => {
    this.terminals.push(terminal);
  };

  private readonly handleTerminalClosed = (terminal: vscode.Terminal): void => {
    this.terminals = this.terminals.filter((t) => t !== terminal);
  };

  private getActiveTerminalContext(): {
    name: string;
    creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
    state: vscode.TerminalState;
    processId: string | null;
    shellPath: string | null;
  } | null {
    const activeTerminal = vscode.window.activeTerminal;
    return activeTerminal ? this.getTerminalMetadata(activeTerminal) : null;
  }

  private getTerminalMetadata(terminal: vscode.Terminal): {
    name: string;
    creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
    state: vscode.TerminalState;
    processId: string | null;
    shellPath: string | null;
  } {
    return {
      name: terminal.name,
      creationOptions: terminal.creationOptions,
      state: terminal.state,
      processId: terminal.processId !== undefined ? String(terminal.processId) : null, // eslint-disable-line @typescript-eslint/no-base-to-string
      shellPath: this.getShellPath(terminal),
    };
  }

  private getShellPath(terminal: vscode.Terminal): string | null {
    try {
      // Handle different terminal types safely
      const options = terminal.creationOptions;
      if (options && 'shellPath' in options) {
        return (options as vscode.TerminalOptions).shellPath || null;
      }

      // Safely access internal properties as last resort
      // Using precise type assertion for internal VS Code properties
      interface VSCodeTerminalInternal {
        _shellPath?: { value: string };
        _ptyProcess?: { shellPath: string };
      }

      /* @ts-expect-error - Accessing internal VS Code API */
      const internalTerm: VSCodeTerminalInternal = terminal;

      const shellPath = internalTerm._shellPath?.value ?? internalTerm._ptyProcess?.shellPath;

      return typeof shellPath === 'string' ? shellPath : null;
    } catch (error) {
      this.channel.appendLine(
        `Error getting shell path: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
