import path from 'path';
import { pathToFileURL } from 'url';

const typesUrl = pathToFileURL(path.join(process.cwd(), 'indesign-mcp-server', 'src', 'types', 'index.js')).href;
const { allToolDefinitions } = await import(typesUrl);
const seen = new Map();
const dups = [];
for (const t of allToolDefinitions) {
  if (!t?.name) continue;
  const k = t.name;
  if (seen.has(k)) dups.push(k);
  else seen.set(k, true);
}
if (dups.length) {
  console.log('Duplicate tool names:', Array.from(new Set(dups)).join(', '));
  process.exit(1);
} else {
  console.log('No duplicate tool names found.');
}
