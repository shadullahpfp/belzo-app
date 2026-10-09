# Belzo — Technical Requirements Document (TRD)
**Project Name:** Belzo Hyperlocal Quick-Commerce Ecosystem  
**Document Version:** 2.1.0  
**Stack Topology:** Monorepo (Expo React Native + Next.js App Router + Supabase Postgres)  

---

## 1. System Architecture & Monorepo Topology

```text
belzo-app/
├── apps/
│   ├── mobile/                # Expo React Native App (Customer & Rider Consoles)
│   │   ├── app/               # Expo Router (file-based routing)
│   │   │   ├── (auth)/        # Login, OTP verification
│   │   │   ├── (customer)/    # Home, Search, Product, Cart, Checkout, Tracking
│   │   │   └── (rider)/       # Rider Console, Active Delivery, Shift Earnings
│   │   ├── components/ui/     # Apple HIG Component Kit (Squircles, Steppers, Docks)
│   │   ├── store/             # Zustand Global State (Cart, Location, Rider)
│   │   └── lib/               # Firebase Phone Auth & Supabase client bindings
│   │
│   └── admin/                 # Next.js 14 App Router (Operator Terminal & Super Admin)
│       ├── app/
│       │   ├── operator/      # Store Operator Live Dispatch & Fast Inventory
│       │   ├── (admin)/       # Super Admin (GMV, Riders KYC, Hubs, Marketing)
│       │   └── api/auth/      # Firebase-to-Supabase Session Bridge API
│       └── lib/               # Audio synthesizers, WhatsApp link generator
│
├── packages/
│   └── supabase/              # Database Schema, Migrations, Seed Scripts & Types
│       ├── scripts/           # Seed scripts (Joniha Hub + 24 verified products)
│       └── src/types.ts       # Shared TypeScript database entity interfaces
```

---

## 2. Technology Stack & Third-Party Services

| Layer | Technology | Version | Purpose |
| --- | --- | --- | --- |
| **Mobile Runtime** | Expo / React Native | SDK 51+ / RN 0.74+ | Cross-platform iOS & Android mobile clients |
| **Mobile Navigation** | `expo-router` | v3.5+ | Typed, file-based routing architecture |
| **Web Runtime** | Next.js (App Router) | 14.2+ | Desktop/tablet Store Operator station & Admin portal |
| **Database & Engine** | PostgreSQL / Supabase | 15.x | Relational store, Realtime CDC engine, and RLS |
| **Authentication** | Firebase Phone Auth | v10.x | 10,000 monthly free SMS OTP delivery |
| **Auth Session Bridge** | Custom JWT Bridge | Node / Edge | Converts verified Firebase phone token into Supabase JWT |
| **State Management** | Zustand | v4.5+ | Lightweight, reactive mobile store layer |
| **Styling & Design** | Tailwind CSS / NativeWind | v3.3+ | Apple HIG design tokens, squircle borders, glass blur |
| **Haptic Feedback** | `expo-haptics` | SDK 51 | Native iOS/Android tactile impact generation |
| **Location Services** | `expo-location` | SDK 51 | Foreground GPS acquisition & reverse-geocoding |

---

## 3. Core Algorithms & Technical Protocols

### 3.1 Haversine Radial Distance Calculation (5 KM Geofence)

The customer application executes client-side geofencing against the Joniha Central Hub anchor:

$$\Delta\text{lat} = \text{lat}_2 - \text{lat}_1, \quad \Delta\text{lon} = \text{lon}_2 - \text{lon}_1$$

$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right), \quad d = R \cdot c \quad (R = 6371\text{ km})$$

If $d \le 5.0\text{ km}$, `isServiceable` is set to `true`. If $d > 5.0\text{ km}$, cart progression is locked and the out-of-zone modal is triggered.

### 3.2 Dual-Provider Zero-Cost Authentication Architecture

1. **SMS Delivery (Firebase):** Mobile issues `signInWithPhoneNumber(auth, '+91' + phone, recaptchaVerifier)`. Firebase delivers the 6-digit OTP over its free monthly tier.
2. **Verification & Bridging:** The user enters the OTP. Upon `confirmationResult.confirm(otp)`, mobile issues a request to `/api/auth/bridge` with the verified phone number.
3. **Session Minting:** The Next.js backend uses `SUPABASE_SERVICE_ROLE_KEY` to upsert the user record in `auth.users` and `public.profiles`, generating an active Supabase session stored locally in `AsyncStorage`.
4. **Reviewer Test Bypass:** Inputting `9876543210` (Customer) or `9999999999` (Rider) with OTP `123456` immediately returns a valid session token, bypassing telecom SMS requirements during Google Play Store and Apple App Store reviews.

### 3.3 Operator Terminal WhatsApp Dispatch Protocol

When the store operator clicks the **"WhatsApp Dispatch"** button on an order card, the client generates a URI-encoded dispatch payload and invokes:

```typescript
const url = `https://wa.me/${targetNumber}?text=${encodeURIComponent(formattedOrderMessage)}`;
window.open(url, '_blank');
```

The payload structure includes customer details, line items, and a direct Google Maps deep-link:
`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`.

### 3.4 Native Turn-by-Turn Navigation Protocol

The Rider console detects the host operating system and opens the native map application:

* **iOS:** `maps://?daddr=${lat},${lng}&dirflg=d`
* **Android:** `google.navigation:q=${lat},${lng}` (fallback to `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`)

---

## 4. Real-time Pub/Sub Channels (Supabase Realtime)

The ecosystem subscribes to the `supabase_realtime` publication:

| Channel Name | Source Table | Filter Event | Subscriber | UI Action |
| --- | --- | --- | --- | --- |
| `operator-orders` | `orders` | `INSERT` (matching `store_id`) | Operator Terminal | Synthesizes Web Audio chime; adds card to `Pending` queue. |
| `rider-broadcast` | `orders` | `UPDATE` (`status = 'ready_for_pickup'`) | Rider Mobile App | Triggers vibration & opens 30-second offer modal. |
| `order-tracker` | `orders` | `UPDATE` (`id = eq.order_id`) | Customer Tracking | Advances radar timeline to next milestone. |
