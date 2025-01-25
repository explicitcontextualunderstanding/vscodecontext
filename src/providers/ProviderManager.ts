import type { IContextProvider } from '../interfaces/IContextProvider';
import { ContextCategory } from './contextContracts';
import type { ContextProviderConfig } from './contextContracts';
import type { ContextData } from '@/contextProvider';
import type { EditorContext } from './EditorContextProvider';
import type { WorkspaceContext } from './WorkspaceContextProvider';
import type { SCMContext } from './SCMContextProvider';
import type { DebugContext } from './DebugContextProvider';
import type { TasksContext } from './TasksContextProvider';
import type { TerminalContext } from './TerminalContextProvider';
import type { ExtensionHostContext } from './ExtensionHostContextProvider';

/**
 * Manages the registration, configuration, and initialization of context providers.
 */
export class ProviderManager {
  private providers: Map<ContextCategory, IContextProvider> = new Map();

  constructor(providers: IContextProvider[]) {
    providers.forEach((provider) => this.registerProvider(provider));
  }

  /**
   * Registers a context provider.
   * @param provider - The context provider to register.
   */
  public registerProvider(provider: IContextProvider): void {
    this.providers.set(provider.category, provider);
  }

  /**
   * Configures a context provider.
   * @param category - The category of the provider to configure.
   * @param config - The configuration for the provider.
   */
  public configureProvider(
    category: ContextCategory,
    config: ContextProviderConfig,
  ): void {
    const provider = this.providers.get(category);
    if (provider) {
      provider.configure(config);
    }
  }

  /**
   * Gets the enabled context providers.
   * @returns An array of enabled context providers.
   */
  public getEnabledProviders(): IContextProvider[] {
    return Array.from(this.providers.values()).filter(
      (provider) => provider.config.enabled,
    );
  }

  /**
   * Initializes all registered providers.
   */
  public async initialize(): Promise<void> {
    const initPromises = Array.from(this.providers.values()).map((provider) =>
      provider.initialize(),
    );
    await Promise.all(initPromises);
  }

  /**
   * Gets the aggregated context from all enabled providers.
   * @returns A promise that resolves to the aggregated context.
   */
  public async getContext(): Promise<ContextData> {
    const enabledProviders = this.getEnabledProviders();
    const providerContexts = await Promise.all(
      enabledProviders.map((provider) => provider.getContext()),
    );

    let aggregatedContext: ContextData = {}; // Initialize as empty ContextData
    providerContexts.forEach((context, index) => {
      // Added index to forEach
      const provider = enabledProviders[index]; // Get provider from enabledProviders array
      if (provider.category === ContextCategory.Editor) {
        aggregatedContext.editor = context.editor as EditorContext; // Access context.editor and type assertion
      } else if (provider.category === ContextCategory.Workspace) {
        aggregatedContext.workspace = context.workspace as WorkspaceContext; // Access context.workspace and type assertion
      } else if (provider.category === ContextCategory.SCM) {
        aggregatedContext.scm = context.scm as SCMContext; // Access context.scm and type assertion
      } else if (provider.category === ContextCategory.Debug) {
        aggregatedContext.debug = context.debug as DebugContext; // Access context.debug and type assertion
      } else if (provider.category === ContextCategory.Tasks) {
        aggregatedContext.tasks = context.tasks as TasksContext; // Access context.tasks and type assertion
      } else if (provider.category === ContextCategory.Terminal) {
        aggregatedContext.terminal = context.terminal as TerminalContext; // Access context.terminal and type assertion
      } else if (provider.category === ContextCategory.ExtensionHost) {
        aggregatedContext.extensionHost =
          context.extensionHost as ExtensionHostContext; // Access context.extensionHost and type assertion
      }
    });

    return aggregatedContext;
  }

  /**
   * Starts all registered providers.
   */
  public startProviders(): void {
    // TODO: Implement provider start logic if needed
  }

  /**
   * Stops all registered providers.
   */
  public stopProviders(): void {
    // TODO: Implement provider stop/dispose logic if needed
  }
}
