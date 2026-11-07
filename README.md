# ChillAgent (`chill-agent`)

> **The Zero-Bloat Anti-Slop 2.0 Engine & Pragmatic Senior Developer Standard.**  
> Fuses the visual craftsmanship of [anti-slop](https://github.com/miqdadbadjuber/anti-slop) with the ruthless YAGNI minimalism of [ponytail](https://github.com/dietrichgebert/ponytail).

[![NPM Version](https://img.shields.io/npm/v/chill-agent.svg?style=flat&color=10B981)](https://www.npmjs.com/package/chill-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6.svg)](LICENSE)
[![Dependencies: 0](https://img.shields.io/badge/dependencies-0-10B981.svg)](package.json)
[![Node.js: >=18.0.0](https://img.shields.io/badge/node-%3E%3D18.0.0-6366F1.svg)](https://nodejs.org)
[![Multi-Agent: 14 Hosts](https://img.shields.io/badge/hosts-14%20agents-EC4899.svg)](AGENTS.md)

---

## Overview

Most AI coding assistants suffer from two distinct failure modes:
1. **Visual & Copywriting Slop:** Unsolicited purple-to-cyan mesh gradients, bubbly 24px border radiuses, floating cards without grid alignment, and marketing cliches (*"supercharge your workflow"*, *"effortless simplicity"*).
2. **Architectural Over-Engineering:** Writing 200 lines of abstract factory patterns, config wrappers, and unrequested npm dependencies when a 3-line standard library call solves the task.

**ChillAgent** fixes both simultaneously. It operates as a dual-core negative filter and pragmatic execution engine across 14 coding agent environments.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CHILLAGENT                                │
├───────────────────────────────────┬────────────────────────────────────┤
│     NEGATIVE FILTER (Anti-Slop)   │   PRAGMATIC SENIOR DEV (Ponytail)  │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Zero AI mesh gradients          │ • The shortest working diff wins   │
│ • Zero bubbly floating cards      │ • Standard library > dependencies  │
│ • Monochromatic carbon surfaces   │ • Reuse existing codebase helpers  │
│ • Tabular numbers (monospace)     │ • 1-line "why" comments only       │
│ • Concrete domain copy & metrics  │ • Delivery disclosure for skips    │
│ • Strict WCAG 4.5:1 contrast      │ • Assert-based self-checking tests │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## Quickstart

Run directly in any project directory via `npx` without installation:

```bash
# Launch interactive agent setup wizard (Antigravity, Cursor, Claude, Codex, Windsurf)
npx chill-agent

# Scan current workspace for AI slop cliches, unrequested bloat, and gradient leaks
npx chill-agent audit

# Automatically remediate violations (strip emojis, clean redundant comments, normalize radius)
npx chill-agent audit --fix

# Generate a high-craft DESIGN.md specification
npx chill-agent init-design linear-carbon

# Inspect environment health, active agent manifests, and rule synchronization
npx chill-agent doctor

# Launch deterministic time-travel debugger & Linear-grade Web Inspector
npx chill-agent rewind ui
```

---

## The 6-Step Minimalist Execution Ladder

When solving any task, your agent evaluates options in strict order and stops at the **first option that fully works**:

1. **Does it need to exist?** Skip options, wrappers, and flexibility nobody asked for. Name them in one line.
2. **Already in this codebase?** Reuse existing helpers, patterns, hooks, and house components.
3. **Standard library or native platform feature?** Reach for `node:*`, native `fetch`, CSS Grid, native `<dialog>`, `Intl.NumberFormat`.
4. **Already-installed dependency?** Use what is already declared in `package.json`. Never add a dependency for a few lines of logic.
5. **Can it be a single readable line?** Write the single line.
6. **Otherwise:** Minimum working code that preserves validation, error handling, and security boundaries.

---

## Intensity Modes (`/chill` & `/ponytail`)

Both `/chill` and `/ponytail` commands are recognized interchangeably across all supported agent interfaces:

| Mode | Command | Behavioral Scope |
| :--- | :--- | :--- |
| **Lite** | `/chill lite` | Prototype speed. Enforces standard library preference and basic negative filters while permitting exploratory architecture. |
| **Full** *(Default)* | `/chill full` | Production standard. Strict YAGNI ladder, Linear-grade visual constraints, 1-line delivery disclosure of what was skipped. |
| **Ultra** | `/chill ultra` | Maximum minimalism. Pushes back on unnecessary requests, questions assumptions, demands single-file implementations where viable. |
| **Off** | `/chill off` | Temporarily suspends rule injection for the active session. |

---

## Modular Skills Architecture (`skills/`)

ChillAgent provides 11 specialized skills that inject targeted domain intelligence into agent contexts:

- **`chill-slop` (Master Filter):** Unifies Ponytail YAGNI constraints with Anti-Slop Hard Gates (R-01 through R-40).
- **`chill-slop-ui`:** Precision layout, CSS Grid, 1px `#26262B` borders, carbon surfaces, tabular numbers.
- **`chill-slop-code`:** Pragmatic software engineering, native APIs, minimal diff footprints, zero factory bloat.
- **`chill-slop-copywriting`:** Anti-hype copy rules, banned buzzword dictionaries, concrete telemetry metrics.
- **`chill-slop-human`:** WCAG 2.2 AAA accessibility, APCA contrast validation, 44px minimum hit targets.
- **`chill-slop-mobile`:** Responsive design, fluid typography via `clamp()`, zero horizontal blowout.
- **`chill-audit`:** Repository-wide audit tool scanning for over-engineering and visual cliches.
- **`chill-review`:** Focused code-review skill analyzing diffs for bloat, unnecessary packages, and missed edge cases.
- **`chill-debt`:** Harvests `shortcut:` comments into a prioritized engineering ledger.
- **`chill-gain`:** Measures impact scoreboard (lines deleted, tokens saved, bundle bytes eliminated).
- **`chill-help`:** Instant reference card for modes, commands, and active rules.

---

## 5 High-Craft Design System Presets (`npx chill-agent init-design`)

Prevent coding agents from defaulting to generic blank screens or AI gradients by generating an authoritative `DESIGN.md`:

1. **`linear-carbon` (Default):** Deep carbon monochrome (`#09090B`), 1px hairline borders (`#26262B`), `JetBrains Mono` tabular metrics, emerald status indicators (`#10B981`).
2. **`swiss-brutal`:** High-contrast black and white ink, strict 0px border radius, heavy grotesque typography, dense borders.
3. **`technical-spec`:** Blueprint telemetry layout, slate/steel panels, data density, monospace key-value registers.
4. **`editorial-paper`:** Warm ivory background (`#FBFBF9`), charcoal typography, literary serif headings, generous reading rhythm.
5. **`micro-density`:** Cyberpunk telemetry HUD, compact phosphor-green indicators, minimal margins, high information density.

---

## Multi-Agent Ecosystem Support (14 Environments)

ChillAgent installs native configuration doors for every major agent platform:

| Platform | Integration Path | Mechanism |
| :--- | :--- | :--- |
| **Google Antigravity** | `plugin.json` + `GEMINI.md` | Native skill bundle + instruction injection |
| **Cursor IDE** | `.cursor/rules/chill-agent.mdc` | MDC context rules + `.cursor-plugin/` |
| **Claude Code** | `.claude-plugin/plugin.json` | Plugin manifest + lifecycle hooks |
| **OpenCode** | `.opencode/plugins/` + `.opencode/command/` | Server plugin + slash commands |
| **Codex CLI** | `.codex-plugin/plugin.json` | Skill adapter + prompt presets |
| **Windsurf** | `.windsurf/rules/chill-agent.md` | Workspace rule file |
| **Cline** | `.clinerules/chill-agent` | System prompt instruction set |
| **Devin** | `.devin-plugin/plugin.json` | Plugin door |
| **Grok** | `.grok-plugin/marketplace.json` | Auto-invoking skill manifest |
| **Kimi Code** | `.kimi-plugin/plugin.json` | Direct AGENTS.md binding |
| **Qoder** | `.qoder-plugin/plugin.json` | Rules + runtime hooks |
| **Gemini CLI** | `gemini-extension.json` | Reusable extension adapter |
| **Hermes Agent** | `__init__.py` + `plugin.yaml` | Python runtime hooks + command gateway |
| **Pi Package** | `pi-extension/index.js` | Status line indicator + session sync |

---

## Verification & Test Suite

The package includes an extensive test suite verifying manifest integrity, hook execution, and rule consistency across all host adapters:

```bash
# Run full unit and integration test suite
npm test

# Run rule copy parity checks
node scripts/check-rule-copies.js

# Run cross-manifest version alignment check
node scripts/check-versions.js
```

---

## Contributing

Review [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests. All contributions must maintain:
- Zero new runtime npm dependencies.
- The shortest working diff standard.
- Parity across all multi-agent plugin doors.

---

## License

MIT © [sann](https://github.com/sann) (Steaven Galang)
