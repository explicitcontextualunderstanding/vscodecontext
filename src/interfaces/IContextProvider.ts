export interface ContextData {
  [key: string]: unknown;
}

export interface IContextProvider {
  getAllContext(categories: string[]): Promise<ContextData>;
  triggerContextExtraction(): void;
}

export interface ContextDataProvider {
  getContext(): Promise<Record<string, unknown>>;
}

export enum ContextCategory {
  Editor = 'Editor',
  Terminal = 'Terminal',
  Workspace = 'Workspace',
}
