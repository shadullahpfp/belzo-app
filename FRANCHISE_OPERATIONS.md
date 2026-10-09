# ⚡ BELZO FRANCHISE OPERATIONS MANUAL
## Standard Operating Procedure — Hyperlocal Dark Store Micro-Fulfilment Center

> **Version:** 1.0.0 | **Effective:** October 2026 | **Confidential:** Belzo Technologies Inc.

---

## 1. FRANCHISE UNIT MODEL

### 1.1 Concept Overview
A **Belzo Franchise Dark Store** is a 10-Minute Hyperlocal Micro-Fulfilment Center (MFC) operating as a first-party ultra-dark retail node. Unlike conventional stores, franchise units carry zero customer walk-ins — every transaction is app-originated, processed, packed, dispatched, and PIN-verified in an end-to-end encrypted delivery loop.

### 1.2 Core Design Principles
| Principle | Specification |
|-----------|--------------|
| **Order-to-Door SLA** | ≤ 12 minutes (10-min target, 2-min grace window) |
| **Service Radius** | 5–8 km from hub centroid |
| **Catalog Depth** | 124+ verified SKUs across 6 official categories |
| **Operating Hours** | 06:00 – 23:00 IST (17-hour shift window) |
| **Min Hub Area** | 400–700 sq. ft. temperature-controlled ground-floor storage |
| **Fleet Capacity** | 3–5 active EV Motorcycles / E-Bicycles per shift |

---

## 2. FLAGSHIP NODE — JONIHA CENTRAL HUB 01

### 2.1 Node Identity
| Field | Value |
|-------|-------|
| **Store Code** | `BLZ-HUB-01` |
| **System Store ID** | `a0000000-0000-0000-0000-000000000001` |
| **Hub Name** | `Belzo Joniha Central Hub 01` |
| **Full Address** | Ward No. 4, Shahbajpur, Joniha Chauraha, Bindki Road, Fatehpur 212635, Uttar Pradesh |
| **GPS Coordinates** | `26.0350°N, 80.4650°E` |
| **Hub Phone** | `+91 98765 43210` |
| **Service Radius** | 5–8 km |
| **Hub Type** | First-Party Joniha Pilot MFC |

### 2.2 Service Zone
```
Coverage Block:
├── Joniha Chauraha & surrounding mohallas
├── Bindki Road Corridor (NH-2 access zone)
├── Shahbajpur — Ward 4, Ward 5
├── Saidpur & Katra Bazaar access roads
└── Fatehpur Civil Lines peripheral access
```

---

## 3. OFFICIAL PRODUCT CATEGORY HIERARCHY

All franchise nodes must carry **exactly** these 6 official categories. Injection of custom or arbitrary categories is prohibited:

| # | Category ID | Display Name | Coverage |
|---|------------|-------------|----------|
| 1 | `cat-01-grocery` | **Grocery** | Kirana, Oils (Sarso Tel, Fortune, Nutrela), Spices (Goldi), Dals & Rice, Tea & Sugar, Cold Drinks, Namkeen, Baby Nutrition (Cerelac, Horlicks), Home Care |
| 2 | `cat-02-produce` | **Fruits & Vegetables** | Taza Sabzi Mandi: Aloo, Pyaz, Tamatar, Bhindi, Baingan, Parwal, Lauki, Karela, Gobhi, Dhaniya, Mushroom, Adrak, Mirch, Garlic |
| 3 | `cat-03-food` | **Food & Restaurant** | Pizza Paradise, Bala Ji Restaurant Specials, Desi Dhaba Meals (Thali, Dal, Roti), Bakery Cakes, Mithai |
| 4 | `cat-04-pharma` | **Medicine & Healthcare** | First Aid (Dettol, Iodex, Zandu), Ayurvedic (Chyawanprash), Baby Care (Gripe Water, Amul Spray), Skin Care, Eno, All Out |
| 5 | `cat-05-fashion` | **Fashion & Lifestyle** | Cotton Socks, Lifestyle Accessories, Home Comfort Items |
| 6 | `cat-06-electronics` | **Electronics** | 5G Smartphones (Vivo, Realme, Oppo, Redmi), Feature Phones (Nokia), Chargers & Adapters, TWS Earbuds, Neckbands, Soundbars, Smartwatches, Car Accessories |

