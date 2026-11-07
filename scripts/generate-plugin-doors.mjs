// scripts/generate-plugin-doors.mjs
import fs from 'node:fs';

const manifest = {
  name: "chill-agent",
  displayName: "ChillAgent (Anti-Slop 2.0 + Ponytail Senior Dev)",
  version: "1.2.0",
  description: "Master Negative Filter, Anti-Slop, and Pragmatic Senior Dev Standard. Combines ruthless YAGNI minimalism with Linear-grade visual engineering.",
  author: {
    name: "sann"
  },
  homepage: "https://github.com/sann/chill-agent",
  repository: "https://github.com/sann/chill-agent",
  license: "MIT",
  keywords: [
    "anti-slop",
    "ponytail",
    "design-rules",
    "minimalism",
    "agent-skills",
    "yagni",
    "ui",
    "accessibility"
  ],
  skills: [
    "./skills/chill-slop/",
    "./skills/chill-slop-ui/",
    "./skills/chill-slop-code/",
    "./skills/chill-slop-copywriting/",
    "./skills/chill-slop-human/",
    "./skills/chill-slop-mobile/",
    "./skills/chill-audit/",
    "./skills/chill-review/",
    "./skills/chill-debt/",
    "./skills/chill-gain/",
    "./skills/chill-help/"
  ]
};

// 1. Antigravity plugin.json
fs.writeFileSync('plugin.json', JSON.stringify({ name: "chill-agent" }, null, 2), 'utf8');

// 2. Universal plugin.yaml
fs.writeFileSync('plugin.yaml', `name: chill-agent
version: 1.2.0
description: ChillAgent Anti-Slop 2.0 & Pragmatic Senior Dev Standard
skills:
  - ./skills/chill-slop/
  - ./skills/chill-slop-ui/
  - ./skills/chill-slop-code/
  - ./skills/chill-slop-copywriting/
  - ./skills/chill-slop-human/
  - ./skills/chill-slop-mobile/
  - ./skills/chill-audit/
  - ./skills/chill-review/
`, 'utf8');

// 3. gemini-extension.json
fs.writeFileSync('gemini-extension.json', JSON.stringify({
  name: "chill-agent",
  version: "1.2.0",
  description: "ChillAgent Anti-Slop 2.0 & Pragmatic Senior Dev Mode. Forces smallest working diff, YAGNI, standard library first, zero AI slop.",
  contextFileName: "AGENTS.md"
}, null, 2), 'utf8');

// 4. opencode.json
fs.writeFileSync('opencode.json', JSON.stringify({
  name: "chill-agent",
  version: "1.2.0",
  description: "ChillAgent Anti-Slop & Ponytail Engine for OpenCode",
  skills: manifest.skills
}, null, 2), 'utf8');

// 5. .claude-plugin/plugin.json
fs.writeFileSync('.claude-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');

// 6. .cursor-plugin/plugin.json
fs.writeFileSync('.cursor-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');

// 7. .cursor/rules/chill-agent.mdc
fs.writeFileSync('.cursor/rules/chill-agent.mdc', `---
description: ChillAgent Anti-Slop 2.0 & Pragmatic Senior Dev Standard
globs: *
---
` + fs.readFileSync('skills/chill-slop/SKILL.md', 'utf8'), 'utf8');

// 8. .windsurf/rules/chill-agent.md
fs.writeFileSync('.windsurf/rules/chill-agent.md', fs.readFileSync('skills/chill-slop/SKILL.md', 'utf8'), 'utf8');

// 9. .cline-plugin/plugin.json & .clinerules
fs.writeFileSync('.cline-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.clinerules/chill-agent', fs.readFileSync('skills/chill-slop/SKILL.md', 'utf8'), 'utf8');

// 10. .codex-plugin/plugin.json & .agents/plugins/marketplace.json
fs.writeFileSync('.codex-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.agents/plugins/marketplace.json', JSON.stringify({
  plugins: [manifest]
}, null, 2), 'utf8');

// 11. .kimi-plugin, .omp-plugin, .devin-plugin, .grok-plugin, .qoder-plugin
fs.writeFileSync('.kimi-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.omp-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.devin-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.grok-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.qoder-plugin/plugin.json', JSON.stringify(manifest, null, 2), 'utf8');
fs.writeFileSync('.qoder/rules/chill-agent.md', fs.readFileSync('skills/chill-slop/SKILL.md', 'utf8'), 'utf8');

console.log('Successfully generated all multi-agent plugin doors and manifests!');
