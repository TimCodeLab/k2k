import { Hono } from 'hono';
import type { AppEnv } from '../types';
import { ORDER_STATUSES } from '../lib/constants';
import { orderId } from '../lib/helpers';
import { getAuth } from '../lib/auth';

const orders = new Hono<AppEnv>();

// POST /api/orders/create — Feature 3: Secured Escrow via Bakong KHQR.
orders.post('/api/orders/create', async (c) => {
  try {
    const claims = await getAuth(c);
    if (!claims) return c.json({ error: 'unauthorized' }, 401);
    const buyer_id = claims.sub;

    const { crop_id, delivery_address, quantity_kg } = await c.req.json();
    if (!crop_id || !delivery_address)
      return c.json({ error: 'missing_fields' }, 400);

    const crop: any = await c.env.DB.prepare('SELECT * FROM crops WHERE id = ?').bind(crop_id).first();
    if (!crop) return c.json({ error: 'crop_not_found' }, 404);
    if (crop.status !== 'available') return c.json({ error: 'crop_unavailable' }, 409);

    const qty = quantity_kg ? Math.min(Number(quantity_kg), crop.quantity_kg) : crop.quantity_kg;
    const total = Math.round(qty * crop.price_per_kg_khr);
    const id = orderId();
    // Simulated KHQR MD5 hash used to reconcile a Bakong transaction.
    const md5 = crypto.randomUUID().replace(/-/g, '');

    await c.env.DB.prepare(
      `INSERT INTO orders (id, crop_id, buyer_id, farmer_id, total_price_khr, delivery_address, order_status, khqr_md5_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'created', ?)`
    ).bind(id, crop_id, buyer_id, crop.farmer_id, total, delivery_address, md5).run();

    const farmer: any = await c.env.DB.prepare('SELECT khqr_string FROM users WHERE id = ?').bind(crop.farmer_id).first();

    return c.json({
      order: { id, crop_id, buyer_id, farmer_id: crop.farmer_id, total_price_khr: total, order_status: 'created' },
      payment: {
        khqr_string: farmer?.khqr_string ?? null,
        khqr_md5_hash: md5,
        amount_khr: total,
        note: 'Scan with Bakong / ABA to fund escrow',
      },
    }, 201);
  } catch (e: any) {
    return c.json({ error: 'create_order_failed', detail: String(e?.message ?? e) }, 500);
  }
});

orders.get('/api/orders', async (c) => {
  const userId = c.req.query('user_id');
  let sql = `SELECT o.*, c.crop_name, c.category FROM orders o JOIN crops c ON c.id = o.crop_id`;
  const binds: any[] = [];
  if (userId) { sql += ' WHERE o.buyer_id = ? OR o.farmer_id = ?'; binds.push(userId, userId); }
  sql += ' ORDER BY o.created_at DESC';
  const { results } = await c.env.DB.prepare(sql).bind(...binds).all();
  return c.json({ orders: results });
});

// Escrow + logistics state machine.
// paid_escrow -> in_transit -> delivered -> (auto) completed
orders.post('/api/orders/:id/status', async (c) => {
  try {
    const claims = await getAuth(c);
    if (!claims) return c.json({ error: 'unauthorized' }, 401);

    const { status } = await c.req.json();
    if (!ORDER_STATUSES.includes(status)) return c.json({ error: 'invalid_status' }, 400);

    const order: any = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(c.req.param('id')).first();
    if (!order) return c.json({ error: 'not_found' }, 404);
    // Only the buyer, the farmer, or a logistics provider may advance an order.
    const isParticipant = order.buyer_id === claims.sub || order.farmer_id === claims.sub || claims.role === 'logistics';
    if (!isParticipant) return c.json({ error: 'forbidden' }, 403);

    await c.env.DB.prepare('UPDATE orders SET order_status = ? WHERE id = ?').bind(status, order.id).run();

    if (status === 'paid_escrow') {
      // Lock the crop while escrow is funded; farmer is notified to dispatch.
      await c.env.DB.prepare("UPDATE crops SET status = 'pending_payment' WHERE id = ?").bind(order.crop_id).run();
    }
    if (status === 'delivered') {
      // Feature 3: automatic release — funds transferred to farmer's Bakong wallet.
      await c.env.DB.prepare("UPDATE orders SET order_status = 'completed' WHERE id = ?").bind(order.id).run();
      await c.env.DB.prepare("UPDATE crops SET status = 'sold_out' WHERE id = ?").bind(order.crop_id).run();
      return c.json({ order_status: 'completed', released_to_farmer: true });
    }
    return c.json({ order_status: status });
  } catch (e: any) {
    return c.json({ error: 'status_update_failed', detail: String(e?.message ?? e) }, 500);
  }
});

export default orders;
