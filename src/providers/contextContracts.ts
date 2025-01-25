/**
 * Represents the configuration for a context provider.
 */
export type ContextProviderConfig = {
  enabled: boolean;
  refreshInterval?: number;
  cacheTimeout?: number;
};

/**
 * Represents the available context categories.
 */
export enum ContextCategory {
  Editor = 'Editor',
  Terminal = 'Terminal',
  Workspace = 'Workspace',
  Debug = 'Debug',
  SCM = 'SCM',
  Tasks = 'Tasks',
  ExtensionHost = 'ExtensionHost',
}
