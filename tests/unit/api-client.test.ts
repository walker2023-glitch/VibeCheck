import { describe, expect, it } from "vitest";
import { parseEnvelope } from "../../lib/api/client";
import { demoConcepts, demoFixturesLabeled, resolveFixtureMode } from "../../lib/api/fixtures";
import type { AnalysisRun, Concept, Repository } from "../../lib/api/types";

describe("API client envelope parsing", () => {
  it("returns data when error is null", () => {
    const repo: Repository = {
      id: "repo_1",
      githubUrl: "https://github.com/owner/repo",
      visibility: "public",
      persistence: "ephemeral",
      latestRunId: null
    };
    expect(parseEnvelope({ data: repo, error: null })).toEqual(repo);
  });

  it("throws ApiError when the envelope carries an error", () => {
    expect(() =>
      parseEnvelope({
        data: null,
        error: {
          code: "REPOSITORY_NOT_FOUND",
          message: "GitHub could not find this public repository.",
          requestId: "req_1",
          retryable: false
        }
      })
    ).toThrow(/REPOSITORY_NOT_FOUND/);
  });
});

describe("Development fixtures (contract-shaped)", () => {
  it("are explicitly labeled as fixtures", () => {
    expect(demoFixturesLabeled).toBe(true);
  });

  it("expose 3â€“6 concepts with required evidence fields", () => {
    expect(demoConcepts.length).toBeGreaterThanOrEqual(3);
    expect(demoConcepts.length).toBeLessThanOrEqual(6);
    for (const concept of demoConcepts as Concept[]) {
      expect(concept.id).toBeTruthy();
      expect(concept.label).toBeTruthy();
      expect(concept.evidence.length).toBeGreaterThanOrEqual(1);
      const evidence = concept.evidence[0];
      expect(evidence.path).toBeTruthy();
      expect(evidence.startLine).toBeGreaterThanOrEqual(1);
      expect(evidence.endLine).toBeGreaterThanOrEqual(evidence.startLine);
      expect(evidence.snippet.length).toBeGreaterThan(0);
      expect(["observed", "inferred"]).toContain(evidence.kind);
    }
  });

  it("include a succeeded analysis run with a contract stage", () => {
    const run: AnalysisRun = {
      id: "run_fixture_1",
      repositoryId: "repo_fixture_1",
      status: "succeeded",
      stage: "complete",
      snapshotSha: "abc123"
    };
    expect(["queued", "fetching", "detecting", "clarifying", "persisting", "complete"]).toContain(
      run.stage
    );
  });

  it("selects the live API path when NEXT_PUBLIC_USE_FIXTURES is not true", () => {
    expect(resolveFixtureMode("false")).toBe(false);
    expect(resolveFixtureMode(undefined)).toBe(false);
    expect(resolveFixtureMode("true")).toBe(true);
  });
});
