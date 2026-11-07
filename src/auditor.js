// src/auditor.js - Automated Anti-Slop 2.0 & Ponytail Multi-Page Auditor
import fs from 'node:fs';
import path from 'node:path';
import { c } from './prompts.js';

/**
 * Full 40 R-Rule and Ponytail YAGNI Detection Matrix.
 * Tiers:
 * 1. Hard Gate (Absolute FAIL, Severity: HIGH)
 * 2. Purpose-Gate (Technique allowed only with written reason, Severity: MEDIUM)
 * 3. Quality Locks & Minimalism (Consistency & YAGNI, Severity: LOW/MEDIUM)
 */
export const SLOP_PATTERNS = [
  // ─── TIER 1: HARD GATES (Absolute Violations) ───────────────────────────
  {
    id: 'R-02',
    alias: 'COPY-04',
    category: 'Hard Gate: Copywriting',
    severity: 'HIGH',
    rule: 'R-02',
    regex: /—/u,
    name: 'Em Dash (—) AI Writing Tic',
    fix: 'R-02 rule: replace em dash (—) with a comma, period, colon, or parentheses.'
  },
  {
    id: 'R-03',
    alias: 'VISUAL-04',
    category: 'Hard Gate: Mobile Responsiveness',
    severity: 'HIGH',
    rule: 'R-03',
    regex: /body\s*\{[^}]*overflow-x\s*:\s*hidden|width:\s*(?:[4-9][0-9]{2}|[1-9][0-9]{3,})px(?!.*@media)/i,
    name: 'Mobile Breakpoint Violation / Lazy Overflow Masking',
    fix: 'R-03 rule: ensure layout reflows without horizontal overflow or lazy `overflow-x: hidden` masking.'
  },
  {
    id: 'R-17',
    alias: 'COPY-03',
    category: 'Hard Gate: Data & Numbers',
    severity: 'HIGH',
    rule: 'R-17',
    regex: /\b(?:10[kK]\+|99\.9%|500[mM]\+|120\+\s*countries|10,000\+\s*users|trusted\s+by\s+[0-9,]+\s+happy\s+customers)\b/i,
    name: 'Hallucinated / Unverified Statistics',
    fix: 'R-17 rule: show only verified metrics or use explicit `[REAL DATA]` placeholder.'
  },
  {
    id: 'R-18',
    category: 'Hard Gate: Testimonials',
    severity: 'HIGH',
    rule: 'R-18',
    regex: /(?:fictional\s+reviews?|placeholder\s+avatar|randomuser\.me\/api\/portraits)/i,
    name: 'Synthetic / Fictional Testimonial',
    fix: 'R-18 rule: do not render testimonials without verifiable social proof.'
  },
  {
    id: 'R-24',
    category: 'Hard Gate: Navigation',
    severity: 'HIGH',
    rule: 'R-24',
    regex: /<a[^>]+href=["']#(?:features|about|contact|pricing)?["'][^>]*>(?!.*scroll)/i,
    name: 'Dead Navigation / Ghost Anchor Link',
    fix: 'R-24 rule: every navigation item must resolve to a real, existing destination section or route.'
  },
  {
    id: 'R-25',
    category: 'Hard Gate: Color Contrast',
    severity: 'HIGH',
    rule: 'R-25',
    regex: /(?:text-(?:gray|zinc|slate)-[34]00\s+bg-white|text-(?:gray|zinc|slate)-500\s+bg-(?:black|zinc-900|slate-950)|color:\s*#(?:888|999|aaa|bbb)\s*;\s*background:\s*#(?:fff|fafafa))/i,
    name: 'Sub-WCAG AA Color Contrast (<4.5:1)',
    fix: 'R-25 rule: text must meet minimum 4.5:1 contrast against its background.'
  },
  {
    id: 'R-26',
    category: 'Hard Gate: Interactive Elements',
    severity: 'HIGH',
    rule: 'R-26',
    regex: /<button[^>]*>\s*<\/button>|<button(?![^>]*(?:onClick|type=|on:click|@click|v-on))[^>]*>/i,
    name: 'Dead Interactive Control / Non-Functional Button',
    fix: 'R-26 rule: every interactive control must have functional logic or a visible `// TODO` notice.'
  },
  {
    id: 'R-32',
    category: 'Hard Gate: Accessibility',
    severity: 'HIGH',
    rule: 'R-32',
    regex: /outline:\s*(?:none|0)(?!\s*;\s*&:focus-visible)|\boutline-none(?!\s+focus-visible:)/i,
    name: 'Stripped Focus Outline Without Replacement',
    fix: 'R-32 rule: never remove default focus ring without providing a visible custom focus indicator.'
  },
  {
    id: 'R-33',
    category: 'Hard Gate: Script Patching',
    severity: 'HIGH',
    rule: 'R-33',
    regex: /str\.replace\(.*\.css|rewrite_css|patch_styles/i,
    name: 'External File/CSS Patching via Script',
    fix: 'R-33 rule: build features directly in source code, never through external string-replacement scripts.'
  },
  {
    id: 'R-36',
    category: 'Hard Gate: Trust Claims',
    severity: 'HIGH',
    rule: 'R-36',
    regex: /\b(?:SOC\s*2\s*compliant|ISO\s*27001\s*certified|enterprise-grade\s*security|300%\s*faster\s*than)\b/i,
    name: 'Unsubstantiated Compliance / Performance Claim',
    fix: 'R-36 rule: remove fabricated compliance, security, or performance claims lacking verifiable audit proof.'
  },
  {
    id: 'R-39',
    alias: 'A11Y-01',
    category: 'Hard Gate: Semantics & Affordances',
    severity: 'HIGH',
    rule: 'R-39',
    regex: /<button[^>]*>[^<]*<svg[^>]*>[\s\S]*?<\/svg>[^<]*<\/button>(?![^<]*aria-label)|<img(?![^>]*\balt=)[^>]*>|user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i,
    name: 'Missing Accessible Name, Alt Text, or Scalability Block',
    fix: 'R-39 rule: provide aria-label on icon buttons, alt text on images, and do not lock viewport scaling.'
  },
  {
    id: 'R-40',
    category: 'Hard Gate: Media & Performance',
    severity: 'HIGH',
    rule: 'R-40',
    regex: /<(?:img|video|iframe)(?![^>]*(?:width|height|aspect-ratio|style=.*aspect-ratio))[^>]*>|<img[^>]*class=["'][^"']*hero[^"']*["'][^>]*loading=["']lazy["']/i,
    name: 'Unreserved Media Dimensions / Lazy-Loaded Hero',
    fix: 'R-40 rule: declare width/height or aspect-ratio on media elements; hero image must load eagerly.'
  },

  // ─── TIER 2: PURPOSE-GATE (Allowed Only With Stated Purpose) ──────────────
  {
    id: 'R-01',
    alias: 'VISUAL-01',
    category: 'Purpose-Gate: Color & Gradients',
    severity: 'MEDIUM',
    rule: 'R-01',
    regex: /from-purple-[0-9]{3}\s+to-indigo-[0-9]{3}|from-violet-[0-9]{3}\s+to-cyan-[0-9]{3}|from-indigo-[0-9]{3}\s+to-pink-[0-9]{3}|linear-gradient\([^)]*(?:#8b5cf6|#6366f1|#ec4899)[^)]*(?:#06b6d4|#3b82f6)\)/i,
    name: 'Generic AI Purple/Cyan Gradient',
    fix: 'R-01 rule: replace default purple mesh with brand-grounded color or linear-carbon `#09090B`.'
  },
  {
    id: 'R-04',
    category: 'Purpose-Gate: Icons',
    severity: 'MEDIUM',
    rule: 'R-04',
    regex: /(?<![a-zA-Z0-9_-])(?:Sparkles?|MagicWand|Wand2|BotIcon|CpuIcon|AiIcon|SparkleIcon|AiOrb)(?![a-zA-Z0-9_-])(?!\s*\/\/\s*purpose:)/i,
    name: 'Generic AI Glyphs (Sparkle/Robot/Magic)',
    fix: 'R-04 rule: icons must represent actual domain concepts, not generic AI decoration.'
  },
  {
    id: 'R-06',
    category: 'Purpose-Gate: Typography',
    severity: 'MEDIUM',
    rule: 'R-06',
    regex: /font-mono\s+text-(?:4xl|5xl|6xl)|tracking-\[(?:0\.[3-9]em|[4-9]px)\]/i,
    name: 'Over-Styled Monospace Heading / Extreme Tracking',
    fix: 'R-06 rule: reserve monospace for tabular numbers/code; do not use it purely for terminal aesthetics.'
  },
  {
    id: 'R-07',
    category: 'Purpose-Gate: Background',
    severity: 'MEDIUM',
    rule: 'R-07',
    regex: /background-image:\s*(?:radial-gradient\(#|linear-gradient\(to right, #(?:e5e7eb|26262b) 1px, transparent 1px\))|bg-\[radial-gradient/i,
    name: 'Unanchored Background Grid / Dot Matrix',
    fix: 'R-07 rule: use background patterns only if they directly reinforce verified brand identity.'
  },
  {
    id: 'R-08',
    category: 'Purpose-Gate: Button Arrows',
    severity: 'LOW',
    rule: 'R-08',
    regex: /<button[^>]*>.*(?:&rarr;|&#8594;|→|↗|<ArrowRight|<ChevronRight).*<\/button>/i,
    name: 'Default Arrow Cliché on Every Button',
    fix: 'R-08 rule: arrows are directional cues, not default decoration on every action button.'
  },
  {
    id: 'R-09',
    category: 'Purpose-Gate: Badges',
    severity: 'MEDIUM',
    rule: 'R-09',
    regex: /rounded-full[^>]*border[^>]*>\s*(?:AI Powered|Beta|New|Next Gen|v[0-9]\.[0-9]|Intelligent)/i,
    name: 'AI Capsule Pill Badge Above Headline',
    fix: 'R-09 rule: capsule badges must serve functional status, not redundant hype.'
  },
  {
    id: 'R-10',
    alias: 'VISUAL-03',
    category: 'Purpose-Gate: Glassmorphism',
    severity: 'LOW',
    rule: 'R-10',
    regex: /backdrop-blur-(?:md|lg|xl|2xl)/i,
    name: 'Excessive Glassmorphic Blur Stacking',
    fix: 'R-10 rule: dose cap blur on maximum 1-2 elements; avoid stacking across cards and navbars.'
  },
  {
    id: 'R-12',
    category: 'Purpose-Gate: Shadow',
    severity: 'MEDIUM',
    rule: 'R-12',
    regex: /shadow-(?:2xl|xl)\s+(?!.*hover:)/i,
    name: 'Heavy Soft Floating Shadows',
    fix: 'R-12 rule: use shadows selectively as hierarchy elevation markers, not floating card defaults.'
  },
  {
    id: 'R-13',
    category: 'Purpose-Gate: Glow',
    severity: 'LOW',
    rule: 'R-13',
    regex: /(?:drop-shadow-\[0_0_|box-shadow:\s*0\s*0\s*[1-9][0-9]px|glow-)/i,
    name: 'Pervasive Neon Glow Accent',
    fix: 'R-13 rule: limit glow to at most 1 key focal element; avoid simultaneous glows on cards and buttons.'
  },
  {
    id: 'R-14',
    category: 'Purpose-Gate: Feature Cards',
    severity: 'MEDIUM',
    rule: 'R-14',
    regex: /(?:grid-cols-3.*\{features\.map|\{items\.map.*<Card)/i,
    name: 'Cookie-Cutter Uniform Feature Cards',
    fix: 'R-14 rule: vary card layout and hierarchy to reflect the actual importance of each feature.'
  },
  {
    id: 'R-19',
    category: 'Purpose-Gate: Animations',
    severity: 'LOW',
    rule: 'R-19',
    regex: /(?:animate-bounce|animate-pulse\s+animate-spin|fade-up.*floating.*scale)/i,
    name: 'Stacked Template Animations',
    fix: 'R-19 rule: use purposeful motion tied to declared MOTION dial; avoid simultaneously stacked animations.'
  },
  {
    id: 'R-22',
    category: 'Purpose-Gate: Illustrations',
    severity: 'LOW',
    rule: 'R-22',
    regex: /(?:undraw|storyset|3d-character|blob-scene)/i,
    name: 'Generic 3D Blob / Stock Illustration',
    fix: 'R-22 rule: use real product screenshots, telemetry diagrams, or no illustration at all.'
  },

  // ─── TIER 3: QUALITY LOCKS & PONYTAIL MINIMALISM ────────────────────────
  {
    id: 'R-05',
    category: 'Quality Lock: Layout Rhythm',
    severity: 'MEDIUM',
    rule: 'R-05',
    regex: /<section[^>]*>.*how-it-works.*step-1.*step-2.*step-3/is,
    name: 'Template "How It Works" 3-Step Rhythm',
    fix: 'R-05 rule: structure page flow around the actual narrative rather than template 3-step sequences.'
  },
  {
    id: 'R-11',
    alias: 'VISUAL-02',
    category: 'Quality Lock: Border Radius',
    severity: 'MEDIUM',
    rule: 'R-11',
    regex: /\brounded-3xl\b|\brounded-full\s+.*(?:card|panel|modal|dialog)\b/i,
    name: 'Pill-Shaped Floating Bubble / Excessive Radius',
    fix: 'R-11 rule: maintain geometric design system radius (4px-8px) with 1px hairlines.'
  },
  {
    id: 'R-15',
    category: 'Quality Lock: Call to Action',
    severity: 'LOW',
    rule: 'R-15',
    regex: />\s*(?:Get Started|Learn More|Try Now|Explore|Discover)\s*</i,
    name: 'Generic Vague CTA Copy',
    fix: 'R-15 rule: use action-specific CTAs (e.g. "Start Project", "View Source", "Open Dashboard").'
  },
  {
    id: 'R-16',
    alias: 'COPY-01',
    category: 'Quality Lock: Copywriting Buzzwords',
    severity: 'HIGH',
    rule: 'R-16',
    regex: /\b(?:unleash\s+the\s+power\s+of|supercharge\s+your|seamlessly\s+integrate|next-generation|game-changer|delve\s+into|dive\s+deep\s+into|cutting-edge|revolutionary|effortless)\b/i,
    name: 'Generic AI Marketing Buzzword',
    fix: 'R-16 rule: replace hype words with concrete technical or functional explanations.'
  },
  {
    id: 'R-29',
    category: 'Quality Lock: Color Palette',
    severity: 'MEDIUM',
    rule: 'R-29',
    regex: /(?:bg-(?:red|orange|yellow|green|blue|purple|pink)-[0-9]{3}.*){4,}/i,
    name: 'Palette Explosion (>3 Core Colors)',
    fix: 'R-29 rule: limit palette to maximum 2-3 core brand colors + 1 deliberate accent.'
  },
  {
    id: 'BLOAT-01',
    category: 'Ponytail Minimalism: Architecture',
    severity: 'HIGH',
    rule: 'YAGNI',
    regex: /class\s+[A-Za-z0-9]+Factory|class\s+[A-Za-z0-9]+AbstractBuilder|class\s+[A-Za-z0-9]+ProviderManager/i,
    name: 'Premature Factory / Builder Abstraction',
    fix: 'Ponytail YAGNI ladder: replace speculative class wrappers with a direct function or object literal.'
  },
  {
    id: 'BLOAT-02',
    category: 'Ponytail Minimalism: Dependencies',
    severity: 'MEDIUM',
    rule: 'STDLIB',
    regex: /import\s+.*lodash\/(?:cloneDeep|isEqual|merge)|import\s+is-number\s+from/i,
    name: 'Unnecessary Micro-Dependency',
    fix: 'Use native JavaScript built-ins (`structuredClone`, standard operators) instead of external packages.'
  },
  {
    id: 'CODE-01',
    category: 'Ponytail Hygiene: Code Comments',
    severity: 'LOW',
    rule: 'HYGIENE',
    regex: /\/\/\s*(?:this\s+function\s+calculates|this\s+is\s+the\s+render\s+method|define\s+variables?|initialize\s+state)/i,
    name: 'Redundant Obvious AI Code Comment',
    fix: 'Remove comments that restate the code. Document the "WHY", not the "WHAT".'
  },
  {
    id: 'CODE-02',
    category: 'Ponytail Hygiene: Stubbed Logic',
    severity: 'LOW',
    rule: 'HYGIENE',
    regex: /\/\/\s*TODO:\s*(?:implement\s+this|add\s+logic\s+later|finish\s+this)/i,
    name: 'Unimplemented Lazy AI Stub',
    fix: 'Provide working implementation or raise explicit NotImplementedError with actionable detail.'
  },
  {
    id: 'COPY-02',
    category: 'Copywriting Cliché: Emoji Overuse',
    severity: 'MEDIUM',
    rule: 'R-02',
    regex: /[✨🚀🎉💡🔥🤖⚡]/u,
    name: 'AI Sparkle / Rocket Emoji Cliché',
    fix: 'Strip decorative emojis from headlines, buttons, and interface labels.'
  }
];

const SCAN_EXTENSIONS = new Set([
  '.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro',
  '.js', '.ts', '.mjs', '.cjs',
  '.css', '.scss', '.sass', '.less',
  '.md', '.mdx'
]);

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.chillrewind', 'dist', 'build', '.next', '.cache',
  'coverage', '.vercel', '.output', '.openclaw', '.claude-plugin', '.codex-plugin',
  '.cursor', '.cursor-plugin', '.windsurf', '.qoder', '.qoder-plugin', '.kimi-plugin',
  '.devin-plugin', '.grok-plugin', '.omp-plugin', 'i18n', 'rules', 'skills'
]);

const IGNORE_FILES = new Set([
  'antislop.md', 'chillslop.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'GUIDE.md',
  'README.md', 'CODE_OF_CONDUCT.md', 'CONTRIBUTING.md', 'SECURITY.md', 'INSTALL.md',
  'after-install.md'
]);

/**
 * Discover all pages, routes, views, layouts, and components across the project.
 */
export function discoverPages(rootDir) {
  const pages = [];

  function walk(currentDir) {
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (IGNORE_FILES.has(entry.name)) continue;
        const ext = path.extname(entry.name).toLowerCase();
        if (SCAN_EXTENSIONS.has(ext)) {
          const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
          const isRoute = /\b(pages|app|routes|views)\b/i.test(relPath) || entry.name.startsWith('page.') || entry.name === 'index.html';
          const isComponent = /\b(components|ui|widgets)\b/i.test(relPath);
          const isStyle = ext === '.css' || ext === '.scss';
          const isDoc = ext === '.md' || ext === '.mdx';

          pages.push({
            file: fullPath,
            relPath,
            name: entry.name,
            ext,
            type: isRoute ? 'PAGE_ROUTE' : isComponent ? 'COMPONENT' : isStyle ? 'STYLESHEET' : isDoc ? 'DOCUMENT' : 'SOURCE'
          });
        }
      }
    }
  }

  walk(rootDir);
  return pages;
}

/**
 * Scan a single file against the full 40 R-rule pattern matrix.
 */
export function scanFile(filePath) {
  const findings = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, lineIdx) => {
      // Carve-out: skip markdown headings for em-dash check (e.g. `## R-02 — Copywriting`)
      const isHeading = line.trim().startsWith('#') || line.trim().startsWith('//') || line.trim().startsWith('*');

      for (const pattern of SLOP_PATTERNS) {
        if (pattern.id === 'R-02' && isHeading) {
          continue;
        }

        if (pattern.regex.test(line)) {
          findings.push({
            file: filePath,
            line: lineIdx + 1,
            snippet: line.trim().slice(0, 90),
            id: pattern.alias || pattern.id,
            rule: pattern.rule || pattern.id,
            category: pattern.category,
            severity: pattern.severity,
            name: pattern.name,
            fix: pattern.fix
          });
        }
      }
    });
  } catch {}
  return findings;
}

/**
 * Audit all pages in repository, grouping results by page and rule tier.
 */
export function auditAllPages(rootDir) {
  const pages = discoverPages(rootDir);
  const pageResults = [];
  let totalViolations = 0;

  for (const page of pages) {
    const findings = scanFile(page.file);
    const hardGateFails = findings.filter((f) => f.severity === 'HIGH').length;
    const purposeGateFails = findings.filter((f) => f.severity === 'MEDIUM').length;
    const qualityLockFails = findings.filter((f) => f.severity === 'LOW').length;

    // Delivery Gate Score: 100 - (High * 15 + Med * 5 + Low * 2)
    const rawScore = 100 - (hardGateFails * 15 + purposeGateFails * 5 + qualityLockFails * 2);
    const score = Math.max(0, Math.min(100, rawScore));
    const status = hardGateFails === 0 && purposeGateFails === 0 ? 'PASS' : 'FAIL';

    totalViolations += findings.length;

    pageResults.push({
      page,
      findings,
      score,
      status,
      counts: {
        total: findings.length,
        high: hardGateFails,
        medium: purposeGateFails,
        low: qualityLockFails
      }
    });
  }

  return {
    rootDir,
    totalPages: pages.length,
    totalViolations,
    pageResults,
    overallStatus: pageResults.every((p) => p.status === 'PASS') ? 'PASS' : 'FAIL'
  };
}

/**
 * Scan directory helper for backward compatibility.
 */
export function scanDirectory(dirPath) {
  const audit = auditAllPages(dirPath);
  const all = [];
  for (const res of audit.pageResults) {
    all.push(...res.findings);
  }
  return all;
}

/**
 * Automatically remediate fixable slop patterns.
 */
export function autoFixFile(filePath) {
  let modified = false;
  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Strip emojis (R-02 / COPY-02)
    const strippedEmoji = content.replace(/[✨🚀🎉💡🔥🤖⚡]/gu, '');
    if (strippedEmoji !== content) {
      content = strippedEmoji;
      modified = true;
    }

    // 2. Replace em dashes with comma/period (R-02) outside headings
    const lines = content.split('\n');
    const fixedLines = lines.map((l) => {
      if (l.trim().startsWith('#') || l.trim().startsWith('//')) return l;
      if (l.includes('—')) {
        modified = true;
        return l.replace(/—/g, ',');
      }
      return l;
    });
    if (modified) content = fixedLines.join('\n');

    // 3. Fix redundant obvious comments (CODE-01)
    const strippedComments = content.replace(/\/\/\s*(?:this\s+function\s+calculates|this\s+is\s+the\s+render\s+method|define\s+variables?|initialize\s+state).*\n/gi, '');
    if (strippedComments !== content) {
      content = strippedComments;
      modified = true;
    }

    // 4. Normalize rounded-3xl / rounded-full cards (R-11 / VISUAL-02)
    const fixedRadius = content.replace(/\brounded-3xl\b/g, 'rounded-lg');
    if (fixedRadius !== content) {
      content = fixedRadius;
      modified = true;
    }

    // 5. Replace generic CTAs (R-15)
    const fixedCtas = content
      .replace(/>\s*Get Started\s*</g, '>Start Project<')
      .replace(/>\s*Learn More\s*</g, '>Documentation<');
    if (fixedCtas !== content) {
      content = fixedCtas;
      modified = true;
    }

    // 6. Ensure native button type (R-26)
    const fixedButtons = content.replace(/<button(?!\s+type=)([^>]*)>/g, '<button type="button"$1>');
    if (fixedButtons !== content) {
      content = fixedButtons;
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch {}
  return modified;
}

/**
 * Generate standard Mode 2 audit report in `anti-slop/audit-NNN-YYYY-MM-DD.md`.
 */
export function generateAuditReport(auditData, rootDir = process.cwd()) {
  const outDir = path.join(rootDir, 'anti-slop');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Determine increment index
  let maxIndex = 0;
  try {
    const existing = fs.readdirSync(outDir);
    for (const f of existing) {
      const match = f.match(/^audit-(\d{3})-/);
      if (match) {
        maxIndex = Math.max(maxIndex, parseInt(match[1], 10));
      }
    }
  } catch {}

  const nextIndex = String(maxIndex + 1).padStart(3, '0');
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `audit-${nextIndex}-${dateStr}.md`;
  const reportPath = path.join(outDir, fileName);

  const lines = [
    `# Anti-Slop Audit Report #${nextIndex}`,
    ``,
    `> Generated on **${dateStr}** by **ChillAgent Anti-Slop 2.0 Engine**`,
    `> Scope: Full-Page Repository Audit (${auditData.totalPages} pages/components scanned)`,
    ``,
    `---`,
    ``,
    `## Executive Summary`,
    ``,
    `- **Delivery Gate Verdict:** **${auditData.overallStatus}**`,
    `- **Total Pages Audited:** ${auditData.totalPages}`,
    `- **Total Infractions Detected:** ${auditData.totalViolations}`,
    ``,
    `### Page-by-Page Audit Ledger`,
    ``,
    `| Page / Component Path | Type | Health Score | Gate Status | High | Med | Low |`,
    `| :--- | :--- | :---: | :---: | :---: | :---: | :---: |`
  ];

  for (const pr of auditData.pageResults) {
    if (pr.counts.total > 0 || pr.page.type === 'PAGE_ROUTE') {
      lines.push(
        `| \`${pr.page.relPath}\` | ${pr.page.type} | **${pr.score}/100** | ${pr.status === 'PASS' ? '🟢 PASS' : '🔴 FAIL'} | ${pr.counts.high} | ${pr.counts.medium} | ${pr.counts.low} |`
      );
    }
  }

  lines.push(``);
  lines.push(`---`);
  lines.push(``);
  lines.push(`## Numbered Findings List (Actionable Remediation)`);
  lines.push(``);

  let findingCounter = 1;
  for (const pr of auditData.pageResults) {
    if (pr.findings.length === 0) continue;

    lines.push(`### \`${pr.page.relPath}\``);
    lines.push(``);

    for (const f of pr.findings) {
      lines.push(`#### Finding #${findingCounter} [${f.severity}] — ${f.name} (${f.rule})`);
      lines.push(`- **Location:** \`${pr.page.relPath}:${f.line}\``);
      lines.push(`- **Category:** ${f.category}`);
      lines.push(`- **Violating Snippet:** \`${f.snippet}\``);
      lines.push(`- **Remediation Advice:** ${f.fix}`);
      lines.push(`- [ ] **Approve fix #${findingCounter}**`);
      lines.push(``);
      findingCounter++;
    }
  }

  lines.push(`---`);
  lines.push(``);
  lines.push(`## Mode 2 Execution Workflow`);
  lines.push(`To automatically remediate approved items:`);
  lines.push(`\`\`\`bash`);
  lines.push(`npx chill-agent audit --fix`);
  lines.push(`\`\`\``);

  fs.writeFileSync(reportPath, lines.join('\n'), 'utf8');
  return { reportPath, fileName, nextIndex };
}

/**
 * Format and print comprehensive audit summary to console.
 */
export function printAuditReport(findings, targetDir = process.cwd(), auditData = null) {
  console.log(`\n${c.bold}ChillAgent Anti-Slop 2.0 & Ponytail Comprehensive Audit${c.reset}`);
  console.log(`${c.dim}Target Workspace: ${targetDir}${c.reset}\n`);

  if (!findings || findings.length === 0) {
    console.log(`${c.emerald}${c.bold}✔ Clean Codebase!${c.reset} No AI slop patterns or premature over-engineering found.`);
    return;
  }

  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const medCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;

  console.log(
    `Found ${c.bold}${findings.length} infractions${c.reset} across audited files ` +
      `(${c.coral}${highCount} Hard Gate / High${c.reset}, ${c.amber}${medCount} Purpose-Gate / Med${c.reset}, ${c.gray}${lowCount} Quality Locks / Low${c.reset}):\n`
  );

  findings.slice(0, 50).forEach((f, idx) => {
    const sevColor = f.severity === 'HIGH' ? c.coral : f.severity === 'MEDIUM' ? c.amber : c.gray;
    const relFile = path.relative(targetDir, f.file).replace(/\\/g, '/');

    console.log(
      `${c.bold}#${idx + 1}${c.reset} [${sevColor}${f.severity}${c.reset}] ` +
        `${c.cyan}${f.rule || f.id}${c.reset} — ${c.bold}${f.name}${c.reset}`
    );
    console.log(`  ${c.dim}Location:${c.reset} ${relFile}:${f.line}`);
    console.log(`  ${c.dim}Snippet:${c.reset}  ${c.italic}"${f.snippet}"${c.reset}`);
    console.log(`  ${c.emerald}Fix:${c.reset}      ${f.fix}\n`);
  });

  if (findings.length > 50) {
    console.log(`${c.dim}... and ${findings.length - 50} more findings. Run with --report to generate a markdown audit report.${c.reset}\n`);
  }
}
