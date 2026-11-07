// src/auditor.js - Automated Anti-Slop & Over-Engineering Scanner
import fs from 'node:fs';
import path from 'node:path';
import { c } from './prompts.js';

const SLOP_PATTERNS = [
  // 1. Visual Slop (Anti-Slop UI)
  {
    id: 'VISUAL-01',
    category: 'Visual Slop',
    severity: 'HIGH',
    regex: /from-purple-[0-9]{3}\s+to-indigo-[0-9]{3}|from-violet-[0-9]{3}\s+to-cyan-[0-9]{3}|from-indigo-[0-9]{3}\s+to-pink-[0-9]{3}/i,
    name: 'Generic AI Purple/Cyan Gradient',
    fix: 'Replace with precision monochromatic carbon `#09090B` or a branded domain color palette.'
  },
  {
    id: 'VISUAL-02',
    category: 'Visual Slop',
    severity: 'MEDIUM',
    regex: /rounded-3xl|rounded-full\s+.*shadow-2xl/i,
    name: 'Pill-Shaped Floating Bubble',
    fix: 'Use crisp geometric radius (4px to 8px) with hairline 1px borders instead of rounded-3xl with heavy shadow.'
  },
  {
    id: 'VISUAL-03',
    category: 'Visual Slop',
    severity: 'LOW',
    regex: /backdrop-blur-(md|lg|xl|2xl)/i,
    name: 'Excessive Glassmorphic Blur',
    fix: 'Ensure backdrop-blur is not stacked across cards, modals, and navbars simultaneously.'
  },
  {
    id: 'VISUAL-04',
    category: 'Visual Slop',
    severity: 'MEDIUM',
    regex: /body\s*\{[^}]*overflow-x\s*:\s*hidden/i,
    name: 'Lazy Body Overflow Masking',
    fix: 'Do not use overflow-x: hidden on body to mask layout bugs. Eliminate the protruding element width directly.'
  },

  // 2. Over-Engineering & Bloat (Ponytail Minimalism)
  {
    id: 'BLOAT-01',
    category: 'Over-Engineering',
    severity: 'HIGH',
    regex: /class\s+[A-Za-z0-9]+Factory|class\s+[A-Za-z0-9]+AbstractBuilder|class\s+[A-Za-z0-9]+ProviderManager/i,
    name: 'Premature Factory / Builder Abstraction',
    fix: 'Ponytail YAGNI rule: replace speculative multi-class factory wrappers with a direct 1-line function or object literal.'
  },
  {
    id: 'BLOAT-02',
    category: 'Over-Engineering',
    severity: 'MEDIUM',
    regex: /import\s+.*lodash\/(cloneDeep|isEqual|merge)|import\s+is-number\s+from/i,
    name: 'Unnecessary Micro-Dependency',
    fix: 'Use native JavaScript standard library (`structuredClone`, `Object.assign`, or standard operators) instead of external micro-packages.'
  },

  // 3. Copywriting Slop
  {
    id: 'COPY-01',
    category: 'Copywriting Slop',
    severity: 'HIGH',
    regex: /\b(unleash\s+the\s+power\s+of|supercharge\s+your|seamlessly\s+integrate|next-generation|game-changer|delve\s+into|dive\s+deep\s+into)\b/i,
    name: 'Generic AI Hype Filler',
    fix: 'Replace vague hype words with concrete specifications or direct functional instructions.'
  },
  {
    id: 'COPY-02',
    category: 'Copywriting Slop',
    severity: 'MEDIUM',
    regex: /[✨🚀🎉💡🔥]/u,
    name: 'AI Sparkle / Rocket Emoji Cliché',
    fix: 'Strip emojis from marketing headlines, documentation, and interface button labels.'
  },
  {
    id: 'COPY-03',
    category: 'Copywriting Slop',
    severity: 'HIGH',
    regex: /\b(trusted\s+by\s+[0-9,]+\s+happy\s+customers|99\.9%\s+customer\s+satisfaction)\b/i,
    name: 'Hallucinated Social Proof',
    fix: 'Cite verified customer metrics or remove synthetic testimonials entirely.'
  },
  {
    id: 'COPY-04',
    category: 'Copywriting Slop',
    severity: 'MEDIUM',
    regex: /—/u,
    name: 'Em Dash (—) AI Writing Tic',
    fix: 'R-02 rule: replace em dash with comma, period, colon, or parentheses.'
  },

  // 4. Code Hygiene Slop
  {
    id: 'CODE-01',
    category: 'Code Hygiene',
    severity: 'MEDIUM',
    regex: /\/\/\s*(this\s+function\s+calculates|this\s+is\s+the\s+render\s+method|define\s+variables?|initialize\s+state)/i,
    name: 'Redundant Obvious AI Code Comment',
    fix: 'Remove comments that merely restate what the code visibly does. Document the "WHY", not the "WHAT".'
  },
  {
    id: 'CODE-02',
    category: 'Code Hygiene',
    severity: 'LOW',
    regex: /\/\/\s*TODO:\s*(implement\s+this|add\s+logic\s+later|finish\s+this)/i,
    name: 'Unimplemented Lazy AI Stub',
    fix: 'Provide full working implementation or throw explicit NotImplementedError with actionable message.'
  },

  // 5. Human Factors & Accessibility
  {
    id: 'A11Y-01',
    category: 'Human Factors',
    severity: 'HIGH',
    regex: /<button[^>]*>[^<]*<svg[^>]*>[\s\S]*?<\/svg>[^<]*<\/button>/i,
    name: 'Icon Button Missing Accessible Label',
    fix: 'Add aria-label="..." to the button element so screen readers can identify the control action.'
  }
];

