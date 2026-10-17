import { ApiError } from "./errors";
import {
  demoAnalysisRun, demoAssessment, demoCompletion, demoConcepts, demoExplanation,
  demoRepository, fixtureStageSequence, isFixtureMode, recordFixtureAttempt, resetFixtureAttempts
} from "./fixtures";
import type {
  AiAssistance, AnalysisRun, Assessment, Attempt, ConceptPage, Envelope,
  Explanation, Repository, SessionCompletion
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api/v1";

export function parseEnvelope<T>(envelope: Envelope<T>): T {
  if (envelope.error) throw new ApiError(envelope.error);
  if (envelope.data === null || envelope.data === undefined) {
    throw new ApiError({ code: "INVALID_REQUEST", message: "Empty response data.", requestId: "client", retryable: false });
  }
  return envelope.data;
}

function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "idem_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}

async function request<T>(path: string, init: RequestInit & { idempotency?: boolean } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (init.idempotency) headers.set("Idempotency-Key", newIdempotencyKey());
  const response = await fetch(API_BASE + path, { ...init, headers, credentials: "include" });
  return parseEnvelope((await response.json()) as Envelope<T>);
}

let fixturePollIndex = 0;

export const api = {
  isFixtureMode,

  async createRepository(githubUrl: string): Promise<Repository> {
    if (isFixtureMode()) {
      resetFixtureAttempts();
      fixturePollIndex = 0;
      return { ...demoRepository, githubUrl, latestRunId: null };
    }
    return request<Repository>("/repositories", { method: "POST", body: JSON.stringify({ githubUrl }), idempotency: true });
  },

  async startAnalysisRun(repositoryId: string): Promise<AnalysisRun> {
    if (isFixtureMode()) {
      fixturePollIndex = 0;
      return { ...fixtureStageSequence[0], repositoryId };
    }
    return request<AnalysisRun>("/repositories/" + repositoryId + "/analysis-runs", { method: "POST", body: JSON.stringify({}), idempotency: true });
  },

  async getAnalysisRun(runId: string): Promise<AnalysisRun> {
    if (isFixtureMode()) {
      const step = fixtureStageSequence[Math.min(fixturePollIndex, fixtureStageSequence.length - 1)];
      fixturePollIndex += 1;
      return { ...step, id: runId };
    }
    return request<AnalysisRun>("/analysis-runs/" + runId);
  },

  async listConcepts(runId: string): Promise<ConceptPage> {
    if (isFixtureMode()) {
      void runId;
      return { items: demoConcepts, nextCursor: null };
    }
    return request<ConceptPage>("/analysis-runs/" + runId + "/concepts");
  },

  async explainCode(runId: string, evidenceId: string): Promise<Explanation> {
    if (isFixtureMode()) {
      void runId; void evidenceId;
      return demoExplanation;
    }
    return request<Explanation>("/code-detective", { method: "POST", body: JSON.stringify({ runId, evidenceId }) });
  },

  async updateAiConsent(repositoryId: string, granted: boolean): Promise<{ granted: boolean; consentVersion: string }> {
    if (isFixtureMode()) {
      void repositoryId;
      return { granted, consentVersion: "demo.v1" };
    }
    return request<{ granted: boolean; consentVersion: string }>("/repositories/" + repositoryId + "/ai-consent", {
      method: "PUT", body: JSON.stringify({ granted, consentVersion: "demo.v1" })
    });
  },

  async askCompanion(page: string, question: string, context?: { runId?: string; evidenceId?: string }): Promise<Explanation> {
    if (isFixtureMode()) {
      return { summary: "VibeCheck helps you understand AI-assisted code. This fixture reply is sample guidance, not a live provider response. (Implemented now.)", claims: [] };
    }
    return request<Explanation>("/companion/messages", {
      method: "POST",
      body: JSON.stringify({ page, question, ...(context?.runId ? { runId: context.runId } : {}), ...(context?.evidenceId ? { evidenceId: context.evidenceId } : {}) }),
      idempotency: true
    });
  },

  async createAssessment(runId: string, conceptIds: string[]): Promise<Assessment> {
    if (isFixtureMode()) return { ...demoAssessment, runId, items: demoAssessment.items.slice(0, 2) };
    return request<Assessment>("/assessments", { method: "POST", body: JSON.stringify({ runId, conceptIds: conceptIds.slice(0, 5) }) });
  },

  async getAssessment(assessmentId: string): Promise<Assessment> {
    if (isFixtureMode()) return { ...demoAssessment, id: assessmentId, items: demoAssessment.items.slice(0, 2) };
    return request<Assessment>("/assessments/" + assessmentId);
  },

  async submitAttempt(assessmentId: string, itemId: string, answer: string, aiAssistance: AiAssistance): Promise<Attempt> {
    if (process.env.NEXT_PUBLIC_USE_FIXTURES === "true") {
      void assessmentId;
      const { gradeFixtureAttempt } = await import("./fixtures/grading");
      const attempt = gradeFixtureAttempt(itemId, answer, aiAssistance);
      recordFixtureAttempt(attempt);
      return attempt;
    }
    return request<Attempt>("/assessments/" + assessmentId + "/attempts", {
      method: "POST", body: JSON.stringify({ itemId, answer, aiAssistance }), idempotency: true
    });
  },

  async getCompletion(assessmentId: string): Promise<SessionCompletion> {
    if (isFixtureMode()) {
      void assessmentId;
      return demoCompletion();
    }
    return request<SessionCompletion>("/assessments/" + assessmentId + "/completion");
  },

  demoSucceededRun(): AnalysisRun {
    return demoAnalysisRun;
  }
};
