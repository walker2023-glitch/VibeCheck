import { ANALYSIS_STAGE_LABELS } from "./api/errors";

export type AnalysisUiStage = keyof typeof ANALYSIS_STAGE_LABELS;

export type CompassAnalysisVisual = {
  label: string;
  motion: "search" | "pulse" | "connect" | "complete" | "error" | "idle";
  hint: string | null;
};

/**
 * Maps real UI analysis stages to branded compass presentation.
 * Does not invent backend stages or progress percentages.
 */
export function getCompassAnalysisVisual(stage: AnalysisUiStage): CompassAnalysisVisual {
  switch (stage) {
    case "validating":
      return {
        label: ANALYSIS_STAGE_LABELS.validating,
        motion: "search",
        hint: null
      };
    case "reading":
      return {
        label: ANALYSIS_STAGE_LABELS.reading,
        motion: "search",
        hint: null
      };
    case "inspecting":
      return {
        label: ANALYSIS_STAGE_LABELS.inspecting,
        motion: "pulse",
        hint: null
      };
    case "finding":
      return {
        label: ANALYSIS_STAGE_LABELS.finding,
        motion: "connect",
        hint: "Connecting evidence"
      };
    case "success":
      return {
        label: ANALYSIS_STAGE_LABELS.success,
        motion: "complete",
        hint: null
      };
    case "failed":
    case "invalid":
    case "rateLimited":
    case "unavailable":
      return {
        label: ANALYSIS_STAGE_LABELS[stage],
        motion: "error",
        hint: null
      };
    default:
      return {
        label: ANALYSIS_STAGE_LABELS.idle,
        motion: "idle",
        hint: null
      };
  }
}
