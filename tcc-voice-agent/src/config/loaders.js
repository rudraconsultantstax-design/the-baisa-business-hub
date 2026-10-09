// Loads runtime config, preferring a real file (clients.json / agent-ids.json) and
// falling back to the shipped *.sample.json so the service boots out-of-the-box.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function load(name) {
  const real = path.join(__dirname, `${name}.json`);
  const sample = path.join(__dirname, `${name}.sample.json`);
  const p = fs.existsSync(real) ? real : sample;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { console.error(`[config] failed to load ${name}:`, e.message); return null; }
}

let _clients = load('clients') || [];
let _agentIds = load('agent-ids') || {};

export function getClients() { return _clients; }
export function getClient(id) { return _clients.find((c) => c.id === id) || null; }
export function getAgentId(key) { return _agentIds[key] || null; }
export function getAgentKeyById(bolnaId) {
  return Object.keys(_agentIds).find((k) => _agentIds[k] === bolnaId) || null;
}
