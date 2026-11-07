// src/cli.js - ChillAgent CLI Command Router
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { banner, c, select, multiselect, confirm } from './prompts.js';
import { detectAgents } from './detector.js';
import { AVAILABLE_SKILLS, copySkillsToProject, generatePointerBlock, injectPointerIntoFile } from './installer.js';
import { scanDirectory, printAuditReport, auditAllPages, generateAuditReport, autoFixFile } from './auditor.js';
import { DESIGN_PRESETS } from './presets.js';
import { configureMode } from '../cli/lib/settings.mjs';

export async function runCli() {
  const rawArgs = process.argv.slice(2);
  const command = rawArgs[0] || 'wizard';

  if (command === 'help' || rawArgs.includes('--help') || rawArgs.includes('-h')) {
    banner();
    console.log(`
${c.bold}USAGE:${c.reset}
  npx chill-agent                          Launch interactive setup wizard
  npx chill-agent install [--all] [--agent <name>]   Install anti-slop skills non-interactively
  npx chill-agent audit [dir] [--fix] [--report] [--all-pages]   Scan & audit all pages for AI slop
  npx chill-agent mode [during|after|ask]   Configure global anti-slop usage mode
  npx chill-agent init-design [preset]     Generate a high-craft DESIGN.md specification
  npx chill-agent doctor                   Inspect detected coding agents and rule health
  npx chill-agent rewind [subcommand]      Run deterministic time-travel debugger & proxy

${c.bold}PRESETS FOR init-design:${c.reset}
  linear-carbon    Precision carbon monochrome, 1px hairlines (Default)
  swiss-brutal     Stark black/white contrast, zero border radius
  technical-spec   Industrial data-first layout, telemetry density
  editorial-paper  Warm ivory paper, literary serif headings
  micro-density    Cyberpunk HUD, compact phosphor-green telemetry
`);
    return;
  }

  if (command === 'mode' || rawArgs.includes('--mode')) {
    const modeArgs = command === 'mode' ? rawArgs.slice(1) : rawArgs.slice(rawArgs.indexOf('--mode') + 1);
    try {
      console.log(configureMode(modeArgs));
    } catch (err) {
      console.error(`antislop: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  if (command === 'doctor') {
    banner();
    console.log(`${c.bold}ChillAgent Environment Diagnostics${c.reset}\n`);
    const agents = detectAgents();
    agents.forEach((ag) => {
      const statusIcon = ag.isDetected ? `${c.emerald}✔ DETECTED${c.reset}` : `${c.gray}○ NOT FOUND${c.reset}`;
      console.log(`  ${ag.icon} ${c.bold}${ag.name.padEnd(30)}${c.reset} ${statusIcon} ${c.dim}(${ag.matchType})${c.reset}`);
    });
    console.log();
    return;
  }

  if (command === 'audit' || command === 'lint' || command === 'scan') {
    const isFix = rawArgs.includes('--fix');
    const isReport = rawArgs.includes('--report');
    const isAllPages = rawArgs.includes('--all-pages') || rawArgs.includes('--pages');
    const isJson = rawArgs.includes('--json');
    const targetDir = rawArgs[1] && !rawArgs[1].startsWith('--')
      ? path.resolve(process.cwd(), rawArgs[1])
      : process.cwd();

    const auditData = auditAllPages(targetDir);

    if (isFix) {
      let fixCount = 0;
      for (const pr of auditData.pageResults) {
        if (pr.findings.length > 0 && autoFixFile(pr.page.file)) {
          fixCount++;
        }
      }
      console.log(`\n${c.emerald}✔ Anti-Slop Auto-Fix Completed:${c.reset} Remedied slop patterns across ${c.bold}${fixCount}${c.reset} audited files.`);
    }

    if (isReport) {
      const rep = generateAuditReport(auditData, targetDir);
      console.log(`\n${c.emerald}✔ Anti-Slop Mode 2 Report Generated:${c.reset} ${c.bold}${rep.reportPath}${c.reset}`);
    }

    if (isJson) {
      console.log(JSON.stringify(auditData, null, 2));
    } else {
      if (isAllPages) {
        console.log(`\n${c.bold}Discovered ${auditData.totalPages} Pages & Component Entrypoints:${c.reset}`);
        console.log(`--------------------------------------------------------------------------------`);
        for (const pr of auditData.pageResults) {
          const statusIcon = pr.status === 'PASS' ? `${c.green}✔ PASS${c.reset}` : `${c.coral}✖ FAIL${c.reset}`;
          console.log(`  ${statusIcon} [${c.bold}${String(pr.score).padStart(3)}/100${c.reset}] \`${pr.page.relPath}\` (${pr.page.type}) — ${pr.counts.high} High, ${pr.counts.medium} Med, ${pr.counts.low} Low`);
        }
        console.log(`--------------------------------------------------------------------------------`);
      }
      const allFindings = [];
      for (const pr of auditData.pageResults) allFindings.push(...pr.findings);
      printAuditReport(allFindings, targetDir, auditData);
    }
    return;
  }

  if (command === 'init-design') {
    const presetId = rawArgs[1];
    let selectedPreset = DESIGN_PRESETS.find((p) => p.id === presetId);

    if (!selectedPreset) {
      banner();
      const choice = await select({
        message: 'Select a High-Craft Aesthetic Preset for DESIGN.md:',
        choices: DESIGN_PRESETS.map((p) => ({
          label: p.name,
          value: p.id,
          description: p.description
        }))
      });
      selectedPreset = DESIGN_PRESETS.find((p) => p.id === choice);
    }

    if (selectedPreset) {
      const destPath = path.join(process.cwd(), 'DESIGN.md');
      fs.writeFileSync(destPath, selectedPreset.content, 'utf8');
      console.log(`\n${c.emerald}✔ Generated DESIGN.md${c.reset} using '${c.bold}${selectedPreset.name}${c.reset}' preset.`);
    }
    return;
  }

  if (command === 'install') {
    const { values } = parseArgs({
      args: rawArgs.slice(1),
      options: {
        all: { type: 'boolean', default: false },
        agent: { type: 'string', short: 'a' }
      },
      strict: false
    });

    const skillsToInstall = values.all
      ? AVAILABLE_SKILLS.map((s) => s.id)
      : ['chill-slop', 'chill-slop-ui', 'chill-slop-copywriting', 'chill-slop-code'];

    copySkillsToProject(skillsToInstall);

    const agents = detectAgents();
    let targetAgents = agents.filter((ag) => ag.isDetected);
    if (values.agent) {
      targetAgents = agents.filter((ag) => ag.id === values.agent);
    }
    if (targetAgents.length === 0) {
      targetAgents = [agents.find((ag) => ag.id === 'antigravity') || agents[0]];
    }

    const pointer = generatePointerBlock(skillsToInstall);
    for (const ag of targetAgents) {
      const targetFilePath = path.join(process.cwd(), ag.targetFile);
      injectPointerIntoFile(targetFilePath, pointer);
      console.log(`${c.emerald}✔ Injected Anti-Slop into ${ag.name}:${c.reset} ${ag.targetFile}`);
    }
    return;
  }

  if (command === 'rewind') {
    const rewindCliPath = path.resolve(__dirname, '..', 'chillrewind', 'src', 'cli.ts');
    if (!fs.existsSync(rewindCliPath)) {
      console.error(`${c.coral}ChillRewind engine not found at ${rewindCliPath}${c.reset}`);
      return;
    }
    const { spawn } = await import('node:child_process');
    spawn('node', ['--experimental-strip-types', '--no-warnings', rewindCliPath, ...rawArgs.slice(1)], {
      stdio: 'inherit'
    });
    return;
  }

  // Interactive Wizard (Default)
  banner();
  console.log(`${c.dim}Setting up ChillAgent Anti-Slop 2.0 in ${process.cwd()}${c.reset}\n`);

  // Step 1: Detect Agents
  const agents = detectAgents();
  const detectedList = agents.filter((a) => a.isDetected);

  let selectedAgents = [];
  if (detectedList.length > 0) {
    console.log(`${c.bold}Detected Agent Environments in Workspace:${c.reset}`);
    detectedList.forEach((ag) => console.log(`  ${ag.icon} ${c.cyan}${ag.name}${c.reset} ${c.dim}(${ag.matchType})${c.reset}`));
    console.log();

    selectedAgents = await multiselect({
      message: 'Select target coding agents to configure:',
      choices: agents.map((ag) => ({
        label: `${ag.icon} ${ag.name}`,
        value: ag.id,
        description: ag.isDetected ? 'Detected' : 'Standard'
      })),
      defaultSelected: detectedList.map((ag) => ag.id)
    });
  } else {
    selectedAgents = await multiselect({
      message: 'Select target coding agents to configure:',
      choices: agents.map((ag) => ({
        label: `${ag.icon} ${ag.name}`,
        value: ag.id
      })),
      defaultSelected: ['antigravity', 'claude']
    });
  }

  if (selectedAgents.length === 0) {
    console.log(`${c.yellow}No agents selected. Exiting.${c.reset}`);
    return;
  }

  // Step 2: Choose Skills
  console.log();
  const selectedSkills = await multiselect({
    message: 'Select Anti-Slop skills to install into this project:',
    choices: AVAILABLE_SKILLS.map((s) => ({
      label: s.label,
      value: s.id,
      description: s.description
    })),
    defaultSelected: AVAILABLE_SKILLS.map((s) => s.id) // All by default
  });

  // Step 3: Design Direction
  console.log();
  const needDesignMd = !fs.existsSync(path.join(process.cwd(), 'DESIGN.md'));
  if (needDesignMd) {
    const wantDesign = await confirm({
      message: 'No DESIGN.md found. Initialize a High-Craft aesthetic spec to avoid sterile AI defaults?'
    });
    if (wantDesign) {
      const presetId = await select({
        message: 'Pick an aesthetic foundation for DESIGN.md:',
        choices: DESIGN_PRESETS.map((p) => ({
          label: p.name,
          value: p.id,
          description: p.description
        }))
      });
      const chosen = DESIGN_PRESETS.find((p) => p.id === presetId);
      if (chosen) {
        fs.writeFileSync(path.join(process.cwd(), 'DESIGN.md'), chosen.content, 'utf8');
        console.log(`${c.emerald}✔ Generated DESIGN.md${c.reset} (${chosen.name})`);
      }
    }
  }

  // Step 4: Perform Installation
  console.log(`\n${c.bold}Installing selected skills & injecting agent hooks...${c.reset}`);
  const copied = copySkillsToProject(selectedSkills);
  console.log(`${c.emerald}✔ Copied ${copied.length} skills into:${c.reset} ./skills/`);

  const pointer = generatePointerBlock(selectedSkills);
  for (const agentId of selectedAgents) {
    const ag = agents.find((a) => a.id === agentId);
    if (ag) {
      const targetFilePath = path.join(process.cwd(), ag.targetFile);
      injectPointerIntoFile(targetFilePath, pointer);
      console.log(`${c.emerald}✔ Configured ${ag.name}:${c.reset} ${ag.targetFile}`);
    }
  }

  console.log(`
${c.green}${c.bold}✔ ChillAgent Anti-Slop 2.0 Successfully Activated!${c.reset}
${c.dim}------------------------------------------------------------${c.reset}
${c.bold}Next Steps:${c.reset}
  • Run ${c.cyan}npx chill-agent audit${c.reset} to scan existing files for AI slop cliches.
  • Run ${c.cyan}npx chill-agent rewind ui${c.reset} to inspect agent time-travel timelines.
  • Start coding in your agent; all anti-slop rules are now strictly enforced!
`);
}
