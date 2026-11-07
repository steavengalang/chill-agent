---
name: chill-slop-human
description: "Comprehensive Ergonomics, Human Factors & Accessibility Standard. Enforces WCAG AA 4.5:1 contrast, visible focus rings, 44px touch targets, Escape-key dialogs, and accessible screen-reader semantics."
license: MIT
---

# ChillSlop Human: Comprehensive Ergonomics & Accessibility Standard

> *"Accessibility is not an optional polish phase. An interface that cannot be used by everyone is simply an unfinished interface."*

---

## 1. Contrast Ratios & Visual Legibility

### WCAG AA Minimum Thresholds
- **Normal Body Text (< 18pt regular):** Minimum contrast ratio of **4.5:1** against its immediate background.
- **Large Text (>= 18pt regular or >= 14pt bold):** Minimum contrast ratio of **3:1**.
- **Interactive UI Components & Hairlines:** Minimum contrast ratio of **3:1** against adjacent surfaces.

### Banned Contrast Sins
- **No Low-Contrast Gray-on-Gray Slop:** Never place `#71717A` body text on a `#18181B` card surface. Secondary metadata may use muted text only if text size is at least 11px and contrast is verified >= 4.5:1.
- **No White Text Over Light Gradients:** If using a gradient, text passing over it must maintain 4.5:1 contrast across the *entire* gradient spectrum, not just the dark endpoint.

---

## 2. Keyboard Navigation & Focus Management

### Visible Focus Indicators
- Every interactive element (`<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`) must display a visible, unclipped focus indicator upon keyboard Tab navigation:
  ```css
  :focus-visible {
    outline: 2px solid #818CF8;
    outline-offset: 2px;
  }
  ```
- **FORBIDDEN:** Setting `outline: none` or `outline: 0` without immediately supplying a custom focus indicator.

### Modals, Drawers & Focus Trapping
- **Escape Key Interception:** Any open modal, drawer, dropdown, or overlay dialog MUST close immediately upon pressing the `Escape` key.
- **Focus Restoration:** Upon closing an overlay, focus must return directly to the trigger button that launched it.
- **Focus Trap:** When a modal is open, keyboard `Tab` cycles only through interactive elements inside the modal; background page content must be inert (`aria-hidden="true"` or `inert`).

---

## 3. Touch Targets & Tactile Ergonomics

- **Minimum Dimensions:** All buttons, toggle switches, links, and icon triggers on touch screens must measure at least **44x44px** (or provide 44px of hit area via padding).
- **Spacing Between Targets:** Adjacent touch controls must have at least `8px` of separation to prevent accidental mis-taps.

---

## 4. Semantics & Screen Reader Affordances

### Native HTML First
- Use `<button>` for actions. Use `<a href="...">` for navigation to real URLs.
- **FORBIDDEN:** `<div onClick={...}>` or `<span onClick={...}>` without `role="button"`, `tabIndex={0}`, and `onKeyDown` handlers.

### Icon Buttons & Accessible Labels
- Every button containing only an SVG or icon glyph **MUST** have an accessible text label:
  ```html
  <button aria-label="Close dialog">
    <svg aria-hidden="true">...</svg>
  </button>
  ```
- All decorative images must declare empty `alt=""`. All content images must have concise, descriptive `alt` text.

### Form Fields
- Every `<input>`, `<textarea>`, and `<select>` must have a visible `<label>` bound via `id` and `for`:
  ```html
  <label for="session-id">Session ID</label>
  <input id="session-id" type="text" />
  ```
- Never rely solely on `placeholder="..."` as the field label. Placeholders disappear when typed and fail contrast checks.
