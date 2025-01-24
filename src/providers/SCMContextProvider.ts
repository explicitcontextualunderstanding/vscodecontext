import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';

export class SCMContextProvider
  extends EventEmitter
  implements IContextProvider
{
  async getAllContext(): Promise<Record<string, unknown>> {
    const context = {
      scmProvider: 'git',
      branches: ['main', 'develop'],
      currentBranch: 'main',
    };
    return context;
  }

  triggerContextExtraction(): void {
    this.emit('contextExtracted', {
      scmProvider: 'git',
      branches: ['main', 'develop'],
      currentBranch: 'main',
    });
  }
}
