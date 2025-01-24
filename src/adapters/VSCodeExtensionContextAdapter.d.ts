import type * as vscode from 'vscode';
import type { IExtensionContext } from '../interfaces/IExtensionContext';
export declare class VSCodeExtensionContextAdapter implements IExtensionContext {
    private readonly context;
    constructor(context: vscode.ExtensionContext);
    get subscriptions(): vscode.Disposable[];
}
