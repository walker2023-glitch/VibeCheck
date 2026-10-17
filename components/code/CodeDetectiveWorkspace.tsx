"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, FileCode2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError, userMessageForError } from "@/lib/api/errors";
import type { Concept, Explanation } from "@/lib/api/types";
import { buildAssessmentConceptIds } from "@/lib/assessment-concepts";
import {
  CODE_DETECTIVE_EMPTY_MESSAGE,
  getCodeDetectiveViewState
} from "@/lib/code-detective-state";
import { loadGuestSession, saveGuestSession } from "@/lib/session-state";
import { Button } from "../ui/Button";
import { CodeExplanationPanel } from "./CodeExplanationPanel";
import { CodeViewer } from "./CodeViewer";

export function CodeDetectiveWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const runId = params.get("runId");
  const conceptId = params.get("conceptId");
  const evidenceId = params.get("evidenceId");

  const [session, setSession] = useState(() => loadGuestSession());
  const [concepts, setConcepts] = useState<Concept[]>(() => loadGuestSession()?.concepts ?? []);
  const concept = concepts.find((c) => c.id === conceptId) ?? concepts[0];
  const evidence =
    concept?.evidence.find((e) => e.id === evidenceId) ?? concept?.evidence[0] ?? null;

  const viewState = getCodeDetectiveViewState({ runId, evidence });

  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(viewState === "ready");
  const [startingCheck, setStartingCheck] = useState(false);
  const [aiConsentGranted, setAiConsentGranted] = useState(false);
  const [enablingAi, setEnablingAi] = useState(false);
  const [explanationRefresh, setExplanationRefresh] = useState(0);

  useEffect(() => {
    if (!runId || concepts.length > 0) return;
    let cancelled = false;
    void api.listConcepts(runId).then((page) => {
      if (cancelled) return;
      setConcepts(page.items);
      const current = loadGuestSession();
      const recovered = current
        ? { ...current, runId, concepts: page.items }
        : { githubUrl: "", repositoryId: "", runId, concepts: page.items, usingFixtures: api.isFixtureMode() };
      setSession(recovered);
      saveGuestSession(recovered);
    }).catch((err) => {
      if (!cancelled) {
        setError(userMessageForError(err instanceof ApiError ? err : { code: "RESOURCE_NOT_FOUND", message: "Could not restore analysis evidence." }));
      }
    });
    return () => { cancelled = true; };
  }, [runId, concepts.length]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (viewState !== "ready" || !runId || !evidence) {
        setLoading(false);
        setExplanation(null);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await api.explainCode(runId, evidence.id);
        if (!cancelled) {
          setExplanation(result);
          if (session && concept) {
            saveGuestSession({
              ...session,
              selectedConceptId: concept.id,
              selectedEvidenceId: evidence.id
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setExplanation(null);
          setError(
            userMessageForError(
              err instanceof ApiError
                ? err
                : {
                    code: "AI_UNAVAILABLE",
                    message: "Could not load explanation."
                  }
            )
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [viewState, runId, evidence, concept, explanationRefresh]);

  async function enableAiExplanations() {
    if (!session?.repositoryId || enablingAi) return;
    setEnablingAi(true);
    setError(null);
    try {
      await api.updateAiConsent(session.repositoryId, true);
      setAiConsentGranted(true);
      setExplanationRefresh((value) => value + 1);
    } catch (err) {
      setError(
        userMessageForError(
          err instanceof ApiError
            ? err
            : { code: "INVALID_REQUEST", message: "Could not enable AI explanations." }
        )
      );
    } finally {
      setEnablingAi(false);
    }
  }

  async function continueToCheck() {
    if (!runId || viewState !== "ready") return;
    setStartingCheck(true);
    setError(null);
    try {
      const conceptIds = buildAssessmentConceptIds(concepts, concept?.id);
      const assessment = await api.createAssessment(runId, conceptIds);
      const current = loadGuestSession();
      if (current) saveGuestSession({
        ...current,
        assessmentId: assessment.id,
        selectedConceptId: concept?.id,
        selectedEvidenceId: evidence?.id
      });
      sessionStorage.setItem(
        "vibecheck_assessment_v1",
        JSON.stringify(assessment)
      );
      router.push(`/knowledge-check?assessmentId=${encodeURIComponent(assessment.id)}`);
    } catch (err) {
      setError(
        userMessageForError(
          err instanceof ApiError
            ? err
            : { code: "ASSESSMENT_UNAVAILABLE", message: "Could not start Knowledge Check." }
        )
      );
      setStartingCheck(false);
    }
  }

  if (viewState === "empty" || !runId || !evidence) {
    return (
      <main className="mx-auto max-w-[800px] px-5 py-16 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
          Code Detective
        </p>
        <h1 className="mt-3 text-3xl font-bold text-text">Understand the code behind your ideas.</h1>
        <p className="mt-4 text-text-muted">{CODE_DETECTIVE_EMPTY_MESSAGE}</p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-on-primary transition-transform duration-150 hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Go to homepage
        </Link>
      </main>
    );
  }

  const activeEvidence = evidence;

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-16">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
          Code Detective
        </span>
        <span className="text-text-muted">/</span>
        <span className="font-mono text-text">
          {session?.githubUrl.replace("https://github.com/", "")}
        </span>
        <span className="text-text-muted">/</span>
        <span className="inline-flex items-center gap-1.5 font-mono text-text">
          <FileCode2 size={14} aria-hidden className="text-primary" />
          {activeEvidence.path}
        </span>
      </div>

      <h1 className="sr-only">Code Detective workspace</h1>

      {error ? (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
              Your code
            </h2>
            <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
              {activeEvidence.kind === "observed" ? "Observed evidence" : "Inferred evidence"}
            </span>
          </div>
          <CodeViewer evidence={activeEvidence} repositoryLabel={session?.githubUrl} />
        </div>

        <div className="flex flex-col gap-3 lg:col-span-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-learning">
            Understand it
          </h2>
          {!aiConsentGranted ? (
            <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-text">Enhance explanations with AI</p>
              <p className="mt-2 text-sm text-text-muted">
                Use managed AI to explain this selected code evidence. Repository evidence may be sent to the configured AI provider.
              </p>
              <Button
                type="button"
                onClick={enableAiExplanations}
                disabled={enablingAi || !session?.repositoryId}
                className="mt-3 w-full sm:w-auto"
              >
                {enablingAi ? "Enabling…" : "Enable AI explanations"}
              </Button>
            </div>
          ) : null}
          {loading ? (
            <p className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm text-text-muted" role="status">
              Loading explanation…
            </p>
          ) : explanation ? (
            <>
              <CodeExplanationPanel
                conceptLabel={concept?.label ?? "Concept"}
                explanation={explanation}
              />
              <div className="mt-2 rounded-[var(--radius-card)] border border-primary/35 bg-surface p-4 shadow-[0_0_24px_rgba(22,184,176,0.08)]">
                <p className="text-sm text-text-muted">
                  Ready to prove what you understand about this concept?
                </p>
                <Button
                  type="button"
                  onClick={continueToCheck}
                  disabled={startingCheck}
                  className="mt-3 w-full sm:w-auto"
                >
                  {startingCheck ? "Preparing…" : "Check my understanding"}
                  {!startingCheck ? <ArrowRight size={16} aria-hidden /> : null}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
