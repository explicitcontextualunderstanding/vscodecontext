import * as vscode from 'vscode';
import type { ContextDataProvider } from './contextContracts';
import { ContextCategory } from './contextContracts';
export declare class EditorContextProvider implements ContextDataProvider {
    category: ContextCategory;
    isEnabled(): boolean;
    getContext(): Promise<{
        activeTextEditor: vscode.TextEditor | undefined;
        selections: readonly vscode.Selection[] | undefined;
        visibleTextEditors: readonly vscode.TextEditor[];
    }>;
}
