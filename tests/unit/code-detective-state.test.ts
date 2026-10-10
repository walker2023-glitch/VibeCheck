import { describe, expect, it } from "vitest";
import type { Evidence } from "../../lib/api/types";
import {
  CODE_DETECTIVE_EMPTY_MESSAGE,
  getCodeDetectiveViewState
} from "../../lib/code-detective-state";

const sampleEvidence: Evidence = {
  id: "ev_1",
  commitSha: "abc1234",
  path: "src/app.ts",
  startLine: 10,
  endLine: 18,
  language: "typescript",
  kind: "observed",
  snippet: "export function demo() {\n  return true;\n}",
  snippetTruncated: false
};

describe("Code Detective evidence vs empty-state exclusivity (UI-CD)", () => {
  it("is empty when runId is missing even if session evidence exists", () => {
    expect(
      getCodeDetectiveViewState({ runId: null, evidence: sampleEvidence })
    ).toBe("empty");
  });

  it("is empty when evidence is missing even if a runId is present", () => {
    expect(getCodeDetectiveViewState({ runId: "run_1", evidence: null })).toBe(
      "empty"
    );
  });

  it("is ready only when both runId and evidence are valid", () => {
    expect(
      getCodeDetectiveViewState({ runId: "run_1", evidence: sampleEvidence })
    ).toBe("ready");
  });

  it("keeps the empty-state copy distinct for the empty branch", () => {
    expect(CODE_DETECTIVE_EMPTY_MESSAGE).toMatch(/Analyze a public repository/i);
    expect(CODE_DETECTIVE_EMPTY_MESSAGE).not.toMatch(/What this code does/i);
  });
});
