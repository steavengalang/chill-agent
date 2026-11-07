# Modal Dialog Component

**Task:** "Create an accessible modal dialog in vanilla HTML/CSS/JS."

## Without ChillAgent (120 lines, custom backdrop, custom focus trap, custom scroll locks)
Manual z-index soup, forgotten Escape key handlers, broken keyboard traps.

## With ChillAgent (12 lines using native HTML <dialog>)
```html
<dialog id="confirmModal" style="border: 1px solid #26262E; border-radius: 8px; background: #111114; color: #F4F4F6; padding: 20px;">
  <form method="dialog">
    <p>Confirm irreversible session fork?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm" style="background: #818CF8; color: #09090B;">Fork</button>
  </form>
</dialog>
<button onclick="document.getElementById('confirmModal').showModal()">Open</button>
```
*Features:* Built-in backdrop, native Escape key closing, native focus trapping, zero external libraries.
