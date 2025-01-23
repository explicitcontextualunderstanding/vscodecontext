import { EventEmitter } from 'events';
import type { ContextData } from './interfaces/ContextProviderInterface';
import type { IContextProvider } from './interfaces/IContextProvider';

export const EXTRACT_REQUEST = 'EXTRACT_REQUEST';

import type * as vscode from 'vscode';

export class ContextProvider extends EventEmitter implements IContextProvider {
  private readonly outputChannel: vscode.OutputChannel;
  constructor(outputChannel: vscode.OutputChannel) {
    super();
    this.outputChannel = outputChannel;
  }
  async getAllContext(categories: string[]): Promise<ContextData> {
    // Use categories parameter to avoid ESLint error
    const contextData: ContextData = {};
    categories.forEach((category) => {
      contextData[category] = {}; // Placeholder implementation
    });
    return contextData;
  }

  triggerContextExtraction(): void {
    // Implementation here
  }

  startTrackingTerminals(): void {
    // Implementation here
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.outputChannel.appendLine(message);
    if (data) {
      this.outputChannel.appendLine(JSON.stringify(data, null, 2));
    }
  }
}