const SCAN_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.html', '.css', '.md', '.mdx'
]);

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.chillrewind', 'dist', 'build', '.next', '.cache', 'coverage'
]);

export function scanFile(filePath) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
      for (const pattern of SLOP_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            file: filePath,
            line: lineIdx + 1,
            snippet: line.trim().slice(0, 80),
            ...pattern
          });
        }
      }
    });
  } catch {}
  return findings;
}

export function autoFixFile(filePath) {
  let modified = false;
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Strip marketing emojis
    const strippedEmoji = content.replace(/[✨🚀🎉💡🔥]/gu, '');
    if (strippedEmoji !== content) {
      content = strippedEmoji;
      modified = true;
    }

    // 2. Fix redundant obvious comments
    const strippedComments = content.replace(/\/\/\s*(this\s+function\s+calculates|this\s+is\s+the\s+render\s+method|define\s+variables?|initialize\s+state).*\n/gi, '');
    if (strippedComments !== content) {
      content = strippedComments;
      modified = true;
    }

    // 3. Fix rounded-3xl cards
    const fixedRadius = content.replace(/\brounded-3xl\b/g, 'rounded-lg');
    if (fixedRadius !== content) {
      content = fixedRadius;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch {}
  return modified;
}

export function scanDirectory(dirPath) {
  const allFindings = [];

  function walk(current) {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          walk(path.join(current, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (SCAN_EXTENSIONS.has(ext)) {
          const res = scanFile(path.join(current, entry.name));
          allFindings.push(...res);
        }
      }
    }
  }

  walk(dirPath);
  return allFindings;
}

export function printAuditReport(findings, targetDir = process.cwd()) {
  console.log(`\n${c.bold}ChillAgent Anti-Slop & Over-Engineering Audit${c.reset}`);
  console.log(`${c.dim}Scanned directory: ${targetDir}${c.reset}\n`);

  if (findings.length === 0) {
    console.log(`${c.green}${c.bold}✔ Clean Codebase!${c.reset} No AI slop patterns or premature over-engineering found.`);
    return;
  }

  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const medCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;

  console.log(
    `Found ${c.bold}${findings.length} infractions${c.reset} ` +
      `(${c.coral}${highCount} High${c.reset}, ${c.amber}${medCount} Medium${c.reset}, ${c.gray}${lowCount} Low${c.reset}):\n`
  );

  findings.forEach((f, idx) => {
    const sevColor = f.severity === 'HIGH' ? c.coral : f.severity === 'MEDIUM' ? c.amber : c.gray;
    const relFile = path.relative(targetDir, f.file);

    console.log(
      `${c.bold}#${idx + 1}${c.reset} [${sevColor}${f.severity}${c.reset}] ` +
        `${c.cyan}${f.category}${c.reset} — ${c.bold}${f.name}${c.reset}`
    );
    console.log(`  ${c.dim}Location:${c.reset} ${relFile}:${c.line}`);
    console.log(`  ${c.dim}Snippet:${c.reset}  ${c.italic}"${f.snippet}"${c.reset}`);
    console.log(`  ${c.emerald}Fix:${c.reset}      ${f.fix}\n`);
  });
}
