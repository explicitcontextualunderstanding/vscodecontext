import * as vscode from 'vscode';

/**
 * Interface defining the structure of terminal metadata
 */
interface TerminalMetadata {
  name: string;
  creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions;
  state: vscode.TerminalState;
  processId: string | null;
  shellPath: string | null;
}

/**
 * Service to provide terminal related information.
 * This service directly interacts with the VS Code API
 * to fetch terminal data, independent of context providers.
 */
export class TerminalService {
  private readonly outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('Terminal Service');
  }

  /**
   * Retrieves context information for the currently active terminal.
   * @returns Terminal metadata object or null if no active terminal
   */
  public getActiveTerminalContext(): TerminalMetadata | null {
    const activeTerminal = vscode.window.activeTerminal;
    return activeTerminal ? this.getTerminalMetadata(activeTerminal) : null;
  }

  /**
   * Extracts metadata information from a terminal instance.
   * @param terminal The terminal to get metadata from
   * @returns Object containing terminal metadata
   */
  private getTerminalMetadata(terminal: vscode.Terminal): TerminalMetadata {
    return {
      name: terminal.name,
      creationOptions: terminal.creationOptions,
      state: terminal.state,
      processId: terminal.processId !== undefined ? String(terminal.processId) : null,
      shellPath: this.getShellPath(terminal),
    };
  }

  /**
   * Attempts to retrieve the shell path from a terminal instance.
   * Handles different terminal types and falls back to internal properties if needed.
   * @param terminal The terminal to get the shell path from
   * @returns The shell path or null if not available
   */
  private getShellPath(terminal: vscode.Terminal): string | null {
    try {
      // Handle different terminal types safely
      const options = terminal.creationOptions;
      if (options && 'shellPath' in options) {
        return (options as vscode.TerminalOptions).shellPath ?? null;
      }

      // Safely access internal properties as last resort
      interface VSCodeTerminalInternal {
        _shellPath?: { value: string };
        _ptyProcess?: { shellPath: string };
      }

      /* @ts-expect-error - Accessing internal VS Code API */
      const internalTerm: VSCodeTerminalInternal = terminal;

      const shellPath = internalTerm._shellPath?.value ?? internalTerm._ptyProcess?.shellPath;

      return typeof shellPath === 'string' ? shellPath : null;
    } catch (error) {
      this.outputChannel.appendLine(
        `Error getting shell path: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  /**
   * Retrieves context information for the currently active terminal specifically formatted for LM Tool
   * @returns Terminal metadata object formatted as LanguageModelToolResult
   */
  public async getActiveTerminalContextForTool(): Promise<vscode.LanguageModelToolResult> {
    const terminalData = this.getActiveTerminalContext();

    if (!terminalData) {
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart('No active terminal found.'),
      ]);
    }

    const formattedDetails = [
      'Active Terminal Details:',
      `Name: ${terminalData.name}`,
      `Process ID: ${terminalData.processId || 'N/A'}`,
      `Shell Path: ${terminalData.shellPath || 'N/A'}`,
      `State: ${terminalData.state ? 'Active' : 'Inactive'}`,
    ].join('\n');

    return new vscode.LanguageModelToolResult([new vscode.LanguageModelTextPart(formattedDetails)]);
  }
}
