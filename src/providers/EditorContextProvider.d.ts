import * as vscode from 'vscode';
import type { ContextDataProvider } from './contextContracts';
export declare class EditorContextProvider implements ContextDataProvider {
  category: any;
  isEnabled(): boolean;
  getContext(): Promise<{
    activeTextEditor: vscode.TextEditor | undefined;
    selections: readonly vscode.Selection[] | undefined;
    visibleTextEditors: readonly vscode.TextEditor[];
  }>;
}
