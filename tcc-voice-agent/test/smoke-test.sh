#!/usr/bin/env bash
# End-to-end smoke test in DRY_RUN (no real API calls). Isolated data dir.
# Verifies: token auth, telephony_data phone mapping, webhook idempotency,
# compliance gates, x-api-key auth, and billing.
set -e
cd "$(dirname "$0")/.."

TMPDATA="$(mktemp -d)"
export DRY_RUN=true CALL_WINDOW_START=0 CALL_WINDOW_END=24 PORT=3999 \
       INTERNAL_API_KEY=testkey COGS_PER_MIN=5.5 BOLNA_WEBHOOK_TOKEN=whsecret DATA_DIR="$TMPDATA"
node src/server.js & SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true; rm -rf "$TMPDATA"' EXIT
sleep 1.3
BASE=http://localhost:3999
MONTH=$(TZ=Asia/Kolkata date +%Y-%m)
hr(){ echo; echo "──────── $1"; }

hr "health";                       curl -s $BASE/health; echo
hr "webhook: BAD token (should 401)"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$BASE/webhooks/bolna?client_id=tcc&agent=receptionist&token=wrong" -H 'content-type: application/json' -d @test/mock-webhook.json
hr "webhook: inbound receptionist (customer from telephony_data.from_number; hot + needs-human)"
  curl -s -X POST "$BASE/webhooks/bolna?client_id=tcc&agent=receptionist&token=whsecret" -H 'content-type: application/json' -d @test/mock-webhook.json; echo
hr "webhook: SAME execution again (idempotent → duplicate, NO double-bill)"
  curl -s -X POST "$BASE/webhooks/bolna?client_id=tcc&agent=receptionist&token=whsecret" -H 'content-type: application/json' -d @test/mock-webhook.json; echo
hr "webhook: sawai-dental usage 650 min (telephony_data.to_number)"
  curl -s -X POST "$BASE/webhooks/bolna?client_id=sawai-dental&agent=gst_reminder&token=whsecret" -H 'content-type: application/json' \
    -d '{"id":"exec-002","status":"completed","conversation_duration":39000,"telephony_data":{"duration":39000,"call_type":"outbound","to_number":"+919812300011","provider":"plivo"}}'; echo
hr "outbound: service gst_reminder (should PASS)"
  curl -s -X POST $BASE/calls/outbound -H 'content-type: application/json' -H 'x-api-key: testkey' \
    -d '{"client_id":"sawai-dental","agent":"gst_reminder","to_number":"+919812300011","variables":{"customer_name":"Dr Meena","return_type":"GSTR-3B","due_date":"20 Aug"}}'; echo
hr "outbound: promotional WITHOUT consent (should BLOCK: NO_CONSENT)"
  curl -s -X POST $BASE/calls/outbound -H 'content-type: application/json' -H 'x-api-key: testkey' -d '{"agent":"lead_qualify","to_number":"+919812300044"}'; echo
hr "outbound: promotional WITH consent (should PASS)"
  curl -s -X POST $BASE/calls/outbound -H 'content-type: application/json' -H 'x-api-key: testkey' -d '{"agent":"lead_qualify","to_number":"+919812300044","consent_ref":"web_form_123"}'; echo
hr "auth: outbound without x-api-key (should 401)"
  curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST $BASE/calls/outbound -H 'content-type: application/json' -d '{"agent":"feedback","to_number":"+919812300000"}'
hr "billing: portfolio (sawai-dental = 650 min once, NOT doubled)"
  curl -s "$BASE/billing?month=$MONTH" -H 'x-api-key: testkey'; echo
echo; echo "✅ smoke test done"
