// Bolna API client. Endpoints verified against docs.bolna.ai (2026):
//   POST /v2/agent      -> create agent
//   POST /call          -> place outbound call (dynamic vars in user_data)
//   GET  /executions/:id-> fetch a call record
// Auth: Authorization: Bearer <BOLNA_API_KEY>
const BASE = process.env.BOLNA_BASE_URL || 'https://api.bolna.ai';
const KEY = process.env.BOLNA_API_KEY || '';
const DRY = process.env.DRY_RUN === 'true' || !KEY;

async function call(method, pathname, body) {
  if (DRY) {
    console.log(`[bolna:DRY_RUN] ${method} ${pathname}`, body ? JSON.stringify(body).slice(0, 300) : '');
    if (pathname === '/call') return { message: 'done', status: 'queued', execution_id: 'dry-' + Date.now() };
    if (pathname === '/v2/agent') return { agent_id: 'dry-agent-' + Math.random().toString(36).slice(2, 8), state: 'created' };
    return { dry_run: true };
  }
  const res = await fetch(BASE + pathname, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000), // don't hang a request forever
  });
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Bolna ${method} ${pathname} -> ${res.status}: ${text.slice(0, 300)}`);
  return json;
}

export function createAgent(agentBody) { return call('POST', '/v2/agent', agentBody); }

export function makeOutboundCall({ agentId, toNumber, fromNumber, userData }) {
  const body = { agent_id: agentId, recipient_phone_number: toNumber };
  if (fromNumber) body.from_phone_number = fromNumber;
  if (userData && Object.keys(userData).length) body.user_data = userData;
  return call('POST', '/call', body);
}

export function getExecution(id) { return call('GET', `/executions/${id}`); }

export const isDryRun = DRY;
