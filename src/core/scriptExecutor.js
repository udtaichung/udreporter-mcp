/**
 * Core script execution via Windows PowerShell + InDesign COM.
 *
 * Eliminates the upstream winax native addon (which would require Visual
 * Studio C++ build tools to compile) by delegating COM attachment to a
 * bundled PowerShell launcher. The macOS AppleScript branch has been
 * removed; this fork targets Windows only (see package.json "os").
 */
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUN_JSX_PS1 = path.join(__dirname, 'run-jsx.ps1');

export class ScriptExecutor {
    static isWindows() {
        return process.platform === 'win32';
    }

    /**
     * Execute an ExtendScript snippet inside Adobe InDesign.
     *
     * Flow:
     *   1. Wrap caller's script with NEVER_INTERACT + try/catch (identical
     *      wrapper to upstream to keep handler JSX byte-compatible).
     *   2. Write wrapped JSX to a temp file (UTF-8).
     *   3. Spawn `powershell -File run-jsx.ps1 -ScriptPath <tempfile>`.
     *      The launcher attaches to InDesign via COM ROT, calls DoScript,
     *      writes result to stdout.
     *   4. Return stdout (trimmed).
     *
     * @param {string} script - Raw ExtendScript/JavaScript to execute.
     * @returns {Promise<string>} Whatever DoScript returned (or empty).
     */
    static async executeInDesignScript(script) {
        if (!this.isWindows()) {
            throw new Error(
                'udreporter-mcp is Windows-only. The upstream macOS AppleScript ' +
                'branch was removed in this fork. See package.json "os": ["win32"].'
            );
        }

        // Wrap to enforce non-interactive mode and capture thrown errors.
        // Kept byte-identical to upstream so all 114+ handler JSX snippets
        // continue to work without modification.
        const wrapped = [
            'try {',
            '  app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;',
            script,
            '} catch (e) {',
            '  "Error: " + e.message;',
            '}'
        ].join('\n');

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'udmcp-'));
        const jsxPath = path.join(tempDir, 'script.jsx');
        fs.writeFileSync(jsxPath, wrapped, { encoding: 'utf8' });

        try {
            const result = execFileSync('powershell', [
                '-NoProfile',
                '-ExecutionPolicy', 'Bypass',
                '-File', RUN_JSX_PS1,
                '-ScriptPath', jsxPath,
            ], {
                encoding: 'utf8',
                windowsHide: true,
                // InDesign preflight / large exports can take a while.
                // 10 minutes avoids hanging forever on a stuck modal while
                // still allowing long-running operations.
                timeout: 600_000,
            });
            return (result ?? '').trim();
        } catch (error) {
            const stderr = (error.stderr ?? '').toString().trim();
            const stdout = (error.stdout ?? '').toString().trim();
            const detail = stderr || stdout || error.message;
            throw new Error(`PowerShell InDesign execution failed: ${detail}`);
        } finally {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
            } catch {
                // swallow cleanup errors
            }
        }
    }
}
