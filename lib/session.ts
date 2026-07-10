// Stateless, signed session tokens (JWT-style HMAC).
//
// Why: on serverless (Vercel) each request can land on a different instance, so
// server-stored sessions in an in-memory store are unreliable. A signed cookie
// carries the identity itself and is verified by any instance with the same
// secret — no shared session store required.

import crypto from "node:crypto";

export interface SessionPayload {
  userId: string;
  orgId: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff";
  iat: number;
}

function secret(): string {
  // Prefer an explicit secret; fall back to the Supabase service key (a real
  // secret that's set in production anyway); last resort is a dev constant.
  return process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "baisa-os-dev-secret-set-AUTH_SECRET";
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function signSession(payload: Omit<SessionPayload, "iat">): string {
  const full: SessionPayload = { ...payload, iat: Date.now() };
  const body = b64url(JSON.stringify(full));
  const sig = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  return `${body}.${sig}`;
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", secret()).update(body).digest());
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
    // 30-day expiry
    if (!payload.iat || Date.now() - payload.iat > 1000 * 60 * 60 * 24 * 30) return null;
    return payload;
  } catch {
    return null;
  }
}
