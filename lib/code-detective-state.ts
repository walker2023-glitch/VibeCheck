import type { Evidence } from "./api/types";

export type CodeDetectiveViewState = "empty" | "ready";

/**
 * Valid Code Detective evidence requires both a run id and concrete evidence.
 * Empty and evidence views are mutually exclusive — never render both.
 */
export function getCodeDetectiveViewState(input: {
  runId: string | null | undefined;
  evidence: Evidence | null | undefined;
}): CodeDetectiveViewState {
  if (!input.runId || !input.evidence) return "empty";
  return "ready";
}

export const CODE_DETECTIVE_EMPTY_MESSAGE =
  "No analysis evidence selected. Analyze a public repository on the homepage first.";
