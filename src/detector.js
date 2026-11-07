// src/detector.js - Coding Agent Environment & Configuration Detector
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function getHomeDir() {
  return os.homedir();
}

export function detectAgents(projectRoot = process.cwd()) {
  const home = getHomeDir();
  const detected = [];

  const candidates = [
    {
      id: 'antigravity',
      name: 'Antigravity (Google / AGY)',
      icon: '🌌',
      projectFiles: ['GEMINI.md', 'AGENTS.md'],
      globalPaths: [
        path.join(home, '.gemini', 'antigravity'),
        path.join(home, '.gemini', 'config', 'skills')
      ],
      targetFile: 'GEMINI.md'
    },
    {
      id: 'claude',
      name: 'Claude Code (Anthropic)',
      icon: '🤖',
      projectFiles: ['CLAUDE.md', '.claude-plugin'],
      globalPaths: [path.join(home, '.claude')],
      targetFile: 'CLAUDE.md'
    },
    {
      id: 'cursor',
      name: 'Cursor IDE',
      icon: '⚡',
      projectFiles: ['.cursorrules', '.cursor/rules'],
      globalPaths: [path.join(home, '.cursor')],
      targetFile: fs.existsSync(path.join(projectRoot, '.cursor', 'rules'))
        ? path.join('.cursor', 'rules', 'chill-agent.mdc')
        : '.cursorrules'
    },
    {
      id: 'windsurf',
      name: 'Windsurf (Codeium)',
      icon: '🏄',
      projectFiles: ['.windsurfrules', '.windsurf'],
      globalPaths: [],
      targetFile: '.windsurfrules'
    },
    {
      id: 'codex',
      name: 'OpenAI Codex / OpenCode',
      icon: '🧠',
      projectFiles: ['AGENTS.md', '.codex-plugin'],
      globalPaths: [path.join(home, '.codex')],
      targetFile: 'AGENTS.md'
    },
    {
      id: 'copilot',
      name: 'GitHub Copilot Workspace',
      icon: '🐙',
      projectFiles: ['.github/copilot-instructions.md'],
      globalPaths: [],
      targetFile: path.join('.github', 'copilot-instructions.md')
    }
  ];

  for (const agent of candidates) {
    let found = false;
    let matchType = 'none';

    // Check project-level existence
    for (const rel of agent.projectFiles) {
      if (fs.existsSync(path.join(projectRoot, rel))) {
        found = true;
        matchType = `project (${rel})`;
        break;
      }
    }

    // Check global installation
    if (!found) {
      for (const gPath of agent.globalPaths) {
        if (fs.existsSync(gPath)) {
          found = true;
          matchType = 'global';
          break;
        }
      }
    }

    detected.push({
      ...agent,
      isDetected: found,
      matchType
    });
  }

  return detected;
}
