import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), '.chillrewind');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DB_DIR, 'store.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    parent_id TEXT,
    fork_step INTEGER,
    cmd TEXT,
    tokens_saved INTEGER DEFAULT 0,
    tokens_pruned INTEGER DEFAULT 0,
    cost_saved_usd REAL DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    step_idx INTEGER NOT NULL,
    hash TEXT NOT NULL,
    model TEXT,
    req_json TEXT NOT NULL,
    res_json TEXT NOT NULL,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    pruned_bytes INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    replayed INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch())
  );

  CREATE INDEX IF NOT EXISTS idx_lookup ON steps(session_id, step_idx);
  CREATE INDEX IF NOT EXISTS idx_hash ON steps(hash);
`);

export interface SessionRow {
  id: string;
  parent_id: string | null;
  fork_step: number | null;
  cmd: string;
  tokens_saved: number;
  tokens_pruned: number;
  cost_saved_usd: number;
  created_at: number;
  step_count?: number;
}

export interface StepRow {
  id: number;
  session_id: string;
  step_idx: number;
  hash: string;
  model: string;
  req_json: string;
  res_json: string;
  tokens_in: number;
  tokens_out: number;
  pruned_bytes: number;
  latency_ms: number;
  replayed: number;
  created_at: number;
}

const VOLATILE_KEYS = new Set(['stream', 'user', 'timestamp', 'created_at', 'request_id']);

function canonicalize(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(canonicalize);
  if (val && typeof val === 'object') {
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>).sort()) {
      if (!VOLATILE_KEYS.has(k)) {
        sorted[k] = canonicalize((val as Record<string, unknown>)[k]);
      }
    }
    return sorted;
  }
  return val;
}

export function canonicalHash(payload: unknown): string {
  const norm = JSON.stringify(canonicalize(payload));
  return crypto.createHash('sha256').update(norm).digest('hex');
}

export function createSession(id: string, cmd: string, parentId: string | null = null, forkStep: number | null = null): void {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO sessions (id, parent_id, fork_step, cmd) VALUES (?, ?, ?, ?)`
  );
  stmt.run(id, parentId, forkStep, cmd);
}

export function getSession(id: string): SessionRow | undefined {
  return db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id) as SessionRow | undefined;
}

export function listSessions(): SessionRow[] {
  return db.prepare(`
    SELECT s.*, COUNT(st.id) as step_count
    FROM sessions s
    LEFT JOIN steps st ON st.session_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
    LIMIT 100
  `).all() as unknown as SessionRow[];
}

export function resolveStep(sessionId: string, stepIdx: number, hash: string): StepRow | undefined {
  let currId: string | null = sessionId;
  let maxStep = Infinity;

  while (currId) {
    if (stepIdx <= maxStep) {
      const exact = db.prepare(
        `SELECT * FROM steps WHERE session_id = ? AND step_idx = ? ORDER BY id DESC LIMIT 1`
      ).get(currId, stepIdx) as StepRow | undefined;

      if (exact && (exact.hash === hash || exact.replayed === 2)) {
        return exact;
      }
    }
    const sess = getSession(currId);
    if (!sess || !sess.parent_id || sess.fork_step === null) break;
    maxStep = Math.min(maxStep, sess.fork_step);
    currId = sess.parent_id;
  }

  return db.prepare(`SELECT * FROM steps WHERE hash = ? ORDER BY id DESC LIMIT 1`).get(hash) as StepRow | undefined;
}

export function getSessionTimeline(sessionId: string): StepRow[] {
  const lineage: { id: string; maxStep: number }[] = [];
  let currId: string | null = sessionId;
  let bound = Infinity;

  while (currId) {
    lineage.unshift({ id: currId, maxStep: bound });
    const s = getSession(currId);
    if (!s || !s.parent_id || s.fork_step === null) break;
    bound = Math.min(bound, s.fork_step);
    currId = s.parent_id;
  }

  const map = new Map<number, StepRow>();
  for (const node of lineage) {
    const rows = db.prepare(
      `SELECT * FROM steps WHERE session_id = ? AND step_idx <= ? ORDER BY step_idx ASC, id ASC`
    ).all(node.id, node.maxStep) as unknown as StepRow[];
    for (const r of rows) map.set(r.step_idx, r);
  }
  return Array.from(map.values()).sort((a, b) => a.step_idx - b.step_idx);
}

export function recordStep(step: Omit<StepRow, 'id' | 'created_at'>): number {
  const res = db.prepare(`
    INSERT INTO steps (session_id, step_idx, hash, model, req_json, res_json, tokens_in, tokens_out, pruned_bytes, latency_ms, replayed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    step.session_id,
    step.step_idx,
    step.hash,
    step.model,
    step.req_json,
    step.res_json,
    step.tokens_in,
    step.tokens_out,
    step.pruned_bytes,
    step.latency_ms,
    step.replayed
  );

  const estPrunedTokens = Math.floor(step.pruned_bytes / 4);
  if (step.replayed > 0) {
    const savedTokens = step.tokens_in + step.tokens_out + estPrunedTokens;
    const savedUsd = (step.tokens_in * 0.000003) + (step.tokens_out * 0.000015) + (estPrunedTokens * 0.000003);
    db.prepare(`
      UPDATE sessions
      SET tokens_saved = tokens_saved + ?,
          tokens_pruned = tokens_pruned + ?,
          cost_saved_usd = cost_saved_usd + ?
      WHERE id = ?
    `).run(savedTokens, estPrunedTokens, savedUsd, step.session_id);
  } else if (estPrunedTokens > 0) {
    const savedUsd = estPrunedTokens * 0.000003;
    db.prepare(`
      UPDATE sessions
      SET tokens_pruned = tokens_pruned + ?,
          cost_saved_usd = cost_saved_usd + ?
      WHERE id = ?
    `).run(estPrunedTokens, savedUsd, step.session_id);
  }

  return Number(res.lastInsertRowid);
}

export function forkSession(parentSessionId: string, forkStep: number, mockResJson?: string): string {
  const parent = getSession(parentSessionId);
  const newId = `ses_fork_${crypto.randomBytes(4).toString('hex')}`;
  createSession(newId, parent?.cmd || 'forked-session', parentSessionId, forkStep);

  if (mockResJson) {
    const timeline = getSessionTimeline(parentSessionId);
    const target = timeline.find((s) => s.step_idx === forkStep);
    if (target) {
      recordStep({
        session_id: newId,
        step_idx: forkStep,
        hash: target.hash,
        model: target.model,
        req_json: target.req_json,
        res_json: mockResJson,
        tokens_in: target.tokens_in,
        tokens_out: target.tokens_out,
        pruned_bytes: target.pruned_bytes,
        latency_ms: 0,
        replayed: 2 // 2 = User-mutated deterministic mock override
      });
    }
  }
  return newId;
}
