# Technical Context

## Technologies Used

- VS Code Extension API
- TypeScript
- Language Model API
- Jest Testing Framework
- Webpack for bundling

## Development Setup

1. **Project Structure**

   - src/: Source code
   - tests/: Test files
   - cline_docs/: Documentation
   - extension/: Built extension files

2. **Key Files**
   - package.json: Extension manifest and dependencies
   - tsconfig.json: TypeScript configuration
   - webpack.config.js: Build configuration
   - extension.ts: Extension entry point

## Technical Constraints

1. **VS Code API**

   - Limited access to internal terminal properties
   - Must handle API version differences
   - Async nature of terminal operations

2. **Language Model Integration**

   - Tool registration must match package.json schema
   - Input validation requirements
   - Performance considerations for context gathering

3. **Extension Lifecycle**
   - Proper cleanup on deactivation
   - Resource management
   - Event listener handling

## Development Guidelines

1. Use TypeScript strict mode
2. Follow VS Code extension best practices
3. Maintain comprehensive documentation
4. Write tests for new functionality
5. Handle errors gracefully
