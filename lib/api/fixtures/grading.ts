/**
 * DEVELOPMENT-ONLY fixture grading keys.
 * Imported dynamically from the API client only while fixture mode is active.
 * Must not be statically imported by client components — keeps keys out of the
 * production browser graph when NEXT_PUBLIC_USE_FIXTURES=false.
 */
import type { Attempt } from "../types";
import { demoAssessment } from "./index";

/** Fixture answer keys — never part of live API assessment payloads. */
const FIXTURE_CORRECT: Record<string, string> = {
  item_1: "opt_b",
  item_2: "opt_a"
};

export function gradeFixtureAttempt(
  itemId: string,
  answer: string,
  aiAssistance: "yes" | "no" | "prefer_not_to_say"
): Attempt {
  const correct = FIXTURE_CORRECT[itemId] === answer;
  const practiceOnly = aiAssistance === "prefer_not_to_say";
  const item = demoAssessment.items.find((i) => i.id === itemId);
  return {
    id: `attempt_${itemId}_${Date.now()}`,
    itemId,
    outcome: correct ? "correct" : "incorrect",
    aiAssistance,
    practiceOnly,
    gradingLabel: "Deterministically graded",
    feedback: correct
      ? itemId === "item_1"
        ? "Yes — the code checks response.ok and throws before parsing JSON, so failures stay explicit."
        : "Yes — the updater form setCount(current => current + 1) reads the latest value without listing count as a dependency."
      : itemId === "item_1"
        ? "Look again at the if (!response.ok) branch: it throws before response.json() runs."
        : "Look at the empty dependency array together with the functional updater — that combination keeps increment stable without freezing an old count.",
    misconception: correct
      ? null
      : "Mixing HTTP success checks with parsing, or confusing callback identity with stale state.",
    evidence: item?.evidence ?? [],
    followUpQuestion: "Where else in this repo might the same pattern appear?"
  };
}
