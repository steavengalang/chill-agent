---
name: chill-slop-copywriting
description: "Comprehensive Copywriting & Authentic Voice Standard. Strips robotic AI marketing fluff, hype words, and hallucinated metrics in favor of sharp, technical prose a busy human understands in one read."
license: MIT
---

# ChillSlop Copywriting: Comprehensive Authentic Voice Standard

> *"Write with the precision of an engineer and the brevity of an editor."*

---

## 1. The Banned Vocabulary Index (50+ AI Cliches)

Strip these words and phrases immediately upon detection:

| Banned AI Buzzword | Why It Fails | What to Use Instead |
|---|---|---|
| **"Unleash the power of..."** | Lazy, overused AI cliché. | Name the specific tool and its concrete function. |
| **"Seamlessly integrate / Effortless"** | Minimizes technical complexity; reads like marketing spam. | Name the protocol: *"Installs via stdio JSON-RPC in 1 command."* |
| **"Supercharge your workflow"** | Hollow hype with no empirical meaning. | Provide benchmark figures: *"Cuts compilation time from 12s to 4s."* |
| **"Next-generation / Cutting-edge"** | Meaningless assertion that dates quickly. | State the architecture: *"Written in native C++20 with WAL mode."* |
| **"Revolutionary / Game-changer"** | Inflated self-praise. | Describe the mechanism: *"First debugger to support deterministic parent-DAG forks."* |
| **"Dive in / Delve into / Let's explore"** | Unmistakable GPT filler opener. | Delete entirely. Start directly with the technical step. |
| **"Robust and scalable"** | Vague engineering hand-waving. | Specify limits: *"Handles 15,000 req/sec across 4 worker threads."* |
| **"Empower developers to..."** | Paternalistic marketing jargon. | State the action: *"Inspect, rewind, and replay LLM trajectories."* |
| **"Look no further!"** | Cheesy infomercial script. | Delete entirely. State the product's identity plainly. |
| **"Tailored to your needs"** | Empty corporate filler. | Explain customization hooks: *"Configurable via JSON schema."* |
| **"Magic / Magically"** | Obscures mechanical operation. | Explain the algorithm: *"Canonicalizes JSON keys before SHA-256 hashing."* |
| **"In today's fast-paced world"** | High school essay introductory fluff. | Delete entirely. |
| **"A testament to..."** | Robotic academic phrase. | State the result directly. |
| **"Pivotal / Paramount"** | Pseudo-intellectual filler. | Use "critical", "essential", or plain language. |

---

## 2. The Em Dash (`—`) Ban & Clean Punctuation

- **The Rule:** The em dash character (`—`) is strictly banned in all generated text and UI copy.
- **Why:** Large language models excessively insert em dashes to simulate literary sophistication, resulting in an unmistakable AI signature.
- **Direct Replacements:**
  - *Bad:* "Fast, reliable — and built for teams."
  - *Good (Comma):* "Fast, reliable, and built for teams."
  - *Good (Colon):* "Built for teams: fast, reliable, and deterministic."
  - *Good (Separate Sentences):* "Built for teams. Fast and reliable."

---

## 3. The Specificity Mandate

Replace abstract claims with concrete engineering realities:

### Example 1: Product Descriptions
- **Slop:** *"ChillRewind is an ultra-fast, modern AI proxy that saves you lots of money and prevents stuck loops."*
- **Craft:** *"ChillRewind is a zero-dependency local proxy running on `node:sqlite` in WAL mode. It prunes stale tool outputs over 1.5KB and halts agent runs when the same tool signature repeats 3 consecutive times."*

### Example 2: Performance Claims
- **Slop:** *"Experience blazing-fast response times and incredible token efficiency."*
- **Craft:** *"Replays cached LLM turns with 0ms latency and $0.00 upstream cost."*

---

## 4. Microcopy, Buttons & Interface Verbs

### Action-Oriented Buttons
Every interactive button must pair an **imperative verb** with a **direct object**:
- **Banned:** `Get Started`, `Learn More`, `Submit`, `Click Here`, `Explore`, `Continue`.
- **Approved:** `Fork Session`, `Export JSON`, `Connect Database`, `Copy API Key`, `Download Log`, `Verify Hash`.

### Honest Error Messages
Every error message must state three facts: (1) what failed, (2) why it failed, and (3) the exact resolution command.
- **Slop:** *"Oops! Something went wrong while saving your session. Please try again later."*
- **Craft:** *"SQLite write failed: database file `.chillrewind/store.db` is locked by process PID 4120. Run `chill-agent doctor` or terminate stale proxy instances."*

---

## 5. Social Proof & Statistics

- **The Rule:** Never invent statistics (*"Trusted by 10,000+ developers"*), fake customer headshots, or fabricated quotes.
- If verified customer metrics or official case studies exist, cite them with links.
- If verified data is not available, **omit the section entirely**. An empty section or no testimonials builds far higher trust than fabricated praise.
