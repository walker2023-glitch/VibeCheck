import { CheckCircle2, CircleAlert, CircleHelp } from "lucide-react";
import type { Attempt } from "@/lib/api/types";

type Props = {
  attempt: Attempt;
};

export function LearningFeedback({ attempt }: Props) {
  const Icon =
    attempt.outcome === "correct"
      ? CheckCircle2
      : attempt.outcome === "partial"
        ? CircleHelp
        : CircleAlert;

  const label =
    attempt.outcome === "correct"
      ? "Correct"
      : attempt.outcome === "partial"
        ? "Partially correct"
        : "Needs another look";

  return (
    <div
      className="rounded-[var(--radius-card)] border border-border bg-surface p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <Icon
          size={20}
          className={
            attempt.outcome === "correct"
              ? "text-success"
              : attempt.outcome === "partial"
                ? "text-warning"
                : "text-learning"
          }
          aria-hidden
        />
        <p className="text-sm font-semibold text-text">{label}</p>
        <span className="text-xs text-text-muted">· {attempt.gradingLabel}</span>
      </div>
      <p className="mt-2 text-[15px] leading-6 text-text">{attempt.feedback}</p>
      {attempt.misconception ? (
        <p className="mt-2 text-sm text-text-muted">
          <span className="font-medium text-text">Common mix-up: </span>
          {attempt.misconception}
        </p>
      ) : null}
      {attempt.evidence && attempt.evidence[0] ? (
        <p className="mt-3 font-mono text-[12px] text-text-muted">
          From your repo: {attempt.evidence[0].path}:{attempt.evidence[0].startLine}–
          {attempt.evidence[0].endLine}
        </p>
      ) : null}
    </div>
  );
}
