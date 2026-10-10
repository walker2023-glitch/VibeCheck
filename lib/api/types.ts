/** Hand-typed shapes from docs/contracts/openapi-v1.yaml (frozen). Do not invent fields. */

export type ApiErrorBody = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
};

export type Envelope<T> = {
  data: T | null;
  error: ApiErrorBody | null;
};

export type Evidence = {
  id: string;
  commitSha: string;
  path: string;
  startLine: number;
  endLine: number;
  language: string;
  kind: "observed" | "inferred";
  snippet: string;
  snippetTruncated: boolean;
};

export type Claim = {
  kind: "observed" | "inferred";
  text: string;
  evidenceRefs: Evidence[];
};

export type Repository = {
  id: string;
  githubUrl: string;
  visibility: "public" | "private";
  persistence: "ephemeral" | "account";
  latestRunId: string | null;
};

export type AnalysisRunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";
export type AnalysisStage =
  | "queued"
  | "fetching"
  | "detecting"
  | "clarifying"
  | "persisting"
  | "complete";

export type AnalysisRun = {
  id: string;
  repositoryId: string;
  status: AnalysisRunStatus;
  stage: AnalysisStage;
  snapshotSha: string;
  progress?: number;
  partial?: boolean;
  skippedFiles?: number;
  errorCode?: string | null;
};

export type Concept = {
  id: string;
  label: string;
  evidence: Evidence[];
};

export type AssessmentOption = {
  id: string;
  text: string;
};

export type AssessmentItem = {
  id: string;
  conceptId: string;
  type: "multiple_choice" | "written";
  question: string;
  options?: AssessmentOption[];
  evidence: Evidence[];
};

export type Assessment = {
  id: string;
  runId: string;
  items: AssessmentItem[];
};

export type AiAssistance = "yes" | "no" | "prefer_not_to_say";

export type Attempt = {
  id: string;
  itemId: string;
  outcome: "correct" | "partial" | "incorrect";
  aiAssistance: AiAssistance;
  practiceOnly: boolean;
  gradingLabel: "Deterministically graded" | "AI-graded, reviewable";
  feedback: string;
  misconception: string | null;
  evidence?: Evidence[];
  followUpQuestion?: string;
};

export type SessionConceptResult = {
  conceptId: string;
  status: "demonstrated" | "unverified";
  independentOutcome: "correct" | "incorrect" | null;
  assistedOutcome: "correct" | "incorrect" | null;
  practiceOnly: boolean;
  evidence: Evidence[];
};

export type SessionCompletion = {
  assessmentId: string;
  completed: boolean;
  itemCount: number;
  attemptedItemCount: number;
  concepts: SessionConceptResult[];
  expiresAt?: string | null;
};

export type Explanation = {
  summary: string;
  claims: Claim[];
  alternative?: string;
};

export type ConceptPage = {
  items: Concept[];
  nextCursor: string | null;
};
