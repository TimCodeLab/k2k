import type { Crop, User, Order, CalendarPlan, Category } from '../types';
import { getToken } from '../context/SessionContext';

// In dev, Vite proxies /api -> http://localhost:8787 (the Worker).
// In production set VITE_API_BASE to the deployed Worker URL.
const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...init, headers: { ...headers, ...(init?.headers as object) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `HTTP ${res.status}`);
  return data as T;
}

export interface CropQuery { category?: string; province?: string; q?: string; sort?: string }

export const api = {
  meta: () => req<{ provinces: string[]; categories: Category[] }>('/api/meta'),

  requestOtp: (phone: string) =>
    req<{ sent: boolean; is_registered: boolean; dev_code?: string }>('/api/auth/request-otp',
      { method: 'POST', body: JSON.stringify({ phone }) }),

  verifyOtp: (body: { phone: string; code: string } & Partial<User>) =>
    req<{ user: User; token: string }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),

  me: () => req<{ user: User }>('/api/auth/me'),

  getCrops: (params: CropQuery) => {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.province) q.set('province', params.province);
    if (params.q) q.set('q', params.q);
    if (params.sort) q.set('sort', params.sort);
    const qs = q.toString();
    return req<{ crops: Crop[] }>(`/api/crops${qs ? `?${qs}` : ''}`);
  },

  getCrop: (id: number | string) => req<{ crop: Crop }>(`/api/crops/${id}`),

  // farmer_id is derived from the auth token server-side.
  newCrop: (body: Record<string, unknown>) =>
    req<{ crop: Crop }>('/api/crops/new', { method: 'POST', body: JSON.stringify(body) }),

  // buyer_id is derived from the auth token server-side.
  createOrder: (body: { crop_id: number; delivery_address: string; quantity_kg?: number }) =>
    req<{ order: Order; payment: { khqr_string: string | null; khqr_md5_hash: string; amount_khr: number; note: string } }>(
      '/api/orders/create', { method: 'POST', body: JSON.stringify(body) }),

  getOrders: (userId: string) => req<{ orders: Order[] }>(`/api/orders?user_id=${userId}`),

  setOrderStatus: (id: string, status: string) =>
    req<{ order_status: string; released_to_farmer?: boolean }>(`/api/orders/${id}/status`,
      { method: 'POST', body: JSON.stringify({ status }) }),

  ask: (body: { user_id?: string; transcript_khmer: string; crop_context?: string }) =>
    req<{ answer: string; source: string }>('/api/ai/ask', { method: 'POST', body: JSON.stringify(body) }),

  diagnose: (form: FormData) =>
    req<{ answer: string; source: string; image_url: string | null }>('/api/ai/diagnose', { method: 'POST', body: form }),

  calendarPlan: (body: { province: string; category: string; hectares: number }) =>
    req<CalendarPlan>('/api/calendar/plan', { method: 'POST', body: JSON.stringify(body) }),

  upload: (file: Blob, name = 'crop.jpg') => {
    const fd = new FormData();
    fd.append('file', file, name);
    return req<{ url: string | null; stored: boolean }>('/api/upload', { method: 'POST', body: fd });
  },
};
