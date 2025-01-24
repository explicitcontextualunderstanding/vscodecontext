/// <reference types="node" resolution-mode="require"/>
import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';
export declare class SCMContextProvider
  extends EventEmitter
  implements IContextProvider
{
  getAllContext(): Promise<Record<string, unknown>>;
  triggerContextExtraction(): void;
}
