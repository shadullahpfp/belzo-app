# Belzo — Technical Requirements Document (TRD)
**Project Name:** Belzo Hyperlocal Quick-Commerce Ecosystem  
**Document Version:** 1.0.0  
**Target Release:** Production v1  
**Document Owner:** Principal Software Architect & Tech Lead  
**Last Updated:** September 2026  

---

## 1. System Architecture & High-Level Topology

Belzo adopts a **Unified Monorepo Architecture** with decoupled edge-ready applications communicating with a managed Postgres backend, a cloud-native object store with zero-egress pricing, and real-time WebSocket state distribution.

```
                     ┌────────────────────────────────────────────────────────┐
                     │                     CLIENT LAYER                       │
                     ├──────────────────────────┬─────────────────────────────┤
                     │   Customer Mobile App    │      Rider Mobile App       │
                     │  (Expo SDK / React Nat.) │   (Expo SDK / React Nat.)   │
                     ├──────────────────────────┴─────────────────────────────┤
                     │                   Web Admin Portal                     │
                     │               (Next.js 14 App Router)                  │
                     └─────────────┬───────────────────────────┬──────────────┘
                                   │                           │
                            HTTPS / WSS                 S3 Presigned API
                                   │                           │
                                   ▼                           ▼
                     ┌───────────────────────────┐   ┌────────────────────────┐
                     │     SUPABASE PLATFORM     │   │     CLOUDFLARE R2      │
                     ├───────────────────────────┤   ├────────────────────────┤
                     │ • GoTrue Auth (Phone OTP) │   │ • Product Images (CDN) │
                     │ • PostgreSQL 15 + RLS     │   │ • Rider KYC Proofs     │
                     │ • Realtime WebSockets     │   │ • Delivery Signature   │
                     │ • Supabase Edge Functions │   │ • Zero-Egress Bandwidth│
                     └─────────────┬─────────────┘   └────────────────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │   PUSH NOTIFICATION HUB   │
                     ├───────────────────────────┤
                     │ • Firebase (FCM)          │
                     │ • Apple APNs (via Expo)   │
                     └───────────────────────────┘
```

---

## 2. Technology Stack & Framework Selection

### 2.1 Mobile Application (Customer & Rider)
- **Framework:** React Native with **Expo SDK (v51+)** using bare workflow escape capabilities.
- **Routing Engine:** **Expo Router v4** (File-based routing with group segments: `(auth)`, `(customer)`, `(rider)`).
- **Styling:** **NativeWind v4** (Tailwind CSS engine compiled for native primitives).
- **State Management:**
  - Server State & Cache: **TanStack React Query v5** (for optimistic mutations, window focus refetching, and pagination).
  - Client / UI State: **Zustand** (lightweight atomic store for Cart, Active Address, Location).
- **Offline / Persistent Storage:** **MMKV** (`react-native-mmkv`) for ultra-fast synchronous storage.
- **Maps & Telemetry:** `react-native-maps` with Google Maps / Apple Maps integration + Mapbox GL SDK for smooth polyline vector rendering.
- **Background Tasks:** `expo-location` and `expo-task-manager` for battery-optimized courier location broadcast.
- **Micro-Interactions & Animation:** `react-native-reanimated v3` + `lottie-react-native`.
- **Dual-Platform Architecture (iOS & Android):**
  - **Android Package:** `com.belzo.app` with `softwareKeyboardLayoutMode: "pan"` and adaptive icons.
  - **iOS Bundle Identifier:** `com.belzo.app` with granular InfoPlist location permissions (`NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`).
  - **Platform Inset & Layout Strategy:** Universal `ScreenContainer` leveraging `react-native-safe-area-context` and `Platform.select` to standardize notch/Dynamic Island offsets, Android translucent status bar padding, keyboard avoidance, and shadow vs elevation metrics.


