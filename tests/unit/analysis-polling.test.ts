import { describe, expect, it } from "vitest";
import { getAnalysisPollPlan } from "../../lib/api/analysis-polling";

describe("analysis poll plan", () => {
  it("keeps fixture polling short for fast tests", () => {
    const plan = getAnalysisPollPlan(true);
    expect(plan.maxDurationMs).toBeLessThanOrEqual(2_000);
    expect(plan.intervalMs).toBeLessThanOrEqual(100);
    expect(plan.maxAttempts).toBeGreaterThanOrEqual(5);
  });

  it("allows approximately 60 seconds for live analysis at ~1s intervals", () => {
    const plan = getAnalysisPollPlan(false);
    expect(plan.intervalMs).toBe(1_000);
    expect(plan.maxAttempts).toBe(60);
    expect(plan.maxDurationMs).toBe(60_000);
  });
});
