import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { uid } from '../lib/helpers';

const media = new Hono<AppEnv>();

// Feature 4: worker stores the (already compressed) image to R2, returns a lightweight URL.
media.post('/api/upload', async (c) => {
  try {
    if (!c.env.BUCKET) {
      // Local dev without R2 — echo back so the flow still works.
      return c.json({ url: null, stored: false, note: 'R2 not bound in this environment' });
    }
    const form = await c.req.formData();
    const file = form.get('file') as unknown as File | null;
    if (!file || typeof file.arrayBuffer !== 'function') return c.json({ error: 'no_file' }, 400);
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    const key = `crops/${uid('img')}.${ext}`;
    await c.env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || 'image/jpeg' },
    });
    return c.json({ url: `/media/${key}`, stored: true });
  } catch (e: any) {
    return c.json({ error: 'upload_failed', detail: String(e?.message ?? e) }, 500);
  }
});

media.get('/media/*', async (c) => {
  if (!c.env.BUCKET) return c.json({ error: 'no_bucket' }, 404);
  const key = c.req.path.replace('/media/', '');
  const obj = await c.env.BUCKET.get(key);
  if (!obj) return c.json({ error: 'not_found' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  return new Response(obj.body, { headers });
});

export default media;
