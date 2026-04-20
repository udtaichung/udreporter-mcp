/**
 * Smoke test: verify the PowerShell COM bridge reaches InDesign
 * and returns ExtendScript evaluation results.
 *
 * Usage:    node tests/smoke-powershell.mjs
 * Expects:  Adobe InDesign desktop installed and launched at least
 *           once (so COM is registered).
 *
 * Exits 0 on success, 1 on failure.
 */
import { ScriptExecutor } from '../src/core/scriptExecutor.js';

const jsx = '"version=" + app.version + "; documents=" + app.documents.length + "; locale=" + app.locale';

try {
    const start = Date.now();
    const result = await ScriptExecutor.executeInDesignScript(jsx);
    const elapsed = Date.now() - start;
    console.log(`[OK] round-trip took ${elapsed}ms`);
    console.log(`[OK] InDesign returned: ${result}`);
    process.exit(0);
} catch (err) {
    console.error(`[FAIL] ${err.message}`);
    process.exit(1);
}
