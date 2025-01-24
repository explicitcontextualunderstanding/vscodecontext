import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';

export class ExtensionHostContextProvider
  extends EventEmitter
  implements IContextProvider
{
  async getAllContext(): Promise<Record<string, unknown>> {
    const context = {
      extensionHost: 'vscode',
      version: '1.0.0',
      activeExtensions: ['extension1', 'extension2'],
    };
    return context;
  }

  triggerContextExtraction(): void {
    this.emit('contextExtracted', {
      extensionHost: 'vscode',
      version: '1.0.0',
      activeExtensions: ['extension1', 'extension2'],
    });
  }
}
