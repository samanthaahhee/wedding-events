// Cookie-based admin session, single-user.
// HMAC-SHA256 signed cookie via Web Crypto so it works in Edge middleware.

const COOKIE_NAME = "admin_session";
const SESSION_DURATION_DAYS = 30;
const SESSION_DURATION_SECONDS = SESSION_DURATION_DAYS * 24 * 60 * 60;

type SessionPayload = {
  /** Issued-at timestamp, seconds since epoch */
  iat: number;
  /** Expiry timestamp, seconds since epoch */
  exp: number;
};

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or shorter than 32 chars",
    );
  }
  return secret;
}

function b64urlEncode(bytes: Uint8Array): string {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacSha256(secret: string, data: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return new Uint8Array(sig);
}

function constantTimeEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Create a signed cookie value representing a fresh session. */
export async function createSessionCookie(): Promise<{
  name: string;
  value: string;
  maxAge: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };
  const payloadB64 = b64urlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const sig = await hmacSha256(getSecret(), payloadB64);
  const sigB64 = b64urlEncode(sig);
  return {
    name: COOKIE_NAME,
    value: `${payloadB64}.${sigB64}`,
    maxAge: SESSION_DURATION_SECONDS,
  };
}

/** Returns true if the cookie verifies and is not expired. */
export async function verifySessionCookie(
  value: string | undefined,
): Promise<boolean> {
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  let expected: Uint8Array;
  try {
    expected = b64urlDecode(sigB64);
  } catch {
    return false;
  }
  let actual: Uint8Array;
  try {
    actual = await hmacSha256(getSecret(), payloadB64);
  } catch {
    return false;
  }
  if (!constantTimeEquals(actual, expected)) return false;
  let payload: SessionPayload;
  try {
    const json = new TextDecoder().decode(b64urlDecode(payloadB64));
    payload = JSON.parse(json) as SessionPayload;
  } catch {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp < now) return false;
  return true;
}

export const COOKIE_KEY = COOKIE_NAME;
