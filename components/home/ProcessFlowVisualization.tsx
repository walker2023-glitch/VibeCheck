"use client";

import { useEffect, useState } from "react";

const STAGES = [
  "Your repository",
  "Read code",
  "Find concepts",
  "Connect evidence",
  "Understand",
  "Prove",
  "Grow"
] as const;

type Props = {
  /** When analysis is running, highlight a conceptual stage that complements real status. */
  activeStageIndex?: number | null;
};

export function ProcessFlowVisualization({ activeStageIndex = null }: Props) {
  const [pulseIndex, setPulseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || activeStageIndex != null) return;
    const id = window.setInterval(() => {
      setPulseIndex((i) => (i + 1) % STAGES.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [reduceMotion, activeStageIndex]);

  const highlight =
    activeStageIndex != null
      ? Math.min(Math.max(activeStageIndex, 0), STAGES.length - 1)
      : reduceMotion
        ? -1
        : pulseIndex;

  return (
    <section
      className="vc-process-flow w-full max-w-4xl"
      aria-label="How VibeCheck works"
      data-reduced-motion={reduceMotion ? "true" : "false"}
    >
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        How VibeCheck works
      </p>
      <ol className="relative flex flex-col items-stretch gap-0 md:flex-row md:items-center md:justify-between md:gap-1">
        <span
          className="vc-process-path pointer-events-none absolute left-5 top-4 bottom-4 w-px md:left-4 md:right-4 md:top-1/2 md:h-px md:w-auto md:bottom-auto"
          aria-hidden
        />
        {STAGES.map((label, index) => {
          const active = highlight === index;
          return (
            <li
              key={label}
              className={`relative z-10 flex items-center gap-3 md:flex-1 md:flex-col md:gap-2 ${
                active ? "vc-process-stage-active" : ""
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors duration-300 ${
                  active
                    ? "border-primary bg-primary text-on-primary shadow-[0_0_16px_rgba(22,184,176,0.35)]"
                    : "border-border bg-surface text-text-muted"
                }`}
                aria-hidden
              >
                {index + 1}
              </span>
              <span
                className={`text-left text-[12px] leading-4 md:text-center ${
                  active ? "font-semibold text-text" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      {reduceMotion ? (
        <p className="mt-4 text-center text-sm text-text-muted">
          Conceptual flow: repository → read → concepts → evidence → understand → prove → grow.
        </p>
      ) : null}
    </section>
  );
}

export function analysisStageToProcessIndex(
  stage: "validating" | "reading" | "inspecting" | "finding" | string
): number {
  switch (stage) {
    case "validating":
      return 0;
    case "reading":
      return 1;
    case "inspecting":
      return 2;
    case "finding":
      return 3;
    default:
      return 0;
  }
}
