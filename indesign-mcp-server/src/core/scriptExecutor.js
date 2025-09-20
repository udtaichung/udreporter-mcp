/**
 * Core script execution functionality (macOS AppleScript + Windows COM)
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ScriptExecutor {
    // Cache a COM Application instance for Windows to avoid repeated activation
    static _winApp = null;

    static isWindows() {
        return process.platform === 'win32';
    }

    /**
     * Execute AppleScript command (macOS only)
     * @param {string} script - The AppleScript to execute
     * @returns {string} The result of the AppleScript execution
     */
    static async executeAppleScript(script) {
        try {
            const result = execSync(`osascript -e '${script}'`, { encoding: 'utf8' });
            return result.trim();
        } catch (error) {
            throw new Error(`AppleScript execution failed: ${error.message}`);
        }
    }

    /**
     * Resolve a Windows COM InDesign.Application object via winax
     * Tries multiple ProgIDs to maximize compatibility across versions.
     */
    static _getWindowsInDesignApp() {
        if (!this.isWindows()) {
            throw new Error('Windows COM is only available on Windows');
        }
        if (this._winApp) return this._winApp;

        // Lazy-require winax to avoid issues on non-Windows platforms
        const requireCjs = createRequire(import.meta.url);
        let WinaxObject;
        try {
            const winax = requireCjs('winax');
            // winax provides constructor as winax.Object and also sets global.ActiveXObject in CJS
            WinaxObject = winax.Object || global.ActiveXObject;
        } catch (e) {
            throw new Error("Missing dependency 'winax'. Please run: npm install winax");
        }

        // Prefer explicit recent desktop ProgIDs, then generic, then older versions
        const progIDs = [
            // Newer/future first
            'InDesign.Application.2026',
            'InDesign.Application.CC.2026',
            // Current
            'InDesign.Application.2025',
            'InDesign.Application.CC.2025',
            // Generic
            'InDesign.Application',
            // Recent past
            'InDesign.Application.2024',
            'InDesign.Application.CC.2024',
            'InDesign.Application.2023',
            'InDesign.Application.CC.2023',
            'InDesign.Application.2022',
            'InDesign.Application.CC.2022',
            // InDesign Server fallbacks (least preferred)
            'InDesignServer.Application.2025',
            'InDesignServer.Application.2024',
            'InDesignServer.Application',
        ];

        let lastError;
        for (const id of progIDs) {
            try {
                const app = new WinaxObject(id);
                this._winApp = app;
                return app;
            } catch (err) {
                lastError = err;
            }
        }
        throw new Error(
            `Could not create InDesign COM object. Tried: ${progIDs.join(', ')}. ` +
            `Last error: ${lastError?.message || lastError}. ` +
            `Tips: Ensure Adobe InDesign desktop is installed and has been launched at least once, ` +
            `and that COM registration is available. If installation is fresh, try restarting or running once as administrator.`
        );
    }

    /**
     * Execute InDesign ExtendScript/JavaScript code
     * - On Windows: Use COM DoScript via winax
     * - On macOS: Use AppleScript to run the temp JSX file
     * @param {string} script - The ExtendScript to execute
     * @returns {string} The result of the script execution
     */
    static async executeInDesignScript(script) {
        if (this.isWindows()) {
            return await this._executeInDesignScriptWindows(script);
        }
        // macOS path (AppleScript + temp JSX file)
        try {
            const tempScriptPath = path.join(__dirname, '../../temp_script.jsx');
            // Force non-interactive (headless) execution where possible
            const wrapped = [
                'try {',
                '  app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;',
                script,
                '} catch (e) {',
                '  "Error: " + e.message;',
                '}'
            ].join('\n');
            fs.writeFileSync(tempScriptPath, wrapped);

            const appleScript = `
        tell application "Adobe InDesign 2025"
          do script POSIX file "${tempScriptPath}" language javascript
        end tell
      `;

            const result = await this.executeAppleScript(appleScript);

            // Clean up temporary file (best-effort)
            try { fs.unlinkSync(tempScriptPath); } catch {}

            return result;
        } catch (error) {
            throw new Error(`Error executing tool (macOS): ${error.message}`);
        }
    }

    /**
     * Windows: Execute via COM DoScript
     */
    static async _executeInDesignScriptWindows(script) {
        try {
            const app = this._getWindowsInDesignApp();
            // Wrap to enforce non-interactive mode and basic error capture
            const wrapped = [
                'try {',
                '  app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;',
                script,
                '} catch (e) {',
                '  "Error: " + e.message;',
                '}'
            ].join('\n');
            // ScriptLanguage.JAVASCRIPT (numeric enum for COM environments)
            const ScriptLanguage_JAVASCRIPT = 1246973031;
            const result = app.DoScript(wrapped, ScriptLanguage_JAVASCRIPT);
            return (result === undefined || result === null) ? '' : String(result);
        } catch (error) {
            throw new Error(`Windows COM execution failed: ${error.message}`);
        }
    }
}
