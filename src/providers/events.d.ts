export declare const EventType: {
  readonly Resource: 'resource';
  readonly StateChange: 'state_change';
  readonly Error: 'error';
};
export type ContextEventType = (typeof EventType)[keyof typeof EventType];
export interface EventMetadata {
  priority?: 'low' | 'medium' | 'high';
  source: string;
  timestamp: number;
  [key: string]: unknown;
}
export interface ContextEvent<T = unknown> {
  type: ContextEventType;
  payload: T;
  metadata: EventMetadata;
}
export interface AggregationStrategy {
  process<T>(
    event: ContextEvent<T>,
    metadata: EventMetadata,
    emit: (events: Array<ContextEvent<unknown>>) => Promise<void>,
  ): Promise<void>;
}
export interface ResourceEvent
  extends ContextEvent<{
    id: string;
  }> {
  readonly type: 'resource';
}
export interface StateChangeEvent
  extends ContextEvent<{
    oldState: string;
    newState: string;
  }> {
  readonly type: 'state_change';
}
export interface ErrorEvent
  extends ContextEvent<{
    message: string;
  }> {
  readonly type: 'error';
  metadata: EventMetadata & {
    severity: 'critical' | 'warning';
  };
}
export declare function isResourceEvent(
  event: ContextEvent,
): event is ResourceEvent;
export declare function isStateChangeEvent(
  event: ContextEvent,
): event is StateChangeEvent;
export declare function isErrorEvent(event: ContextEvent): event is ErrorEvent;
