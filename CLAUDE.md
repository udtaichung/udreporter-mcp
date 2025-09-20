# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an InDesign MCP (Model Context Protocol) Server that provides programmatic access to Adobe InDesign through 135+ professional tools. It enables AI assistants to automate InDesign workflows through natural language commands.

## Key Development Commands

### Starting the Server
```bash
npm start                    # Start the MCP server
npm run dev                  # Start with debugging enabled
node src/index.js           # Direct execution
```

### Testing
```bash
node tests/index.js --coverage    # Comprehensive integration test
node tests/test-*.js              # Run specific test files
```

The main test entry point is `tests/index.js` which runs comprehensive integration tests covering all 135+ tools and 13 handler classes.

### No Build Step Required
This is a pure Node.js project with no build process - files run directly.

## Architecture Overview

### Core Structure
- **Entry Point**: `src/index.js` - Main server startup
- **Server Class**: `src/core/InDesignMCPServer.js` - Main MCP server implementation
- **Session Management**: `src/core/sessionManager.js` - Handles page dimensions and smart positioning
- **Script Execution**: `src/core/scriptExecutor.js` - Manages AppleScript/ExtendScript execution

### Handler-Based Architecture
The codebase uses a modular handler system with 13 specialized handler classes:

**Core Document & Page Management**
- `DocumentHandlers` - Document lifecycle, preferences, grid settings  
- `PageHandlers` - Page operations, layout, content placement

**Content Creation** 
- `TextHandlers` - Text frames, tables, find/replace
- `GraphicsHandlers` - Shapes, images, object styles
- `StyleHandlers` - Paragraph/character styles, colors

**Advanced Layout**
- `MasterSpreadHandlers` - Master page templates
- `SpreadHandlers` - Spread management  
- `LayerHandlers` - Layer operations
- `PageItemHandlers` - Individual page item control
- `GroupHandlers` - Object grouping and organization

**Production & Export**
- `BookHandlers` - Multi-document book management
- `ExportHandlers` - PDF, images, packaging

**System Utilities**
- `UtilityHandlers` - Code execution, session management
- `HelpHandlers` - Built-in help system
- `PresentationHandlers` - Presentation features

All handlers are centrally exported from `src/handlers/index.js` for consistent imports.

### Tool Definitions
Tool schemas are modularized in `src/types/` directory:
- Each handler category has its own tool definitions file
- Combined into `allToolDefinitions` in `src/types/index.js`
- 135+ total professional tools covering all major InDesign functionality

### Session Management Integration
Session management is transparent and automatic:
- **Page Dimension Tracking**: Automatically stores document dimensions when creating/opening documents
- **Smart Positioning**: Calculates optimal content placement when coordinates aren't provided  
- **Workflow Continuity**: Maintains state across operations without separate calls required
- **Bounds Checking**: Prevents content from being placed off-page

## Platform Requirements

### Prerequisites
- **Adobe InDesign 2025** (20.0.0.95 or later) - Must be installed and running
- **Node.js 18+** 
- **macOS** - Required for AppleScript support (uses AppleScript to communicate with InDesign)
- **winax** dependency for Windows compatibility (though primarily designed for macOS)

## Key Implementation Patterns

### Handler Pattern
Each handler class provides specialized functionality for a category of operations. Handlers are:
- Self-contained with related functionality grouped together
- Integrated with session management automatically
- Error-handled with comprehensive recovery mechanisms

### Smart Positioning
Content creation tools automatically position elements when coordinates aren't specified:
```javascript
// Automatic positioning based on page dimensions and margins
await callTool('create_text_frame', { 
  content: 'Hello World', 
  fontSize: 14 
});
```

### Session-Aware Operations  
Operations that create/modify documents automatically update session state:
- Document creation stores page dimensions
- Content placement uses smart positioning
- State persists across tool calls

## Error Handling Strategy
- **Graceful Degradation**: Operations continue when possible
- **Detailed Error Messages**: Clear error descriptions with context
- **Recovery Mechanisms**: Automatic cleanup and state restoration
- **Session Protection**: Session data preserved during errors

## Testing Approach
The project includes comprehensive testing:
- **Integration Tests**: Full workflow testing via `tests/index.js`
- **Component Tests**: Individual handler and feature testing
- **Coverage Testing**: All 135+ tools and 13 handlers verified
- **Real-world Scenarios**: Tests use actual InDesign operations

## MCP Protocol Implementation
Implements Model Context Protocol (MCP) v0.5.0:
- **Tool Discovery**: Dynamic tool list via `ListToolsRequestSchema`
- **Tool Execution**: Standardized execution via `CallToolRequestSchema`  
- **Error Formatting**: Consistent response formatting with `formatResponse`/`formatErrorResponse`
- **Transport**: Uses `StdioServerTransport` for communication

When working with this codebase:
1. All operations go through the MCP protocol layer
2. Handlers provide the actual InDesign integration logic
3. Session management happens transparently 
4. Testing should verify both MCP protocol compliance and InDesign functionality