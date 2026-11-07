import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canonicalHash,
  createSession,
  forkSession,
  getSession,
  getSessionTimeline,
  listSessions,
  recordStep,
  resolveStep
} from './db.ts';
import { applySlopSieve, buildCircuitBreakerResponse } from './sieve.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sseClients = new Set<http.ServerResponse>();
const stepCounters = new Map<string, number>();

export type PonyEvent = {
  type: 'step_start' | 'step_replayed' | 'slop_pruned' | 'loop_blocked' | 'step_complete' | 'session_forked';
  sessionId: string;
  stepIdx?: number;
  model?: string;
  latencyMs?: number;
  prunedBytes?: number;
  tokensIn?: number;
  tokensOut?: number;
  detail?: string;
  timestamp: number;
};

export function broadcastEvent(ev: PonyEvent, onLocalEvent?: (e: PonyEvent) => void): void {
  if (onLocalEvent) onLocalEvent(ev);
  const payload = `data: ${JSON.stringify(ev)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function reassembleSSEStream(rawSSE: string, model: string, isAnthropic: boolean): Record<string, any> {
  const lines = rawSSE.split('\n');
  let contentText = '';
  const toolCallsMap = new Map<number, { id: string; type: 'function'; function: { name: string; arguments: string } }>();

  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const dataStr = line.slice(5).trim();
    if (!dataStr || dataStr === '[DONE]') continue;
    try {
      const parsed = JSON.parse(dataStr);
      // OpenAI delta
      const delta = parsed?.choices?.[0]?.delta;
      if (delta) {
        if (typeof delta.content === 'string') contentText += delta.content;
        if (Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            const existing = toolCallsMap.get(idx) || {
              id: tc.id || `call_${idx}`,
              type: 'function',
              function: { name: '', arguments: '' }
            };
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.function.name += tc.function.name;
            if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
            toolCallsMap.set(idx, existing);
          }
        }
      }
      // Anthropic delta
      if (parsed?.type === 'content_block_delta' && parsed?.delta?.text) {
        contentText += parsed.delta.text;
      }
    } catch {
      // Ignore non-JSON keepalive comments
    }
  }

  if (isAnthropic) {
    return {
      id: `msg_stream_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model,
      content: [{ type: 'text', text: contentText }],
      usage: { input_tokens: 120, output_tokens: Math.ceil(contentText.length / 4) }
    };
  }

  const message: Record<string, any> = { role: 'assistant', content: contentText || null };
  if (toolCallsMap.size > 0) {
    message.tool_calls = Array.from(toolCallsMap.values());
  }

  return {
    id: `chatcmpl_stream_${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message, finish_reason: toolCallsMap.size > 0 ? 'tool_calls' : 'stop' }],
    usage: {
      prompt_tokens: 150,
      completion_tokens: Math.max(10, Math.ceil(contentText.length / 4)),
      total_tokens: 150 + Math.max(10, Math.ceil(contentText.length / 4))
    }
  };
}

export function startProxyServer(
  port = 8787,
  defaultSessionId = `ses_${Date.now().toString(36)}`,
  onLocalEvent?: (e: PonyEvent) => void
): Promise<http.Server> {
  createSession(defaultSessionId, 'proxy-daemon');

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

    // CORS headers for local DevTools
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-ChillRewind-Session, anthropic-version, x-api-key');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. PonyTail SSE Live Stream
    if (req.method === 'GET' && url.pathname === '/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      res.write(`data: ${JSON.stringify({ type: 'connected', sessionId: defaultSessionId, timestamp: Date.now() })}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    // 2. Web Inspector Single-File UI
    if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/ui')) {
      const uiPath = path.join(__dirname, 'ui.html');
      const html = fs.readFileSync(uiPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    // 3. REST API for Web Inspector
    if (req.method === 'GET' && url.pathname === '/api/sessions') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ sessions: listSessions(), activeSessionId: defaultSessionId }));
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/api/sessions/')) {
      const sid = decodeURIComponent(url.pathname.replace('/api/sessions/', ''));
      const session = getSession(sid);
      if (!session) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Session not found' }));
        return;
      }
      const steps = getSessionTimeline(sid);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ session, steps }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/fork') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const { sessionId, stepIdx, mockResponse } = body;
      const newSessionId = forkSession(
        sessionId,
        Number(stepIdx),
        mockResponse ? (typeof mockResponse === 'string' ? mockResponse : JSON.stringify(mockResponse)) : undefined
      );
      broadcastEvent(
        {
          type: 'session_forked',
          sessionId: newSessionId,
          stepIdx: Number(stepIdx),
          detail: `Forked from ${sessionId} at step #${stepIdx}`,
          timestamp: Date.now()
        },
        onLocalEvent
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          newSessionId,
          resumeCommand: `chillrewind run --session ${newSessionId} -- <your_agent_cmd>`
        })
      );
      return;
    }

    // 4. LLM Proxy Interceptor (/v1/chat/completions & /v1/messages)
    if (req.method === 'POST' && (url.pathname.endsWith('/chat/completions') || url.pathname.endsWith('/messages'))) {
      const startTime = Date.now();
      const isAnthropic = url.pathname.endsWith('/messages');
      const sessionId = (req.headers['x-chillrewind-session'] as string) || process.env.CHILLREWIND_SESSION_ID || defaultSessionId;
      createSession(sessionId, 'agent-run');

      const stepIdx = stepCounters.get(sessionId) ?? 0;
      stepCounters.set(sessionId, stepIdx + 1);

      const rawBody = await readBody(req);
      let parsedReq: Record<string, any> = {};
      try {
        parsedReq = JSON.parse(rawBody);
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        return;
      }

      const model = parsedReq.model || (isAnthropic ? 'claude-3-7-sonnet' : 'gpt-4o');
      const history = getSessionTimeline(sessionId);

      // Run SlopSieve (Prune stale tool outputs + check for infinite loop)
      const { cleanedPayload, prunedBytes, blockedByLoop, loopSignature } = applySlopSieve(parsedReq, history);

      if (prunedBytes > 0) {
        broadcastEvent(
          {
            type: 'slop_pruned',
            sessionId,
            stepIdx,
            model,
            prunedBytes,
            detail: `Pruned ${(prunedBytes / 1024).toFixed(2)} KB of stale context slop`,
            timestamp: Date.now()
          },
          onLocalEvent
        );
      }

      const hash = canonicalHash(cleanedPayload);

      // Circuit Breaker Trip
      if (blockedByLoop) {
        const cbResponse = buildCircuitBreakerResponse(isAnthropic, model, loopSignature);
        const cbJson = JSON.stringify(cbResponse);
        recordStep({
          session_id: sessionId,
          step_idx: stepIdx,
          hash,
          model,
          req_json: JSON.stringify(cleanedPayload),
          res_json: cbJson,
          tokens_in: 0,
          tokens_out: 0,
          pruned_bytes: prunedBytes,
          latency_ms: 0,
          replayed: 1
        });
        broadcastEvent(
          {
            type: 'loop_blocked',
            sessionId,
            stepIdx,
            model,
            detail: `Circuit Breaker halted 3x repeated tool call (${loopSignature})`,
            timestamp: Date.now()
          },
          onLocalEvent
        );
        res.writeHead(200, { 'Content-Type': 'application/json', 'X-ChillRewind': 'CIRCUIT-BREAKER' });
        res.end(cbJson);
        return;
      }

      // Check Deterministic Replay Cache
      const cached = resolveStep(sessionId, stepIdx, hash);
      if (cached) {
        recordStep({
          session_id: sessionId,
          step_idx: stepIdx,
          hash,
          model,
          req_json: JSON.stringify(cleanedPayload),
          res_json: cached.res_json,
          tokens_in: cached.tokens_in,
          tokens_out: cached.tokens_out,
          pruned_bytes: prunedBytes,
          latency_ms: 0,
          replayed: cached.replayed === 2 ? 2 : 1
        });

        broadcastEvent(
          {
            type: 'step_replayed',
            sessionId,
            stepIdx,
            model,
            latencyMs: 0,
            prunedBytes,
            tokensIn: cached.tokens_in,
            tokensOut: cached.tokens_out,
            detail: cached.replayed === 2 ? 'Served mutated fork override ($0.00)' : 'Replayed from SQLite DAG ($0.00)',
            timestamp: Date.now()
          },
          onLocalEvent
        );

        // If client requested SSE stream, wrap cached JSON as instant SSE event
        if (parsedReq.stream) {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-ChillRewind': 'REPLAY-STREAM'
          });
          const parsedCached = JSON.parse(cached.res_json);
          const content = parsedCached?.choices?.[0]?.message?.content || parsedCached?.content?.[0]?.text || '';
          const toolCalls = parsedCached?.choices?.[0]?.message?.tool_calls;
          const chunk = {
            id: parsedCached.id || 'chatcmpl_replay',
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model,
            choices: [
              {
                index: 0,
                delta: { role: 'assistant', content, ...(toolCalls ? { tool_calls: toolCalls } : {}) },
                finish_reason: toolCalls ? 'tool_calls' : 'stop'
              }
            ]
          };
          res.write(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`);
          res.end();
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json', 'X-ChillRewind': 'REPLAY' });
        res.end(cached.res_json);
        return;
      }

      // Live Upstream Call
      broadcastEvent(
        {
          type: 'step_start',
          sessionId,
          stepIdx,
          model,
          prunedBytes,
          detail: `Forwarding live step #${stepIdx} to upstream`,
          timestamp: Date.now()
        },
        onLocalEvent
      );

      const defaultUpstream = isAnthropic ? 'https://api.anthropic.com' : 'https://api.openai.com';
      const upstreamBase = (process.env.CHILLREWIND_UPSTREAM || defaultUpstream).replace(/\/+$/, '');
      const targetUrl = `${upstreamBase}${url.pathname}`;

      const outHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (req.headers.authorization) outHeaders.Authorization = req.headers.authorization;
      if (req.headers['x-api-key']) outHeaders['x-api-key'] = String(req.headers['x-api-key']);
      if (req.headers['anthropic-version']) outHeaders['anthropic-version'] = String(req.headers['anthropic-version']);

      try {
        const upstreamRes = await fetch(targetUrl, {
          method: 'POST',
          headers: outHeaders,
          body: JSON.stringify(cleanedPayload)
        });

        const latencyMs = Date.now() - startTime;

        if (parsedReq.stream && upstreamRes.ok && upstreamRes.body) {
          res.writeHead(upstreamRes.status, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'X-ChillRewind': 'LIVE-STREAM'
          });

          const reader = upstreamRes.body.getReader();
          const decoder = new TextDecoder();
          let rawSSEBuffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunkStr = decoder.decode(value, { stream: true });
            rawSSEBuffer += chunkStr;
            res.write(chunkStr);
          }
          res.end();

          const assembled = reassembleSSEStream(rawSSEBuffer, model, isAnthropic);
          const tokensIn = assembled?.usage?.prompt_tokens || assembled?.usage?.input_tokens || 120;
          const tokensOut = assembled?.usage?.completion_tokens || assembled?.usage?.output_tokens || 60;

          recordStep({
            session_id: sessionId,
            step_idx: stepIdx,
            hash,
            model,
            req_json: JSON.stringify(cleanedPayload),
            res_json: JSON.stringify(assembled),
            tokens_in: tokensIn,
            tokens_out: tokensOut,
            pruned_bytes: prunedBytes,
            latency_ms: latencyMs,
            replayed: 0
          });

          broadcastEvent(
            {
              type: 'step_complete',
              sessionId,
              stepIdx,
              model,
              latencyMs,
              prunedBytes,
              tokensIn,
              tokensOut,
              detail: `Recorded streamed step (${latencyMs}ms)`,
              timestamp: Date.now()
            },
            onLocalEvent
          );
          return;
        }

        const resText = await upstreamRes.text();
        res.writeHead(upstreamRes.status, {
          'Content-Type': 'application/json',
          'X-ChillRewind': 'LIVE'
        });
        res.end(resText);

        if (upstreamRes.ok) {
          const parsedRes = JSON.parse(resText);
          const tokensIn = parsedRes?.usage?.prompt_tokens || parsedRes?.usage?.input_tokens || 100;
          const tokensOut = parsedRes?.usage?.completion_tokens || parsedRes?.usage?.output_tokens || 50;

          recordStep({
            session_id: sessionId,
            step_idx: stepIdx,
            hash,
            model,
            req_json: JSON.stringify(cleanedPayload),
            res_json: resText,
            tokens_in: tokensIn,
            tokens_out: tokensOut,
            pruned_bytes: prunedBytes,
            latency_ms: latencyMs,
            replayed: 0
          });

          broadcastEvent(
            {
              type: 'step_complete',
              sessionId,
              stepIdx,
              model,
              latencyMs,
              prunedBytes,
              tokensIn,
              tokensOut,
              detail: `Recorded live step (${latencyMs}ms)`,
              timestamp: Date.now()
            },
            onLocalEvent
          );
        }
      } catch (err: any) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `ChillRewind upstream error: ${err?.message || err}` }));
      }
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
