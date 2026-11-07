# After Install

ChillAgent is now active in your workspace.

## Immediate Commands

- `/chill [lite|full|ultra|off]` — Switch runtime minimalism intensity.
- `/chill-audit [target]` — Audit diffs and check for over-engineering bloat.
- `/chill-review [target]` — Review code and verify the shortest readable diff.
- `/chill-debt` — Identify dead code, unused abstractions, and redundant layers.
- `/chill-gain` — Measure net lines added vs business capability gained.
- `/chill-help` — View available commands and active skill configurations.

## Verification

Run the auditor to scan for AI slop and bloat:
```bash
npx chill-agent audit
```
To launch the live time-travel inspector:
```bash
npx chill-agent rewind ui
```
