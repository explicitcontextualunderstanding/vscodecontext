# System Patterns

## Architecture Overview

The extension follows a modular architecture with clear separation of concerns:

1. **Core Components**

   - Extension Entry Point (extension.ts)
   - Context Providers
   - Services
   - Language Model Tools

2. **Design Patterns**
   - Service Pattern: Dedicated services for specific functionality
   - Provider Pattern: Context providers for different VS Code features
   - Dependency Injection: Services injected into tools and providers
   - Command Pattern: VS Code commands for user interactions

## Key Technical Decisions

### Terminal Information Architecture

1. **Decoupled Service Approach**

   - Separate TerminalService from TerminalContextProvider
   - Direct VS Code API interaction in service layer
   - Clean separation between context gathering and tool functionality

2. **Language Model Tool Integration**

   - Tools receive services through constructor injection
   - Static registration via package.json
   - Runtime registration in extension activation

3. **Error Handling**
   - Graceful fallbacks for unavailable terminal information
   - Clear error messages for debugging
   - Proper cleanup on deactivation

## Technical Stack

- TypeScript for type safety
- VS Code Extension API
- Language Model API for tool integration
- Jest for testing
