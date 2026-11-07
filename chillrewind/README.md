# ChillRewind (`chillrewind`)

Zero-bloat deterministic time-travel debugger, anti-slop context sieve, and live stream inspector for AI coding agents.

## Core Pillars
1. **RewindCore (SQLite WAL & DAG Engine):**
   - Canonicalizes JSON payloads before SHA-256 hashing to guarantee reproducible cache hits.
   - Preserves parent-child session relationships (`sessions.parent_id`, `sessions.fork_step`) to traverse lineage and replay upstream turns at $0 cost and 0ms latency.
2. **SlopSieve (Context Hygiene & Circuit Breaker):**
   - Compresses stale tool outputs (>1.5KB) older than 4 conversation turns down to 800 characters using head/tail retention.
   - Halts agents entering infinite loops if identical tool signatures repeat 3 times consecutively.
3. **PonyTail (Sub-millisecond Event Bus & Live Stream):**
   - SSE bus (`/events`) streaming agent steps, pruned token counters, and circuit breaker interventions.
4. **Native MCP Server & Linear/Vercel Geist Web Inspector:**
   - Single-file carbon UI (`src/ui.html`) with zero CDN dependencies.
   - Interactive SVG step scrubber (`J`/`K` or `Left`/`Right` arrow keys, `F` to fork).
   - JSON-RPC stdio MCP interface (`chillrewind mcp`).

## Usage

```powershell
# Open Web Inspector UI
node --experimental-strip-types --no-warnings src/cli.ts ui

# Run agent with deterministic caching and SlopSieve
node --experimental-strip-types --no-warnings src/cli.ts run -- python agent.py

# Live tail stream in separate terminal
node --experimental-strip-types --no-warnings src/cli.ts tail

# View session statistics
node --experimental-strip-types --no-warnings src/cli.ts stats

# Run unit tests
node --experimental-strip-types --no-warnings test_unit.ts
```
