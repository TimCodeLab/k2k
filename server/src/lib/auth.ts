import type { Context } from 'hono';
import type { AppEnv, Env } from '../types';

// Minimal JWT (HS256) using Web Crypto — no external deps, Workers-native.
const enc = new TextEncoder();

function b64url(data: ArrayBuffer | string): string {
  const bytes = typeof data === 'string' ? enc.encode(data) : new Uint8Array(data);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToString(s: string): string {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return atob(pad);
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

const secretOf = (env: Env) => (env as any).JWT_SECRET || 'agrik2k-dev-secret-change-me';

export interface AuthClaims { sub: string; role: string; name: string; iat: number; exp: number; }

export async function signToken(env: Env, claims: Omit<AuthClaims, 'iat' | 'exp'>, ttlSec = 60 * 60 * 24 * 30): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthClaims = { ...claims, iat: now, exp: now + ttlSec };
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const key = await hmacKey(secretOf(env));
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(`${head}.${body}`));
  return `${head}.${body}.${b64url(sig)}`;
}

export async function verifyToken(env: Env, token: string): Promise<AuthClaims | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  try {
    const key = await hmacKey(secretOf(env));
    const expected = b64url(await crypto.subtle.sign('HMAC', key, enc.encode(`${head}.${body}`)));
    if (expected !== sig) return null;
    const claims = JSON.parse(b64urlToString(body)) as AuthClaims;
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

// Read & verify the Bearer token from the request. Returns null if missing/invalid.
export async function getAuth(c: Context<AppEnv>): Promise<AuthClaims | null> {
  const header = c.req.header('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  return verifyToken(c.env, token);
}

export const sixDigitCode = () => String(Math.floor(100000 + Math.random() * 900000));
