"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError, userMessageForError } from "@/lib/api/errors";
import type { Explanation } from "@/lib/api/types";
import { buildAssessmentConceptIds } from "@/lib/assessment-concepts";
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

  const session = useMemo(() => loadGuestSession(), []);
  const concept = session?.concepts.find((c) => c.id === conceptId) ?? session?.concepts[0];
  const evidence =
    concept?.evidence.find((e) => e.id === evidenceId) ?? concept?.evidence[0] ?? null;

  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingCheck, setStartingCheck] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!runId || !evidence) {
        setLoading(false);
        setError(
          "No analysis evidence selected. Analyze a public repository on the homepage first."
        );
        return;
      }

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
  }, [runId, evidence, session, concept]);

  async function continueToCheck() {
    if (!runId || !session) return;
    setStartingCheck(true);
    setError(null);
    try {
      const conceptIds = buildAssessmentConceptIds(session.concepts, concept?.id);
      const assessment = await api.createAssessment(runId, conceptIds);
      saveGuestSession({
        ...session,
        assessmentId: assessment.id,
        selectedConceptId: concept?.id,
        selectedEvidenceId: evidence?.id
      });
      // stash assessment items for the quiz page
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

  if (!evidence) {
    return (
      <main className="mx-auto max-w-[800px] px-5 py-16 md:px-10">
        <h1 className="text-3xl font-bold text-text">Understand the code behind your ideas.</h1>
        <p className="mt-4 text-text-muted">
          {error ?? "Analyze a repository on the homepage, then inspect a concept to open this workspace."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-on-primary"
        >
          Go to homepage
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 lg:px-16">
      <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
          Code Detective
        </span>
        <span className="text-text-muted">/</span>
        <span className="font-mono text-text">{session?.githubUrl.replace("https://github.com/", "")}</span>
        <span className="text-text-muted">/</span>
        <span className="font-mono text-text">{evidence.path}</span>
      </div>

      <h1 className="sr-only">Code Detective workspace</h1>

      {error ? (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <CodeViewer evidence={evidence} />
        </div>
        <div className="lg:col-span-5">
          {loading ? (
            <p className="text-sm text-text-muted" role="status">
              Loading explanation…
            </p>
          ) : explanation ? (
            <>
              <CodeExplanationPanel
                conceptLabel={concept?.label ?? "Concept"}
                explanation={explanation}
              />
              <div className="mt-6">
                <Button type="button" onClick={continueToCheck} disabled={startingCheck}>
                  {startingCheck ? "Preparing…" : "Continue to Knowledge Check"}
                </Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
