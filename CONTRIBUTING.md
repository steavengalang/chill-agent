# Contributing to ChillAgent

ChillAgent welcomes contributions that make AI coding assistants leaner, faster, and more visually distinct.

## Core Rules for Contributors
1. **Zero New Runtime Dependencies:** The core package must remain 100% zero-dependency on native Node.js APIs.
2. **Shortest Readable Diff:** Do not introduce architectural bloat when patching. Deletion beats addition.
3. **Verify Before PR:** Run `npm test` and `node bin/chill-agent.js audit` to ensure all checks pass cleanly.