### 2.2 Web Admin Portal
- **Framework:** **Next.js 14** (React 18 Server Components + App Router).
- **Styling:** **Tailwind CSS** with **Shadcn UI** (Radix UI primitives).
- **Icons:** **Lucide React**.
- **Realtime Integration:** `@supabase/supabase-js` Realtime client listening to Postgres change data capture (CDC).
- **Audio Synthesis:** Web Audio API (`AudioContext`) for low-latency dispatch chimes.
- **Data Visualization:** **Recharts** for sales velocity, SLA delivery trends, and rider performance metrics.

### 2.3 Backend & Cloud Infrastructure
- **Core Database:** **Supabase PostgreSQL 15+** with PostGIS geographic extensions.
- **Identity & Access Management:** **Supabase GoTrue** (Twilio / MessageBird SMS bridge for Phone OTP).
- **Realtime Layer:** **Supabase Realtime** (WebSocket server based on Elixir Phoenix Channels broadcasting row mutations).
- **Object Storage:** **Cloudflare R2** with S3-compatible SDK (`@aws-sdk/client-s3`) and custom Cloudflare Workers for CDN image resizing.
- **Push Notification Gateway:** **Expo Push Notification Service** bridged to Apple Push Notification service (APNs) and Firebase Cloud Messaging (FCM).

---

## 3. Monorepo Directory Layout

The workspace is organized as an enterprise monorepo using **Turborepo** and npm/pnpm workspaces:

```
belzo-app/
├── package.json
├── turbo.json
├── apps/
│   ├── mobile/                      # Unified Expo Mobile App
│   │   ├── app/
│   │   │   ├── _layout.tsx          # Root Layout & Auth Role Gatekeeper
│   │   │   ├── index.tsx            # Initial resolver
│   │   │   ├── (auth)/              # Authentication flow
│   │   │   │   ├── login.tsx
│   │   │   │   └── verify-otp.tsx
│   │   │   ├── (customer)/          # Customer application group
│   │   │   │   ├── (tabs)/
│   │   │   │   │   ├── _layout.tsx
│   │   │   │   │   ├── home.tsx
│   │   │   │   │   ├── categories.tsx
│   │   │   │   │   ├── search.tsx
│   │   │   │   │   ├── offers.tsx
│   │   │   │   │   └── profile.tsx
│   │   │   │   ├── product/[id].tsx
│   │   │   │   ├── cart.tsx
│   │   │   │   ├── checkout.tsx
│   │   │   │   ├── order/
│   │   │   │   │   ├── confirmation.tsx
│   │   │   │   │   └── [id]/track.tsx
│   │   │   │   └── support.tsx
│   │   │   └── (rider)/             # Delivery Partner console group
│   │   │       ├── dashboard.tsx
│   │   │       ├── order/[id]/
│   │   │       │   ├── details.tsx
│   │   │       │   ├── pickup.tsx
│   │   │       │   └── deliver.tsx
│   │   │       ├── earnings.tsx
│   │   │       └── profile.tsx
│   │   ├── src/
│   │   │   ├── components/          # Native components (Pill, Stepper, Shimmer)
│   │   │   ├── hooks/               # useLocation, useCart, useRealtimeOrder
│   │   │   ├── stores/              # Zustand slices
│   │   │   ├── tasks/               # Background location tasks
│   │   │   └── utils/
│   │   ├── app.json
│   │   ├── babel.config.js
│   │   ├── tailwind.config.js
│   │   └── tsconfig.json
│   │
│   └── admin/                       # Next.js 14 Web Admin Portal
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── (auth)/login/page.tsx
│       │   └── (dashboard)/
│       │       ├── layout.tsx
│       │       ├── page.tsx          # Executive metrics
│       │       ├── live-orders/page.tsx # Audio chime Kanban pipeline
│       │       ├── catalog/
│       │       │   ├── products/page.tsx
│       │       │   └── categories/page.tsx
│       │       ├── inventory/page.tsx
│       │       ├── fleet/page.tsx
│       │       ├── customers/page.tsx
│       │       └── reports/page.tsx
│       ├── components/              # Admin UI components & live map widgets
│       ├── lib/                     # Supabase server client, audio synth
│       ├── public/
│       └── next.config.js
│
├── packages/
│   ├── supabase/                    # Shared database client & types
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   └── database.types.ts    # Auto-generated from PostgreSQL schema
│   │   ├── migrations/
│   │   └── package.json
│   │
│   └── ui/                          # Shared design tokens & constants
│       ├── src/
│       │   ├── colors.ts
│       │   └── constants.ts
│       └── package.json
│
└── docs/                            # Foundational documentation
    ├── PRD.md
    ├── TRD.md
    ├── SCHEMA.sql
    └── UI_UX_SPEC.md
```

