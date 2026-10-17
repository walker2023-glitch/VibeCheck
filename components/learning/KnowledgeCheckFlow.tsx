"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError, userMessageForError } from "@/lib/api/errors";
import type { AiAssistance, Assessment, Attempt } from "@/lib/api/types";
import { loadGuestSession, saveGuestSession } from "@/lib/session-state";
import { QuestionCard } from "./QuestionCard";

const ASSESSMENT_KEY = "vibecheck_assessment_v1";

function readStoredAssessment(assessmentId: string | null): Assessment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ASSESSMENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Assessment;
    if (!assessmentId || parsed.id !== assessmentId) return null;
    return { ...parsed, items: parsed.items.filter((item) => item.type === "multiple_choice").slice(0, 2) };
  } catch {
    return null;
  }
}

export function KnowledgeCheckFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const assessmentId = params.get("assessmentId");
  const stored = useMemo(() => readStoredAssessment(assessmentId), [assessmentId]);
  const [assessment, setAssessment] = useState<Assessment | null>(stored);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(
    assessmentId ? null : "No knowledge check is ready. Inspect a concept from your analysis first."
  );
  const session = useMemo(() => loadGuestSession(), []);

  useEffect(() => {
    let cancelled = false;
    if (!assessmentId || assessment) return;
    setError(null);
    void api.getAssessment(assessmentId).then((restored) => {
      if (cancelled) return;
      const normalized = { ...restored, items: restored.items.filter((item) => item.type === "multiple_choice").slice(0, 2) };
      setAssessment(normalized);
      sessionStorage.setItem(ASSESSMENT_KEY, JSON.stringify(normalized));
      const guest = loadGuestSession();
      if (guest) saveGuestSession({ ...guest, assessmentId: normalized.id });
    }).catch((err) => {
      if (!cancelled) setError(userMessageForError(err instanceof ApiError ? err : { code: "RESOURCE_NOT_FOUND", message: "Could not restore the knowledge check session." }));
    });
    return () => { cancelled = true; };
  }, [assessmentId, assessment]);

  if (error || !assessment) {
    return (
      <main className="mx-auto max-w-[800px] px-5 py-16 md:px-10">
        <h1 className="text-3xl font-bold text-text">Check your understanding.</h1>
        <p className="mt-4 text-text-muted" role={error ? "alert" : "status"}>{error ?? "Restoring knowledge check…"}</p>
        <Link href="/" className="mt-8 inline-flex min-h-10 items-center text-primary underline">Back to homepage</Link>
      </main>
    );
  }

  const items = assessment.items;
  const current = items[index];

  async function handleSubmit(answer: string, aiAssistance: AiAssistance): Promise<Attempt> {
    try {
      return await api.submitAttempt(assessment.id, current.id, answer, aiAssistance);
    } catch (err) {
      throw new Error(userMessageForError(err instanceof ApiError ? err : { code: "INVALID_ATTEMPT", message: "Could not submit answer." }));
    }
  }

  function handleContinue() {
    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
      return;
    }
    const guest = loadGuestSession();
    router.push("/session-result?assessmentId=" + encodeURIComponent(assessment.id) + (guest?.usingFixtures ? "&fixtures=1" : ""));
  }

  return (
    <main className="relative mx-auto max-w-[720px] px-5 py-10 md:px-10 lg:px-16">
      <div className="pointer-events-none absolute -top-8 right-0 h-48 w-48 rounded-full bg-learning/10 blur-3xl" aria-hidden />
      <p className="relative text-xs font-semibold uppercase tracking-[0.08em] text-learning">Knowledge Check</p>
      <h1 className="relative mt-2 text-3xl font-bold tracking-tight text-text">Check your understanding.</h1>
      <p className="relative mt-3 text-text-muted">Short questions grounded in your repository. Incorrect answers are a chance to learn — they never block progress.</p>
      {session?.githubUrl ? <p className="relative mt-3 font-mono text-[12px] text-text-muted">Repository: {session.githubUrl.replace("https://github.com/", "")}</p> : null}
      <div className="relative mt-8">
        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-raised" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={index + 1} aria-label="Question progress">
          <div className="h-full rounded-full bg-learning transition-[width] duration-200" style={{ width: ((index + 1) / items.length) * 100 + "%" }} />
        </div>
        <QuestionCard key={current.id} item={current} index={index} total={items.length} onSubmit={handleSubmit} onContinue={handleContinue} />
      </div>
    </main>
  );
}
