export interface ContextProviderInterface {
  getContext(): Promise<Record<string, unknown>>;
  getAllContext(filter?: string[]): Promise<Record<string, unknown>>;
}

export interface ContextData {
  // Define the structure of ContextData here
  [key: string]: unknown;
}
