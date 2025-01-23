import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';

export class TasksContextProvider extends EventEmitter implements IContextProvider {
  async getAllContext(): Promise<Record<string, unknown>> {
    const context = {
      tasks: [
        { id: 'task1', status: 'completed' },
        { id: 'task2', status: 'pending' },
      ],
    };
    return context;
  }

  triggerContextExtraction(): void {
    this.emit('contextExtracted', {
      tasks: [
        { id: 'task1', status: 'completed' },
        { id: 'task2', status: 'pending' },
      ],
    });
  }
}
