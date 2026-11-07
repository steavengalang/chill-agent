// src/installer.js - Multi-Agent Skill Injector & Config Manager
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { c } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

export const AVAILABLE_SKILLS = [
  { id: 'chill-slop', label: 'ChillSlop Master Filter (Anti-Slop + Ponytail Core)', description: 'Hard gates, YAGNI ladder, craftsmanship standard' },
  { id: 'chill-slop-code', label: 'ChillSlop Pragmatic Code', description: 'Smallest complete change, native APIs, zero over-engineering' },
  { id: 'chill-slop-ui', label: 'ChillSlop UI & Layout', description: 'Monochrome surfaces, 1px hairlines, non-generic cards' },
  { id: 'chill-slop-copywriting', label: 'ChillSlop Copywriting', description: 'Strip AI buzzwords, vague hype, fake testimonials' },
  { id: 'chill-slop-human', label: 'ChillSlop Ergonomics & A11y', description: 'WCAG 4.5:1 contrast, visible focus rings, 44px tap targets' },
  { id: 'chill-slop-mobile', label: 'ChillSlop Mobile & Fluid', description: 'Clamp scaling, thumb reach zones, zero overflow' }
];

export function generatePointerBlock(selectedSkills = ['chill-slop'], intensity = 'full') {
  const lines = [
    '<!-- chill-agent:start -->',
    '## ChillAgent Anti-Slop 2.0 & Pragmatic Senior Dev Standard (Ponytail + Anti-Slop)',
    `Active Mode: \`${intensity}\` (Options: lite | full | ultra). Switch anytime with \`/chill <mode>\`.`,
    '',
    'Before generating or editing any code, interface, copy, or architecture in this workspace, follow these active skills:',
    ...selectedSkills.map((s) => `- \`skills/${s}/SKILL.md\``),
    '',
    '### Core Operating Rules:',
    '1. **The Smallest Complete Change (Ponytail):** Take the shortest path that solves the whole task: standard library > existing codebase helper > installed dependency > minimum new code. No premature abstractions or wrapper factories.',
    '2. **Purpose Test (Anti-Slop):** Every visual decision, color accent, layout structure, and copy phrase must name a specific domain purpose. AI defaults (purple gradients, rounded-3xl cards, generic cards) are forbidden.',
    '3. **Liveliness Bar:** Avoid sterile defaults by reading `DESIGN.md`. If `DESIGN.md` is missing, adhere strictly to Linear/Geist carbon monochromatic standards.',
    '4. **Context Hygiene & Time-Travel:** Strip conversational fluff and emojis. When debugging stochastic agent loops, route upstream LLM calls through `chillrewind run` (deterministic SQLite WAL replay + SlopSieve circuit breaker).',
    '5. **Delivery Disclosure:** End non-trivial deliveries with a 1-line disclosure: what was skipped and known limits/trade-offs.',
    '<!-- chill-agent:end -->'
  ];
  return lines.join('\n');
}

export function copySkillsToProject(selectedSkills, targetDir = process.cwd()) {
  const destSkillsDir = path.join(targetDir, 'skills');
  if (!fs.existsSync(destSkillsDir)) fs.mkdirSync(destSkillsDir, { recursive: true });

  const copied = [];
  for (const skillId of selectedSkills) {
    const srcDir = path.join(ROOT_DIR, 'skills', skillId);
    const destDir = path.join(destSkillsDir, skillId);

    if (fs.existsSync(srcDir)) {
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      const srcSkillMd = path.join(srcDir, 'SKILL.md');
      const destSkillMd = path.join(destDir, 'SKILL.md');
      if (fs.existsSync(srcSkillMd)) {
        fs.copyFileSync(srcSkillMd, destSkillMd);
        copied.push(skillId);
      }
    }
  }
  return copied;
}

export function injectPointerIntoFile(targetFilePath, pointerBlock) {
  let existingContent = '';
  if (fs.existsSync(targetFilePath)) {
    existingContent = fs.readFileSync(targetFilePath, 'utf8');
  } else {
    const parentDir = path.dirname(targetFilePath);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
  }

  const startMarker = '<!-- chill-agent:start -->';
  const endMarker = '<!-- chill-agent:end -->';

  let newContent = '';
  if (existingContent.includes(startMarker) && existingContent.includes(endMarker)) {
    const before = existingContent.substring(0, existingContent.indexOf(startMarker));
    const after = existingContent.substring(existingContent.indexOf(endMarker) + endMarker.length);
    newContent = `${before.trimEnd()}\n\n${pointerBlock}\n${after.trimStart()}`.trim() + '\n';
  } else {
    newContent = existingContent.trim() ? `${existingContent.trim()}\n\n${pointerBlock}\n` : `${pointerBlock}\n`;
  }

  fs.writeFileSync(targetFilePath, newContent, 'utf8');
  return true;
}
