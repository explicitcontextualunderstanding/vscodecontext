import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from '../providers/contextContracts'; // Import ContextCategory
import type { ContextProviderConfig } from './contextContracts'; // Import ContextProviderConfig
import type { ContextData } from '@/contextProvider'; // Import ContextData

/**
 * Defines the structure for SCM context data.
 */
export type SCMContext = {
  // Export SCMContext type
  scmProvider: string;
  branches: string[];
  currentBranch: string;
};

export class SCMContextProvider
  extends EventEmitter
  implements IContextProvider
{
  readonly category = ContextCategory.SCM; // Add category property
  config!: ContextProviderConfig;

  async getContext(): Promise<ContextData> {
    // Change return type to Promise<ContextData>
    const context = {
      scm: {
        // Wrap SCMContext in 'scm' property
        scmProvider: 'git',
        branches: ['main', 'develop'],
        currentBranch: 'main',
      },
    };
    return context as ContextData; // Type assertion to ContextData
  }

  triggerContextExtraction(): void {
    this.emit('contextExtracted', {
      scmProvider: 'git',
      branches: ['main', 'develop'],
      currentBranch: 'main',
    });
  }
  configure(config: ContextProviderConfig): void {
    this.config = config;
  }
  initialize(): Promise<void> {
    return Promise.resolve();
  }
  async getAllContext(): Promise<ContextData> {
    // Removed categories parameter
    return this.getContext();
  }
}
