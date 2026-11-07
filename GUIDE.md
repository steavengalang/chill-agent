# ChillAgent Comprehensive Operational Guide

> Master Negative Filter, Anti-Slop 2.0, and Pragmatic Senior Developer Standard.

---

## What is ChillAgent?

ChillAgent is a dual-core intelligence layer for AI coding assistants that stops two of the most common AI failure modes:
1. **AI Visual Slop:** Cookie-cutter landing pages with purple gradients, bubbly rounded-3xl cards, generic Lucide-style star icons, and fake metrics.
2. **AI Architectural Over-Engineering:** Writing 5 classes, factory wrappers, and custom repository interfaces for a simple 10-line routine.

---

## The Core Mechanisms

### 1. The Purpose Test (Visual Craftsmanship)
Before rendering any gradient, badge, glassmorphic layer, or shadow, ask:
> *"What specific communicative or domain hierarchy goal does this serve?"*
If the answer is *"it looks modern"* or *"it fills space"*, delete it immediately.

### 2. The 6-Step Minimalist Execution Ladder (Ponytail Creed)
1. Does it need to exist? (Skip unrequested features)
2. Already in this codebase? (Reuse existing house patterns)
3. Standard library or native platform? (Node stdlib, native CSS/HTML)
4. Already-installed dependency? (Use `package.json` packages)
5. Can it be one readable line? (Write the one line)
6. Minimum working code.

### 3. Intensity Controls
Switch intensity modes in chat anytime:
- `/chill lite` — Prototyping mode.
- `/chill full` — Production default.
- `/chill ultra` — Maximum minimalism & audit rigor.

### 4. SlopSieve Runtime Pruning & Loop Circuit Breaker
When running agents through `chillrewind run`:
- Stale tool outputs older than 4 conversation turns exceeding 1.5KB are pruned middle-out, saving up to 80% context tokens.
- If an agent calls the exact same tool with identical arguments 3 times consecutively, the circuit breaker halts upstream calls to stop runaway token burn.

### 5. Mandatory Delivery Disclosure
At the conclusion of every non-trivial technical response, provide:
```markdown
---
**Skipped:** [Deliberately omitted features or abstractions]
**Risk / Limits:** [Known limits and trigger conditions for upgrading]
```
