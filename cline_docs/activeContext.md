# Active Context

## Current Work

Implementing a decoupled terminal service architecture to:

1. Separate terminal functionality from TerminalContextProvider
2. Create a dedicated TerminalService for better separation of concerns
3. Refactor the Language Model Tool to use the new service

## Recent Changes

- Added initial documentation for Language Model Tool registration
- Created Memory Bank documentation structure
- Established product context documentation

## Next Steps

1. Review current TerminalContextProvider implementation
2. Create new TerminalService class
3. Implement ActiveTerminalTool using new service
4. Update extension.ts for proper registration
5. Test the new implementation
