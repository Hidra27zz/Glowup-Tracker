import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'glowup_auth_user';
const SECRET_KEY = process.env.AUTH_SECRET || 'glowup_os_hmac_secret_key_v2_2026';

export interface SignedSessionPayload {
  id: string;
  name: string;
  email: string;
  majorOrField: string;
  role: string;
  sessionToken?: string;
  exp?: number;
}

export function signSessionCookieValue(payload: SignedSessionPayload): string {
  const withExp: SignedSessionPayload = {
    ...payload,
    exp: payload.exp || Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const jsonB64 = Buffer.from(JSON.stringify(withExp), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET_KEY).update(jsonB64).digest('base64url');
  return `${jsonB64}.${sig}`;
}

export function verifySessionCookieValue(rawCookie?: string | null): SignedSessionPayload | null {
  if (!rawCookie) return null;

  // 1. Verify HMAC-signed token format: <base64url>.<hmac>
  if (rawCookie.includes('.')) {
    const [jsonB64, sig] = rawCookie.split('.');
    if (!jsonB64 || !sig) return null;
    const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(jsonB64).digest('base64url');
    if (sig !== expectedSig) return null;
    try {
      const parsed = JSON.parse(Buffer.from(jsonB64, 'base64url').toString('utf8')) as SignedSessionPayload;
      if (parsed.exp && parsed.exp < Date.now()) return null;
      if (parsed && typeof parsed.id === 'string' && parsed.id.trim() !== '') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  // 2. Backward-compatible fallback for legacy JSON cookie
  try {
    const parsed = JSON.parse(rawCookie) as SignedSessionPayload;
    if (parsed && typeof parsed.id === 'string' && parsed.id.trim() !== '') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function hashPasswordSecure(password: string): string {
  const randomSalt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, randomSalt, 32).toString('hex');
  return `${randomSalt}:${derived}`;
}

export function verifyPasswordSecure(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.includes(':')) {
    const [salt, hash] = storedHash.split(':');
    const derived = crypto.scryptSync(password, salt, 32).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  }
  // Legacy fixed-salt compatibility
  const legacySalt = 'glowup_os_salt_v1';
  const legacyHash = crypto.scryptSync(password, legacySalt, 32).toString('hex');
  return storedHash === legacyHash;
}
