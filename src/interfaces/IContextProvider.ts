import type {
  ContextProviderConfig,
  ContextCategory,
} from '../providers/contextContracts';
import type { ContextData } from '../contextProvider';

/**
 * Represents a provider for a specific type of context data.
 */
export interface IContextProvider {
  /**
   * The category of the context provider.
   */
  readonly category: ContextCategory;

  /**
   * The configuration for the context provider.
   */
  config: ContextProviderConfig;

  /**
   * Configures the context provider.
   * @param config - The configuration for the context provider.
   */
  configure(config: ContextProviderConfig): void;

  /**
   * Initializes the context provider.
   */
  initialize(): Promise<void>;

  /**
   * Gets the context data for the provider.
   * @returns A promise that resolves to the context data.
   */
  getContext(): Promise<ContextData>;

  /**
   * Triggers the context extraction process.
   */
  triggerContextExtraction(): void;

  /**
   * Gets all context data for the provider.
   * @param categories - The categories of context data to retrieve.
   * @returns A promise that resolves to the context data.
   */
  getAllContext(categories: string[]): Promise<ContextData>;
}
