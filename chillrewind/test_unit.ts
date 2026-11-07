// test_unit.ts - Direct Unit Testing for db.ts and sieve.ts
import assert from 'node:assert';
import { canonicalHash, createSession, recordStep, resolveStep, getSessionTimeline, forkSession } from './src/db.ts';
import { applySlopSieve, buildCircuitBreakerResponse } from './src/sieve.ts';

console.log('[Unit Test] Verifying Canonical Hashing...');
const payloadA = { model: 'gpt-4o', messages: [{ role: 'user', content: 'hello' }], stream: true };
const payloadB = { stream: false, messages: [{ role: 'user', content: 'hello' }], model: 'gpt-4o' };
assert.strictEqual(canonicalHash(payloadA), canonicalHash(payloadB), 'Canonical hashes must match regardless of key order or volatile fields');

console.log('[Unit Test] Verifying SlopSieve Middle-Out Pruning...');
const hugeMessage = 'X'.repeat(2500);
const messages = [
  { role: 'tool', content: hugeMessage },
  { role: 'user', content: 'turn 1' },
  { role: 'assistant', content: 'turn 2' },
  { role: 'user', content: 'turn 3' },
  { role: 'assistant', content: 'turn 4' },
  { role: 'user', content: 'turn 5' }
];
const sieveRes = applySlopSieve({ messages }, []);
assert.ok(sieveRes.prunedBytes > 1000, `Expected >1000 bytes pruned, got ${sieveRes.prunedBytes}`);
assert.ok(sieveRes.cleanedPayload.messages[0].content.includes('ChillRewind SlopSieve pruned'), 'Marker text missing');

console.log('[Unit Test] Verifying Circuit Breaker Trip...');
const fakeToolStep = {
  id: 1,
  session_id: 'test_sess',
  step_idx: 1,
  hash: 'h1',
  model: 'gpt-4o',
  req_json: '{}',
  res_json: JSON.stringify({
    choices: [{ message: { tool_calls: [{ function: { name: 'bash', arguments: '{"cmd":"ls"}' } }] } }]
  }),
  tokens_in: 10,
  tokens_out: 10,
  pruned_bytes: 0,
  latency_ms: 5,
  replayed: 0,
  created_at: Date.now()
};

const loopHistory = [fakeToolStep, { ...fakeToolStep, step_idx: 2 }, { ...fakeToolStep, step_idx: 3 }];
const loopSieve = applySlopSieve({ messages: [{ role: 'user', content: 'go' }] }, loopHistory);
assert.strictEqual(loopSieve.blockedByLoop, true, 'Circuit breaker should have triggered on 3 consecutive identical tool calls');
assert.strictEqual(loopSieve.loopSignature, 'bash');

console.log('[Unit Test] Verifying SQLite DAG Branching & Replay...');
const rootId = `ses_test_root_${Date.now()}`;
createSession(rootId, 'test-command');
recordStep({
  session_id: rootId,
  step_idx: 0,
  hash: canonicalHash({ step: 0 }),
  model: 'gpt-4o',
  req_json: JSON.stringify({ step: 0 }),
  res_json: JSON.stringify({ result: 'initial' }),
  tokens_in: 50,
  tokens_out: 50,
  pruned_bytes: 0,
  latency_ms: 120,
  replayed: 0
});

const forkedId = forkSession(rootId, 0, JSON.stringify({ result: 'mutated' }));
const resolved = resolveStep(forkedId, 0, canonicalHash({ step: 0 }));
assert.ok(resolved, 'Forked step should be resolvable');
assert.strictEqual(resolved?.replayed, 2, 'Fork step should have replayed status 2 (mock override)');

console.log('✓ All Unit & DAG Integrity Tests Passed Cleanly!');
