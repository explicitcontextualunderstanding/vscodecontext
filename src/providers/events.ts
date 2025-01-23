/**
 * Comprehensive enum defining all possible context event types
 * Categorized by domain and operation type
 */
export enum ContextEventType {
  // Editor Events
  EDITOR_CONTENT_CHANGED = 'editor.content.changed',
  EDITOR_SELECTION_CHANGED = 'editor.selection.changed',
  EDITOR_FOCUSED = 'editor.focused',
  EDITOR_CLOSED = 'editor.closed',

  // Terminal Events
  TERMINAL_CREATED = 'terminal.created',
  TERMINAL_CLOSED = 'terminal.closed',
  TERMINAL_DATA = 'terminal.data',
  TERMINAL_ACTIVE_CHANGED = 'terminal.active.changed',

  // Workspace Events
  WORKSPACE_FOLDER_ADDED = 'workspace.folder.added',
  WORKSPACE_FOLDER_REMOVED = 'workspace.folder.removed',
  WORKSPACE_FILE_CHANGED = 'workspace.file.changed',
  WORKSPACE_CONFIG_CHANGED = 'workspace.config.changed',

  // Debug Events
  DEBUG_SESSION_STARTED = 'debug.session.started',
  DEBUG_SESSION_STOPPED = 'debug.session.stopped',
  DEBUG_BREAKPOINT_CHANGED = 'debug.breakpoint.changed',

  // SCM Events
  SCM_STATUS_CHANGED = 'scm.status.changed',
  SCM_BRANCH_CHANGED = 'scm.branch.changed',
  SCM_COMMIT_MADE = 'scm.commit.made',

  // Task Events
  TASK_STARTED = 'task.started',
  TASK_COMPLETED = 'task.completed',
  TASK_FAILED = 'task.failed',

  // Provider Lifecycle Events
  PROVIDER_INITIALIZED = 'provider.initialized',
  PROVIDER_DISPOSED = 'provider.disposed',
  PROVIDER_ERROR = 'provider.error',

  // Context Management Events
  CONTEXT_REQUESTED = 'context.requested',
  CONTEXT_GATHERED = 'context.gathered',
  CONTEXT_ERROR = 'context.error',

  // Cache Events
  CACHE_HIT = 'cache.hit',
  CACHE_MISS = 'cache.miss',
  CACHE_INVALIDATED = 'cache.invalidated',
  CACHE_UPDATED = 'cache.updated',
}

/**
 * Priority levels for context events
 */
export enum EventPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Interface defining the metadata structure for context events
 */
export interface EventMetadata {
  correlationId: string;
  timestamp: number;
  priority: EventPriority;
  cached?: boolean;
  ttl?: number; // Time-to-live in milliseconds
}

/**
 * Generic interface for context event payloads
 */
export interface ContextEvent<T = unknown> {
  type: ContextEventType;
  source: string;
  data: T;
  metadata: EventMetadata;
}

/**
 * Interface for events that affect specific files or resources
 */
export interface ResourceEvent {
  type: ContextEventType;
  source: string;
  data: {
    uri: string;
    type: string;
    content?: unknown;
  };
  metadata: EventMetadata;
}

/**
 * Interface for events that represent state changes
 */
export interface StateChangeEvent {
  type: ContextEventType;
  source: string;
  data: {
    previous: unknown;
    current: unknown;
    changes: unknown[];
  };
  metadata: EventMetadata;
}

/**
 * Interface for error events
 */
export interface ErrorEvent {
  type: ContextEventType;
  source: string;
  data: {
    error: Error;
    context?: unknown;
    stackTrace?: string;
  };
  metadata: EventMetadata;
}

/**
 * Type guard to check if an event is a ResourceEvent
 */
export function isResourceEvent(event: ContextEvent): event is ResourceEvent {
  const data = event.data as { uri?: string; type?: string };
  return typeof data === 'object' && data !== null && 'uri' in data && 'type' in data;
}

/**
 * Type guard to check if an event is a StateChangeEvent
 */
export function isStateChangeEvent(event: ContextEvent): event is StateChangeEvent {
  const data = event.data as { previous?: unknown; current?: unknown };
  return typeof data === 'object' && data !== null && 'previous' in data && 'current' in data;
}

/**
 * Type guard to check if an event is an ErrorEvent
 */
export function isErrorEvent(event: ContextEvent): event is ErrorEvent {
  const data = event.data as { error?: Error };
  return typeof data === 'object' && data !== null && 'error' in data;
}

/**
 * Utility function to create a correlation ID for event tracking
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Utility function to create event metadata
 */
export function createEventMetadata(
  priority: EventPriority = EventPriority.MEDIUM,
  ttl?: number,
): EventMetadata {
  return {
    correlationId: generateCorrelationId(),
    timestamp: Date.now(),
    priority,
    ttl,
  };
}

/**
 * Factory function to create a new context event
 */
export function createContextEvent<T>(
  type: ContextEventType,
  source: string,
  data: T,
  priority?: EventPriority,
  ttl?: number,
): ContextEvent<T> {
  return {
    type,
    source,
    data,
    metadata: createEventMetadata(priority, ttl),
  };
}
