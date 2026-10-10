"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { api } from "@/lib/api/client";
import { ApiError, userMessageForError } from "@/lib/api/errors";
import type { AiAssistance, Assessment, Attempt } from "@/lib/api/types";
import { loadGuestSession } from "@/lib/session-state";
import { QuestionCard } from "./QuestionCard";

const ASSESSMENT_KEY = "vibecheck_assessment_v1";

function readStoredAssessment(assessmentId: string | null): {
  assessment: Assessment | null;
  error: string | null;
} {
  if (typeof window === "undefined") {
    return { assessment: null, error: null };
  }
  try {
    const raw = sessionStorage.getItem(ASSESSMENT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Assessment;
      if (!assessmentId || parsed.id === assessmentId) {
        return {
          assessment: {
            ...parsed,
            items: parsed.items.filter((item) => item.type === "multiple_choice").slice(0, 2)
          },
          error: null
        };
      }
    }
    return {
      assessment: null,
      error: "No knowledge check is ready. Inspect a concept from your analysis first."
    };
  } catch {
    return { assessment: null, error: "Could not restore the knowledge check session." };
  }
}

export function KnowledgeCheckFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const assessmentId = params.get("assessmentId");
  const initial = useMemo(() => readStoredAssessment(assessmentId), [assessmentId]);
  const [index, setIndex] = useState(0);
  const session = useMemo(() => loadGuestSession(), []);

  if (initial.error || !initial.assessment) {
    return (
      <main className="mx-auto max-w-[800px] px-5 py-16 md:px-10">
        <h1 className="text-3xl font-bold text-text">Check your understanding.</h1>
        <p className="mt-4 text-text-muted">
          {initial.error ?? "Loading knowledge check…"}
        </p>
        <Link href="/" className="mt-8 inline-flex min-h-10 items-center text-primary underline">
          Back to homepage
        </Link>
      </main>
    );
  }

  const assessment = initial.assessment;
  const items = assessment.items;
  const current = items[index];

  async function handleSubmit(answer: string, aiAssistance: AiAssistance): Promise<Attempt> {
    try {
      return await api.submitAttempt(assessment.id, current.id, answer, aiAssistance);
    } catch (err) {
      throw new Error(
        userMessageForError(
          err instanceof ApiError
            ? err
            : { code: "INVALID_ATTEMPT", message: "Could not submit answer." }
        )
      );
    }
  }

  function handleContinue() {
    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
      return;
    }
    const guest = loadGuestSession();
    router.push(
      `/session-result?assessmentId=${encodeURIComponent(assessment.id)}${
        guest?.usingFixtures ? "&fixtures=1" : ""
      }`
    );
  }

  return (
    <main className="relative mx-auto max-w-[720px] px-5 py-10 md:px-10 lg:px-16">
      <div
        className="pointer-events-none absolute -top-8 right-0 h-48 w-48 rounded-full bg-learning/10 blur-3xl"
        aria-hidden
      />
      <p className="relative text-xs font-semibold uppercase tracking-[0.08em] text-learning">
        Knowledge Check
      </p>
      <h1 className="relative mt-2 text-3xl font-bold tracking-tight text-text">
        Check your understanding.
      </h1>
      <p className="relative mt-3 text-text-muted">
        Short questions grounded in your repository. Incorrect answers are a chance to learn —
        they never block progress.
      </p>
      {session?.githubUrl ? (
        <p className="relative mt-3 font-mono text-[12px] text-text-muted">
          Repository: {session.githubUrl.replace("https://github.com/", "")}
        </p>
      ) : null}

      <div className="relative mt-8">
        <div
          className="mb-4 h-1.5 overflow-hidden rounded-full bg-surface-raised"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={index + 1}
          aria-label="Question progress"
        >
          <div
            className="h-full rounded-full bg-learning transition-[width] duration-200"
            style={{ width: `${((index + 1) / items.length) * 100}%` }}
          />
        </div>

        <QuestionCard
          key={current.id}
          item={current}
          index={index}
          total={items.length}
          onSubmit={handleSubmit}
          onContinue={handleContinue}
        />
      </div>
    </main>
  );
}
