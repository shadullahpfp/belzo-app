# Belzo — UI/UX Design System & Interaction Specification
**Project Name:** Belzo Hyperlocal Quick-Commerce Ecosystem  
**Design Standard:** Apple Human Interface Guidelines (HIG) & App Store Aesthetic  
**Document Version:** 2.0.0 (Apple Edition)  
**Last Updated:** September 2026  

---

## 1. Aesthetic Philosophy & Visual Identity

Belzo adapts the product-first minimalism, tactile spring physics, and typographic authority of the Apple App Store to instant quick-commerce delivery:
- **Product-First Canvas:** Elimination of banner clutter; high-contrast editorial hierarchy makes catalog items the primary focus.
- **Squircle Geometry:** Continuous-curve rounded corners (20px–24px radius) on cards, action sheets, and modal views.
- **Frosted Translucency (Materials):** Native iOS background blur (`backdrop-filter: blur(20px)`, `rgba(255, 255, 255, 0.82)`) on navigation headers and floating navigation pills.
- **Hairline Precision:** Elimination of muddy drop shadows; clean boundaries defined by 0.5px ultra-thin borders (`rgba(0, 0, 0, 0.06)`).
- **Physical Spring Feedback:** Apple-standard cubic-bezier spring animations paired with contextual device haptics (`UIImpactFeedbackGenerator`).

---

## 2. Color Palette & Design Tokens

### 2.1 Core Palette

| Token Name | Value | Apple HIG Role | Purpose |
|---|---|---|---|
| `canvas-grouped` | `#F2F2F7` | `systemGroupedBackground` | Soft neutral grey screen canvas base |
| `surface-card` | `#FFFFFF` | `secondarySystemGroupedBackground` | High-contrast white card surfaces & sheets |
| `surface-glass` | `rgba(255, 255, 255, 0.85)` | `systemUltraThinMaterial` | Translucent top navigation and floating docks |
| `border-hairline` | `rgba(0, 0, 0, 0.06)` | `separator` | 0.5px card separation borders |
| `brand-primary` | `#2A134D` | Custom Brand Tint | Belzo Imperial Purple (headers, active tab icons) |
| `brand-primary-light` | `#3E1B6B` | Custom Brand Elevated | Secondary dark badge backgrounds |
| `action-orange` | `#FF5E00` | Accent Color | Vibrant Wing Orange (CTAs, "ADD", checkout actions) |
| `fill-quaternary` | `rgba(116, 116, 128, 0.08)` | `quaternarySystemFill` | Inactive stepper backgrounds, input fields |
| `text-primary` | `#000000` | `label` | Large titles, product titles, bold prices |
| `text-secondary` | `#8E8E93` | `secondaryLabel` | SKU units, weights, delivery SLA, strikethrough MRP |

### 2.2 Semantic & Status Tokens (Apple System Foundation)

| Semantic State | Hex Code | Background Tint | Apple Token Equivalent |
|---|---|---|---|
| **Delivered / In-Stock** | `#34C759` | `#E8F9ED` | `systemGreen` |
| **Out for Delivery** | `#FF9500` | `#FFF4E5` | `systemOrange` |
| **Out of Stock / Cancelled** | `#FF3B30` | `#FFEBEA` | `systemRed` |
| **Route / Active Telemetry** | `#007AFF` | `#E5F1FF` | `systemBlue` |

---

## 3. Typography Scale & Hierarchy

- **Font Hierarchy:** SF Pro Display (Large Titles & Headings), SF Pro Text (Body, Captions, Labels).
- **Tabular Formatting:** `font-variant-numeric: tabular-nums` enforced across all prices, quantity counters, countdowns, and coordinates.

| Level | Size | Weight | Line Height | Tracking | HIG Application |
|---|---|---|---|---|---|
| **Large Title** | 34px | Bold (700) | 41px | +0.37px | Top Screen Title (Home, Cart, Orders) |
| **Title 1** | 28px | Bold (700) | 34px | +0.36px | Modal Sheet Headers, Section Highlights |
| **Title 2** | 22px | Bold (700) | 28px | -0.26px | Shelf Titles ("Popular in Grocery") |
| **Headline** | 17px | SemiBold (600) | 22px | -0.41px | Product Titles, Delivery Addresses |
| **Body** | 17px | Regular (400) | 22px | -0.41px | Descriptions, Customer Instructions |
| **Subheadline** | 15px | Regular (400) | 20px | -0.24px | Past Price (Strikethrough), Secondary Info |
| **Footnote** | 13px | SemiBold (600) | 18px | -0.08px | Weight/Unit Badges (`1 kg`, `500 ml`) |
| **Caption 1** | 12px | Medium (500) | 16px | 0.00px | ETA Badges, Order Timestamps |
| **Price Hero** | 20px | Heavy (800) | 24px | -0.30px | Selling Price (`₹149`) |

---

## 4. Signature Component Guidelines

### 4.1 Floating Glass Cart Dock (Apple Capsule)
Mounts dynamically when `cartItemCount > 0`.
- **Dimensions:** Height `58px`, horizontal margins `16px`, corner radius `29px` (Full Capsule).
- **Surface Material:** Frosted dark acrylic (`rgba(42, 19, 77, 0.92)` with `backdrop-filter: blur(20px)`).
- **Border:** `0.5px solid rgba(255, 255, 255, 0.18)`.
- **Shadow:** `0px 12px 32px rgba(0, 0, 0, 0.22)`.
- **Motion:** Slides up via spring physics (`stiffness: 280, damping: 22`). Tap triggers medium impact haptic.

