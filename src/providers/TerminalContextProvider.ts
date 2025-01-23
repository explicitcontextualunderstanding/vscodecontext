import * as vscode from 'vscode';
import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { getConfig } from '../config';

/**
 * Manages and provides context information about VS Code integrated terminals.
 * This provider tracks:
 * - Terminal creation and deletion
 * - Active terminal information
 * - Terminal metadata (name, process ID, shell path)
 * - Terminal state changes
 *
 * Part of the Configurable Context Providers pattern, this provider
 * can be enabled/disabled through VS Code settings.
 */
export class TerminalContextProvider implements ContextDataProvider {
  /** Identifies this provider's context category */
  readonly category = ContextCategory.Terminal;
  /** Maintains list of all active terminals */
  private readonly terminals: {
    terminal: vscode.Terminal;
    creationTime: Date;
    lastActivity: Date;
    inputCount: number;
    outputCount: number;
    totalLifetime: number;
  }[] = [];

  constructor() {
    vscode.window.onDidOpenTerminal(this.onDidOpenTerminal, this);
    vscode.window.onDidCloseTerminal(this.onDidCloseTerminal, this);
    vscode.window.onDidChangeActiveTerminal(this.onDidChangeActiveTerminal, this);
  }

  private onDidOpenTerminal(terminal: vscode.Terminal): void {
    this.terminals.push({
      terminal,
      creationTime: new Date(),
      lastActivity: new Date(),
      inputCount: 0,
      outputCount: 0,
      totalLifetime: 0,
    });
  }

  private onDidCloseTerminal(terminal: vscode.Terminal): void {
    const index = this.terminals.findIndex((t) => t.terminal === terminal);
    if (index !== -1) {
      this.terminals.splice(index, 1);
    }
  }

  private onDidChangeActiveTerminal(terminal: vscode.Terminal | undefined): void {
    if (terminal) {
      const terminalData = this.terminals.find((t) => t.terminal === terminal);
      if (terminalData) {
        terminalData.lastActivity = new Date();
      }
    }
  }

  public async getContext(): Promise<Record<string, unknown>> {
    return {
      terminals: this.terminals.map((t) => ({
        name: t.terminal.name,
        creationTime: t.creationTime.toISOString(),
        lastActivity: t.lastActivity.toISOString(),
        inputCount: t.inputCount,
        outputCount: t.outputCount,
        totalLifetime: Date.now() - t.creationTime.getTime(),
      })),
    };
  }

  public getTerminalData() {
    return this.terminals;
  }

  /**
   * Checks if terminal context gathering is enabled in settings
   * @returns true if terminal context gathering is enabled
   */
  public isEnabled(): boolean {
    const config = getConfig().categories;
    return config.enableTerminalContext;
  }
}
