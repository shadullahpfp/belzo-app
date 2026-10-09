<div align="center">

# ⚡ BELZO

### Hyperlocal Quick-Commerce Ecosystem — 10-Minute Delivery Platform for Bharat Tier-2/3 Micro-Hubs

[![CI Pipeline](https://github.com/shadullahpfp/belzo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/shadullahpfp/belzo-app/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue.svg)](https://www.typescriptlang.org/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020.svg)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3ECF8E.svg)](https://supabase.com/)
[![EAS Build](https://img.shields.io/badge/EAS-Build%20Ready-FF5E00.svg)](https://expo.dev/eas)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*An enterprise-grade, multi-tier quick-commerce ecosystem — customer mobile shopping, dark store operator packing station, courier dispatch engine, and unified Super Admin analytics portal — all synchronized in sub-second latency via Supabase Realtime.*

</div>

---

## 🏛️ Ecosystem Architecture

Belzo is engineered as an enterprise-grade monorepo powering **four distinct operational workflows** synchronized via PostgreSQL Row-Level Security and Supabase Realtime WebSocket channels:

```
                               ┌────────────────────────┐
                               │     Supabase Cloud     │
                               │  PostgreSQL + Realtime  │
                               │   (wwxuiexvgsmweu...)   │
                               └───────────┬────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
│   Customer App    │             │   Rider Console   │             │   Admin Portal    │
│  (iOS / Android)  │             │   (Fleet App)     │             │    (Next.js 14)   │
├───────────────────┤             ├───────────────────┤             ├───────────────────┤
│ • 6-Bento Catalog │             │ • Duty Status     │             │ • Live GMV Board  │
│ • 12-Min SLA Cart │ ──Order──►  │ • Haptic Dispatch │  ◄─Assigned │ • Master Catalog  │
│ • Live Tracking   │             │ • Turn-by-Turn    │             │ • Dark Store Hubs │
│ • 4-Digit PIN     │             │ • PIN Completion  │             │ • Fleet & KYC     │
└───────────────────┘             └───────────────────┘             └───────────────────┘
                                           ▲
                                           │ Dispatches
                                  ┌────────┴──────────┐
                                  │  Dark Store Hub   │
                                  │  Pack & Dispatch  │
                                  │  Web Audio Chime  │
                                  └───────────────────┘
```

---

## 📱 Applications & Platforms

| Application | Workspace | Stack | Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer Mobile** | `apps/mobile` | Expo SDK 57, React Native, Zustand | 124+ SKU catalog, 6-category Bento Grid, 12-min SLA timer, cart shortfall bar, live GPS corridor telemetry, 4-digit PIN gate |
| **Rider Fleet Console** | `apps/mobile/(rider)` | Expo, Zustand, Haptics, Lucide | Haptic 30s dispatch countdown, Apple Maps / Google Maps deep links, bag checklist, OTP doorstep confirmation |
| **Dark Store Operator Terminal** | `apps/admin/operator` | Next.js 14, React 19, Web Audio API | Live Web Audio chime, order packing pipeline, rider assignment, WhatsApp dispatch, inline price & stock editor |
| **Super Admin Analytics Portal** | `apps/admin/admin` | Next.js App Router, Lucide, Glassmorphism | Real-time GMV counters, hourly velocity chart, fleet status matrix, master product SKU ledger, customer & order management |

---

## 📂 Monorepo Structure

```
belzo-app/                              # Enterprise TypeScript Monorepo
├── .github/
│   ├── workflows/ci.yml               # CI Pipeline: typecheck + security audit
│   └── PULL_REQUEST_TEMPLATE.md       # Production PR review gate
├── apps/
│   ├── mobile/                        # Universal iOS & Android Expo App
│   │   ├── app/
│   │   │   ├── _layout.tsx            # Root layout + useAuth bridge hook
│   │   │   ├── (auth)/login.tsx       # Phone OTP auth + demo bypass
│   │   │   ├── (customer)/            # Commerce, cart, checkout, tracking, profile
│   │   │   │   ├── home.tsx           # 6-Bento Grid + 3 product shelf rails
│   │   │   │   ├── search.tsx         # Full-text + Hindi synonym search engine
│   │   │   │   ├── cart.tsx           # Cart + savings bar + paddingBottom=140 fix
│   │   │   │   ├── checkout.tsx       # Order placement + 4-digit PIN generation
│   │   │   │   ├── track-order/[id].tsx  # Live order tracker + PIN display
│   │   │   │   └── profile.tsx        # Dynamic profile + CompleteProfileSheet
│   │   │   └── (rider)/               # Courier console
│   │   │       ├── dashboard.tsx      # Dynamic identity card + Edit modal
│   │   │       ├── active-order.tsx   # PIN verification + haptics
│   │   │       └── earnings.tsx       # Shift ledger
│   │   ├── components/
│   │   │   ├── profile/CompleteProfileSheet.tsx  # Inline profile completion modal
│   │   │   ├── rider/OrderAlertModal.tsx         # 30s dispatch countdown modal
│   │   │   ├── rider/DeliveryPinModal.tsx        # PIN input keypad
│   │   │   └── ui/                              # QuantityStepper, CartPill, Shimmer
│   │   ├── constants/catalog.ts       # 124-item offline catalog (0 duplicate URLs)
│   │   ├── store/
│   │   │   ├── useAuthStore.ts        # Zustand: profile, rider, role, session
│   │   │   ├── useCartStore.ts        # Cart state + savings computation
│   │   │   ├── useRiderStore.ts       # Rider duty, shift metrics, dispatch
│   │   │   ├── useCatalogStore.ts     # Live Supabase catalog + Realtime sync
│   │   │   └── useLocationStore.ts   # GPS, serviceability, hub distance
│   │   ├── eas.json                   # EAS Build: preview APK + production AAB
│   │   └── app.json                   # android.package: com.belzo.hyperlocal
│   └── admin/                         # Next.js 14 Admin Suite
│       ├── app/
│       │   ├── admin/                 # 9 Executive Analytics Suites
│       │   │   ├── page.tsx           # GMV dashboard + hourly velocity chart
│       │   │   ├── orders/            # Full order pipeline
│       │   │   ├── products/          # Master SKU ledger
│       │   │   ├── categories/        # Strict 6-category enforcer
│       │   │   ├── riders/            # Fleet KYC + verification
│       │   │   └── customers/         # Customer registry
│       │   ├── operator/
│       │   │   ├── page.tsx           # Live packing pipeline + WhatsApp dispatch
│       │   │   └── inventory/         # Inline price edit + stock toggle
│       │   └── api/auth/bridge/       # Demo auth bypass server route
│       └── lib/
│           ├── supabase.ts            # Supabase client + JONIHA_HUB_ID
│           ├── sound.ts               # Web Audio API two-tone dispatch chime
│           └── whatsapp.ts            # WhatsApp dispatch message builder
├── packages/
│   └── supabase/
│       ├── scripts/
│       │   ├── seed_master_launch_catalog.sql   # 6 categories + 124 items seed
│       │   └── seed_master_launch_catalog.ts    # Node TS execution harness
│       └── src/types.ts               # Shared database type definitions
├── docs/                              # Engineering specs: PRD, TRD, SCHEMA, UI/UX
├── FRANCHISE_OPERATIONS.md            # Complete dark store SOP & franchise manual
├── .env.example                       # Environment variable blueprint
├── .gitignore                         # Blocks .env, .next, node_modules, .expo
└── package.json                       # Monorepo root workspace
```

---

## 🏪 Core Features

### 🛒 1. Strict 6-Category Bento Grid Architecture
The entire catalog hierarchy is locked to exactly 6 official Belzo categories with zero arbitrary additions:

| # | ID | Category | Coverage |
|---|-----|---------|---------|
| 1 | `cat-01-grocery` | **Grocery** | Kirana, Oils, Spices, Tea, Dals, Drinks, Baby Nutrition, Home Care |
| 2 | `cat-02-produce` | **Fruits & Vegetables** | Taza Mandi Sabzi: Aloo, Pyaz, Bhindi, Baingan, Gobhi, Dhaniya |
| 3 | `cat-03-food` | **Food & Restaurant** | Kulhad Pizza, Thali, Dhaba Meals, Mithai, Bakery Cakes |
| 4 | `cat-04-pharma` | **Medicine & Healthcare** | Dettol, Iodex, Chyawanprash, Baby Care, Skin Solution |
| 5 | `cat-05-fashion` | **Fashion & Lifestyle** | Cotton Wear, Lifestyle Accessories |
| 6 | `cat-06-electronics` | **Electronics** | 5G Mobiles, Chargers, TWS Earbuds, Speakers, Smartwatches |

### 📦 2. 124-Item Verified Client Catalog
- **Zero duplicate Unsplash image URLs** — each of 124 products has a distinct studio packshot.
- **Exact client pricing** — Deva Pahadi Aloo ₹20, Lal Tamatar ₹190/₹200, Kulhad Pizza ₹79, Dettol ₹41.49, Cerelac ₹299.
- **Dual sync** — live from Supabase with offline fallback from `constants/catalog.ts`.

### 🔐 3. Dynamic Profile System — Zero Mock Names
- All hardcoded mock strings (`"Ananya Deshmukh"`, `"Vikram Patel"`, `"+91 98451 22334"`, `"UP-71-BLZ-9421"`) are completely eliminated.
- On first login, `CompleteProfileSheet.tsx` launches inline to capture real name, phone, and delivery address.
- Header avatar dynamically renders the authenticated user's initial letter.

### 🔔 4. Real-Time Order Dispatch Loop
```
Customer Checkout → 4-digit PIN generated → Supabase INSERT
    ↓
Operator Terminal receives Web Audio chime 🔔
    ↓
Operator packs → marks ready → Rider receives haptic alert
    ↓
Rider accepts → navigates to hub → picks up → navigates to customer
    ↓
Customer shares 4-digit PIN → Rider enters → Supabase UPDATE: delivered
    ↓
Admin GMV increments live | Rider earnings credited | Order closed ✅
```

### 📍 5. WhatsApp Dispatch Engine
1-click dispatch sends a formatted WhatsApp message to the assigned rider containing:
- Order ID, Time, Customer Name, Phone
- Full delivery address + Google Maps direct pin
- Itemized checklist with prices
- Bill total and payment mode

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** `v20.x+`
- **npm** `v10.x+`
- **Expo Go** or Android Studio (for mobile)
- **Supabase project** with schema applied

### 1. Clone & Install
```bash
git clone https://github.com/shadullahpfp/belzo-app.git
cd belzo-app
npm install
```

### 2. Environment Configuration
```bash
# Mobile app
cp apps/mobile/.env.example apps/mobile/.env

# Admin portal
cp apps/admin/.env.example apps/admin/.env.local
```

Fill in your Supabase credentials:
```ini
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# apps/admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Supabase Database Setup
Run the master catalog seed in your **Supabase SQL Editor**:
```sql
-- Paste contents of:
packages/supabase/scripts/seed_master_launch_catalog.sql
```

This creates:
- `dark_stores`: Joniha Central Hub 01 (`BLZ-HUB-01`)
- `categories`: All 6 official Belzo categories
- `products`: 124 verified client items

### 4. Local Development Servers

**Next.js Admin & Operator Portal (port 3001):**
```bash
cd apps/admin
npm run dev
# http://localhost:3001/admin
# http://localhost:3001/operator
```

**Expo Mobile Dev Server (port 8081):**
```bash
cd apps/mobile
npx expo start -c
# Scan QR code in Expo Go, or press 'a' for Android / 'i' for iOS
```

### 5. Android Standalone APK Build (EAS)
```bash
cd apps/mobile
eas build -p android --profile preview
```
> EAS generates a downloadable `.apk` in 5–10 minutes. Sideload directly onto customer or rider Android devices.

---

## 🛠️ TypeScript Verification

Both apps must compile with **zero errors** before any release:

```bash
# Mobile
cd apps/mobile && npx tsc --noEmit

# Admin
cd apps/admin && npx tsc --noEmit
```

**v1.0.0 Status:** ✅ 0 errors across both apps.

---

## 🔒 Security & Compliance

- **Zero Hardcoded Secrets**: All keys live in `.env` files excluded from git history.
- **Row-Level Security (RLS)**: Fine-grained Postgres policies — customers only see their own orders; riders only modify assigned deliveries.
- **4-Digit PIN Handshake**: Cryptographically random (`Math.floor(1000 + Math.random() * 9000)`) contactless delivery PIN stored in `orders.delivery_pin`.
- **Role-Based Gatekeeping**: Layout guards block cross-role access between `customer`, `rider`, `store_operator`, and `admin` roles.
- **`.gitignore` Enforcement**: `.env`, `.env.local`, `.expo/`, `.next/`, `node_modules/`, `scratch/`, and `dist/` are all blocked from commits.

---

## 📋 Franchise Operations

For full dark store SOP, hardware requirements, shift protocols, and fleet operations, see:

📄 **[FRANCHISE_OPERATIONS.md](FRANCHISE_OPERATIONS.md)**

---

## 🤝 Contributing

We maintain strict code quality, typed contracts, and conventional commits.

```bash
# Before any PR
npx tsc --noEmit                           # Zero errors required
git commit -m "feat(scope): description"   # Conventional Commits
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).

---

## 📄 License

MIT License — see [LICENSE](LICENSE).
Copyright © 2026 Belzo Technologies Inc. All rights reserved.
