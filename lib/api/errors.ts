import type { ApiErrorBody } from "./types";

export class ApiError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(body: ApiErrorBody) {
    super(`${body.code}: ${body.message}`);
    this.name = "ApiError";
    this.code = body.code;
    this.requestId = body.requestId;
    this.retryable = body.retryable;
  }
}

/** User-facing copy mapped from docs/contracts/errors.md — no internal codes in UI. */
export function userMessageForError(error: ApiError | { code: string; message: string }): string {
  switch (error.code) {
    case "REPOSITORY_NOT_FOUND":
      return "GitHub could not find this public repository. Check the URL and try again.";
    case "REPOSITORY_INACCESSIBLE":
      return "This repository isn't available for guest analysis. Private repos need a later signed-in authorization.";
    case "GITHUB_RATE_LIMITED":
      return "GitHub is rate-limiting requests right now. Wait a moment and try again.";
    case "GITHUB_UNAVAILABLE":
      return "GitHub couldn't be reached. Try again shortly.";
    case "ANALYSIS_FAILED":
      return "Analysis couldn't finish for this repository. Try again or pick a different public repo.";
    case "INVALID_REQUEST":
      return error.message || "That request wasn't valid. Check the repository URL and try again.";
    case "RATE_LIMITED":
      return "Too many requests. Please wait a moment and try again.";
    case "AI_UNAVAILABLE":
    case "AI_RATE_LIMITED":
      return "The explanation service is temporarily unavailable. Try again in a moment.";
    case "ASSESSMENT_UNAVAILABLE":
      return "A knowledge check isn't available for this analysis yet.";
    case "RESOURCE_NOT_FOUND":
      return "That session resource is no longer available. Start a new analysis from the homepage.";
    default:
      return error.message || "Something went wrong. Please try again.";
  }
}

export function analysisUiStage(
  stage: string,
  status: string
): "validating" | "reading" | "inspecting" | "finding" | "success" | "failed" {
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "succeeded" || stage === "complete") return "success";
  switch (stage) {
    case "queued":
      return "validating";
    case "fetching":
      return "reading";
    case "detecting":
      return "inspecting";
    case "clarifying":
    case "persisting":
      return "finding";
    default:
      return "validating";
  }
}

export const ANALYSIS_STAGE_LABELS = {
  idle: "Ready when you are",
  validating: "Validating repository…",
  reading: "Reading repository…",
  inspecting: "Inspecting source…",
  finding: "Finding concepts…",
  success: "Analysis complete",
  failed: "Analysis failed",
  invalid: "Invalid repository",
  rateLimited: "GitHub rate limited",
  unavailable: "GitHub unavailable"
} as const;
