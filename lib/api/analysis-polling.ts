/**
 * Analysis run poll timing.
 * Live mode allows ~60s of backend work at ~1s intervals.
 * Fixture mode stays short so unit/e2e journeys remain fast.
 */
export type AnalysisPollPlan = {
  maxAttempts: number;
  intervalMs: number;
  /** Soft ceiling for documentation/tests (attempts * interval). */
  maxDurationMs: number;
};

export function getAnalysisPollPlan(fixtureMode: boolean): AnalysisPollPlan {
  if (fixtureMode) {
    // Fixture status advances each poll; a handful of quick polls is enough.
    return { maxAttempts: 10, intervalMs: 50, maxDurationMs: 500 };
  }
  return { maxAttempts: 60, intervalMs: 1000, maxDurationMs: 60_000 };
}
