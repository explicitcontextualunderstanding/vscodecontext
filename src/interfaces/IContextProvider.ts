export enum ContextCategory {
  Workspace = 'workspace',
  Editor = 'editor',
  Terminal = 'terminal',
  Environment = 'environment',
  Debug = 'debug',
  SCM = 'scm'
}

export interface ContextDataProvider {
  readonly category: ContextCategory;
  isEnabled(): boolean;
  getContext(): Promise<Record<string, unknown>>;
  onConfigurationChanged?(): void;
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

export interface Logger {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
}

export interface IContextProvider extends Logger {
  registerProvider(provider: ContextDataProvider): void;
  getAllContext(categories: string[]): Promise<Record<string, unknown>>;
  validateProviderConfiguration(): void;
  log(entry: LogEntry): void;
  getLogHistory(): LogEntry[];
}
