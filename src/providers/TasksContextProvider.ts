import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../providers/contextContracts'; // Import ContextCategory
import type { ContextProviderConfig } from './contextContracts'; // Import ContextProviderConfig
import type { ContextData } from '@/contextProvider'; // Import ContextData

/**
 * Defines the structure for Tasks context data.
 */
export type TasksContext = {
  // Export TasksContext type
  tasks: Array<{ id: string; status: string }>;
};

export class TasksContextProvider
  extends EventEmitter
  implements IContextProvider
{
  readonly category = ContextCategory.Tasks; // Add category property
  config!: ContextProviderConfig;

  async getContext(): Promise<ContextData> {
    // Change return type to Promise<ContextData>
    const context = {
      tasks: {
        // Wrap TasksContext in 'tasks' property
        tasks: [
          { id: 'task1', status: 'completed' },
          { id: 'task2', status: 'pending' },
        ],
      },
    };
    return context as ContextData; // Type assertion to ContextData
  }

  triggerContextExtraction(): void {
    this.emit('contextExtracted', {
      tasks: [
        { id: 'task1', status: 'completed' },
        { id: 'task2', status: 'pending' },
      ],
    });
  }
  configure(config: ContextProviderConfig): void {
    this.config = config;
  }
  initialize(): Promise<void> {
    return Promise.resolve();
  }
  async getAllContext(_categories: string[]): Promise<ContextData> {
    return this.getContext();
  }
}
