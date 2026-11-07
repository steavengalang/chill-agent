#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { createSession, forkSession, getSession, getSessionTimeline, listSessions } from './db.ts';
import { startProxyServer, type PonyEvent } from './proxy.ts';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  emerald: '\x1b[38;5;48m',
  amber: '\x1b[38;5;214m',
  rose: '\x1b[38;5;204m',
  indigo: '\x1b[38;5;141m',
  cyan: '\x1b[38;5;81m',
  gray: '\x1b[38;5;244m'
};

function formatEventLine(ev: PonyEvent): string {
  const stepTag = ev.stepIdx !== undefined ? `#${ev.stepIdx}` : 'sys';
  switch (ev.type) {
    case 'step_replayed':
      return `${c.emerald}⚡ [REPLAY ${stepTag}]${c.reset} ${c.bold}0ms${c.reset} | $0.00 | ${c.dim}${ev.detail}${c.reset}`;
    case 'slop_pruned':
      return `${c.amber}✂️  [SIEVE  ${stepTag}]${c.reset} Pruned ${c.bold}${((ev.prunedBytes || 0) / 1024).toFixed(2)} KB${c.reset} stale context slop`;
    case 'loop_blocked':
      return `${c.rose}🛑 [GUARD  ${stepTag}]${c.reset} ${c.bold}${ev.detail}${c.reset}`;
    case 'step_complete':
      return `${c.cyan}●  [RECORD ${stepTag}]${c.reset} ${ev.latencyMs}ms | in:${ev.tokensIn} out:${ev.tokensOut} tok`;
    case 'session_forked':
      return `${c.indigo}⑂  [FORK   ${stepTag}]${c.reset} ${ev.detail} -> ${c.bold}${ev.sessionId}${c.reset}`;
    default:
      return `${c.gray}○  [STEP   ${stepTag}]${c.reset} ${ev.detail || ev.type}`;
  }
}

function openBrowser(url: string): void {
  const plat = process.platform;
  const cmd = plat === 'win32' ? 'cmd' : plat === 'darwin' ? 'open' : 'xdg-open';
  const args = plat === 'win32' ? ['/c', 'start', '', url] : [url];
  spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
}

async function runMcpServer(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  rl.on('line', (line) => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      if (msg.method === 'initialize') {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: { tools: {} },
              serverInfo: { name: 'chillrewind-mcp', version: '1.0.0' }
            }
          }) + '\n'
        );
      } else if (msg.method === 'tools/list') {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: {
              tools: [
                {
                  name: 'chillrewind_list_sessions',
                  description: 'List recorded AI agent sessions, token savings, and DAG fork lineages.',
                  inputSchema: { type: 'object', properties: {} }
                },
                {
                  name: 'chillrewind_inspect_timeline',
                  description: 'Get step-by-step execution timeline for a session ID.',
                  inputSchema: {
                    type: 'object',
                    properties: { session_id: { type: 'string' } },
                    required: ['session_id']
                  }
                },
                {
                  name: 'chillrewind_fork_session',
                  description: 'Time-travel fork a session at a specific step index with an optional JSON response override.',
                  inputSchema: {
                    type: 'object',
                    properties: {
                      session_id: { type: 'string' },
                      step_idx: { type: 'number' },
                      mock_json: { type: 'string' }
                    },
                    required: ['session_id', 'step_idx']
                  }
                }
              ]
            }
          }) + '\n'
        );
      } else if (msg.method === 'tools/call') {
        const { name, arguments: args } = msg.params || {};
        let payload: unknown = {};
        if (name === 'chillrewind_list_sessions') {
          payload = listSessions();
        } else if (name === 'chillrewind_inspect_timeline') {
          payload = getSessionTimeline(args.session_id);
        } else if (name === 'chillrewind_fork_session') {
          const newId = forkSession(args.session_id, Number(args.step_idx), args.mock_json);
          payload = { new_session_id: newId, resume_cmd: `chillrewind run --session ${newId} -- <cmd>` };
        }
        process.stdout.write(
          JSON.stringify({
            jsonrpc: '2.0',
            id: msg.id,
            result: { content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }] }
          }) + '\n'
        );
      }
    } catch {
      // Ignore malformed stdio lines
    }
  });
}

