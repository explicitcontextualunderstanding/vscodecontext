export const EventType = {
    Resource: 'resource',
    StateChange: 'state_change',
    Error: 'error',
};
export function isResourceEvent(event) {
    return event.type === 'resource';
}
export function isStateChangeEvent(event) {
    return event.type === 'state_change';
}
export function isErrorEvent(event) {
    return event.type === 'error';
}
//# sourceMappingURL=events.js.map