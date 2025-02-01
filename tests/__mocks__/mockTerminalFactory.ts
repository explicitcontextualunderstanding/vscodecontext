import { MockTerminal } from './mockTerminal';
import type { MockTerminalState } from './mockTerminal';

export class MockTerminalFactory {
  static createActive(): MockTerminal {
    return new MockTerminal('Active Terminal', 12345, {
      isActive: true,
      isInteractedWith: true,
    });
  }

  static createInactive(): MockTerminal {
    return new MockTerminal('Inactive Terminal', 12346, {
      isActive: false,
      isInteractedWith: false,
    });
  }

  static createWithCustomState(
    name: string,
    processId: number,
    isActive: boolean,
    shellPath?: string,
  ): MockTerminal {
    const state: MockTerminalState = {
      isActive,
      isInteractedWith: isActive,
    };

    return new MockTerminal(name, processId, state, {}, shellPath);
  }
}