### 4.2 App Store "GET"-Style Quantity Stepper
- **State 1 (Default / Qty 0):** Compact capsule button (Height 32px, Radius 16px). Fill: `rgba(116, 116, 128, 0.10)`, Text: `#FF5E00` (Bold 14px "ADD").
- **State 2 (Active / Qty >= 1):** Expands horizontally from 72px to 88px. Fill: `#FF5E00`, Text: `#FFFFFF` (`—  qty  +`).
- **Haptic Physics:** Increment (`+`) triggers light impact; decrement to 0 triggers warning feedback; limit reached dims opacity to 0.35.

### 4.3 App Store "Today" Editorial Product Card
- **Surface:** `#FFFFFF` squircle with `20px` corner radius.
- **Border:** `0.5px solid rgba(0, 0, 0, 0.06)`.
- **Image Container:** 1:1 aspect ratio with a subtle 2% neutral inset backdrop (`#F8F9FA`) to display packaging clearly.
- **Active State:** Scale down compression (`scale: 0.97`) on touch press with zero latency rebound.

### 4.4 iOS Segmented Control (Category Switcher)
- **Track:** Capsule bar (`#E5E5EA`, padding 2px, height 36px).
- **Active Thumb:** Pure `#FFFFFF` squircle with Apple standard elevation (`box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.12)`).
- **Motion:** Fluid sliding thumb transition between category tabs.

### 4.5 Shimmer Content Placeholders (Zero Spinners)
- Continuous 1.1-second linear sweep (`#E5E5EA` ➔ `#F2F2F7` ➔ `#E5E5EA`) across cards, category avatars, and text bars.

---

## 5. Screen Layout Blueprints & Wireframes

### 5.1 Customer Home Screen (App Store Today Style)

```
┌────────────────────────────────────────────────────────┐
│  THURSDAY, 17 SEPTEMBER                                │ ➔ Uppercase Date (Footnote)
│  Belzo                                      [🔔] [👤]  │ ➔ Large Title 34px Bold
├────────────────────────────────────────────────────────┤
│  ⚡ Fast Delivery to Indiranagar, 100ft Rd ▾           │ ➔ Subheadline + Location Pin
├────────────────────────────────────────────────────────┤
│  🔍 Search grocery, fruits, tech, pharma...            │ ➔ Glass Search Bar
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ EDITORIAL STORY CARD (24px Squircle)               │ │ ➔ App Store Feature Card
│ │ Fresh Morning Harvest                              │ │
│ │ Handpicked Farm Essentials • 30% Off               │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│  Categories                                            │ ➔ Title 2 (22px)
│  [🛒 Grocery]  [🥦 Veggies]  [🍔 Food]  [💊 Pharma]   │
├────────────────────────────────────────────────────────┤
│  Trending Essentials                       See All ➔   │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │ [Image 1:1]  │  │ [Image 1:1]  │                    │ ➔ Double-Column Editorial
│  │ Organic Milk │  │ Haas Avocado │                    │    Cards (20px Squircle)
│  │ 500 ml       │  │ 2 pcs        │                    │
│  │ ₹34   ₹38    │  │ ₹149  ₹199   │                    │
│  │   [ ADD ]    │  │  [ — 1 + ]   │                    │
│  └──────────────┘  └──────────────┘                    │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │ ➔ Floating Dynamic
│  │  [2 Items]  ₹183                 View Bag ➔      │  │    Glass Cart Dock
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 5.2 Rider Active Delivery Screen (Apple Maps Minimalist Sheet)

```
┌────────────────────────────────────────────────────────┐
│  Delivery In Progress                      [🚨 Help]  │ ➔ Frosted Navigation Bar
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📍 Koramangala 4th Block, Flat 302                 │ │ ➔ Destination Card
│ │ SLA Target: 8 Mins remaining                       │ │
│ │ [ 📞 Call Customer ]         [ 🧭 Apple Maps ]     │ │ ➔ Apple HIG Action Pills
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│  ORDER CONTENTS (#BLZ-9021)                            │
│  • Amul Taaza Milk 500ml x 2                           │
│  • Brown Bread 400g x 1                                │
├────────────────────────────────────────────────────────┤
│  DELIVERY PIN VERIFICATION                             │
│  ┌─────┐   ┌─────┐   ┌─────┐   ┌─────┐                 │ ➔ High-Contrast
│  │  4  │   │  9  │   │  1  │   │  2  │                 │    Keypad Input
│  └─────┘   └─────┘   └─────┘   └─────┘                 │
├────────────────────────────────────────────────────────┤
│  ====== [ > ] SLIDE TO CONFIRM DELIVERY =============  │ ➔ Apple Slide-to-Action
└────────────────────────────────────────────────────────┘
```

---

## 6. Accessibility & Motion Standards

- **Touch Targets:** Strict adherence to Apple's `44 × 44 pt` minimum touch target boundary.
- **Contrast Ratios:** Primary typography achieves `16:1` against canvas; `#FF5E00` button text achieves `4.8:1` (WCAG AAA/AA).
- **Reduced Motion Support:** Respects `prefers-reduced-motion` by replacing spring translations with instant cross-fades.
- **Haptic Feedback:** Native integration with `expo-haptics` replicating iOS selection, impact, and notification generators.
