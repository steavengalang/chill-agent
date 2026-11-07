# ChillAgent Installation Guide

Choose your agent environment below. ChillAgent natively integrates with every major AI coding assistant.

---

## 1. Zero-Install Execution via NPX (Recommended)

Run directly from any terminal without pre-installing:

```bash
# Interactive setup wizard
npx chill-agent

# Codebase anti-slop & over-engineering audit
npx chill-agent audit

# Automatic remediation (strips emojis, cleans redundant comments, normalizes radius)
npx chill-agent audit --fix

# Generate a master high-craft DESIGN.md
npx chill-agent init-design

# Verify installed agent environment hooks
npx chill-agent doctor
```

---

## 2. Antigravity (Google / AGY)

Add as an Antigravity plugin or copy pointer:
```bash
agy plugin install https://github.com/sann/chill-agent
```
Or include the pointer block in `GEMINI.md`:
```markdown
<!-- chill-agent:start -->
## ChillAgent Anti-Slop 2.0 & Pragmatic Senior Dev Standard
Follow active skills in \`skills/chill-slop/SKILL.md\`.
<!-- chill-agent:end -->
```

---

## 3. Claude Code (Anthropic)

Install via Claude Code plugin marketplace:
```bash
/plugin marketplace add https://github.com/sann/chill-agent
/plugin install chill-agent@chill-agent
```
Or append pointer to `CLAUDE.md`.

---

## 4. Cursor IDE

ChillAgent installs rules directly into `.cursor/rules/chill-agent.mdc` or `.cursorrules`.
Activate anytime via `/chill [lite|full|ultra]` in Cursor Composer.

---

## 5. Windsurf (Codeium)

Rules are loaded from `.windsurf/rules/chill-agent.md` or `.windsurfrules`.

---

## 6. OpenAI Codex & OpenCode

Add plugin to `.agents/plugins/marketplace.json` or `.codex-plugin/plugin.json`, or copy `AGENTS.md` to project root.

---

## 7. Cline & Roo Code

Load rules from `.clinerules/chill-agent` or install via `.cline-plugin/plugin.json`.
