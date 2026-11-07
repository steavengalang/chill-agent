#!/usr/bin/env node
// chill-agent Mode Tracker Hook: detects /chill [lite|full|ultra|off]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const home = os.homedir();
const flagPath = path.join(home, '.chill-agent-active');

const prompt = process.argv.slice(2).join(' ');
const match = prompt.match(/\/chill\s+(lite|full|ultra|off)/i);

if (match) {
  const newMode = match[1].toLowerCase();
  try {
    fs.writeFileSync(flagPath, JSON.stringify({
      active: newMode !== 'off',
      mode: newMode,
      timestamp: Date.now()
    }), 'utf8');
    process.stderr.write(`[chill-agent mode switched to: ${newMode}]\n`);
  } catch {}
}
