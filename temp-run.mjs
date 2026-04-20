import { spawn } from "child_process";
import { setTimeout as delay } from "timers/promises";

function createProcess(command, args) {
  return spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
}

async function readMessages(proc, label) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    let messages = [];

    const onData = (chunk) => {
      buffer += chunk.toString();
      let idx;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const raw = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!raw) continue;
        messages.push(raw);
      }
    };

    const onClose = () => {
      proc.stdout.off("data", onData);
      resolve(messages);
    };

    proc.stdout.on("data", onData);
    proc.on("exit", onClose);
    proc.on("error", (err) => {
      proc.stdout.off("data", onData);
      reject(err);
    });
  });
}

async function main() {
  const server = createProcess("node", ["src/advanced/index.js"]);
  server.stderr.on("data", chunk => {
    const text = chunk.toString();
    if (text.trim()) {
      console.error(`[server stderr] ${text.trim()}`);
    }
  });

  await delay(1500);
  if (server.exitCode !== null) {
    throw new Error(`Server exited early with code ${server.exitCode}`);
  }

  const client = createProcess("node", ["scripts/send-mcp-message.js", "tools/list"]);
  const result = await readMessages(client, "client");
  console.log("client output:", JSON.stringify(result, null, 2));

  server.kill();
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
