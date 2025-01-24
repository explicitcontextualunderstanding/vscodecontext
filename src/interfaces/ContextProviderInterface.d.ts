export interface ContextProviderInterface {
  getContext(): Promise<Record<string, unknown>>;
  getAllContext(filter?: string[]): Promise<Record<string, unknown>>;
}
export interface ContextData {
  [key: string]: unknown;
}
