// scripts/sync-ponytail.mjs
import fs from 'node:fs';
import path from 'node:path';

const filesToFetch = [
  '__init__.py',
  '.agents/rules/ponytail.md',
  '.claude-plugin/marketplace.json',
  '.clinerules/ponytail.md',
  '.github/FUNDING.yml',
  '.github/copilot-instructions.md',
  '.github/plugin/marketplace.json',
  '.github/plugin/plugin.json',
  '.github/workflows/publish.yml',
  '.github/workflows/test.yml',
  '.grok-plugin/marketplace.json',
  '.kiro/steering/ponytail.md',
  '.qoder/rules/ponytail.md',
  '.windsurf/rules/ponytail.md',
  '.cursor/rules/ponytail.mdc',
  '.opencode/command/ponytail-audit.md',
  '.opencode/command/ponytail-debt.md',
  '.opencode/command/ponytail-gain.md',
  '.opencode/command/ponytail-help.md',
  '.opencode/command/ponytail-review.md',
  '.opencode/command/ponytail.md',
  '.opencode/plugins/index.js',
  '.opencode/plugins/ponytail-frontmatter.cjs',
  '.opencode/plugins/ponytail.mjs',
  'hooks/ponytail-activate.js',
  'hooks/ponytail-mode-tracker.js',
  'hooks/ponytail-instructions.js',
  'hooks/ponytail-runtime.js',
  'hooks/ponytail-statusline.ps1',
  'hooks/ponytail-statusline.sh',
  'pi-extension/index.js',
  'pi-extension/package.json',
  'scripts/check-rule-copies.js',
  'scripts/check-versions.js',
  'scripts/cursor-hooks.js',
  'scripts/uninstall.js'
];

async function run() {
  console.log('Fetching and syncing full ponytail files...');
  for (const rel of filesToFetch) {
    try {
      const url = `https://raw.githubusercontent.com/DietrichGebert/ponytail/main/${rel}`;
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const dir = path.dirname(rel);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(rel, text, 'utf8');
        console.log(`✓ Synced: ${rel} (${text.length} B)`);
      } else {
        console.warn(`✗ Not found (${res.status}): ${rel}`);
      }
    } catch (err) {
      console.error(`Error on ${rel}:`, err.message);
    }
  }
}

run();
