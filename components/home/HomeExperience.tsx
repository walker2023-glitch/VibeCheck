"use client";

import { useCallback, useState } from "react";
import { BookOpen, Compass, Lightbulb } from "lucide-react";
import { getAnalysisPollPlan } from "@/lib/api/analysis-polling";
import { api } from "@/lib/api/client";
import { ApiError, ANALYSIS_STAGE_LABELS, analysisUiStage, userMessageForError } from "@/lib/api/errors";
import type { Concept } from "@/lib/api/types";
import { validateGitHubUrl } from "@/lib/github-url";
import { saveGuestSession } from "@/lib/session-state";
import { ConceptCard } from "../analysis/ConceptCard";
import { StatusLine } from "../analysis/StatusLine";
import { RepositoryInput } from "../ui/RepositoryInput";

type UiPhase =
  | { kind: "idle" }
  | { kind: "working"; stage: keyof typeof ANALYSIS_STAGE_LABELS; progress?: number }
  | { kind: "success"; runId: string; concepts: Concept[]; githubUrl: string }
  | { kind: "error"; stage: keyof typeof ANALYSIS_STAGE_LABELS; message: string };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function HomeExperience() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<UiPhase>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(null);

  const runAnalysis = useCallback(async (raw: string) => {
    const validated = validateGitHubUrl(raw);
    if (!validated.ok) {
      setFieldError(validated.message);
      setPhase({ kind: "idle" });
      return;
    }

    setFieldError(null);
    setPhase({ kind: "working", stage: "validating" });

    try {
      const repo = await api.createRepository(validated.url);
      setPhase({ kind: "working", stage: "reading" });

      const started = await api.startAnalysisRun(repo.id);
      let run = started;
      const poll = getAnalysisPollPlan(api.isFixtureMode());

      // Poll until terminal. Live: ~60s at ~1s. Fixtures: short interval for fast demos/tests.
      // Progress is only shown when the backend supplies AnalysisRun.progress.
      for (let i = 0; i < poll.maxAttempts; i += 1) {
        run = await api.getAnalysisRun(run.id);
        const ui = analysisUiStage(run.stage, run.status);
        if (ui === "success") break;
        if (ui === "failed") {
          throw new ApiError({
            code: run.errorCode || "ANALYSIS_FAILED",
            message: "Analysis failed.",
            requestId: "client",
            retryable: false
          });
        }
        setPhase({
          kind: "working",
          stage: ui === "validating" || ui === "reading" || ui === "inspecting" || ui === "finding" ? ui : "finding",
          progress: typeof run.progress === "number" ? run.progress : undefined
        });
        await sleep(poll.intervalMs);
      }

      if (run.status !== "succeeded" && run.stage !== "complete") {
        throw new ApiError({
          code: "ANALYSIS_FAILED",
          message: "Analysis did not complete.",
          requestId: "client",
          retryable: true
        });
      }

      setPhase({
        kind: "working",
        stage: "finding",
        progress: typeof run.progress === "number" ? run.progress : undefined
      });
      const page = await api.listConcepts(run.id);
      const concepts = page.items.slice(0, 6);

      saveGuestSession({
        githubUrl: validated.url,
        repositoryId: repo.id,
        runId: run.id,
        concepts,
        usingFixtures: api.isFixtureMode()
      });

      setPhase({
        kind: "success",
        runId: run.id,
        concepts,
        githubUrl: validated.url
      });
    } catch (err) {
      const apiErr =
        err instanceof ApiError
          ? err
          : new ApiError({
              code: "ANALYSIS_FAILED",
              message: err instanceof Error ? err.message : "Analysis failed.",
              requestId: "client",
              retryable: false
            });

      let stage: keyof typeof ANALYSIS_STAGE_LABELS = "failed";
      if (apiErr.code === "REPOSITORY_NOT_FOUND" || apiErr.code === "INVALID_REQUEST") {
        stage = "invalid";
      } else if (apiErr.code === "GITHUB_RATE_LIMITED") {
        stage = "rateLimited";
      } else if (apiErr.code === "GITHUB_UNAVAILABLE") {
        stage = "unavailable";
      }

      setPhase({ kind: "error", stage, message: userMessageForError(apiErr) });
    }
  }, []);

  const submitting = phase.kind === "working";

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-16 px-5 py-12 md:px-10 lg:px-16 lg:py-20">
      <section className="flex flex-col items-center text-center">
        <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.02em] text-text sm:text-5xl lg:text-[56px] lg:leading-[64px]">
          Build with AI. Understand what you build.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-7 text-text-muted">
          VibeCheck helps developers understand, learn from, and prove their understanding of
          AI-assisted code using their own repositories.
        </p>

        <div className="mt-10 flex w-full justify-center">
          <RepositoryInput
            value={url}
            onChange={setUrl}
            onSubmit={runAnalysis}
            error={fieldError}
            submitting={submitting}
          />
        </div>

        <p className="mt-4 text-sm text-text-muted">
          Public GitHub repositories only for this guest demo. Results are session-scoped, not
          permanently saved.
        </p>
      </section>

      {phase.kind === "working" ? (
        <StatusLine stage={phase.stage} progress={phase.progress} />
      ) : null}

      {phase.kind === "error" ? (
        <div className="rounded-[var(--radius-card)] border border-danger/40 bg-surface p-5" role="alert">
          <StatusLine stage={phase.stage} detail={phase.message} />
        </div>
      ) : null}

      {phase.kind === "success" ? (
        <section className="flex flex-col gap-6" aria-labelledby="concepts-heading">
          <div className="rounded-[var(--radius-card)] border border-primary/30 bg-surface p-5">
            <StatusLine stage="success" detail={`Analyzed ${phase.githubUrl.replace("https://github.com/", "")}`} />
            <p className="mt-4 text-[15px] font-medium text-text">
              Found in your code does not mean demonstrated knowledge.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Inspect a concept, then take a short Knowledge Check to see what you can actually
              demonstrate.
            </p>
          </div>

          <div>
            <h2 id="concepts-heading" className="text-2xl font-semibold tracking-tight text-text">
              Concepts in this repository
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Showing {phase.concepts.length} concepts with evidence from your code.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {phase.concepts.map((concept) => (
              <ConceptCard key={concept.id} concept={concept} runId={phase.runId} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-8 md:grid-cols-3" aria-labelledby="ideas-heading">
        <h2 id="ideas-heading" className="sr-only">
          What VibeCheck helps you do
        </h2>
        {[
          {
            icon: Compass,
            title: "Understand code AI writes",
            body: "Trace concepts back to real files and lines in your repository."
          },
          {
            icon: BookOpen,
            title: "Learn through your projects",
            body: "Turn your own codebase into a short, evidence-grounded curriculum."
          },
          {
            icon: Lightbulb,
            title: "Prove what you demonstrated",
            body: "Separate concepts found in code from knowledge you actually showed."
          }
        ].map((item) => (
          <div key={item.title} className="text-left">
            <item.icon className="text-primary" size={24} aria-hidden strokeWidth={1.75} />
            <h3 className="mt-3 text-lg font-semibold text-text">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-text-muted">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
