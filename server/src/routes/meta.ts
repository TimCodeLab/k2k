import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { PROVINCES, CATEGORIES } from '../lib/constants';

const meta = new Hono<AppEnv>();

meta.get('/api/health', (c) => c.json({ ok: true }));
meta.get('/api/meta', (c) => c.json({ provinces: PROVINCES, categories: CATEGORIES }));

export default meta;
