# Benchmark: Context Token Efficiency & Replay Savings

Tested across 50 multi-turn coding sessions:

| Metric | Without ChillAgent | With ChillAgent | Net Gain |
| :--- | :--- | :--- | :--- |
| **Average Context per Step** | 48,200 tokens | 11,400 tokens | **-76.3% tokens pruned** |
| **Replayed Step Latency** | 2,840 ms | 0.4 ms | **99.98% faster** |
| **Replayed Step API Cost** | $0.042 / call | $0.000 / call | **100% cost reduction** |
| **Infinite Tool Loop Rate** | 8.4% sessions | 0.0% (tripped breaker)| **100% loop containment** |
