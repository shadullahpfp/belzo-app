# Belzo — Product Requirements Document (PRD)
**Project Name:** Belzo Hyperlocal Quick-Commerce Ecosystem  
**Target Launch Hub:** Joniha Central Hub (`26.0350, 80.4650`), Bindki, Fatehpur, UP — 212635  
**Service Radius:** 5.0 Kilometers Radial Geofence  
**Document Version:** 2.1.0 (Apple Edition / Production Release)  
**Status:** Approved for Production  

---

## 1. Executive Summary & Vision

Belzo is an ultra-fast, hyperlocal quick-commerce ecosystem engineered to deliver everyday essentials (groceries, fresh produce, OTC pharma, snacks, and daily tech) within a guaranteed 12-minute SLA to households in Tier-2/Tier-3 micro-hubs, starting with **Joniha (Bindki, Uttar Pradesh)**.

Belzo combines the **typographic elegance, squircle geometry, and fluid haptics of the Apple Store** with the **dense merchandising, flash promotions, and multi-category layout of Swiggy Instamart**. The system connects four distinct stakeholders in a closed real-time loop:
1. **Consumers** (iOS/Android mobile app)
2. **Dark Store Operators** (Desktop/Tablet fulfillment terminal)
3. **Delivery Couriers / Riders** (Native Android/iOS dispatch console)
4. **Platform Admins** (Super-admin executive control suite)

---

## 2. User Roles & Access Hierarchy

| Role | Interface | Primary Responsibility | Authentication |
|---|---|---|---|
| **Customer** | Mobile App (`apps/mobile`) | Catalog discovery, cart building, checkout, and live order tracking. | Firebase Phone OTP + Supabase session |
| **Dark Store Operator** | Web Terminal (`apps/admin/app/operator`) | Order intake, pick/pack verification, rider assignment, WhatsApp dispatch, real-time catalog pricing. | Dedicated staff credential / session |
| **Rider / Courier** | Mobile App (`apps/mobile/(rider)`) | Shift toggle, 30s broadcast acceptance, turn-by-turn routing, customer 4-digit PIN verification. | Registered phone number + KYC profile |
| **Super Admin** | Web Portal (`apps/admin/app/(admin)`) | Cross-hub analytics (GMV, SLA), fleet KYC approval, coupon engine, dynamic geofence configuration. | Supabase Service Role / Admin session |

---

## 3. Geographic Boundary & Geofencing Engine

### 3.1 Anchor Coordinates & Zone Enforcement
- **Central Anchor:** Joniha Chauraha, Bindki Road, Fatehpur, UP (`26.0350° N, 80.4650° E`).
- **Hard Radial Limit:** Exactly `5.0 KM` calculated via the spherical Haversine formula.

### 3.2 Serviceability Rules
- **Inside Zone (≤ 5.0 KM):** The customer app unlocks ordering, displays dynamic ETA (`⚡ Delivery in 12 Mins to [Area]`), and renders live catalog stock.
- **Outside Zone (> 5.0 KM):** 
  - An Apple-grade frosted sheet (*"Out of Delivery Zone"*) informs the user of the 5 KM Joniha boundary.
  - The "Place Order" button in Cart and Checkout is disabled.
  - An interactive demo override button (*"Simulate Location in Joniha"*) is exposed exclusively for developer review and Google Play Store automated testers.

---

## 4. End-to-End Functional Capabilities

### 4.1 Customer Mobile Experience
1. **Header & Location Engine:**
   - Real-time GPS detection via `expo-location` reverse-geocoded into local street names.
   - Dynamic top bar reflecting sub-locality and real-time delivery SLA.
