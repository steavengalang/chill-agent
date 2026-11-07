---
name: chill-slop-mobile
description: "Comprehensive Mobile & Responsive Engineering Standard. Zero horizontal viewport overflow, fluid CSS clamp typography, thumb-zone ergonomics, and cleanly scrollable data views without bloated media queries."
license: MIT
---

# ChillSlop Mobile: Comprehensive Responsive Engineering Standard

> *"A responsive design works everywhere by default, not through 50 brittle media query overrides."*

---

## 1. Zero Horizontal Overflow Mandate

- **The Rule:** The viewport must NEVER produce horizontal scrollbars (`overflow-x: hidden` on `<body>` is a lazy band-aid that hides layout defects; you must eliminate the protruding elements directly).
- **Causes & Fixes:**
  - *Fixed Pixel Widths:* Never write `width: 600px`. Use `width: 100%; max-width: 600px;`.
  - *Large Images / SVGs:* Ensure all images declare `max-width: 100%; height: auto;`.
  - *Code Blocks & Data Tables:* Wrap tables and code views inside an explicit horizontal scrolling container:
    ```css
    .table-wrapper {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border: 1px solid #26262E;
      border-radius: 6px;
    }
    ```

---

## 2. Fluid Typography & The Modular Scale

Avoid massive static header font sizes that blow out mobile viewports. Use mathematical CSS `clamp()`:

### Fluid Header Formulas
```css
/* Responsive H1: 32px on 320px mobile up to 54px on 1280px desktop */
h1 {
  font-size: clamp(2rem, 1.5rem + 2.5vw, 3.375rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

/* Responsive H2: 24px on mobile up to 36px on desktop */
h2 {
  font-size: clamp(1.5rem, 1.25rem + 1.25vw, 2.25rem);
  line-height: 1.2;
}

/* Responsive Body */
p, body {
  font-size: 14px;
  line-height: 1.6;
}
@media (min-width: 768px) {
  p, body {
    font-size: 15px;
  }
}
```

---

## 3. Thumb-Zone Architecture & Safe Areas

### Ergonomic Zones
On mobile devices, user thumbs naturally rest on the bottom third of the screen:
- **Bottom Navigation & Actions:** Place high-frequency buttons (Submit, Filter, Fork, Run) in a sticky bottom action bar or within easy thumb reach.
- **Top Bar:** Reserve the top navigation bar for secondary navigation links, search, and settings.

### Hardware Safe Areas
Sticky bottom action bars and mobile drawers must respect mobile home indicators:
```css
.bottom-action-bar {
  position: sticky;
  bottom: 0;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  background: rgba(16, 16, 20, 0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid #26262E;
}
```

---

## 4. Mobile Breakpoints Architecture

Keep responsive logic lean. Do not declare 10 different media queries. Stick to 3 standard anchors:

| Breakpoint | Width | Target Layout |
|---|---|---|
| **Mobile** | `< 768px` | Single-column stacked layouts, bottom sheets, scrollable table containers. |
| **Tablet** | `768px - 1024px` | 2-column layouts, collapsible sidebars. |
| **Desktop**| `> 1024px` | Full multi-column workspaces, split diff inspectors, fixed navigation rails. |