async function main() {
  const rawArgs = process.argv.slice(2);
  const sub = rawArgs[0] || 'help';

  if (sub === 'mcp') {
    await runMcpServer();
    return;
  }

  if (sub === 'run') {
    const dashDashIdx = rawArgs.indexOf('--');
    const flagSlice = dashDashIdx > -1 ? rawArgs.slice(1, dashDashIdx) : rawArgs.slice(1);
    const cmdParts = dashDashIdx > -1 ? rawArgs.slice(dashDashIdx + 1) : [];

    const { values } = parseArgs({
      args: flagSlice,
      options: {
        session: { type: 'string', short: 's' },
        port: { type: 'string', short: 'p', default: '8787' }
      },
      strict: false
    });

    if (cmdParts.length === 0) {
      console.error(`${c.rose}Usage:${c.reset} chillrewind run [--session <id>] -- <command...>`);
      process.exit(1);
    }

    const port = Number(values.port || 8787);
    const sessionId = (values.session as string) || `ses_${crypto.randomBytes(4).toString('hex')}`;
    const cmdStr = cmdParts.join(' ');
    createSession(sessionId, cmdStr);

    const server = await startProxyServer(port, sessionId, (ev) => {
      if (ev.type !== 'step_start') {
        process.stderr.write(`  ${formatEventLine(ev)}\n`);
      }
    });

    process.stderr.write(
      `\n${c.indigo}${c.bold}◷ ChillRewind${c.reset} ${c.dim}v1.0${c.reset} │ Session ${c.bold}${sessionId}${c.reset} │ Proxy ${c.cyan}http://127.0.0.1:${port}${c.reset}\n\n`
    );

    const child = spawn(cmdParts[0], cmdParts.slice(1), {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        OPENAI_BASE_URL: `http://127.0.0.1:${port}/v1`,
        ANTHROPIC_BASE_URL: `http://127.0.0.1:${port}`,
        CHILLREWIND_SESSION_ID: sessionId
      }
    });

    const finalize = (code: number | null) => {
      server.close();
      const s = getSession(sessionId);
      const steps = getSessionTimeline(sessionId);
      const replayedCount = steps.filter((x) => x.replayed > 0).length;
      process.stderr.write(
        `\n${c.gray}────────────────────────────────────────────────────────────────────${c.reset}\n` +
          `${c.bold}ChillRewind Run Summary${c.reset} (${c.indigo}${sessionId}${c.reset})\n` +
          `  Steps Executed : ${c.bold}${steps.length}${c.reset} (${c.emerald}${replayedCount} replayed at 0ms${c.reset})\n` +
          `  Tokens Saved   : ${c.emerald}${c.bold}${(s?.tokens_saved || 0).toLocaleString()}${c.reset} tok │ Slop Pruned: ${c.amber}${c.bold}${(s?.tokens_pruned || 0).toLocaleString()}${c.reset} tok\n` +
          `  Est. Savings   : ${c.emerald}${c.bold}$${(s?.cost_saved_usd || 0).toFixed(4)}${c.reset}\n` +
          `  Web Inspector  : ${c.cyan}chillrewind ui${c.reset} ${c.dim}(http://127.0.0.1:${port}/?session=${sessionId})${c.reset}\n` +
          `${c.gray}────────────────────────────────────────────────────────────────────${c.reset}\n`
      );
      process.exit(code ?? 0);
    };

    child.on('exit', finalize);
    process.on('SIGINT', () => child.kill('SIGINT'));
    return;
  }

  if (sub === 'tail') {
    const port = process.env.CHILLREWIND_PORT || '8787';
    console.log(`${c.indigo}${c.bold}◷ PonyTail Live Stream${c.reset} connecting to ${c.cyan}http://127.0.0.1:${port}/events${c.reset}...`);
    const res = await fetch(`http://127.0.0.1:${port}/events`);
    if (!res.body) throw new Error('No SSE body');
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split('\n');
      for (const l of lines) {
        if (l.startsWith('data:')) {
          try {
            const ev = JSON.parse(l.slice(5).trim()) as PonyEvent;
            if ((ev as any).type === 'connected') {
              console.log(`${c.emerald}● Connected${c.reset} (Active session: ${ev.sessionId})`);
            } else {
              console.log(formatEventLine(ev));
            }
          } catch {}
        }
      }
    }
    return;
  }

  if (sub === 'fork') {
    const sessionId = rawArgs[1];
    const { values } = parseArgs({
      args: rawArgs.slice(2),
      options: {
        step: { type: 'string', short: 's' },
        mock: { type: 'string', short: 'm' }
      },
      strict: false
    });
    if (!sessionId || values.step === undefined) {
      console.error(`${c.rose}Usage:${c.reset} chillrewind fork <session_id> --step <n> [--mock '<json>']`);
      process.exit(1);
    }
    const newId = forkSession(sessionId, Number(values.step), values.mock as string | undefined);
    console.log(`${c.indigo}⑂ Created branched session:${c.reset} ${c.bold}${newId}${c.reset} (pinned up to step #${values.step})`);
    console.log(`${c.emerald}Resume command:${c.reset} chillrewind run --session ${newId} -- <your_agent_cmd>`);
    return;
  }

  if (sub === 'ui') {
    const port = Number(process.env.CHILLREWIND_PORT || 8787);
    await startProxyServer(port, `ses_ui_${Date.now().toString(36)}`);
    const url = `http://127.0.0.1:${port}`;
    console.log(`${c.indigo}${c.bold}◷ ChillRewind Inspector${c.reset} live at ${c.cyan}${url}${c.reset}`);
    openBrowser(url);
    return;
  }

  if (sub === 'stats') {
    const sessions = listSessions();
    console.log(`\n${c.bold}SESSION ID          PARENT              FORK   STEPS   SAVED TOK    PRUNED TOK   SAVED USD${c.reset}`);
    console.log(`${c.gray}──────────────────────────────────────────────────────────────────────────────────────────${c.reset}`);
    for (const s of sessions) {
      console.log(
        `${c.indigo}${s.id.padEnd(19)}${c.reset} ` +
          `${(s.parent_id || '-').padEnd(19)} ` +
          `${String(s.fork_step ?? '-').padEnd(6)} ` +
          `${String(s.step_count || 0).padEnd(7)} ` +
          `${c.emerald}${String(s.tokens_saved).padEnd(12)}${c.reset} ` +
          `${c.amber}${String(s.tokens_pruned).padEnd(12)}${c.reset} ` +
          `${c.emerald}$${s.cost_saved_usd.toFixed(4)}${c.reset}`
      );
    }
    console.log();
    return;
  }

  console.log(`
${c.indigo}${c.bold}◷ ChillRewind${c.reset} — Deterministic Time-Travel Debugger & Anti-Slop Proxy for AI Agents

${c.bold}Commands:${c.reset}
  chillrewind run -- <cmd>                     Run agent through deterministic cache & SlopSieve
  chillrewind ui                               Launch Linear-grade Web Inspector on http://127.0.0.1:8787
  chillrewind tail                             Live stream agent thoughts, tool calls & pruned slop
  chillrewind fork <sid> --step <n> [--mock]   Branch session at step #n with optional mock JSON
  chillrewind stats                            Display SQLite DAG session savings table
  chillrewind mcp                              Start stdio MCP server for autonomous coding agents
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
