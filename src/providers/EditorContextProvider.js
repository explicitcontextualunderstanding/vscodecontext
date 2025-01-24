import * as vscode from 'vscode';
import { ContextCategory } from './contextContracts';
export class EditorContextProvider {
  constructor() {
    this.category = ContextCategory.Editor;
  }
  isEnabled() {
    const config = vscode.workspace.getConfiguration('yourExtension');
    return config.get('enableEditorContext', true);
  }
  async getContext() {
    return {
      activeTextEditor: vscode.window.activeTextEditor,
      selections: vscode.window.activeTextEditor?.selections,
      visibleTextEditors: vscode.window.visibleTextEditors,
    };
  }
}
//# sourceMappingURL=EditorContextProvider.js.map
