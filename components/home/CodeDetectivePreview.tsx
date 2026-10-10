"use client";

import { useEffect, useId, useState } from "react";

export const CODE_DETECTIVE_PREVIEW_LABEL = "Interactive product preview";

type DemoPhase = "inspect" | "evidence" | "understand" | "prove";

type CodeToken = {
  text: string;
  tone?: "keyword" | "fn" | "type" | "string" | "muted" | "plain";
};

type CodeLine = {
  number: number;
  tokens: CodeToken[];
};

const CODE_LINES: CodeLine[] = [
  {
    number: 1,
    tokens: [
      { text: "async function ", tone: "keyword" },
      { text: "analyzeRepository", tone: "fn" },
      { text: "(repo: ", tone: "plain" },
      { text: "Repository", tone: "type" },
      { text: ") {", tone: "plain" }
    ]
  },
  {
    number: 2,
    tokens: [
      { text: "  const ", tone: "keyword" },
      { text: "files", tone: "plain" },
      { text: " = ", tone: "muted" },
      { text: "await ", tone: "keyword" },
      { text: "fetchSourceFiles", tone: "fn" },
      { text: "(repo);", tone: "plain" }
    ]
  },
  { number: 3, tokens: [{ text: "", tone: "plain" }] },
  {
    number: 4,
    tokens: [
      { text: "  const ", tone: "keyword" },
      { text: "concepts", tone: "plain" },
      { text: " = ", tone: "muted" },
      { text: "await ", tone: "keyword" },
      { text: "Promise.all", tone: "fn" },
      { text: "(", tone: "plain" }
    ]
  },
  {
    number: 5,
    tokens: [
      { text: "    files.map", tone: "plain" },
      { text: "(file => ", tone: "muted" },
      { text: "analyzeFile", tone: "fn" },
      { text: "(file))", tone: "plain" }
    ]
  },
  { number: 6, tokens: [{ text: "  );", tone: "plain" }] },
  { number: 7, tokens: [{ text: "", tone: "plain" }] },
  {
    number: 8,
    tokens: [
      { text: "  return ", tone: "keyword" },
      { text: "concepts.flat();", tone: "plain" }
    ]
  },
  { number: 9, tokens: [{ text: "}", tone: "plain" }] }
];

const PHASES: Array<{
  id: DemoPhase;
  highlightLines: number[];
  label: string;
  explanation: string;
  stageLabel: string;
}> = [
  {
    id: "inspect",
    highlightLines: [1],
    label: "Async Functions",
    explanation:
      "This function can pause for asynchronous work without blocking the rest of the application.",
    stageLabel: "Inspect"
  },
  {
    id: "evidence",
    highlightLines: [4],
    label: "Concurrency",
    explanation:
      "Promise.all waits for multiple asynchronous operations together rather than handling them one at a time.",
    stageLabel: "Follow evidence"
  },
  {
    id: "understand",
    highlightLines: [5],
    label: "Data transformation",
    explanation:
      "Each source file is transformed into an analysis task before the results are combined.",
    stageLabel: "Understand"
  },
  {
    id: "prove",
    highlightLines: [4, 5],
    label: "Think you understand it?",
    explanation: "Why is Promise.all useful here?",
    stageLabel: "Prove"
  }
];

const PHASE_MS = 2500;
const LOOP_MS = PHASE_MS * PHASES.length;

const TOKEN_CLASS: Record<NonNullable<CodeToken["tone"]>, string> = {
  keyword: "text-primary",
  fn: "text-success",
  type: "text-information",
  string: "text-warning",
  muted: "text-text-muted",
  plain: "text-text"
};

type Props = {
  onInviteAnalyze?: () => void;
};

