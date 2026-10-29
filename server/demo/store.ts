import { createHash, randomUUID } from "node:crypto";
import type { Concept } from "../analysis/concepts";
import type { StoredAssessment, StoredAttempt } from "../assessment/knowledge-check";
import { GithubError, retrievePublicSource } from "../github/public-repository";

export const GUEST_TTL_MS = 2 * 60 * 60 * 1_000;
export type RepositoryRecord = { id: string; githubUrl: string; visibility: "public"; persistence: "ephemeral"; latestRunId: string | null; consent: boolean };
export type RunRecord = {
  id: string; repositoryId: string; status: "queued" | "running" | "succeeded" | "failed";
  stage: "queued" | "fetching" | "detecting" | "complete"; snapshotSha: string;
  progress: number; partial: boolean; skippedFiles: number; errorCode: string | null; concepts: Concept[];
};
type StoredAssessmentRecord = { assessment: StoredAssessment; runId: string; attempts: StoredAttempt[] };
type IdempotencyRecord = { digest: string; value: unknown };
export type GuestSession = {
  id: string; expiresAt: number; repositories: Map<string, RepositoryRecord>; runs: Map<string, RunRecord>;
  assessments: Map<string, StoredAssessmentRecord>; idempotency: Map<string, IdempotencyRecord>;
  usage: Map<string, { count: number; resetAt: number }>;
};

const globalState = globalThis as typeof globalThis & { __vibecheckDemoSessions?: Map<string, GuestSession> };
const sessions = globalState.__vibecheckDemoSessions ??= new Map<string, GuestSession>();

const PUBLIC_SOURCE_CACHE_TTL_MS = 10 * 60 * 1_000;
const PUBLIC_SOURCE_CACHE_MAX_ENTRIES = 50;
type PublicSourceSnapshot = Awaited<ReturnType<typeof retrievePublicSource>>;
type CachedSource = { expiresAt: number; value: Promise<PublicSourceSnapshot> };
const sourceState = globalThis as typeof globalThis & {
  __vibecheckPublicSourceCache?: Map<string, CachedSource>;
};
const sourceCache = sourceState.__vibecheckPublicSourceCache ??= new Map<string, CachedSource>();

function prepareSourceCache(now: number): void {
  for (const [key, entry] of sourceCache) {
    if (entry.expiresAt <= now) sourceCache.delete(key);
  }
  while (sourceCache.size >= PUBLIC_SOURCE_CACHE_MAX_ENTRIES) {
    const oldestKey = sourceCache.keys().next().value;
    if (oldestKey === undefined) break;
    sourceCache.delete(oldestKey);
  }
}

async function retrieveCachedSource(githubUrl: string): Promise<PublicSourceSnapshot> {
  const now = Date.now();
  const cached = sourceCache.get(githubUrl);
  if (cached && cached.expiresAt > now) {
    // Refresh insertion order so eviction approximates least-recently-used.
    sourceCache.delete(githubUrl);
    sourceCache.set(githubUrl, cached);
    return cached.value;
  }
  if (cached) sourceCache.delete(githubUrl);

  prepareSourceCache(now);
  const value = retrievePublicSource(githubUrl);
  const entry = { expiresAt: now + PUBLIC_SOURCE_CACHE_TTL_MS, value };
  sourceCache.set(githubUrl, entry);
  try {
    return await value;
  } catch (error) {
    // A newer request may have replaced this entry while the fetch was pending.
    if (sourceCache.get(githubUrl) === entry) sourceCache.delete(githubUrl);
    throw error;
  }
}

