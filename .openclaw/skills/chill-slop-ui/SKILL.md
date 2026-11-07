---
name: chill-slop-ui
description: "Comprehensive Visual Engineering Standard. Deep carbon monochrome palettes, 1px hairline borders, tabular monospace data, asymmetric layout density, and zero generic AI gradients or pill cards."
license: MIT
---

# ChillSlop UI: Comprehensive Visual Engineering Standard

> *"Good design is as little design as possible. Less, but better — because it concentrates on the essential aspects."*

---

## 1. Color Architecture & Surface Hierarchy

### The Monochromatic Foundation
Build 90% of the interface in crisp monochromatic shades. This grounds the interface and lets content stand out:

| Layer | Hex Value | Purpose |
|---|---|---|
| **Canvas Background** | `#09090B` | Base canvas. Deep obsidian carbon, non-reflective. |
| **Panel Surface** | `#111114` | Sidebars, section containers, grouped blocks. |
| **Interactive Surface** | `#16161C` | Cards, table headers, text inputs, inactive buttons. |
| **Active / Hover Surface**| `#1E1E26` | Interactive hover targets, selected tabs. |
| **Hairline Border** | `#26262E` | 1px crisp separation lines. Never use blurry shadows for borders. |
| **Focus / Active Border** | `#3F3F4E` | Focus indicators, active cards, highlighted inputs. |

### Semantic Accent Discipline
Bright colors are strictly functional signals, never background wallpaper:
- **Emerald (`#10B981`):** Cache hits, active streams, verified statuses, low latencies.
- **Amber (`#F59E0B`):** Pruned content, warnings, pending transactions, rate-limits.
- **Rose (`#F43F5E`):** Circuit breakers, fatal errors, destructive actions, high drop-off.
- **Indigo (`#818CF8`):** Branched DAG sessions, active tabs, navigation anchors.

> **Dose Cap Rule:** No single screen may use more than 1 semantic accent color as a dominant highlight. A page painted with emerald borders, indigo buttons, and amber cards is rejected as AI Slop.

---

## 2. Geometry, Elevation & Spacing

### Border Radius Hierarchy
Never make every element on the screen a pill bubble (`rounded-3xl` / `rounded-full`). Follow a strict radius scale:
- **Tags, Micro-Badges, Code Chips:** `4px`
- **Buttons, Text Inputs, Dropdown Items:** `6px`
- **Cards, Panels, Modals, Code Blocks:** `8px`
- **Outer Shell / Max Container:** `12px` (Never exceed `12px` for desktop utility interfaces).

### Depth Through Hairline Borders (No Muddy Shadows)
- Replace 20px-30px blurred ambient shadows with:
  `border: 1px solid #26262E;`
- For elevated modal popups or floating dropdowns, use tight micro-ambient elevation:
  `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 0 1px #26262E;`

### Modular Spacing Scale
Never use arbitrary padding or margins (e.g. `margin-top: 19px`). Follow the 4px/8px modular rhythm:
`4px` → `8px` → `12px` → `16px` → `24px` → `32px` → `48px` → `64px` → `96px`.

---

## 3. Typography & Numerals

### Font Pairing Rules
- **Sans Display & Body:** Inter, Geist Sans, -apple-system, BlinkMacSystemFont, Roboto.
- **Data, Metrics, Code & Hashes:** JetBrains Mono, Fira Code, SF Mono, ui-monospace.
- **Letter Spacing:**
  - Large Section Headers (>= 28px): `letter-spacing: -0.025em;`
  - Body Text: `letter-spacing: normal;`
  - Uppercase Metadata Badges (<= 11px): `letter-spacing: +0.05em; text-transform: uppercase;`

### The Tabular Monospace Mandate
Every timestamp, latency number, hash string, currency value, token counter, and percentage **MUST** use a monospace font or:
`font-variant-numeric: tabular-nums;`
*Why:* Proportional fonts cause layout shifting and jitter when real-time numbers update.

---

## 4. Component Engineering Patterns

### Feature Sections (Breaking the 3-Card Cliche)
- **FORBIDDEN:** 3 identical feature cards with a centered circle icon, bold title, and 2 lines of lorem ipsum.
- **REQUIRED:** Asymmetric density:
  - Card 1: Interactive live code preview or syntax block.
  - Card 2: High-density tabular telemetry feed.
  - Card 3: Split-screen flow diagram with step connectors.

### Buttons & Controls
- **Minimum Tap Target:** Mobile tap targets must measure at least `44x44px` (desktop compact controls may be `32px` to `36px` height with generous click padding).
- **Cursor Affordance:**
  - Enabled: `cursor: pointer;`
  - Disabled: `cursor: not-allowed; opacity: 0.45;`
- **Focus Rings:**
  `outline: 2px solid #818CF8; outline-offset: 2px;`
  Never ship `outline: none` without providing this high-visibility ring.

### Data Tables
- Always use zebra-striping or 1px hairline dividers: `border-bottom: 1px solid #26262E`.
- Numeric columns must align **Right**. Text columns align **Left**. Status badges align **Center**.

---

## 5. Motion & Kinetic Physics

- **Timing Range:** `120ms` to `180ms` for micro-interactions (hovers, clicks); `220ms` to `280ms` for spatial transitions (drawers, dialogs).
- **Easing Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (Deceleration curve for crisp, tactile snap).
- **Reduced Motion Support:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