---

## 4. TERMINAL OPERATIONS — STEP-BY-STEP SOP

### 4.1 Shift Start Protocol (06:00 AM)

1. **Power On Terminal:** Open `admin.belzo.app/operator` on the picking tablet.
2. **Rider Go-Online:** Confirm minimum 2 riders are "Online" in the Rider Fleet panel.
3. **Inventory Spot-Check:** Verify high-velocity SKUs (Aloo, Tamatar, Namkeen, Tata Chai) have stock > 20 units each.
4. **Audio Test:** Trigger a manual order broadcast to confirm Web Audio API dispatch chime fires correctly on the browser.

### 4.2 Incoming Order Handling

When a new customer order arrives:

```
[Customer Places Order]
       │
       ▼
[Supabase INSERT → orders (status: 'placed')]
       │
       ▼
[Operator Terminal receives Web Audio Chime 🔔]
[Order card appears INSTANTLY in "Pending Pick & Pack" column]
       │
       ▼
[Operator reviews order items checklist]
[Packs each item → ticks checkbox ✅]
       │
       ▼
[Clicks "Mark Packed & Ready"]
[Supabase UPDATE → orders (status: 'ready_for_pickup')]
       │
       ▼
[Available online rider receives 30s Haptic Alert on Rider App]
[Rider accepts → status: 'out_for_delivery']
       │
       ▼
[Rider picks up from hub → drops at customer doorstep]
[Customer shares 4-digit Delivery PIN]
[Rider enters PIN → Supabase UPDATE → status: 'delivered']
       │
       ▼
[Order Closed ✅ | Rider Earnings + | Admin GMV +]
```

### 4.3 1-Click WhatsApp Dispatch
For each packed order, the operator may send a WhatsApp dispatch briefing to the assigned rider containing:
- `Order ID` and `Time`
- `Full Delivery Address` with Google Maps Pin: `https://www.google.com/maps/search/?api=1&query={lat},{lng}`
- `Itemized Packing Checklist`
- `Bill Amount` and `Payment Mode`
- `Customer Contact Number`

**Button:** Click **WhatsApp Dispatch** on any ready order card. This opens `https://wa.me/{riderPhone}?text={encodedPayload}` in a new tab.

### 4.4 4-Digit PIN Delivery Verification (Security Gate)
- A cryptographically random 4-digit PIN is generated at the time of checkout: `Math.floor(1000 + Math.random() * 9000)`
- The PIN is stored as `delivery_pin` in the `orders` table (encrypted at rest via Supabase).
- **Customer App** displays this PIN prominently with high contrast on the `track-order` screen.
- **Rider App** shows a PIN entry keypad at the doorstep.
  - ❌ **Incorrect PIN:** Shows `"Invalid PIN. Ask customer for the 4-digit code on their screen."` + error haptics.
  - ✅ **Correct PIN:** Triggers success haptics, marks order `delivered`, increments earnings.

### 4.5 Real-Time Inventory Controller
Operators can manage live pricing and stock from `/operator/inventory`:

| Action | Process |
|--------|---------|
| **Inline Price Edit** | Click price field → type new amount → press Enter → persists to `products.price` in Supabase |
| **Stock Toggle** | Toggle "In Stock" / "Sold Out" → updates `products.is_available` instantly via Supabase → reflects live on customer app |
| **Add New SKU** | Click "+ Add Product" → fill Name, Category, Unit, Price, Stock, Image URL → saved to `products` with `store_id = JONIHA_HUB_ID` |

---

## 5. HARDWARE REQUIREMENTS

