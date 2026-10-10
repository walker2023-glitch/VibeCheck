"use client";

import { useEffect, useId, useState } from "react";

export const CODE_DETECTIVE_PREVIEW_LABEL = "Interactive product preview";

export type StoryPhaseId =
  | "generate"
  | "question"
  | "navigate_async"
  | "navigate_promise"
  | "navigate_map"
  | "prove"
  | "result";

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

export const STORY_PHASES: Array<{
  id: StoryPhaseId;
  durationMs: number;
  highlightLines: number[];
  revealLines: number;
  stageLabel: string;
  title: string;
  body: string;
  badge: "assistant" | "observed" | "learning" | "success" | "compass" | null;
}> = [
  {
    id: "generate",
    durationMs: 2600,
    highlightLines: [],
    revealLines: CODE_LINES.length,
    stageLabel: "Generate",
    title: "AI Coding Assistant",
    body: "Add concurrent repository analysis.",
    badge: "assistant"
  },
  {
    id: "question",
    durationMs: 1800,
    highlightLines: [],
    revealLines: CODE_LINES.length,
    stageLabel: "Question",
    title: "Code generated. But do you understand it?",
    body: "VibeCheck helps you navigate unfamiliar code and point toward understanding.",
    badge: "compass"
  },
  {
    id: "navigate_async",
    durationMs: 1800,
    highlightLines: [1],
    revealLines: CODE_LINES.length,
    stageLabel: "Navigate",
    title: "Async Functions",
    body: "This function can pause for asynchronous work without blocking the rest of the application.",
    badge: "observed"
  },
  {
    id: "navigate_promise",
    durationMs: 1800,
    highlightLines: [4],
    revealLines: CODE_LINES.length,
    stageLabel: "Navigate",
    title: "Concurrency",
    body: "Promise.all waits for multiple asynchronous operations together rather than handling them one at a time.",
    badge: "observed"
  },
  {
    id: "navigate_map",
    durationMs: 1800,
    highlightLines: [5],
    revealLines: CODE_LINES.length,
    stageLabel: "Understand",
    title: "Data transformation",
    body: "Each source file is transformed into an analysis task before the results are combined.",
    badge: "observed"
  },
  {
    id: "prove",
    durationMs: 2000,
    highlightLines: [4, 5],
    revealLines: CODE_LINES.length,
    stageLabel: "Prove",
    title: "Why is Promise.all useful here?",
    body: "A miniature Knowledge Check idea — prove understanding against evidence from the code.",
    badge: "learning"
  },
  {
    id: "result",
    durationMs: 1500,
    highlightLines: [4],
    revealLines: CODE_LINES.length,
    stageLabel: "Result",
    title: "Demonstrated",
    body: "Found in your code does not mean you understand it — until you show that you do.",
    badge: "success"
  }
];

export const STORY_LOOP_MS = STORY_PHASES.reduce((sum, phase) => sum + phase.durationMs, 0);

const TOKEN_CLASS: Record<NonNullable<CodeToken["tone"]>, string> = {
  keyword: "text-primary",
  fn: "text-success",
  type: "text-information",
  string: "text-warning",
  muted: "text-text-muted",
  plain: "text-text"
};

const REDUCED_MOTION_PHASE = STORY_PHASES.find((phase) => phase.id === "navigate_async")!;

type Props = {
  onInviteAnalyze?: () => void;
};

