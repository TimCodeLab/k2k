import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { CATEGORIES, PROVINCES } from '../lib/constants';
import { getAuth } from '../lib/auth';

const crops = new Hono<AppEnv>();

// GET /api/crops?category=Rice&province=Battambang&q=pepper&sort=price_asc
crops.get('/api/crops', async (c) => {
  const category = c.req.query('category');
  const province = c.req.query('province');
  const q = c.req.query('q');
  const sort = c.req.query('sort');
  let sql = `SELECT c.*, u.name AS farmer_name, u.province AS farmer_province, u.district AS farmer_district, u.phone AS farmer_phone
             FROM crops c JOIN users u ON u.id = c.farmer_id
             WHERE c.status = 'available'`;
  const binds: any[] = [];
  if (category && CATEGORIES.includes(category)) { sql += ' AND c.category = ?'; binds.push(category); }
  if (province && PROVINCES.includes(province)) { sql += ' AND u.province = ?'; binds.push(province); }
  if (q && q.trim()) { sql += ' AND c.crop_name LIKE ?'; binds.push(`%${q.trim()}%`); }

  const order = sort === 'price_asc' ? 'c.price_per_kg_khr ASC'
    : sort === 'price_desc' ? 'c.price_per_kg_khr DESC'
    : 'c.created_at DESC';
  sql += ` ORDER BY ${order}`;

  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ crops: results });
});

crops.get('/api/crops/:id', async (c) => {
  const crop = await c.env.DB.prepare(
    `SELECT c.*, u.name AS farmer_name, u.province AS farmer_province, u.district AS farmer_district,
            u.phone AS farmer_phone, u.khqr_string AS farmer_khqr
     FROM crops c JOIN users u ON u.id = c.farmer_id WHERE c.id = ?`
  ).bind(c.req.param('id')).first();
  if (!crop) return c.json({ error: 'not_found' }, 404);
  return c.json({ crop });
});

// POST /api/crops/new — lets a farmer publish a new produce listing.
// Identity (farmer_id) comes from the verified token, never the request body.
crops.post('/api/crops/new', async (c) => {
  try {
    const claims = await getAuth(c);
    if (!claims) return c.json({ error: 'unauthorized' }, 401);
    if (claims.role !== 'farmer') return c.json({ error: 'farmers_only' }, 403);
    const farmer_id = claims.sub;

    const { crop_name, category, quantity_kg, price_per_kg_khr, image_url, harvest_date } = await c.req.json();
    if (!crop_name || !category || quantity_kg == null || price_per_kg_khr == null)
      return c.json({ error: 'missing_fields' }, 400);
    if (!CATEGORIES.includes(category)) return c.json({ error: 'invalid_category' }, 400);

    const res = await c.env.DB.prepare(
      `INSERT INTO crops (farmer_id, crop_name, category, quantity_kg, price_per_kg_khr, image_url, harvest_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(farmer_id, crop_name, category, Number(quantity_kg), Math.round(Number(price_per_kg_khr)),
           image_url ?? null, harvest_date ?? null).run();

    const crop = await c.env.DB.prepare('SELECT * FROM crops WHERE id = ?')
      .bind(res.meta.last_row_id).first();
    return c.json({ crop }, 201);
  } catch (e: any) {
    return c.json({ error: 'create_crop_failed', detail: String(e?.message ?? e) }, 500);
  }
});

crops.get('/api/farmers/:id/crops', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM crops WHERE farmer_id = ? ORDER BY created_at DESC'
  ).bind(c.req.param('id')).all();
  return c.json({ crops: results });
});

export default crops;
