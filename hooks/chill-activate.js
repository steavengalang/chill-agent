#!/usr/bin/env node
// chill-agent SessionStart activation hook
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const home = os.homedir();
const flagPath = path.join(home, '.chill-agent-active');

try {
  fs.writeFileSync(flagPath, JSON.stringify({
    active: true,
    mode: 'full',
    timestamp: Date.now()
  }), 'utf8');

  // Emit compact active notice
  process.stdout.write('[chill-agent active: full (ponytail + anti-slop dual core)]\n');
} catch {}
