import type * as vscode from 'vscode';

import type { IExtensionContext } from '../interfaces/IExtensionContext';

export class VSCodeExtensionContextAdapter implements IExtensionContext {
  constructor(private readonly context: vscode.ExtensionContext) {}

  get subscriptions(): vscode.Disposable[] {
    return this.context.subscriptions;
  }
}