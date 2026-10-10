import { ANALYSIS_STAGE_LABELS } from "@/lib/api/errors";

type StageKey = keyof typeof ANALYSIS_STAGE_LABELS;

type Props = {
  stage: StageKey;
  detail?: string | null;
  progress?: number | null;
};

export function StatusLine({ stage, detail, progress }: Props) {
  const spinning = ["validating", "reading", "inspecting", "finding"].includes(stage);

  return (
    <div
      className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-4 py-3"
      role="status"
      aria-live="polite"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/compass-dark.svg"
        alt=""
        width={28}
        height={28}
        className={`h-7 w-7 ${spinning ? "motion-safe:animate-[spin_2s_linear_infinite]" : ""}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text">{ANALYSIS_STAGE_LABELS[stage]}</p>
        {detail ? <p className="text-sm text-text-muted">{detail}</p> : null}
        {typeof progress === "number" ? (
          <div className="mt-2">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-surface-raised"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Analysis progress"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">{progress}% complete</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
