// Zoho CRM (India DC) integration — refresh-token OAuth, then upsert Lead + add a call note.
const ACCOUNTS = process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in';
const API = process.env.ZOHO_API_DOMAIN || 'https://www.zohoapis.in';
const DRY = process.env.DRY_RUN === 'true' || !process.env.ZOHO_REFRESH_TOKEN;

let _token = null, _exp = 0;
async function accessToken() {
  if (_token && Date.now() < _exp) return _token;
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN,
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });
  const res = await fetch(`${ACCOUNTS}/oauth/v2/token?${params}`, { method: 'POST' });
  const j = await res.json();
  if (!j.access_token) throw new Error('Zoho token error: ' + JSON.stringify(j));
  _token = j.access_token; _exp = Date.now() + 55 * 60 * 1000;
  return _token;
}

// Create or update a Lead by phone. Returns { id } (mock in DRY_RUN).
export async function upsertLead({ name, phone, intent, source = 'AI Voice Agent', score, transcript, recordingUrl }) {
  if (DRY) {
    console.log(`[zoho:DRY_RUN] upsertLead`, { name, phone, intent, score });
    return { id: 'dry-lead-' + Date.now(), dry_run: true };
  }
  const token = await accessToken();
  const [first, ...rest] = String(name || 'Voice Lead').trim().split(' ');
  const payload = {
    data: [{
      Last_Name: rest.join(' ') || first || 'Lead',
      First_Name: rest.length ? first : undefined,
      Phone: phone,
      Lead_Source: source,
      Description: [intent && `Intent: ${intent}`, score != null && `Score: ${score}`, recordingUrl && `Recording: ${recordingUrl}`, transcript && `Transcript:\n${transcript}`].filter(Boolean).join('\n'),
    }],
    duplicate_check_fields: ['Phone'],
  };
  const res = await fetch(`${API}/crm/v8/Leads/upsert`, {
    method: 'POST',
    headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const j = await res.json();
  const id = j?.data?.[0]?.details?.id;
  if (!id) throw new Error('Zoho upsert failed: ' + JSON.stringify(j).slice(0, 300));
  return { id };
}

export const isDryRun = DRY;
