import { describe, expect, it } from "vitest";
import { getCompassAnalysisVisual } from "../../lib/analysis-compass";
import { ANALYSIS_STAGE_LABELS, analysisUiStage } from "../../lib/api/errors";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Compass analysis stage mapping", () => {
  it("maps real backend stages to truthful UI labels without inventing stages", () => {
    expect(analysisUiStage("queued", "running")).toBe("validating");
    expect(analysisUiStage("fetching", "running")).toBe("reading");
    expect(analysisUiStage("detecting", "running")).toBe("inspecting");
    expect(analysisUiStage("clarifying", "running")).toBe("finding");
    expect(analysisUiStage("persisting", "running")).toBe("finding");
    expect(analysisUiStage("complete", "succeeded")).toBe("success");
    expect(analysisUiStage("complete", "failed")).toBe("failed");

    expect(ANALYSIS_STAGE_LABELS.reading).toBe("Reading repository");
    expect(ANALYSIS_STAGE_LABELS.inspecting).toBe("Inspecting source files");
    expect(ANALYSIS_STAGE_LABELS.finding).toBe("Finding concepts");
    expect(ANALYSIS_STAGE_LABELS.success).toBe("Ready to explore");
  });

  it("assigns compass motion from real UI stages", () => {
    expect(getCompassAnalysisVisual("reading").motion).toBe("search");
    expect(getCompassAnalysisVisual("inspecting").motion).toBe("pulse");
    expect(getCompassAnalysisVisual("finding").motion).toBe("connect");
    expect(getCompassAnalysisVisual("finding").hint).toBe("Connecting evidence");
    expect(getCompassAnalysisVisual("success").motion).toBe("complete");
    expect(getCompassAnalysisVisual("failed").motion).toBe("error");
  });

  it("does not render fabricated percentage progress copy in StatusLine", () => {
    const source = readFileSync(
      join(process.cwd(), "components/analysis/StatusLine.tsx"),
      "utf8"
    );
    expect(source).not.toContain("% complete");
    expect(source).not.toContain("96.8%");
    expect(source).toContain("getCompassAnalysisVisual");
    expect(source).toContain("data-compass-motion");
  });
});
