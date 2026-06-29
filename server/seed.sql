-- Demo data for AgriK2K. Run: npm run db:seed (after db:init)

INSERT OR IGNORE INTO users (id, name, role, phone, province, district, khqr_string) VALUES
  ('u_farmer_sok',   'Sok Dara',     'farmer',    '012345678', 'Battambang',   'Sangke',        '00020101021229...BAKONG-SOK'),
  ('u_farmer_chan',  'Chan Sophea',  'farmer',    '012987654', 'Kampong Cham', 'Stueng Trang',  '00020101021229...BAKONG-CHAN'),
  ('u_buyer_resto',  'Phnom Resto',  'buyer',     '011223344', 'Phnom Penh',   'Chamkar Mon',   '00020101021229...BAKONG-RESTO'),
  ('u_logi_truck',   'Mekong Trans', 'logistics', '099887766', 'Kandal',       'Ta Khmau',      NULL);

INSERT OR IGNORE INTO crops (farmer_id, crop_name, category, quantity_kg, price_per_kg_khr, harvest_date, status) VALUES
  ('u_farmer_sok',  'Jasmine Rice (Phka Rumduol)', 'Rice',          1200, 2800, '2026-05-20', 'available'),
  ('u_farmer_sok',  'Fresh Morning Glory',         'Vegetables',     80, 1500, '2026-06-25', 'available'),
  ('u_farmer_chan', 'Kampot Pepper (Black)',       'Spices/Pepper',  40, 60000, '2026-04-10', 'available'),
  ('u_farmer_chan', 'Pailin Longan',               'Fruits',        300, 4500, '2026-06-15', 'available'),
  ('u_farmer_sok',  'Sweet Corn',                  'Vegetables',    500, 2000, '2026-06-28', 'available');
