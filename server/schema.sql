-- AgriK2K — Cloudflare D1 schema (rivendb)
-- Run: npm run db:init  (local)  |  npm run db:init:remote (production)

-- Users & Profiles
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('farmer', 'buyer', 'logistics')) NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    province TEXT CHECK(province IN ('Phnom Penh', 'Battambang', 'Banteay Meanchey', 'Siem Reap', 'Kampong Cham', 'Takeo', 'Kampot', 'Kandal', 'Pursat', 'Preah Vihear', 'Mondulkiri', 'Ratanakiri', 'Koh Kong', 'Preah Sihanouk', 'Svay Rieng', 'Prey Veng', 'Kampong Speu', 'Kampong Chhnang', 'Kampong Thom', 'Kratie', 'Stung Treng', 'Kep', 'Pailin', 'Oddar Meanchey', 'Tboung Khmum')) NOT NULL,
    district TEXT NOT NULL,
    khqr_string TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Listings
CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT NOT NULL,
    crop_name TEXT NOT NULL,
    category TEXT CHECK(category IN ('Rice', 'Vegetables', 'Fruits', 'Spices/Pepper', 'Other')) NOT NULL,
    quantity_kg REAL NOT NULL,
    price_per_kg_khr INTEGER NOT NULL,
    image_url TEXT,
    harvest_date TEXT,
    status TEXT CHECK(status IN ('available', 'pending_payment', 'sold_out')) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(farmer_id) REFERENCES users(id)
);

-- Orders & Escrow Transactions
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    crop_id INTEGER NOT NULL,
    buyer_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    total_price_khr INTEGER NOT NULL,
    delivery_address TEXT NOT NULL,
    order_status TEXT CHECK(order_status IN ('created', 'paid_escrow', 'in_transit', 'delivered', 'completed', 'disputed')) DEFAULT 'created',
    khqr_md5_hash TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(crop_id) REFERENCES crops(id),
    FOREIGN KEY(buyer_id) REFERENCES users(id),
    FOREIGN KEY(farmer_id) REFERENCES users(id)
);

-- AI Advisor Voice Context & Logs
CREATE TABLE IF NOT EXISTS ai_advisory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    audio_url TEXT,
    transcript_khmer TEXT,
    ai_response_khmer TEXT,
    crop_context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- One-time passcodes for phone verification (auth)
CREATE TABLE IF NOT EXISTS otp_codes (
    phone TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crops_category ON crops(category);
CREATE INDEX IF NOT EXISTS idx_crops_status ON crops(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);