export function newGuestSession(): GuestSession {
  for (const [id, existing] of sessions) if (existing.expiresAt <= Date.now()) sessions.delete(id);
  if (sessions.size >= 500) throw new Error("RATE_LIMITED");
  const session: GuestSession = {
    id: randomUUID(), expiresAt: Date.now() + GUEST_TTL_MS, repositories: new Map(), runs: new Map(),
    assessments: new Map(), idempotency: new Map(), usage: new Map(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getGuestSession(id: string | undefined): GuestSession | null {
  if (!id) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) { sessions.delete(id); return null; }
  return session;
}

export function getOwnedRepository(session: GuestSession, id: string): RepositoryRecord | null { return session.repositories.get(id) ?? null; }
export function getOwnedRun(session: GuestSession, id: string): RunRecord | null { return session.runs.get(id) ?? null; }
export function getOwnedAssessment(session: GuestSession, id: string): StoredAssessmentRecord | null { return session.assessments.get(id) ?? null; }

export function idempotent<T>(session: GuestSession, operation: string, key: string, payload: unknown, action: () => T): T {
  const ledgerKey = `${operation}:${key}`;
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const existing = session.idempotency.get(ledgerKey);
  if (existing) {
    if (existing.digest !== digest) throw new Error("IDEMPOTENCY_CONFLICT");
    return existing.value as T;
  }
  const value = action();
  session.idempotency.set(ledgerKey, { digest, value });
  return value;
}

export async function idempotentAsync<T>(session: GuestSession, operation: string, key: string, payload: unknown, action: () => Promise<T>): Promise<T> {
  const ledgerKey = `${operation}:${key}`;
  const digest = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const existing = session.idempotency.get(ledgerKey);
  if (existing) {
    if (existing.digest !== digest) throw new Error("IDEMPOTENCY_CONFLICT");
    return await existing.value as T;
  }
  const pending = Promise.resolve().then(action);
  session.idempotency.set(ledgerKey, { digest, value: pending });
  try {
    const value = await pending;
    session.idempotency.set(ledgerKey, { digest, value });
    return value;
  } catch (error) {
    session.idempotency.delete(ledgerKey);
    throw error;
  }
}

export function consumeBudget(session: GuestSession, operation: string, limit: number): void {
  const now = Date.now();
  const current = session.usage.get(operation);
  if (!current || current.resetAt <= now) { session.usage.set(operation, { count: 1, resetAt: now + 60 * 60 * 1_000 }); return; }
  if (current.count >= limit) throw new Error("RATE_LIMITED");
  current.count++;
}

export function createRepository(session: GuestSession, githubUrl: string): RepositoryRecord {
  const existing = [...session.repositories.values()].find((repo) => repo.githubUrl === githubUrl);
  if (existing) return existing;
  const repo: RepositoryRecord = { id: randomUUID(), githubUrl, visibility: "public", persistence: "ephemeral", latestRunId: null, consent: false };
  session.repositories.set(repo.id, repo);
  return repo;
}

export function createRun(session: GuestSession, repository: RepositoryRecord): RunRecord {
  const active = repository.latestRunId ? session.runs.get(repository.latestRunId) : null;
  if (active && (active.status === "queued" || active.status === "running")) return active;
  const activeCount = [...sessions.values()].reduce((count, guest) => count + [...guest.runs.values()].filter((item) => item.status === "queued" || item.status === "running").length, 0);
  if (activeCount >= 2) throw new Error("RATE_LIMITED");
  const run: RunRecord = {
    id: randomUUID(), repositoryId: repository.id, status: "queued", stage: "queued", snapshotSha: "",
    progress: 0, partial: false, skippedFiles: 0, errorCode: null, concepts: [],
  };
  session.runs.set(run.id, run);
  repository.latestRunId = run.id;
  return run;
}

export function publicRepository(repository: RepositoryRecord) {
  const { id, githubUrl, visibility, persistence, latestRunId } = repository;
  return { id, githubUrl, visibility, persistence, latestRunId };
}

export function publicRun(run: RunRecord) {
  const { id, repositoryId, status, stage, snapshotSha, progress, partial, skippedFiles, errorCode } = run;
  return { id, repositoryId, status, stage, snapshotSha, progress, partial, skippedFiles, errorCode };
}

export async function analyzeRun(session: GuestSession, run: RunRecord): Promise<void> {
  const repository = session.repositories.get(run.repositoryId);
  if (!repository) return;
  run.status = "running"; run.stage = "fetching"; run.progress = 10;
  try {
    const snapshot = await retrieveCachedSource(repository.githubUrl);
    if (!getGuestSession(session.id)) return;
    run.snapshotSha = snapshot.commitSha;
    run.skippedFiles = snapshot.skippedFiles;
    run.partial = snapshot.partial;
    run.stage = "detecting"; run.progress = 80;
    const { analyzeSources } = await import("../analysis/concepts");
    run.concepts = analyzeSources(snapshot.files);
    run.status = "succeeded"; run.stage = "complete"; run.progress = 100;
  } catch (error) {
    run.status = "failed"; run.stage = "complete"; run.progress = 100;
    run.errorCode = error instanceof GithubError ? error.code : "ANALYSIS_FAILED";
  }
}

export function saveAssessment(session: GuestSession, assessment: StoredAssessment): StoredAssessmentRecord {
  const record = { assessment, runId: assessment.runId, attempts: [] as StoredAttempt[] };
  session.assessments.set(assessment.id, record);
  return record;
}
