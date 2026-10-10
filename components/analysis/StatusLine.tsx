import { getCompassAnalysisVisual } from "@/lib/analysis-compass";
import { ANALYSIS_STAGE_LABELS } from "@/lib/api/errors";

type StageKey = keyof typeof ANALYSIS_STAGE_LABELS;

type Props = {
  stage: StageKey;
  detail?: string | null;
  /** Reserved for real backend progress; StatusLine intentionally does not render percentages. */
  progress?: number | null;
};

export function StatusLine({ stage, detail }: Props) {
  const visual = getCompassAnalysisVisual(stage);
  const isError = visual.motion === "error";
  const isComplete = visual.motion === "complete";

  return (
    <div
      className={`flex items-center gap-4 rounded-[var(--radius-card)] border px-4 py-4 ${
        isError
          ? "border-danger/40 bg-surface"
          : isComplete
            ? "border-success/40 bg-surface shadow-[0_0_28px_rgba(65,214,173,0.12)]"
            : "border-border bg-surface"
      }`}
      role="status"
      aria-live="polite"
      data-compass-motion={visual.motion}
    >
      <div
        className={`vc-analysis-compass relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
          isError
            ? "border-danger/50 bg-danger/10"
            : isComplete
              ? "border-success/50 bg-success/10"
              : "border-primary/40 bg-primary/10"
        }`}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/compass-dark.svg"
          alt=""
          width={28}
          height={28}
          className={`h-7 w-7 vc-analysis-compass-mark vc-analysis-compass-mark--${visual.motion}`}
        />
        {visual.motion === "connect" ? (
          <span className="vc-analysis-compass-connect pointer-events-none absolute inset-0 rounded-full" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${isError ? "text-danger" : "text-text"}`}>
          {visual.label}
        </p>
        {visual.hint ? <p className="text-sm text-text-muted">{visual.hint}</p> : null}
        {detail ? <p className={`text-sm ${isError ? "text-danger" : "text-text-muted"}`}>{detail}</p> : null}
      </div>
    </div>
  );
}
