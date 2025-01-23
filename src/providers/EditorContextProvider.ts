import * as vscode from 'vscode';
import type { ContextDataProvider } from './contextContracts';
import { ContextCategory } from './contextContracts';

export class EditorContextProvider implements ContextDataProvider {
  category = ContextCategory.Editor;

  isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('yourExtension');
    return config.get('enableEditorContext', true);
  }

  async getContext(): Promise<{
    activeTextEditor: vscode.TextEditor | undefined;
    selections: readonly vscode.Selection[] | undefined;
    visibleTextEditors: readonly vscode.TextEditor[];
  }> {
    return {
      activeTextEditor: vscode.window.activeTextEditor,
      selections: vscode.window.activeTextEditor?.selections,
      visibleTextEditors: vscode.window.visibleTextEditors,
    };
  }
}
