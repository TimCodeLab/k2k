import type { Category } from '../types';

export const PROVINCES = [
  'Phnom Penh', 'Battambang', 'Banteay Meanchey', 'Siem Reap', 'Kampong Cham',
  'Takeo', 'Kampot', 'Kandal', 'Pursat', 'Preah Vihear', 'Mondulkiri',
  'Ratanakiri', 'Koh Kong', 'Preah Sihanouk', 'Svay Rieng', 'Prey Veng',
  'Kampong Speu', 'Kampong Chhnang', 'Kampong Thom', 'Kratie', 'Stung Treng',
  'Kep', 'Pailin', 'Oddar Meanchey', 'Tboung Khmum',
];

export const CATEGORIES: Category[] = ['Rice', 'Vegetables', 'Fruits', 'Spices/Pepper', 'Other'];

export const categoryEmoji: Record<string, string> = {
  Rice: '🌾',
  Vegetables: '🥬',
  Fruits: '🥭',
  'Spices/Pepper': '🌶️',
  Other: '🧺',
};
