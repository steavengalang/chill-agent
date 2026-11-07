// src/presets.js - 5 High-Craft Design System Presets for DESIGN.md
export const DESIGN_PRESETS = [
  {
    id: 'linear-carbon',
    name: 'Linear Carbon Geist (Recommended)',
    description: 'Precision carbon monochrome, 1px hairlines, JetBrains Mono, emerald accents.',
    content: `# DESIGN.md — Linear Carbon Geist Spec

## Identity & Philosophy
- **Vibe:** Precision engineering, ultra-clean desktop utility, focused zero-distraction dark canvas.
- **Aesthetic Benchmark:** Linear, Vercel Geist, Raycast.

## Palette
- **Canvas Base:** \`#09090B\`
- **Surface Layer 1 (Panel):** \`#101014\`
- **Surface Layer 2 (Interactive):** \`#16161C\`
- **Surface Hover:** \`#1E1E26\`
- **Hairline Border:** \`1px solid #26262E\`
- **Border Focus / Hover:** \`1px solid #3F3F4E\`
- **Text Primary:** \`#F4F4F6\`
- **Text Secondary:** \`#A1A1AA\`
- **Text Muted:** \`#63636E\`
- **Semantic Accents:**
  - Emerald (Replay / Success): \`#10B981\` (Badge: \`rgba(16, 185, 129, 0.12)\`)
  - Amber (Sieve / Pruned): \`#F59E0B\` (Badge: \`rgba(245, 158, 11, 0.12)\`)
  - Rose (Circuit Breaker): \`#F43F5E\` (Badge: \`rgba(244, 63, 94, 0.12)\`)
  - Indigo (Fork / Branch): \`#818CF8\` (Badge: \`rgba(129, 140, 248, 0.14)\`)

## Typography
- **Display & Body:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Code & Tabular Numbers:** 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, ui-monospace
- **Letter Spacing:** Headers \`-0.025em\`, Uppercase Tags \`+0.05em\`

## Radius & Elevation
- **Controls & Badges:** \`4px\` to \`6px\`
- **Cards & Modals:** \`8px\`
- **Shadows:** None or tight micro-ambient \`0 1px 2px rgba(0,0,0,0.5)\`. Rely on hairline borders.
`
  },
  {
    id: 'swiss-brutal',
    name: 'Swiss Neo-Brutal',
    description: 'Stark black-and-white contrast, zero rounded corners, heavy grotesque type.',
    content: `# DESIGN.md — Swiss Neo-Brutal Spec

## Identity & Philosophy
- **Vibe:** Uncompromising graphic clarity, International Typographic Style, pure structure.
- **Aesthetic Benchmark:** Neue Haas Grotesk, Bauhaus posters, modernist archives.

## Palette
- **Canvas Base:** \`#FFFFFF\` (or Inverted Dark: \`#0A0A0A\`)
- **Ink Primary:** \`#000000\`
- **Divider Hairline:** \`2px solid #000000\`
- **Accent Red:** \`#FF2200\` (Used sparingly for primary anchor)

## Typography
- **Primary:** 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif
- **Headers:** Tight line-height (\`0.95\`), uppercase leading sections, zero kerning slop.

## Geometry
- **Border Radius:** \`0px\` strictly everywhere.
- **Grids:** Strict visible grid lines, bold high-contrast dividers, asymmetric block layouts.
`
  },
  {
    id: 'technical-spec',
    name: 'Industrial Technical Dossier',
    description: 'Data-first layout, slate/steel tone, dense tabular views, blueprint annotations.',
    content: `# DESIGN.md — Industrial Technical Dossier Spec

## Identity & Philosophy
- **Vibe:** Mission control telemetry, NASA flight documentation, Bloomberg terminal density.
- **Aesthetic Benchmark:** Grafana, Datadog Enterprise, Flight Radar.

## Palette
- **Canvas Base:** \`#0B0F19\`
- **Panel Surface:** \`#111827\`
- **Border Grid:** \`1px solid #1F2937\`
- **Cyan Signal:** \`#38BDF8\`
- **Amber Warning:** \`#FBBF24\`

## Typography
- Monospace-first layout for all data cells, timestamps, and parameters.
- Micro-labels at \`10px\` with uppercase \`+0.08em\` letter-spacing.
`
  },
  {
    id: 'editorial-paper',
    name: 'Warm Analog Editorial',
    description: 'Warm ivory paper, charcoal ink, literary serif headings, tactile book feel.',
    content: `# DESIGN.md — Warm Analog Editorial Spec

## Identity & Philosophy
- **Vibe:** Handcrafted print journalism, literary publication, analog warmth.
- **Aesthetic Benchmark:** The Atlantic, Kinfolk, Stripe Press.

## Palette
- **Paper Canvas:** \`#FBFBF9\`
- **Charcoal Ink:** \`#1A1A1A\`
- **Secondary Ink:** \`#575757\`
- **Warm Border:** \`1px solid #E6E6DF\`
- **Terracotta Accent:** \`#C85A32\`

## Typography
- **Display & Headings:** 'Newsreader', 'Playfair Display', Georgia, serif
- **Body & Microcopy:** 'Inter', -apple-system, sans-serif
`
  },
  {
    id: 'micro-density',
    name: 'Cyberpunk Micro-Density',
    description: 'High-density HUD panels, emerald phosphor text, compact technical toggles.',
    content: `# DESIGN.md — Cyberpunk Micro-Density Spec

## Identity & Philosophy
- **Vibe:** Embedded systems monitor, sub-millisecond network analyzer.
- **Aesthetic Benchmark:** Rizin, IDA Pro, Bloomberg CLI.

## Palette
- **Phosphor Green:** \`#22C55E\`
- **Deep Obsidian:** \`#050505\`
- **Surface Elevation:** \`#0D0D0D\`
- **Grid Trace:** \`1px solid #1A1A1A\`
`
  }
];
