import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { PROVINCES } from '../lib/constants';
import { uid } from '../lib/helpers';
import { signToken, getAuth, sixDigitCode } from '../lib/auth';

const auth = new Hono<AppEnv>();

const OTP_TTL_SEC = 5 * 60;

// POST /api/auth/request-otp { phone } — issues a one-time passcode.
// In production this would be sent by SMS; in dev we return it as `dev_code`.
auth.post('/api/auth/request-otp', async (c) => {
  try {
    const { phone } = await c.req.json();
    if (!phone || !/^\d{6,15}$/.test(String(phone))) return c.json({ error: 'invalid_phone' }, 400);

    const code = sixDigitCode();
    const expires = Math.floor(Date.now() / 1000) + OTP_TTL_SEC;
    await c.env.DB.prepare(
      `INSERT INTO otp_codes (phone, code, expires_at, attempts) VALUES (?, ?, ?, 0)
       ON CONFLICT(phone) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at, attempts = 0`
    ).bind(phone, code, expires).run();

    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE phone = ?').bind(phone).first();
    const isDev = (c.env.ENVIRONMENT ?? 'development') !== 'production';
    return c.json({ sent: true, is_registered: !!existing, ...(isDev ? { dev_code: code } : {}) });
  } catch (e: any) {
    return c.json({ error: 'request_otp_failed', detail: String(e?.message ?? e) }, 500);
  }
});

// POST /api/auth/verify-otp { phone, code, [name, role, province, district, khqr_string] }
// Verifies the code, then logs in (existing user) or registers (profile fields present).
// Returns { user, token }.
auth.post('/api/auth/verify-otp', async (c) => {
  try {
    const { phone, code, name, role, province, district, khqr_string } = await c.req.json();
    if (!phone || !code) return c.json({ error: 'missing_fields' }, 400);

    const row: any = await c.env.DB.prepare('SELECT * FROM otp_codes WHERE phone = ?').bind(phone).first();
    if (!row) return c.json({ error: 'no_otp' }, 400);
    if (row.attempts >= 5) return c.json({ error: 'too_many_attempts' }, 429);
    if (row.expires_at < Math.floor(Date.now() / 1000)) return c.json({ error: 'otp_expired' }, 400);
    if (String(row.code) !== String(code)) {
      await c.env.DB.prepare('UPDATE otp_codes SET attempts = attempts + 1 WHERE phone = ?').bind(phone).run();
      return c.json({ error: 'otp_mismatch' }, 400);
    }
    // One-time: consume the code.
    await c.env.DB.prepare('DELETE FROM otp_codes WHERE phone = ?').bind(phone).run();

    let user: any = await c.env.DB.prepare('SELECT * FROM users WHERE phone = ?').bind(phone).first();
    if (!user) {
      // Registration path — profile fields required.
      if (!name || !role || !province || !district) return c.json({ error: 'profile_required' }, 400);
      if (!['farmer', 'buyer', 'logistics'].includes(role)) return c.json({ error: 'invalid_role' }, 400);
      if (!PROVINCES.includes(province)) return c.json({ error: 'invalid_province' }, 400);
      const id = uid('u');
      await c.env.DB.prepare(
        `INSERT INTO users (id, name, role, phone, province, district, khqr_string)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(id, name, role, phone, province, district, khqr_string ?? null).run();
      user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    }

    const token = await signToken(c.env, { sub: user.id, role: user.role, name: user.name });
    return c.json({ user, token });
  } catch (e: any) {
    return c.json({ error: 'verify_otp_failed', detail: String(e?.message ?? e) }, 500);
  }
});

// Returns the current user from the Bearer token.
auth.get('/api/auth/me', async (c) => {
  const claims = await getAuth(c);
  if (!claims) return c.json({ error: 'unauthorized' }, 401);
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(claims.sub).first();
  if (!user) return c.json({ error: 'not_found' }, 404);
  return c.json({ user });
});

auth.get('/api/users/:id', async (c) => {
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(c.req.param('id')).first();
  if (!user) return c.json({ error: 'not_found' }, 404);
  return c.json({ user });
});

export default auth;
