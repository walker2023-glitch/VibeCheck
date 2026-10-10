import { describe, expect, it } from "vitest";
import { createAssessment, gradeAttempt, getCompletion, publicAssessment } from "../../server/assessment/knowledge-check";
import type { Concept } from "../../server/analysis/concepts";

const evidence = { id: "e1", commitSha: "a".repeat(40), path: "src/app.ts", startLine: 4, endLine: 4, language: "typescript", kind: "observed" as const, snippet: "return await fetch('/api');", snippetTruncated: false };
const concepts: Concept[] = [
  { id: "async-await", label: "Async and await", evidence: [evidence] },
  { id: "fetch-api", label: "API calls with fetch", evidence: [{ ...evidence, id: "e2" }] },
  { id: "modules", label: "Imports and modules", evidence: [{ ...evidence, id: "e3", startLine: 1, endLine: 1, snippet: "import { x } from './x'" }] },
];

describe("FR-7 FR-10 AC-KC-01 Knowledge Check", () => {
  it("creates two evidence-grounded multiple-choice items without exposing keys", () => {
    const assessment = createAssessment("run1", concepts, ["async-await", "fetch-api"]);
    const visible = publicAssessment(assessment);
    expect(visible.items).toHaveLength(2);
    expect(visible.items.every((item) => item.type === "multiple_choice" && item.options.length >= 3 && item.evidence.length > 0)).toBe(true);
    expect(JSON.stringify(visible)).not.toMatch(/correctAnswer|correctOption|misconception|explanation|answerKey/);
    expect(visible.items[0].question).toContain("src/app.ts");
  });

  it("grades choices deterministically and explains a misconception with file and line evidence", () => {
    const assessment = createAssessment("run1", concepts, ["async-await", "fetch-api"]);
    const item = assessment.items[0];
    const wrong = item.options.find((option) => option.id !== item.correctOptionId)!;
    const attempt = gradeAttempt(item, wrong.id, "no");
    expect(attempt.outcome).toBe("incorrect");
    expect(attempt.feedback).toContain("src/app.ts:4");
    expect(attempt.misconception).toBeTruthy();
    expect(attempt.evidence).toEqual(item.evidence);
    expect(gradeAttempt(item, item.correctOptionId, "yes").outcome).toBe("correct");
  });

  it("names the mistaken belief before explaining the actual async behavior", () => {
    const assessment = createAssessment("run1", concepts, ["async-await", "fetch-api"]);
    const item = assessment.items.find((entry) => entry.conceptId === "async-await")!;
    const wrong = item.options.find((option) => option.text.includes("synchronously"))!;
    const attempt = gradeAttempt(item, wrong.id, "no");
    expect(attempt.misconception).toContain("whole JavaScript runtime");
    expect(attempt.feedback).toContain("An async function returns a Promise");
  });

  it("rejects an unknown option and never uses arbitrary code execution", () => {
    const assessment = createAssessment("run1", concepts, ["async-await", "fetch-api"]);
    expect(() => gradeAttempt(assessment.items[0], "process.exit(1)", "no")).toThrow();
  });

  it("does not demonstrate repository evidence without a graded correct attempt", () => {
    const assessment = createAssessment("run1", concepts, ["async-await", "fetch-api"]);
    const empty = getCompletion(assessment, concepts, [], "2099-01-01T00:00:00.000Z");
    expect(empty.completed).toBe(false);
    expect(empty.concepts.every((concept) => concept.status === "unverified")).toBe(true);

    const first = assessment.items[0];
    const second = assessment.items[1];
    const attempts = [
      gradeAttempt(first, first.correctOptionId, "no"),
      gradeAttempt(second, second.correctOptionId, "prefer_not_to_say"),
    ];
    const completion = getCompletion(assessment, concepts, attempts, "2099-01-01T00:00:00.000Z");
    expect(completion.completed).toBe(false);
    expect(completion.concepts.find((concept) => concept.conceptId === first.conceptId)).toMatchObject({ status: "demonstrated", independentOutcome: "correct" });
    expect(completion.concepts.find((concept) => concept.conceptId === second.conceptId)).toMatchObject({ status: "unverified", practiceOnly: true });
    expect(completion.concepts.find((concept) => concept.conceptId === "modules")?.status).toBe("unverified");
  });
});
