import { canonicalHash, type StepRow } from './db.ts';

export interface SieveResult {
  cleanedPayload: Record<string, any>;
  prunedBytes: number;
  blockedByLoop: boolean;
  loopSignature?: string;
}

const MAX_TOOL_CHARS = 1500;
const HEAD_CHARS = 500;
const TAIL_CHARS = 300;
const STALE_TURN_THRESHOLD = 4;

function cleanText(text: string): { out: string; saved: number } {
  const before = Buffer.byteLength(text, 'utf8');
  const out = text
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n');
  const after = Buffer.byteLength(out, 'utf8');
  return { out, saved: Math.max(0, before - after) };
}

function pruneStaleContent(text: string): { out: string; saved: number } {
  if (text.length <= MAX_TOOL_CHARS) return cleanText(text);
  const before = Buffer.byteLength(text, 'utf8');
  const head = text.slice(0, HEAD_CHARS);
  const tail = text.slice(-TAIL_CHARS);
  const removedBytes = before - Buffer.byteLength(head + tail, 'utf8');
  const out = `${head}\n\n/* [ChillRewind SlopSieve pruned ${removedBytes} bytes of stale output] */\n\n${tail}`;
  return { out, saved: Math.max(0, before - Buffer.byteLength(out, 'utf8')) };
}

function extractToolSignatures(resObj: any): string[] {
  const sigs: string[] = [];
  // OpenAI format
  const choices = resObj?.choices;
  if (Array.isArray(choices)) {
    for (const c of choices) {
      const tcs = c?.message?.tool_calls;
      if (Array.isArray(tcs)) {
        for (const tc of tcs) {
          const name = tc?.function?.name || 'unknown';
          const args = tc?.function?.arguments || '{}';
          sigs.push(`${name}:${canonicalHash(args)}`);
        }
      }
    }
  }
  // Anthropic format
  if (Array.isArray(resObj?.content)) {
    for (const block of resObj.content) {
      if (block?.type === 'tool_use') {
        sigs.push(`${block.name}:${canonicalHash(block.input || {})}`);
      }
    }
  }
  return sigs;
}

export function applySlopSieve(rawPayload: Record<string, any>, history: StepRow[]): SieveResult {
  const payload = structuredClone(rawPayload);
  let prunedBytes = 0;

  if (Array.isArray(payload.messages)) {
    const total = payload.messages.length;
    for (let i = 0; i < total; i++) {
      const msg = payload.messages[i];
      const isStale = i < total - STALE_TURN_THRESHOLD;

      if (typeof msg.content === 'string') {
        const res = isStale && msg.role === 'tool'
          ? pruneStaleContent(msg.content)
          : cleanText(msg.content);
        msg.content = res.out;
        prunedBytes += res.saved;
      } else if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part?.type === 'text' && typeof part.text === 'string') {
            const res = cleanText(part.text);
            part.text = res.out;
            prunedBytes += res.saved;
          } else if (part?.type === 'tool_result' && typeof part.content === 'string' && isStale) {
            const res = pruneStaleContent(part.content);
            part.content = res.out;
            prunedBytes += res.saved;
          }
        }
      }
    }
  }

  // Loop Circuit Breaker: Check if last 3 steps invoked the exact same tool + arguments
  let blockedByLoop = false;
  let loopSignature: string | undefined;

  if (history.length >= 3) {
    const recentThree = history.slice(-3);
    const sigLists = recentThree.map((s) => {
      try {
        return extractToolSignatures(JSON.parse(s.res_json));
      } catch {
        return [];
      }
    });

    if (
      sigLists.every((l) => l.length > 0) &&
      sigLists[0][0] === sigLists[1][0] &&
      sigLists[1][0] === sigLists[2][0]
    ) {
      blockedByLoop = true;
      loopSignature = sigLists[0][0].split(':')[0];
    }
  }

  return { cleanedPayload: payload, prunedBytes, blockedByLoop, loopSignature };
}

export function buildCircuitBreakerResponse(isAnthropic: boolean, model: string, toolName = 'tool'): Record<string, any> {
  const warning = `⚡ [ChillRewind Circuit Breaker]: Identical tool call '${toolName}' was repeated 3 times consecutively with identical arguments. Upstream API call blocked to prevent infinite token burn. Please mutate your parameters or adopt a different strategy.`;
  if (isAnthropic) {
    return {
      id: `msg_cb_${Date.now()}`,
      type: 'message',
      role: 'assistant',
      model,
      content: [{ type: 'text', text: warning }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 0, output_tokens: 0 }
    };
  }
  return {
    id: `chatcmpl_cb_${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: warning },
        finish_reason: 'stop'
      }
    ],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };
}
