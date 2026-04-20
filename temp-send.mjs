import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

const server = spawn("node", ["src/advanced/index.js"], { stdio: ["pipe", "pipe", "pipe"] });

server.stderr.on("data", chunk => {
  const text = chunk.toString();
  if (text.trim()) {
    console.error(`[server stderr] ${text.trim()}`);
  }
});

await delay(1500);
if (server.exitCode !== null) {
  throw new Error(`Server exited early (code=${server.exitCode})`);
}

let buffer = "";
server.stdout.on("data", chunk => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf('\n')) !== -1) {
    const raw = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!raw) continue;
    console.log('<--', raw);
  }
});

function send(payload) {
  server.stdin.write(`${JSON.stringify(payload)}\n`);
}

send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { clientInfo: { name: 'manual', version: '0.1' }, protocolVersion: '1.0.0', capabilities: {} } });
await delay(300);
send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
await delay(300);
send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_template_blueprints', arguments: {} } });
await delay(300);

server.kill();
