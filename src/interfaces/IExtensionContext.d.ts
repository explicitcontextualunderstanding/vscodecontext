import type { Disposable } from 'vscode';
export interface IExtensionContext {
  /**
   * An array to which disposables can be added. When this extension is
   * deactivated the disposables will be disposed.
   */
  readonly subscriptions: Disposable[];
}
