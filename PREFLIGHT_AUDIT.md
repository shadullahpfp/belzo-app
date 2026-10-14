# Belzo Hyperlocal Quick-Commerce Ecosystem
## Pre-Flight System Audit & Standalone Android APK Build Verification Report

**Audit Date:** October 14, 2026  
**Auditor:** Principal Lead Release Engineer, Mobile Architect & Systems Director  
**Monorepo Workspaces:** `apps/mobile` (Expo React Native), `apps/admin` (Next.js 15 App Router)  
**Target Platform:** Standalone Android `.apk` (Internal Distribution for BillDesk Merchant Verification)

---

### 1. Mobile Ecosystem Pre-Flight Audit (`apps/mobile`)
- [x] **Clerk Google Authentication Resilience (`apps/mobile/app/(auth)/login.tsx`):**
  - Zero mock/demo bypass UI remains.
  - Integration with `@clerk/clerk-expo` (`useSSO` / `useOAuth`).
  - Warm up / cool down via `expo-web-browser` configured.
  - Safe redirect callback handling using `AuthSession.makeRedirectUri({ scheme: 'belzo', path: 'sso-callback' })` preventing null `.toString()` unhandled exceptions.
- [x] **Mandatory Dynamic Profile Sheet (`apps/mobile/components/profile/CompleteProfileSheet.tsx`):**
  - Strict 10-digit Indian mobile number validation (`/^\d{10}$/`).
  - Un-dismissible until mobile and address are verified.
  - Persists directly to Supabase `profiles` table.
- [x] **Address & GPS Integration (`apps/mobile/app/(customer)/profile.tsx`):**
  - Initial address state initialized to empty array `[]` (zero hardcoded mock addresses).
  - Queries saved addresses dynamically from Supabase `addresses` table scoped to `user.id`.
  - "📍 Use Current GPS Location" uses `expo-location` reverse-geocoding to fetch street, district, city, and pincode.
- [x] **Hardware Back-Button Trap (`apps/mobile/app/(customer)/track-order/[id].tsx`):**
  - `BackHandler.addEventListener('hardwareBackPress', ...)` intercepts Android hardware back button and routes to `/(customer)/home` using `router.replace` to prevent checkout loop traps.
- [x] **Rider Console Fleet Binding (`apps/mobile/app/(rider)/dashboard.tsx`):**
  - Status bar / notch collision eliminated using `useSafeAreaInsets()`.
  - Shift metrics bind dynamically to live Supabase `orders` table (earnings & completed count filtered by `status = 'delivered'` for today).
  - Vehicle assignment locked to hub administrator verification.

---

### 2. Admin & Operator Live Sync Audit (`apps/admin`)
- [x] **Zero-Cache Operator Inventory (`apps/admin/app/operator/inventory/page.tsx`):**
  - `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` configured.
  - Resilient product query (`select('*')`) with automated fallback to load all active products across store if store-filtered query returns empty.
  - Direct file image upload via `<ImageUploader />` directly uploading to Supabase Storage bucket `product-images`.
- [x] **Real-Time Order Chime (`apps/admin/app/operator/page.tsx`):**
  - Supabase Realtime channel subscribed to `orders` table `INSERT` events.
  - Triggers Web Audio alert chime (`playDispatchChime()`) on incoming orders.

---

### 3. Standalone Android APK Build Configuration (`apps/mobile`)
- [x] **`apps/mobile/app.json` Configuration:**
  - `android.package`: `"com.belzo.hyperlocal"`
  - `version`: `"1.0.0"`
  - `versionCode`: `1`
  - Explicit runtime permissions only:
    - `ACCESS_COARSE_LOCATION`
    - `ACCESS_FINE_LOCATION`
    - `INTERNET`
    - `POST_NOTIFICATIONS`
    *(No `ACCESS_BACKGROUND_LOCATION` present).*
  - Verified local asset paths:
    - `icon`: `./assets/icon.png` (present, 612 KB)
    - `splash.image`: `./assets/splash.png` (present, 612 KB)
    - `adaptiveIcon.foregroundImage`: `./assets/adaptive-icon.png` (present, 612 KB)
    - `web.favicon`: `./assets/favicon.png` (present, 6.4 KB)
- [x] **`apps/mobile/eas.json` Preview Profile:**
  - Configured for standalone internal `.apk` generation:
    ```json
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
    ```

---

### 4. Static Analysis & Typecheck Quality Gate
- `apps/mobile`: `npx tsc --noEmit` -> **0 errors (Exit code: 0)**
- `apps/admin`: `npx tsc --noEmit` -> **0 errors (Exit code: 0)**

---

### 5. Standalone APK Build Command (BillDesk Merchant Verification)
```bash
cd apps/mobile && eas build -p android --profile preview
```