export function CodeDetectivePreview({ onInviteAnalyze }: Props) {
  const labelId = useId();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setPhaseIndex((current) => (current + 1) % PHASES.length);
    }, PHASE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const phase = PHASES[reduceMotion ? 0 : phaseIndex];
  const isProve = phase.id === "prove";

  return (
    <section
      className="vc-code-preview w-full max-w-4xl"
      aria-labelledby={labelId}
      data-reduced-motion={reduceMotion ? "true" : "false"}
      data-demo-phase={phase.id}
    >
      <div className="mb-4 flex flex-col items-center gap-2 text-center">
        <p
          id={labelId}
          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary"
        >
          {CODE_DETECTIVE_PREVIEW_LABEL}
        </p>
        <p className="text-sm text-text-muted">
          See how VibeCheck reads code — illustrative example, not a live repository result.
        </p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[0_12px_36px_rgba(7,27,44,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="relative border-b border-border lg:col-span-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3">
              <div className="min-w-0 text-left">
                <p className="truncate font-mono text-[13px] text-text">analysis/pipeline.ts</p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted">
                  Illustrative TypeScript
                </p>
              </div>
              <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[12px] text-primary">
                ts
              </span>
            </div>

            <div className="relative overflow-x-auto p-3" role="region" aria-label="Illustrative source preview">
              <div
                className="vc-code-preview-connector pointer-events-none absolute right-0 top-0 hidden h-full w-8 lg:block"
                aria-hidden
              />
              <table className="w-full border-collapse font-mono text-[13px] leading-6">
                <tbody>
                  {CODE_LINES.map((line) => {
                    const active = phase.highlightLines.includes(line.number);
                    return (
                      <tr
                        key={line.number}
                        className={`vc-code-preview-line relative transition-colors duration-500 ${
                          active ? "vc-code-preview-line-active bg-primary/10" : "text-text-muted"
                        }`}
                      >
                        <td
                          className={`w-10 select-none pr-3 text-right align-top ${
                            active ? "font-semibold text-primary" : "opacity-40"
                          }`}
                          aria-hidden
                        >
                          {line.number}
                        </td>
                        <td className="relative whitespace-pre pl-2 text-left align-top">
                          {active ? (
                            <span
                              className="vc-code-preview-marker absolute -left-1 top-0.5 bottom-0.5 w-1 rounded-r bg-primary"
                              aria-hidden
                            />
                          ) : null}
                          {active ? (
                            <span
                              className="vc-code-preview-scanner absolute -left-7 top-1/2 hidden h-5 w-5 -translate-y-1/2 lg:inline-flex"
                              aria-hidden
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src="/brand/compass-dark.svg"
                                alt=""
                                width={20}
                                height={20}
                                className="h-5 w-5 drop-shadow-[0_0_8px_rgba(22,184,176,0.55)]"
                              />
                            </span>
                          ) : null}
                          {line.tokens.map((token, index) => (
                            <span
                              key={`${line.number}-${index}`}
                              className={TOKEN_CLASS[token.tone ?? "plain"]}
                            >
                              {token.text || " "}
                            </span>
                          ))}
                          {active ? (
                            <span
                              className="vc-code-preview-underline mt-0.5 block h-px w-full bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"
                              aria-hidden
                            />
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="relative flex flex-col justify-between gap-4 p-5 lg:col-span-5">
            <div
              key={phase.id}
              className="vc-code-preview-panel flex flex-col gap-3 text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  {phase.stageLabel}
                </span>
                {!isProve ? (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                    Observed in code
                  </span>
                ) : (
                  <span className="rounded-full bg-learning/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-learning">
                    Knowledge Check
                  </span>
                )}
              </div>

              <h3
                className={`text-lg font-semibold tracking-tight ${
                  isProve ? "text-learning" : "text-text"
                }`}
              >
                {phase.label}
              </h3>
              <p className="text-[15px] leading-6 text-text-muted">{phase.explanation}</p>

              {isProve ? (
                <button
                  type="button"
                  onClick={onInviteAnalyze}
                  className="mt-1 inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-learning/40 bg-learning/10 px-4 text-sm font-medium text-learning transition-colors duration-150 hover:bg-learning/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  Check your understanding
                  <span aria-hidden>→</span>
                </button>
              ) : (
                <p className="text-xs text-text-muted">
                  Concept linked to exact evidence in the illustrative snippet.
                </p>
              )}
            </div>

            {!reduceMotion ? (
              <div
                className="vc-code-preview-progress h-1 overflow-hidden rounded-full bg-surface-raised"
                aria-hidden
              >
                <div
                  key={phase.id}
                  className="vc-code-preview-progress-bar h-full rounded-full bg-primary"
                  style={{ animationDuration: `${PHASE_MS}ms` }}
                />
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                Static preview: VibeCheck highlights evidence and explains the concept beside it.
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="sr-only">
        Conceptual demonstration loop lasting about {LOOP_MS / 1000} seconds. Paste a GitHub
        repository above to run a real analysis.
      </p>
    </section>
  );
}