---

## 4. Gatekeeper & Routing Architecture (Expo Router)

The mobile application utilizes a **Single App Binary** for both Customers and Delivery Partners. The user's role is authenticated at the root level and dynamically directs the view stack.

### 4.1 Root Gatekeeper Implementation (`apps/mobile/app/_layout.tsx`)

```tsx
import React, { useEffect, useState, createContext, useContext } from 'react';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { createClient, Session, User } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Define Supabase storage adapter using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'customer' | 'rider' | 'admin' | null;
  isVerifiedRider: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  isVerifiedRider: false,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<'customer' | 'rider' | 'admin' | null>(null);
  const [isVerifiedRider, setIsVerifiedRider] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const segments = useSegments();
  const router = useRouter();

  // 1. Fetch user role and rider onboarding status from public.profiles and public.riders
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', userId)
        .single();

      if (error || !profile || !profile.is_active) {
        setRole('customer'); // Default fallback
        return;
      }

      setRole(profile.role);

      if (profile.role === 'rider') {
        const { data: riderData } = await supabase
          .from('riders')
          .select('is_verified')
          .eq('id', userId)
          .single();
        setIsVerifiedRider(riderData?.is_verified ?? false);
      }
    } catch (e) {
      console.error('Error fetching user profile:', e);
      setRole('customer');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial session retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Realtime auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setIsLoading(true);
          await fetchUserProfile(session.user.id);
        } else {
          setRole(null);
          setIsVerifiedRider(false);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // 2. Navigation Gatekeeper Redirect Logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCustomerGroup = segments[0] === '(customer)';
    const inRiderGroup = segments[0] === '(rider)';

    if (!session) {
      // Unauthenticated users are sent to Phone Login if accessing protected zones
      if (!inAuthGroup && !inCustomerGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated users
      if (role === 'rider') {
        if (!isVerifiedRider) {
          // Rider pending admin KYC approval
          if (segments[1] !== 'verification-pending') {
            router.replace('/(rider)/verification-pending');
          }
        } else if (!inRiderGroup) {
          router.replace('/(rider)/dashboard');
        }
      } else {
        // Customer or unprivileged user
        if (inAuthGroup || inRiderGroup) {
          router.replace('/(customer)/(tabs)/home');
        }
      }
    }
  }, [session, role, isVerifiedRider, segments, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2A134D' }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#E85D04" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        isVerifiedRider,
        isLoading,
        signOut: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      }}
    >
      <Slot />
    </AuthContext.Provider>
  );
}
```

---

## 5. Background Location & Battery Optimization Strategy

### 5.1 The Telemetry Problem in Quick-Commerce
Continuous GPS tracking (`LocationAccuracy.Highest` at 1Hz) drains a smartphone battery in less than 3 hours, causing rider app abandonment. Belzo utilizes an **adaptive dual-mode polling strategy** that balances rider safety, customer satisfaction, and battery conservation.

### 5.2 Dual-Mode Polling Engine
1. **Idle / Waiting Mode (Rider Online, No Active Order):**
   - **Update Interval:** 60 seconds.
   - **Distance Filter:** 50 meters.
   - **Accuracy:** Balanced / Cell tower assisted (`LocationAccuracy.Balanced`).
