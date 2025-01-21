import type * as vscode from 'vscode';

export interface LogEntry {
  message: string;
  level: 'info' | 'warn' | 'error';
  metadata?: object;
}

export interface IContextProvider {
  logger: {
    log: (entry: LogEntry) => void;
    info: (message: string, metadata?: object) => void;
  };
  getAllContext: (categories: string[]) => object;
  startTrackingTerminals: (context: vscode.ExtensionContext) => void;
}
