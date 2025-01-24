/// <reference types="node" />
import { EventEmitter } from 'events';
import type { IContextProvider } from '../interfaces/IContextProvider';
export declare class TasksContextProvider extends EventEmitter implements IContextProvider {
    getAllContext(): Promise<Record<string, unknown>>;
    triggerContextExtraction(): void;
}
