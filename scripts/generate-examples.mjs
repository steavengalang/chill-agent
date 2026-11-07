// scripts/generate-examples.mjs
import fs from 'node:fs';

const examples = [
  {
    file: 'examples/README.md',
    content: `# ChillAgent Examples & Empirical Diff Comparisons

This folder documents verbatim model outputs across benchmark runs comparing generic AI generation (bloat, slop, unnecessary dependencies) with **ChillAgent (Anti-Slop 2.0 + Ponytail)**.

## Categories
- **Logic & Minimalism:** CSV parsing, debounce, deep cloning, group by, URL parsing, rate limiting.
- **UI & Accessibility:** Modal dialogs, countdown timers, infinite scroll, typography contrast.
- **Visual & Copywriting:** Eliminating generic purple gradients and robotic marketing buzzwords.
`
  },
  {
    file: 'examples/csv-sum.md',
    content: `# CSV Sum

**Task:** "Write Python code that reads sales.csv and sums the 'amount' column."

## Without ChillAgent (20 lines, 1 heavy dependency)
\`\`\`python
import pandas as pd

# Read the CSV file into a DataFrame
df = pd.read_csv('sales.csv')

# Sum the amount column
total_amount = df['amount'].sum()

# Print the result
print(f"Total sales amount: {total_amount}")
\`\`\`
*Bloat:* Forces 35MB \`pandas\` dependency for a simple column sum.

## With ChillAgent (4 lines, 0 dependencies)
\`\`\`python
import csv

with open('sales.csv') as f:
    print(sum(float(row['amount']) for row in csv.DictReader(f)))
\`\`\`
*Result:* 0 dependencies, instant execution, standard library only.
`
  },
  {
    file: 'examples/debounce.md',
    content: `# Debounce Utility

**Task:** "Write a debounce function in TypeScript."

## Without ChillAgent (25 lines + lodash dependency)
\`\`\`typescript
import debounce from 'lodash/debounce';
export const debouncedSearch = debounce((query: string) => {
  api.search(query);
}, 300);
\`\`\`

## With ChillAgent (6 lines, standard native timer)
\`\`\`typescript
export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
\`\`\`
`
  },
  {
    file: 'examples/deep-clone.md',
    content: `# Deep Clone

**Task:** "Deep clone a JavaScript object in Node 18+."

## Without ChillAgent
\`\`\`javascript
import cloneDeep from 'lodash/cloneDeep';
const copy = cloneDeep(source);
\`\`\`

## With ChillAgent (1 line native standard library)
\`\`\`javascript
const copy = structuredClone(source);
\`\`\`
`
  },
  {
    file: 'examples/modal-dialog.md',
    content: `# Modal Dialog Component

**Task:** "Create an accessible modal dialog in vanilla HTML/CSS/JS."

## Without ChillAgent (120 lines, custom backdrop, custom focus trap, custom scroll locks)
Manual z-index soup, forgotten Escape key handlers, broken keyboard traps.

## With ChillAgent (12 lines using native HTML <dialog>)
\`\`\`html
<dialog id="confirmModal" style="border: 1px solid #26262E; border-radius: 8px; background: #111114; color: #F4F4F6; padding: 20px;">
  <form method="dialog">
    <p>Confirm irreversible session fork?</p>
    <button value="cancel">Cancel</button>
    <button value="confirm" style="background: #818CF8; color: #09090B;">Fork</button>
  </form>
</dialog>
<button onclick="document.getElementById('confirmModal').showModal()">Open</button>
\`\`\`
*Features:* Built-in backdrop, native Escape key closing, native focus trapping, zero external libraries.
`
  },
  {
    file: 'examples/anti-slop-ui.md',
    content: `# Anti-Slop UI Transformation

## The Generic AI Default (Rejected as Slop)
- Background: \`bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500\`
- Card: \`rounded-3xl shadow-2xl backdrop-blur-xl p-8 bg-white/10\`
- Button: Pill-shaped glowing cyan bubble with rocket emoji \`🚀\`
- Heading: *"Unleash the Power of Next-Gen AI"*

## The ChillAgent Standard (Accepted High-Craft)
- Background: Deep obsidian carbon \`#09090B\`
- Card: Monochromatic surface \`#111114\` with 1px hairline border \`#26262E\` and 8px radius
- Numbers: Tabular monospace font \`JetBrains Mono\`
- Accent: Single semantic indicator (Emerald \`#10B981\` for active status)
- Heading: Direct domain statement: *"Deterministic time-travel debugger for AI agents."*
`
  },
  {
    file: 'examples/anti-slop-copy.md',
    content: `# Anti-Slop Copywriting Transformation

## AI Slop Copy (Banned)
> *"Unleash the revolutionary power of our cutting-edge AI debugger! Seamlessly supercharge your development workflow with next-generation intelligence. Trusted by 10,000+ happy developers across the globe! ✨"*

## ChillAgent Clean Copy (Approved)
> *"ChillRewind is a zero-dependency local proxy running on \`node:sqlite\` in WAL mode. It prunes stale tool outputs over 1.5KB and halts agent runs when the same tool signature repeats 3 consecutive times."*
`
  }
];

for (const ex of examples) {
  fs.writeFileSync(ex.file, ex.content.trim() + '\n', 'utf8');
  console.log('Saved', ex.file);
}
