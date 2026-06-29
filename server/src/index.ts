import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv } from './types';

import meta from './routes/meta';
import auth from './routes/auth';
import crops from './routes/crops';
import orders from './routes/orders';
import ai from './routes/ai';
import calendar from './routes/calendar';
import media from './routes/media';

const app = new Hono<AppEnv>();

// Verification Checklist #2 — strict but functional CORS for Ionic web/native.
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.get('/', (c) => c.json({ service: 'AgriK2K API', status: 'ok', time: new Date().toISOString() }));

// Feature routers.
app.route('/', meta);
app.route('/', auth);
app.route('/', crops);
app.route('/', orders);
app.route('/', ai);
app.route('/', calendar);
app.route('/', media);

app.notFound((c) => c.json({ error: 'route_not_found', path: c.req.path }, 404));

export default app;
