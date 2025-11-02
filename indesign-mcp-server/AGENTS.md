# Repository Guidelines

## Project Structure & Module Organization
The working sources live in `indesign-mcp-server/src`: `core/` holds the MCP runtime (`InDesignMCPServer`, session and script executors), `handlers/` groups every tool family (document, page, style, graphics, export, etc.), `types/` defines the tool metadata consumed by the handlers, and `utils/` contains shared helpers like `stringUtils.js`. Scenario-driven tests are under `indesign-mcp-server/tests`, with `index.js` orchestrating suites (required vs. optional) and individual `test-*.js` files mirroring handler boundaries. Reference material, diagrams, and onboarding notes live in the workspace-level `docs/` directory, while `scripts/` stores maintenance helpers such as `fix_schemas.js`. Keep new code and accompanying docs co-located within these folders to simplify discoverability.

## Build, Test, and Development Commands
Run all commands from `indesign-mcp-server/` unless stated otherwise.
- `npm install`: install Node ≥18 dependencies (`@modelcontextprotocol/sdk`, `winax` COM bridge).
- `npm run start`: launch the MCP server via `src/index.js` for CLI or batch usage.
- `npm run dev`: start with `--inspect` for debugging sessions inside VS Code or Chrome DevTools.
- `npm run build`: placeholder (no transpilation); extend only if bundling becomes necessary.
- `node tests/index.js [--required|--help]`: execute the real-time test harness or limit runs to the mandatory suites.
- `start-indesign-mcp.bat` (repo root): convenience launcher that boots the server with a pre-configured working directory—update the path before sharing externally.

## Coding Style & Naming Conventions
Use ES modules with explicit file extensions, 4-space indentation, and semicolons. Export classes (e.g., `DocumentHandlers`) in PascalCase, individual tool functions in camelCase, and keep tool names aligned with `types/toolDefinitions*.js`. Group handler logic by feature; avoid monolithic files outside the existing folder boundaries. Favor descriptive log messages written to `stderr` (not `stdout`) to preserve MCP protocol streams. Run `node --check` or your editor’s ESLint integration before committing if you adjust the toolchain.

## Testing Guidelines
Every new handler or tool must include at least one scenario in `tests/test-*.js` plus coverage wiring inside `tests/index.js`. Required suites validate baseline connectivity, document creation, and grid/layout; optional suites stress advanced workflows. When adding CLI flags or transport behavior, extend `tests/unified-test-runner.js` so the progress UI and coverage report stay truthful. Document any external assets referenced by tests inside `tests/README.md`.

## Commit & Pull Request Guidelines
Follow the existing conventional-commit style (`type: summary`), as seen in `refactor: improve script execution and session management`. Keep subject lines under 72 characters, and describe motivation plus impact in the body when refactoring COM or handler code. Pull requests should include: (1) a concise overview of the change, (2) linked issues or MCP tickets, (3) reproduction steps or sample tool invocations, and (4) screenshots/log excerpts if UI prompts or InDesign panels are affected. Mention any manual test commands you executed so reviewers can replay them quickly.

## Environment & Security Tips
The server uses `winax` to talk to Adobe InDesign via COM automation; contributions must be validated on Windows with InDesign installed and accessible under the same user session. Avoid logging document contents or customer asset paths—prefer anonymized snippets in test fixtures (`tests/test-data.csv`). If you modify `start-indesign-mcp.bat`, keep credentials or machine-specific paths out of version control and reference environment variables instead.
