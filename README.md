<div align="center">

# ⚡ BELZO

### Hyperlocal Quick-Commerce Ecosystem (10-Minute Delivery Platform)

[![CI Pipeline](https://github.com/shadullahpfp/belzo-app/actions/workflows/ci.yml/badge.svg)](https://github.com/shadullahpfp/belzo-app/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4%2B-blue.svg)](https://www.typescriptlang.org/)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2057-000020.svg)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Realtime-3ECF8E.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*An end-to-end, multi-tier quick-commerce ecosystem featuring customer mobile shopping, dark store packing stations, a courier dispatch engine, and a unified Super Admin analytics portal.*

</div>

---

## 🏛️ Ecosystem Architecture

Belzo is engineered as an enterprise-grade monorepo powering four distinct operational workflows synchronized in sub-second latency via PostgreSQL Row-Level Security and Supabase Realtime:

```
                               ┌────────────────────────┐
                               │     Supabase Cloud     │
                               │ PostgreSQL + Realtime  │
                               └───────────┬────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌───────────────────┐             ┌───────────────────┐             ┌───────────────────┐
│   Customer App    │             │   Rider Console   │             │   Admin Portal    │
│  (iOS / Android)  │             │   (Fleet App)     │             │    (Next.js 14)   │
├───────────────────┤             ├───────────────────┤             ├───────────────────┤
│ • 10-Min Catalog  │             │ • Duty Status     │             │ • Executive KPIs  │
│ • SLA Checkout    │ ──Order──►  │ • Haptic Dispatch │  ◄─Assigned │ • Master Catalog  │
│ • Live GPS Beacon │             │ • Turn-by-Turn    │             │ • Dark Store Hubs │
│ • Secure PIN Gate │             │ • PIN Complete    │             │ • Fleet & KYC Desk│
└───────────────────┘             └───────────────────┘             └───────────────────┘
                                           ▲
                                           │ Dispatches
                                  ┌────────┴──────────┐
                                  │ Store Station     │
                                  │ Packing & Hub Ops │
                                  └───────────────────┘
```

---

## 📱 Platforms & Applications

| Application | Workspace | Tech Stack | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **Customer Mobile** | `apps/mobile` | React Native, Expo SDK 57, NativeWind | Instant grocery catalog, 10-min SLA timer, cart shortfall bar, live GPS corridor telemetry, and PIN verification. |
| **Rider Fleet App** | `apps/mobile` | Expo, Zustand, Haptics, Deep-Linking | Audio-haptic 30s dispatch countdown, Apple Maps / Google Navigation deep links, bag checklist, and OTP confirmation. |
| **Dark Store Station** | `apps/admin` | Next.js 14, React 19, Tailwind CSS | On-ground store manager console, order packing pipeline, rider assignment, and local stock replenishment. |
| **Super Admin Portal** | `apps/admin` | Next.js App Router, Lucide, Glassmorphism | Executive analytics dashboard, category controller, master product SKU ledger, fleet KYC verification, coupons & banners. |

---

## 📂 Repository Monorepo Structure

```
belzo-app/
├── .github/                      # Enterprise CI/CD & issue/PR templates
│   ├── workflows/ci.yml          # Automated monorepo typecheck & security audit
│   └── PULL_REQUEST_TEMPLATE.md  # Production pull request review gate
├── apps/
│   ├── mobile/                   # Universal iOS & Android Expo SDK 57 App
│   │   ├── app/
│   │   │   ├── (auth)/           # Phone OTP authentication flow
│   │   │   ├── (customer)/       # Commerce, cart, checkout, live tracking, profile
│   │   │   └── (rider)/          # Courier console, active delivery, shift ledger
│   │   ├── components/           # UI components, modals, and Steppers
│   │   ├── store/                # Zustand stores (Cart & Rider session)
│   │   ├── utils/                # Turn-by-turn navigation deep links
│   │   ├── eas.json              # EAS Build profiles (Android APK preview & Store)
│   │   └── app.json              # Expo configuration & permissions
│   └── admin/                    # Next.js 14 Super Admin & Operator Station
│       ├── app/
│       │   ├── admin/            # 9 Executive Admin Suites
│       │   └── operator/         # Dark store manager packing station
│       ├── lib/                  # Shared sound alerts & Supabase client
│       └── public/               # Official brand assets & winged logo
├── packages/
│   └── supabase/                 # Shared TypeScript database schema & types
├── docs/                         # Engineering specifications (PRD, TRD, SCHEMA, UI/UX)
├── .env.example                  # Environment variable blueprint
└── package.json                  # Monorepo root workspace configuration
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **Expo Go** / Android Studio / iOS Simulator (for mobile testing)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/shadullahpfp/belzo-app.git
cd belzo-app
npm install
```

### 3. Environment Configuration
Copy `.env.example` to target workspaces:
```bash
cp .env.example apps/mobile/.env
cp .env.example apps/admin/.env.local
```
Provide your Supabase URL and anonymous client keys:
```ini
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Running Local Development Servers

#### Launch Next.js Super Admin & Operator Portal (Port 3001):
```bash
cd apps/admin
npm run dev
# Accessible at http://localhost:3001/admin
```

#### Launch Expo Mobile Dev Server (Port 8081):
```bash
cd apps/mobile
npx expo start -c
# Scan the QR code using Expo Go or press 'i' for iOS / 'a' for Android
```

---

## 🔒 Security & Compliance

- **Zero Hardcoded Secrets**: Secrets and service role keys are excluded from git history.
- **Row-Level Security (RLS)**: Fine-grained access control ensuring customers only access their own orders and riders only modify assigned deliveries.
- **PIN-Protected Handoff**: Contactless and secure delivery verified via cryptographic or phone-matching 4-digit PINs.
- **Role-Based Gatekeeping**: Built-in layout guards preventing cross-role access between consumers, couriers, and administrators.

---

## 🤝 Contributing

We maintain strict code quality, typed contracts, and conventional commits. Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md) before submitting pull requests.

```bash
# Verify TypeScript before pushing
npx tsc --noEmit
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more details.
Copyright © 2026 Belzo Technologies Inc. All rights reserved.
