import { TerminalContextProvider } from './TerminalContextProvider';
import { EventAggregator } from './eventAggregator'; // Import EventAggregator

export class ContextProvider {
  private terminalContextProvider: TerminalContextProvider;
  private eventAggregator: EventAggregator;

  constructor() {
    this.eventAggregator = new EventAggregator();
    this.terminalContextProvider = new TerminalContextProvider(
      this.eventAggregator,
    );
  }

  public async startTrackingTerminals(): Promise<void> {
    await this.terminalContextProvider.getContext();
  }
}
