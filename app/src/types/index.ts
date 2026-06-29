export type Role = 'farmer' | 'buyer' | 'logistics';
export type Category = 'Rice' | 'Vegetables' | 'Fruits' | 'Spices/Pepper' | 'Other';

export interface User {
  id: string;
  name: string;
  role: Role;
  phone: string;
  province: string;
  district: string;
  khqr_string?: string | null;
  created_at?: string;
}

export interface Crop {
  id: number;
  farmer_id: string;
  crop_name: string;
  category: Category;
  quantity_kg: number;
  price_per_kg_khr: number;
  image_url?: string | null;
  harvest_date?: string | null;
  status: 'available' | 'pending_payment' | 'sold_out';
  created_at?: string;
  farmer_name?: string;
  farmer_province?: string;
  farmer_district?: string;
  farmer_phone?: string;
  farmer_khqr?: string | null;
}

export interface Order {
  id: string;
  crop_id: number;
  buyer_id: string;
  farmer_id: string;
  total_price_khr: number;
  delivery_address?: string;
  order_status: 'created' | 'paid_escrow' | 'in_transit' | 'delivered' | 'completed' | 'disputed';
  khqr_md5_hash?: string;
  crop_name?: string;
  category?: Category;
  created_at?: string;
}

export interface CalendarPlan {
  province: string;
  category: string;
  hectares: number;
  seed_needed_kg: number;
  compost_needed_kg: number;
  cycle_days: number;
  rotation: { en: string; km: string };
  heavy_rice_zone: boolean;
}