2. **En-Route Mode (Order Accepted / In-Transit):**
   - **Update Interval:** 15–20 seconds.
   - **Distance Filter:** 15 meters.
   - **Accuracy:** High GPS (`LocationAccuracy.High`).
   - **Kalman Filtering:** Spurious jumps with accuracy radius > 25m are filtered client-side before transmission.

### 5.3 Expo Task Manager Location Worker (`apps/mobile/src/tasks/locationTask.ts`)

```typescript
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export const LOCATION_BACKGROUND_TASK = 'BELZO_RIDER_LOCATION_TASK';

interface LocationPayload {
  locations: Location.LocationObject[];
}

TaskManager.defineTask(LOCATION_BACKGROUND_TASK, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as LocationPayload;
    const latest = locations[locations.length - 1];

    if (!latest || !latest.coords) return;

    // Filter out low-confidence readings (e.g. urban canyon reflections)
    if (latest.coords.accuracy && latest.coords.accuracy > 25) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Update rider coordinate payload
      await supabase
        .from('riders')
        .update({
          current_lat: latest.coords.latitude,
          current_lng: latest.coords.longitude,
          last_ping: new Date().toISOString(),
        })
        .eq('id', session.user.id);

    } catch (err) {
      console.error('Failed to sync location ping to Supabase:', err);
    }
  }
});

// Control API
export async function startRiderLocationTracking(isActiveDelivery: boolean) {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') return false;

  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') return false;

  await Location.startLocationUpdatesAsync(LOCATION_BACKGROUND_TASK, {
    accuracy: isActiveDelivery 
      ? Location.Accuracy.High 
      : Location.Accuracy.Balanced,
    timeInterval: isActiveDelivery ? 15000 : 60000, // 15s vs 60s
    distanceInterval: isActiveDelivery ? 15 : 50,    // 15m vs 50m
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Belzo Courier Service',
      notificationBody: isActiveDelivery 
        ? 'Broadcasting live delivery route to customer...' 
        : 'Active and awaiting dispatch...',
      notificationColor: '#2A134D',
    },
  });

  return true;
}

export async function stopRiderLocationTracking() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_BACKGROUND_TASK);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_BACKGROUND_TASK);
  }
}
```

---

## 6. Realtime Architecture & WebSocket Channels

Belzo uses Supabase Realtime (CDC on Postgres tables) for instant state synchronization.

### 6.1 Channel Subscriptions Matrix
| Channel Pattern | Intended Consumer | Event | Action Taken |
|---|---|---|---|
| `orders:id=eq.{orderId}` | Customer App | `UPDATE` (status, rider_id) | Progress bar advancement, ETA recalculation |
| `riders:id=eq.{riderId}` | Customer App | `UPDATE` (current_lat, current_lng) | Marker repositioning on Google Maps via smooth interpolation |
| `dark_store_orders:{storeId}` | Admin Web Portal | `INSERT` (new orders) | Play Web Audio Ding Chime, add to Kanban column |
| `rider_dispatches:{riderId}` | Rider App | `INSERT` (order offer) | Trigger high-priority audio alarm, open 30s countdown overlay |

### 6.2 Admin Audio Chime Webhook / Hook (`apps/admin/lib/useLiveOrderAlerts.ts`)

```typescript
'use client';
import { useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useLiveOrderAlerts(onNewOrder?: (order: any) => void) {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSynthesizedChime = () => {
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic chime chord (A5 -> E6)
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn('Web Audio playback failed (user gesture required):', e);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel('admin-live-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          playSynthesizedChime();
          if (onNewOrder) onNewOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onNewOrder]);
}
```

---

## 7. Media & CDN Architecture (Cloudflare R2)

- **Zero Egress Advantage:** Eliminates AWS S3 bandwidth transfer charges ($0.09/GB saved).
- **Direct Client Upload:** The client requests a presigned PUT URL from a Supabase Edge Function (`/functions/v1/get-r2-upload-url`), uploading images directly to R2.
- **Image Transformation:** Cloudflare Images / Worker transforms images on-the-fly (`/cdn-cgi/image/width=400,format=webp/https://media.belzo.in/...`).
