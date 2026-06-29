# 🌾 AgriK2K — ខ្មែរជួយខ្មែរ (Khmer Help Khmer)

Offline-first agriculture marketplace connecting Cambodian smallholder farmers with
buyers and logistics. Built per the PRD in [`todo.md`](todo.md).

- **Frontend:** Ionic React + Vite (bilingual **KM / EN**, default **Khmer**)
- **Backend:** Cloudflare Workers (Hono) API gateway
- **Database:** Cloudflare D1 (`rivendb`, SQLite)
- **AI:** Cloudflare Workers AI `@cf/meta/llama-3-8b-instruct` (with offline fallback)
- **Storage:** Cloudflare R2 (compressed crop & invoice images)

## Features
1. 🩺 **Crop Doctor** — voice-first AI agronomist answering in conversational Khmer, with optional **plant-photo diagnosis** (vision model).
2. 📅 **Smart Crop Calendar** — seed/compost/cycle calculator with province rice-rotation rules.
3. 🔒 **Escrow Payments** — Bakong KHQR order flow (`created → paid_escrow → delivered → completed`).
4. 📷 **Low-Bandwidth Compression** — client-side Canvas image resize before R2 upload.
5. 🔐 **Phone OTP auth** — passwordless login/register; identity is carried in a signed JWT and enforced server-side (the client never decides who it is).
6. 🔎 **Marketplace search & sort** — text search + price/freshness sorting on top of category/province filters.
7. 📲 **Installable PWA** — service worker caches the app shell and marketplace for offline reading; bundled Khmer webfont for consistent script.

## Quality
- **Tests:** `npm test` in both `app/` (i18n parity, formatting) and `server/` (helpers, JWT, Khmer fallback).
- **CI:** GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck + tests (+ frontend build) on push/PR.

## Project layout
```
server/   Cloudflare Worker — routes/, lib/, D1 schema, AI, R2   (src/index.ts, schema.sql)
app/      Ionic React app   — pages/, services/, i18n/locales/{en,km}.ts
```

## Run locally

### 1. Backend (Cloudflare Worker)
```bash
cd server
npm install
npm run db:init      # create tables in local D1
npm run db:seed      # demo farmers + crops
npm run dev          # http://localhost:8787
```
> Workers AI requires a Cloudflare account; without it the Crop Doctor uses a
> built-in Khmer heuristic fallback, so the app stays fully usable offline.

### 2. Frontend (Ionic React)
```bash
cd app
npm install
npm run dev          # http://localhost:5173  (proxies /api → :8787)
```

## Deploy
```bash
cd server
wrangler d1 create rivendb           # paste database_id into wrangler.toml
npm run db:init:remote
wrangler r2 bucket create agrik2k-media
npm run deploy                       # Worker live on *.workers.dev
```
Set `VITE_API_BASE` to the deployed Worker URL, then `cd app && npm run build`.

## API
🔒 = requires `Authorization: Bearer <jwt>` (issued by `verify-otp`).

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/request-otp` | Send a phone OTP (dev returns `dev_code`) |
| POST | `/api/auth/verify-otp` | Verify code → login or register, returns `{ user, token }` |
| GET  | `/api/auth/me` | 🔒 Current user from token |
| GET  | `/api/crops?category=&province=&q=&sort=` | Available listings (filter/search/sort) |
| POST | `/api/crops/new` | 🔒 Publish a listing (farmers only; `farmer_id` from token) |
| POST | `/api/orders/create` | 🔒 Open an escrow order (`buyer_id` from token), returns KHQR |
| POST | `/api/orders/:id/status` | 🔒 Advance escrow state machine (participants only) |
| POST | `/api/ai/ask` | Khmer agronomy advice (text) |
| POST | `/api/ai/diagnose` | Plant-photo diagnosis (vision model + offline fallback) |
| POST | `/api/ai/voice-advisor` | Audio/transcript advice |
| POST | `/api/calendar/plan` | Seed/compost/cycle plan |
| POST | `/api/upload` | Store compressed image in R2 |

> **Deferred (need real accounts/keys):** SMS delivery for OTP (dev returns the code), live Bakong
> transaction verification + dynamic KHQR encoding, and Web Push / Cron notifications. These are
> stubbed safely so the app runs fully offline today.
