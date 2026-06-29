# 📜 Product Requirement Document (PRD)

## Project Title: AgriK2K (Agriculture Khmer help Khmer)

**Slogan:** ខ្មែរជួយខ្មែរ - គាំទ្រផលិតផលជាតិ (Khmer Help Khmer - Support Our National Products)

**Target Audience:** Smallholder Cambodian Farmers, Local Restaurants/Wholesale Buyers, Community Logistics Providers

**Tech Stack:** Ionic Framework (Frontend), Cloudflare Workers (Backend API Gateway), Cloudflare D1 (Native Serverless SQLite Database), Cloudflare Workers AI

---

## 1. System Architecture Overview

The application uses an **Offline-First / Edge Serverless Architecture**. The AI agent should implement a system where data is cached or stored locally when internet connection is unstable, syncing back to Cloudflare D1 when a stable Smart/Cellcard LTE connection is present.

```
[ Ionic Mobile / Web App ] 
         │
    (HTTPS Fetch)
         ▼
[ Cloudflare Workers Gateway ] ──(Native Binding)──► [ Cloudflare D1 (rivendb) ]
         │
         ├──(Workers AI)───────► [@cf/meta/llama-3-8b-instruct]
         └──(R2 Storage)──────► [Compressed Crop & Invoice Images]

```

---

## 2. Comprehensive Database Schema (Cloudflare D1)

The AI Agent must execute this precise SQL schema inside the Cloudflare D1 instance (`rivendb`).

```sql
-- Users & Profiles
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('farmer', 'buyer', 'logistics')) NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    province TEXT CHECK(province IN ('Phnom Penh', 'Battambang', 'Banteay Meanchey', 'Siem Reap', 'Kampong Cham', 'Takeo', 'Kampot', 'Kandal', 'Pursat', 'Preah Vihear', 'Mondulkiri', 'Ratanakiri', 'Koh Kong', 'Preah Sihanouk', 'Svay Rieng', 'Prey Veng', 'Kampong Speu', 'Kampong Chhnang', 'Kampong Thom', 'Kratie', 'Stung Treng', 'Kep', 'Pailin', 'Oddar Meanchey', 'Tboung Khmum')) NOT NULL,
    district TEXT NOT NULL,
    khqr_string TEXT, -- Base64 or plain string string of user's Bakong / ABA KHQR
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Listings
CREATE TABLE IF NOT EXISTS crops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_id TEXT NOT NULL,
    crop_name TEXT NOT NULL, 
    category TEXT CHECK(category IN ('Rice', 'Vegetables', 'Fruits', 'Spices/Pepper', 'Other')) NOT NULL,
    quantity_kg REAL NOT NULL,
    price_per_kg_khr INTEGER NOT NULL, -- Keep pricing native in Cambodian Riel (KHR)
    image_url TEXT,
    harvest_date TEXT,
    status TEXT CHECK(status IN ('available', 'pending_payment', 'sold_out')) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(farmer_id) REFERENCES users(id)
);

-- Orders & Escrow Transactions
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- Unique Order String (e.g. AGRI-2026-XXXX)
    crop_id INTEGER NOT NULL,
    buyer_id TEXT NOT NULL,
    farmer_id TEXT NOT NULL,
    total_price_khr INTEGER NOT NULL,
    delivery_address TEXT NOT NULL,
    order_status TEXT CHECK(order_status IN ('created', 'paid_escrow', 'in_transit', 'delivered', 'completed', 'disputed')) DEFAULT 'created',
    khqr_md5_hash TEXT, -- Tracked to verify Bakong transaction matches
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(crop_id) REFERENCES crops(id),
    FOREIGN KEY(buyer_id) REFERENCES users(id),
    FOREIGN KEY(farmer_id) REFERENCES users(id)
);

-- AI Advisor Voice Context & Logs
CREATE TABLE IF NOT EXISTS ai_advisory_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    audio_url TEXT, -- Link to audio file stored in Cloudflare R2
    transcript_khmer TEXT,
    ai_response_khmer TEXT,
    crop_context TEXT, -- Automatically tags what crop category the problem applies to
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

```

