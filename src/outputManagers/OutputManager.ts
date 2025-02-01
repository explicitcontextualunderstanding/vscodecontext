/**
 * Interface for output managers that handle different types of outputs
 * and their registration with external systems.
 */
export interface OutputManager {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  register(args: any): Promise<void>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  invoke(args: any): Promise<unknown>;
}