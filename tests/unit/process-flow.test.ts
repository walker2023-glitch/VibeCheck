import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { analysisStageToProcessIndex } from "../../components/home/ProcessFlowVisualization";

describe("Homepage process visualization", () => {
  it("maps real analysis stages to conceptual process steps", () => {
    expect(analysisStageToProcessIndex("validating")).toBe(0);
    expect(analysisStageToProcessIndex("reading")).toBe(1);
    expect(analysisStageToProcessIndex("inspecting")).toBe(2);
    expect(analysisStageToProcessIndex("finding")).toBe(3);
  });

  it("includes a reduced-motion static equivalent in the component source", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/ProcessFlowVisualization.tsx"),
      "utf8"
    );
    expect(source).toContain("prefers-reduced-motion");
    expect(source).toContain("Conceptual flow:");
    expect(source).toContain("data-reduced-motion");
  });
});
