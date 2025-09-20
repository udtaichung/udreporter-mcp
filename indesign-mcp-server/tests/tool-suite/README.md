# Tool Suite Automation

`run-all-tools.js` starts the MCP server, iterates every tool definition exported under `src/types`, and records pass/fail status for each invocation.

## Usage

```
node tests/tool-suite/run-all-tools.js
```

Logs are stored in `tests/tool-suite/logs/` with a timestamped filename. Each log entry contains the tool name, success flag, and the returned message or error for post-run analysis.