---

## 3. Core Features & UX Requirements

### Feature 1: The Voice-First "Crop Doctor" AI Advisor

* **User Action:** Farmers tap a massive microphone button floating on the screen. They hold it down to record their voice explaining a problem in Khmer (e.g., *"My corn has brown spots on the husk and worms"*). They can optionally upload an image of the plant damage.
* **AI Agent Prompt Instruction:**
* Implement an endpoint `/api/ai/voice-advisor` that accepts audio files or text transcripts.
* The prompt sent to Cloudflare’s `@cf/meta/llama-3-8b-instruct` must include a strict system instruction: *"You are an expert agronomist in Cambodia. Answer clearly using simple, conversational Khmer. Provide natural solutions, organic pest control methods readily available in Cambodian provinces, and advise on watering or fertilizer adjustments based on common Cambodian crop seasonal calendars."*
* The backend should map the text response to a Text-to-Speech service so the farmer can listen to the advice without needing to read it.



### Feature 2: High-Yield Smart Crop Calendar

* **System Action:** A background notification worker runs inside the Cloudflare Worker environment.
* **AI Agent Prompt Instruction:** Calculate planting cycles based on the farmer's registered province. If the location is *Battambang* or *Kampong Cham*, load specific wet-season/dry-season rice rotation rules. Provide calculations telling farmers exactly how many kilograms of seed or organic compost are needed for their entered parcel size (measured in hectares).

### Feature 3: Secured Escrow Payments via Bakong KHQR

* **System Action:** Protects farmers from scammers and buyers from non-delivery.
* **AI Agent Prompt Instruction:**
* When an order is created, the system reads the farmer's `khqr_string` and creates a payment intent.
* Money is transferred from the Buyer's app to an Escrow holding account via an integrated KHQR gateway.
* The Worker updates the `order_status` to `paid_escrow`. The farmer is notified to dispatch goods.
* Once logistics updates the status to `delivered`, the Worker processes an automatic release, transferring the KHR funds instantly to the farmer's Bakong wallet.



### Feature 4: Low-Bandwidth Compression Engine

* **System Action:** Farmers take high-resolution camera photos of crops. These take a long time to upload over rural mobile connections.
* **AI Agent Prompt Instruction:** Configure Ionic to compress images natively on the client device using HTML Canvas resizing *before* sending them to the Cloudflare Worker. The worker should write the file directly to **Cloudflare R2** and save only the lightweight string URL into the D1 `crops` table.

---

## 4. API Endpoints Map for AI Agent Generation

Your AI Agent must create these specific REST endpoints in the Cloudflare Worker project (`server/src/index.ts`):

| Method | Endpoint | Description | Payload Context |
| --- | --- | --- | --- |
| **POST** | `/api/auth/register` | Registers a farmer, buyer, or truck driver | `{ name, role, phone, province, district, khqr_string }` |
| **GET** | `/api/crops` | Returns all available crops filtrated by Category/Province | Query Parameters: `?category=Rice&province=Battambang` |
| **POST** | `/api/crops/new` | Lets a farmer publish a new produce listing | `{ farmer_id, crop_name, category, quantity_kg, price_per_kg_khr }` |
| **POST** | `/api/orders/create` | Initiates an escrow transaction | `{ crop_id, buyer_id, delivery_address }` |
| **POST** | `/api/ai/ask` | Processes Khmer text/voice inputs for agricultural support | `{ user_id, transcript_khmer, crop_context }` |

---

## 5. Verification Checklist for the AI Builder Agent

Before compiling your final code, ensure your AI Agent verifies the following:

1. **No Direct D1 access from Ionic:** All requests route through the Worker API gateway.
2. **Strict CORS Policies:** Ensure `Access-Control-Allow-Origin` is configured so the Ionic web viewer or compiled native APK/IPA can communicate smoothly.
3. **SQL Parameter Binding:** Every single input uses `.bind()` to eliminate any possibility of malicious SQL injections into `rivendb`.
4. **No Secret Tokens in Frontend:** All critical database configurations are handled server-side via Cloudflare environment bindings (`env.DB` and `env.AI`).