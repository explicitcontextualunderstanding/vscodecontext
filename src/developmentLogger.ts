import { Logger } from './loggingInterface';

export class DevelopmentLogger implements Logger {
  log(message: string): void {
    console.log(`Development log: ${message}`);
  }

  error(message: string): void {
    console.error(`Development error: ${message}`);
  }
}