export function CodeDetectivePreview({ onInviteAnalyze }: Props) {
  const labelId = useId();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [typed, setTyped] = useState({ epoch: -1, count: 1 });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    let timeoutId = 0;

    const runPhase = (index: number) => {
      if (cancelled) return;
      setPhaseIndex(index);
      const next = STORY_PHASES[index];
      timeoutId = window.setTimeout(() => {
        runPhase((index + 1) % STORY_PHASES.length);
      }, next.durationMs);
    };

    runPhase(0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [reduceMotion]);

  const phase = reduceMotion ? REDUCED_MOTION_PHASE : STORY_PHASES[phaseIndex];
  const generateEpoch =
    !reduceMotion && phase.id === "generate" ? phaseIndex : -1;

  useEffect(() => {
    if (generateEpoch === -1) return;
    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      setTyped({ epoch: generateEpoch, count: Math.min(current, CODE_LINES.length) });
      if (current >= CODE_LINES.length) window.clearInterval(id);
    }, 220);
    return () => window.clearInterval(id);
  }, [generateEpoch]);

  const visibleLines =
    generateEpoch === -1
      ? CODE_LINES.length
      : typed.epoch === generateEpoch
        ? typed.count
        : 1;
  const showAssistantChrome = phase.id === "generate";
  const showCompassIntro = phase.id === "question";
  const showScanner = phase.highlightLines.length > 0;
  const isProve = phase.id === "prove";
  const isResult = phase.id === "result";

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
          Illustrative product story — not a live repository analysis.
        </p>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[0_12px_36px_rgba(7,27,44,0.35)]">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="relative border-b border-border lg:col-span-7 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3">
              <div className="min-w-0 text-left">
                {showAssistantChrome ? (
                  <>
                    <p className="text-[13px] font-medium text-text">AI Coding Assistant</p>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted">
                      Illustrative prompt
                    </p>
                  </>
                ) : (
                  <>
                    <p className="truncate font-mono text-[13px] text-text">analysis/pipeline.ts</p>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted">
                      Illustrative TypeScript
                    </p>
                  </>
                )}
              </div>
              <span className="rounded bg-primary/15 px-2 py-0.5 font-mono text-[12px] text-primary">
                {showAssistantChrome ? "assist" : "ts"}
              </span>
            </div>

            <div className="relative overflow-x-auto p-3" role="region" aria-label="Illustrative source preview">
              {showAssistantChrome ? (
                <p className="mb-3 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-text-muted">
                  <span className="font-medium text-text">Request: </span>
                  Add concurrent repository analysis.
                </p>
              ) : null}

              <div
                className="vc-code-preview-connector pointer-events-none absolute right-0 top-0 hidden h-full w-8 lg:block"
                aria-hidden
              />

              <table className="w-full border-collapse font-mono text-[13px] leading-6">
                <tbody>
                  {CODE_LINES.slice(0, visibleLines).map((line) => {
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
                          {active && showScanner ? (
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
            <div key={phase.id} className="vc-code-preview-panel flex flex-col gap-3 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  {phase.stageLabel}
                </span>
                {phase.badge === "assistant" ? (
                  <span className="rounded-full bg-information/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-information">
                    Illustrative assistant
                  </span>
                ) : null}
                {phase.badge === "observed" ? (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                    Observed in code
                  </span>
                ) : null}
                {phase.badge === "learning" ? (
                  <span className="rounded-full bg-learning/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-learning">
                    Knowledge Check
                  </span>
                ) : null}
                {phase.badge === "success" ? (
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
                    Demonstrated
                  </span>
                ) : null}
                {phase.badge === "compass" ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                    VibeCheck
                  </span>
                ) : null}
              </div>

              {showCompassIntro || isResult ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/compass-dark.svg"
                    alt=""
                    width={36}
                    height={36}
                    className={`h-9 w-9 ${isResult ? "drop-shadow-[0_0_12px_rgba(65,214,173,0.45)]" : "vc-code-preview-scanner"}`}
                  />
                  <h3
                    className={`text-lg font-semibold tracking-tight ${
                      isResult ? "text-success" : "text-text"
                    }`}
                  >
                    {isResult ? (
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden>✓</span>
                        {phase.title}
                      </span>
                    ) : (
                      phase.title
                    )}
                  </h3>
                </div>
              ) : (
                <h3
                  className={`text-lg font-semibold tracking-tight ${
                    isProve ? "text-learning" : "text-text"
                  }`}
                >
                  {phase.title}
                </h3>
              )}

              <p className="text-[15px] leading-6 text-text-muted">{phase.body}</p>

              {isProve ? (
                <div className="rounded-lg border border-learning/30 bg-learning/10 px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-learning">
                    Sample choices
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                    <li>○ Wait for every analysis task together</li>
                    <li>○ Run files one after another only</li>
                    <li>○ Skip asynchronous work entirely</li>
                  </ul>
                  <button
                    type="button"
                    onClick={onInviteAnalyze}
                    className="mt-3 inline-flex min-h-10 w-fit items-center gap-2 rounded-lg border border-learning/40 bg-surface px-4 text-sm font-medium text-learning transition-colors duration-150 hover:bg-learning/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    Analyze your repo to try for real
                    <span aria-hidden>→</span>
                  </button>
                </div>
              ) : null}

              {phase.badge === "observed" ? (
                <p className="text-xs text-text-muted">
                  Concept linked to exact evidence in the illustrative snippet.
                </p>
              ) : null}
            </div>

            {!reduceMotion ? (
              <div
                className="vc-code-preview-progress h-1 overflow-hidden rounded-full bg-surface-raised"
                aria-hidden
              >
                <div
                  key={phase.id}
                  className="vc-code-preview-progress-bar h-full rounded-full bg-primary"
                  style={{ animationDuration: `${phase.durationMs}ms` }}
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
        Conceptual demonstration loop lasting about {Math.round(STORY_LOOP_MS / 1000)} seconds.
        Paste a GitHub repository above to run a real analysis.
      </p>
    </section>
  );
}
