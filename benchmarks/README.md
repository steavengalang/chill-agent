# ChillAgent Benchmarks

Quantitative comparisons measuring:
1. **Lines of Code (LOC) & Diff Length:** Verifying the shortest working diff.
2. **Context Token Reduction:** SlopSieve middle-out pruning performance.
3. **Deterministic Replay Latency:** 0ms cache hits vs upstream API roundtrips.

## Benchmark Scripts
- `benchmarks/loc.js`: Calculates net code changes and AST complexity.
- `benchmarks/results/`: Verified historical run benchmarks across frontier models (Claude 3.7 Sonnet, GPT-4o, Gemini 2.0 Pro).