| Equipment | Specification |
|-----------|--------------|
| **Operator Terminal** | Android tablet (min 7", 2 GB RAM) or Laptop/Desktop with Chrome browser |
| **Thermal Printer** | 58mm Bluetooth/USB thermal receipt printer (e.g. Xprinter XP-58, GOOJPRT PT-210) |
| **Router / Connectivity** | Stable 4G LTE minimum (BSNL or Airtel SIM recommended), backup hotspot on rider phone |
| **Rider Smartphones** | Android 10+ with Expo Go app installed or signed Belzo APK (`com.belzo.hyperlocal`) |
| **Vehicle Fleet** | EV Motorcycle, Scooter, or E-Bicycle per active rider |
| **Storage Bins** | Color-coded picking bins: 🟢 Grocery | 🔴 Produce | 🟡 Pharma | 🔵 Electronics |
| **Thermal Bags** | Insulated delivery thermal bags for produce and pharma cold chain |

---

## 6. SHIFT METRICS & SLA ENFORCEMENT

| Metric | Green | Amber | Red |
|--------|-------|-------|-----|
| **Order-to-Delivered SLA** | ≤ 12 min | 12–18 min | > 18 min |
| **Order Acceptance Rate** | ≥ 95% | 85–95% | < 85% |
| **Pick Accuracy** | 100% correct items | 98% | < 98% |
| **Rider On-Duty Rate** | ≥ 2 active | 1 active | 0 active |
| **Stock Out Events** | 0 per shift | 1–2 | > 2 |

---

## 7. FLEET OPERATIONS

### 7.1 Rider Onboarding
1. Rider downloads Belzo APK from `eas.build` link on Android device.
2. Rider logs in via demo credentials until Supabase profile is linked.
3. Operator verifies KYC details on Admin Portal → Riders section.
4. Rider is tagged with `store_id = 'a0000000-0000-0000-0000-000000000001'` in the `riders` table.
5. Rider completes their profile: Full Name, Vehicle Type, Vehicle Registration Number.

### 7.2 Duty Control
- **Go Online:** Rider toggles "Go Online" → Supabase `riders.is_online = true`.
- **Go Offline / End Shift:** Toggle off → `is_online = false`, shift earnings logged.
- **Incoming Dispatch:** When an order enters `ready_for_pickup`, the rider receives a **30-second countdown alert modal** with customer address and item count.
  - ✅ Accept: `rider_id` assigned, `status: out_for_delivery`.
  - ❌ Reject/Timeout: Order remains in operator queue for reassignment.

---

## 8. FRANCHISE EXPANSION PLAYBOOK

### 8.1 Launching a New Hub
1. Register a new hub in Supabase `dark_stores` table with a unique `hub_code`.
2. Copy the 6 official category IDs — never create custom categories.
3. Execute the master seed SQL on the new hub's `store_id`.
4. Deploy the Operator Terminal URL (`/admin.belzo.app/operator`) with hub-specific login.
5. Assign minimum 3 active riders to the new hub.
6. Run a test order flow end-to-end before going live.

### 8.2 Prohibited Actions
- ❌ Adding non-official category IDs to the product catalog.
- ❌ Modifying `delivery_pin` field manually after order placement.
- ❌ Bypassing PIN verification at doorstep under any circumstance.
- ❌ Using hardcoded mock customer or rider names in production.
- ❌ Committing `.env` or `.env.local` files to the git repository.

---

## 9. ESCALATION MATRIX

| Issue | Tier 1 | Tier 2 | Tier 3 |
|-------|--------|--------|--------|
| App not loading on rider device | Reload page, check internet | Clear app cache + restart | Ops team remote access |
| Supabase realtime not firing | Check Supabase project status | Verify realtime publication | DBA escalate |
| Stuck order in "placed" state | Manual status update from operator terminal | Admin page → Orders → Force-update | CTO |
| PIN mismatch loop | Show customer screen PIN | Manual completion + admin note | Security audit |
| Stock discrepancy | Update `is_available` in inventory | Physical recount | Ops Manager |

---

*Belzo Technologies Inc. | Joniha Central Hub 01 | Fatehpur, UP 212635 | v1.0.0*
