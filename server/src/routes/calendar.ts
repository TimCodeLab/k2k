import { Hono } from 'hono';
import type { AppEnv } from '../types';

const calendar = new Hono<AppEnv>();

// Feature 2: High-Yield Smart Crop Calendar.
calendar.post('/api/calendar/plan', async (c) => {
  try {
    const { province, category, hectares } = await c.req.json();
    const ha = Math.max(Number(hectares) || 1, 0.1);

    // Seed & compost rates per hectare (illustrative agronomy defaults).
    const rates: Record<string, { seed_kg: number; compost_kg: number; cycle_days: number }> = {
      Rice: { seed_kg: 60, compost_kg: 1000, cycle_days: 120 },
      Vegetables: { seed_kg: 4, compost_kg: 1500, cycle_days: 60 },
      Fruits: { seed_kg: 0, compost_kg: 2000, cycle_days: 240 },
      'Spices/Pepper': { seed_kg: 0, compost_kg: 1800, cycle_days: 210 },
      Other: { seed_kg: 20, compost_kg: 1200, cycle_days: 90 },
    };
    const r = rates[category] ?? rates.Other;

    const heavyRice = ['Battambang', 'Kampong Cham'].includes(province) && category === 'Rice';
    const rotation = heavyRice
      ? { en: 'Wet-season rice (May–Nov) then dry-season recession rice (Dec–Apr).', km: 'ស្រូវវស្សា (ឧសភា–វិច្ឆិកា) បន្ទាប់មកស្រូវប្រាំង (ធ្នូ–មេសា)។' }
      : { en: 'Single main cycle aligned to local rainfall.', km: 'វដ្តដាំសំខាន់មួយ ស្របតាមរដូវភ្លៀងក្នុងតំបន់។' };

    return c.json({
      province, category, hectares: ha,
      seed_needed_kg: Math.round(r.seed_kg * ha * 10) / 10,
      compost_needed_kg: Math.round(r.compost_kg * ha),
      cycle_days: r.cycle_days,
      rotation,
      heavy_rice_zone: heavyRice,
    });
  } catch (e: any) {
    return c.json({ error: 'calendar_failed', detail: String(e?.message ?? e) }, 500);
  }
});

export default calendar;
