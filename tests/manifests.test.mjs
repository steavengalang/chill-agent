// tests/manifests.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Verify multi-agent plugin doors and manifests exist', () => {
  const doors = [
    'plugin.json',
    'plugin.yaml',
    'gemini-extension.json',
    'opencode.json',
    '.claude-plugin/plugin.json',
    '.cursor/rules/chill-agent.mdc',
    '.cursor-plugin/plugin.json',
    '.windsurf/rules/chill-agent.md',
    '.cline-plugin/plugin.json',
    '.clinerules/chill-agent',
    '.codex-plugin/plugin.json',
    '.kimi-plugin/plugin.json',
    '.omp-plugin/plugin.json',
    '.devin-plugin/plugin.json',
    '.grok-plugin/plugin.json',
    '.qoder-plugin/plugin.json'
  ];

  for (const door of doors) {
    assert.ok(fs.existsSync(door), `Plugin door missing: ${door}`);
  }
});
