import * as vscode from 'vscode';

import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';

/**
 * Provides context information about the VS Code editor state.
 * This includes information about:
 * - Active text document
 * - Current selections
 * - Diagnostic messages (errors, warnings, etc.)
 *
 * This provider implements the Configurable Context Providers pattern,
 * allowing it to be enabled/disabled through VS Code settings.
 */
export class EditorContextProvider implements ContextDataProvider {
  /** Identifies this provider's context category */
  readonly category = ContextCategory.Editor;

  /**
   * Creates a new EditorContextProvider
   * @param channel Output channel for logging provider operations
   */
  constructor(private readonly channel: vscode.OutputChannel) {}

  /**
   * Checks if this provider is enabled in VS Code settings
   * Part of the Configurable Context Providers pattern
   * @returns true if editor context gathering is enabled
   */
  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('vscode-context');
    return config.get('enableEditorContext', true);
  }

  /**
   * Gathers current editor context information
   * @returns Object containing:
   * - activeDocument: Information about the currently active text document
   * - selections: Array of current text selections with their content
   * - diagnostics: Current diagnostic messages (errors, warnings) for the document
   */
  async getContext(): Promise<Record<string, unknown>> {
    return withErrorHandling(
      () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return {};

        return {
          activeDocument: {
            uri: editor.document.uri.toString(),
            languageId: editor.document.languageId,
            version: editor.document.version,
            lineCount: editor.document.lineCount,
          },
          selections: editor.selections.map((selection) => ({
            anchor: selection.anchor,
            active: selection.active,
            text: editor.document.getText(selection),
          })),
          diagnostics: this.getDiagnostics(editor.document),
        };
      },
      { category: this.category, operation: 'getContext' },
      this.channel,
    );
  }

  private getDiagnostics(document: vscode.TextDocument): Array<{
    severity: string;
    message: string;
    range: vscode.Range;
    source: string | undefined;
  }> {
    return vscode.languages.getDiagnostics(document.uri).map((d) => ({
      severity: vscode.DiagnosticSeverity[d.severity],
      message: d.message,
      range: d.range,
      source: d.source,
    }));
  }
}
