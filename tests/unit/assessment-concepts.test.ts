import { describe, expect, it } from "vitest";
import { buildAssessmentConceptIds } from "../../lib/assessment-concepts";

const concepts = [
  { id: "concept_a" },
  { id: "concept_b" },
  { id: "concept_c" },
  { id: "concept_d" }
];

describe("buildAssessmentConceptIds", () => {
  it("puts an inspected concept beyond index 1 first without duplicating it", () => {
    const ids = buildAssessmentConceptIds(concepts, "concept_c");
    expect(ids[0]).toBe("concept_c");
    expect(ids).toEqual(["concept_c", "concept_a"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("falls back to the first repository concept when none is selected", () => {
    expect(buildAssessmentConceptIds(concepts, undefined)).toEqual([
      "concept_a",
      "concept_b"
    ]);
  });
});
