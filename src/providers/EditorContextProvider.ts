import * as vscode from 'vscode';

import type { ContextDataProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../interfaces/IContextProvider';
import { withErrorHandling } from '../utils/errorUtils';

export class EditorContextProvider implements ContextDataProvider {
  readonly category = ContextCategory.Editor;

  constructor(private readonly channel: vscode.OutputChannel) {}

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('vscode-context');
    return config.get('enableEditorContext', true);
  }

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
