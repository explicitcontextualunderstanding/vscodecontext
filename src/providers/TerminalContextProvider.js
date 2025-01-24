import * as vscode from 'vscode';
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
export class TerminalContextProvider {
  constructor() {
    /** Identifies this provider's context category */
    this.category = ContextCategory.Terminal;
    /** Maintains list of all active terminals */
    this.terminals = [];
    vscode.window.onDidOpenTerminal(this.onDidOpenTerminal, this);
    vscode.window.onDidCloseTerminal(this.onDidCloseTerminal, this);
    vscode.window.onDidChangeActiveTerminal(
      this.onDidChangeActiveTerminal,
      this,
    );
  }
  onDidOpenTerminal(terminal) {
    this.terminals.push({
      terminal,
      creationTime: new Date(),
      lastActivity: new Date(),
      inputCount: 0,
      outputCount: 0,
      totalLifetime: 0,
    });
  }
  onDidCloseTerminal(terminal) {
    const index = this.terminals.findIndex((t) => t.terminal === terminal);
    if (index !== -1) {
      this.terminals.splice(index, 1);
    }
  }
  onDidChangeActiveTerminal(terminal) {
    if (terminal) {
      const terminalData = this.terminals.find((t) => t.terminal === terminal);
      if (terminalData) {
        terminalData.lastActivity = new Date();
      }
    }
  }
  async getContext() {
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
  getTerminalData() {
    return this.terminals;
  }
  /**
   * Checks if terminal context gathering is enabled in settings
   * @returns true if terminal context gathering is enabled
   */
  isEnabled() {
    const config = getConfig().categories;
    return config.enableTerminalContext;
  }
}
//# sourceMappingURL=TerminalContextProvider.js.map