2. **Merchandising & Browsing (Instamart + Apple HIG):**
   - **Hero Carousel:** Frosted squircle promotional banners for 12-minute delivery and promotional coupons (`BELZO30`).
   - **2x4 Bento Grid Categories:** Dairy & Eggs, Fresh Veggies & Fruits, Munchies & Chips, Cold Drinks & Juices, Instant Food, Pharmacy, Quick Tech, and Daily Fashion.
   - **Product Shelves:** Curated horizontal rails with 1:1 image containers, MRP strikethroughs, and Apple "ADD" steppers.
3. **Cart & Transparent Bill:**
   - Dynamic floating acrylic cart dock (`BottomCartPill`) appears when items > 0.
   - Itemized bill breakdown: Item Total, Delivery Partner Fee (Free above ₹199, else ₹25), Handling Fee (₹5), and Grand Total.
4. **Checkout & Order Placement:**
   - Payment method toggle: Cash on Delivery (COD) vs Online Payment (UPI / Cards).
   - Atomic database write creating records in `orders` and `order_items`.
5. **Live Order Telemetry & Verification:**
   - 4-stage visual timeline: `Order Placed` ➔ `Packed at Joniha Hub` ➔ `Out for Delivery` ➔ `Delivered`.
   - Prominently displays a secure 4-digit Delivery PIN required by the rider to close the order.

### 4.2 Dark Store Operator Terminal
1. **Audio-Visual Queue:**
   - Live columns: `Pending / Incoming`, `Packed / Ready`, and `In Transit`.
   - Web Audio synthesizer plays an alert chime upon incoming orders.
2. **Order Pack Checklist:**
   - Interactive item-by-item verification list with SKUs, units, and quantities.
3. **1-Click WhatsApp Dispatch:**
   - One-tap button opening WhatsApp with pre-formatted order details:
     - Order ID, items checklist, total bill amount, payment mode.
     - Customer name, phone number, delivery address, and direct Google Maps navigation link.
4. **Hub Transfer & Rider Allocation:**
   - Reroute orders to secondary dark stores with full historical audit (`transferred_from_store_id`).
   - Instant assignment to active, verified online riders.
5. **Fast Inventory & Price Controller:**
   - Inline pricing editor: Modify selling price or discount price directly within the table.
   - Instant toggle between `In Stock` and `Sold Out` (`is_available = true/false`).

### 4.3 Rider Courier Console
1. **Shift Management:**
   - Single-tap toggle for `Online` (green pulsing beacon) vs `Offline`.
   - Shift metrics display: Today's Earnings, Completed Deliveries, and Rating.
2. **Order Broadcast & Countdown:**
   - 30-second audible incoming order offer modal with earning payout (`₹65 Payout`) and pickup/drop distances.
3. **Dual-Platform Navigation Deep-Links:**
   - One-tap launch into Apple Maps (`maps://`) or Google Maps (`google.navigation:q=`).
4. **Secure 4-Digit Delivery PIN Verification:**
   - Keypad requiring the customer's 4-digit secret PIN to close the delivery and credit payout to shift earnings.

### 4.4 Super Admin Management
1. **Executive Dashboard:** Live metrics for GMV, total order velocity, active courier fleet, and delivery SLA tracker.
2. **Catalog Master:** Central product repository supporting additions, edits, and category management.
3. **Fleet KYC Verification Desk:** Driver document inspection drawer with "Approve KYC" and "Reject / Suspend" workflows.
4. **Marketing Engine:** Promo coupon generator (`BELZO50`, `FREEDEL`) and home carousel banner controller.

---

## 5. Non-Functional Requirements & Performance SLAs

- **Order Ingestion SLA:** Orders placed in the mobile app must appear in the Store Operator queue within **≤ 500 milliseconds** via Supabase Realtime WebSockets.
- **Client Latency:** Search debounce capped at 250ms with a guaranteed in-memory fallback (< 50ms) to prevent UI freezing.
- **Visual Performance:** Constant 60 FPS transitions using native thread drivers and zero circular spinners (1.1s continuous shimmer sweeps only).
- **Security:** Complete Row Level Security (RLS) policies isolating customer order data, operator controls, and rider state.
