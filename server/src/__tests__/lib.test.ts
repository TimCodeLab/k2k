import { describe, it, expect } from 'vitest';
import { offlineAdvice } from '../lib/ai';
import { uid, orderId } from '../lib/helpers';
import { signToken, verifyToken } from '../lib/auth';
import type { Env } from '../types';

const env = { JWT_SECRET: 'test-secret' } as unknown as Env;

describe('helpers', () => {
  it('uid is prefixed and unique', () => {
    const a = uid('u'), b = uid('u');
    expect(a.startsWith('u_')).toBe(true);
    expect(a).not.toBe(b);
  });
  it('orderId matches the AGRI-2026-XXXX shape', () => {
    expect(orderId()).toMatch(/^AGRI-2026-[A-Z0-9]+$/);
  });
});

describe('offlineAdvice (Khmer fallback)', () => {
  it('always returns Khmer guidance', () => {
    const out = offlineAdvice('my corn has worms', 'Corn');
    expect(out).toContain('ការណែនាំ');
    expect(out).toContain('Corn');
  });
  it('reacts to pest keywords', () => {
    expect(offlineAdvice('there are worms and pests')).toContain('សត្វល្អិត');
  });
});

describe('JWT auth', () => {
  it('signs and verifies a token round-trip', async () => {
    const token = await signToken(env, { sub: 'u_1', role: 'farmer', name: 'Sok' });
    const claims = await verifyToken(env, token);
    expect(claims?.sub).toBe('u_1');
    expect(claims?.role).toBe('farmer');
  });
  it('rejects a tampered token', async () => {
    const token = await signToken(env, { sub: 'u_1', role: 'farmer', name: 'Sok' });
    expect(await verifyToken(env, token + 'x')).toBeNull();
  });
  it('rejects a token signed with a different secret', async () => {
    const token = await signToken(env, { sub: 'u_1', role: 'buyer', name: 'X' });
    expect(await verifyToken({ JWT_SECRET: 'other' } as unknown as Env, token)).toBeNull();
  });
});
