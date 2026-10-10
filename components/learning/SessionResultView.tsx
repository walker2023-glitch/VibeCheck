"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, Circle } from "lucide-react";
import { api } from "@/lib/api/client";
import { ApiError, userMessageForError } from "@/lib/api/errors";
import type { SessionCompletion } from "@/lib/api/types";
import { conceptLabel, loadGuestSession } from "@/lib/session-state";

export function SessionResultView() {
  const params = useSearchParams();
  const assessmentId = params.get("assessmentId");
  const [result, setResult] = useState<SessionCompletion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const session = loadGuestSession();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!assessmentId) {
        setError("No session result available. Complete a Knowledge Check first.");
        return;
      }
      try {
        const completion = await api.getCompletion(assessmentId);
        if (!cancelled) setResult(completion);
      } catch (err) {
        if (!cancelled) {
          setError(
            userMessageForError(
              err instanceof ApiError
                ? err
                : { code: "RESOURCE_NOT_FOUND", message: "Could not load session result." }
            )
          );
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  if (error) {
    return (
      <main className="mx-auto max-w-[800px] px-5 py-16">
        <h1 className="text-3xl font-bold text-text">Session result</h1>
        <p className="mt-4 text-danger" role="alert">
          {error}
        </p>
        <Link href="/" className="mt-6 inline-flex text-primary underline">
          Start over
        </Link>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="px-5 py-16 text-text-muted" role="status">
        Loading session result…
      </main>
    );
  }

  const demonstrated = result.concepts.filter((c) => c.status === "demonstrated");
  const unverified = result.concepts.filter((c) => c.status === "unverified");

  return (
    <main className="mx-auto max-w-[960px] px-5 py-12 md:px-10 lg:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo">
        Guest session result
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text md:text-4xl">
        Demonstrated vs still unverified
      </h1>
      <p className="mt-4 max-w-2xl rounded-[var(--radius-card)] border border-primary/30 bg-surface px-5 py-4 text-lg leading-7 text-text shadow-[0_0_28px_rgba(22,184,176,0.08)]">
        <span className="font-semibold text-text">
          Found in your code does not mean you understand it.
        </span>{" "}
        <span className="text-text-muted">
          VibeCheck tracks what you&apos;ve actually demonstrated in this session.
        </span>
      </p>
      <p className="mt-3 text-sm text-text-muted">
        This guest result is temporary and is not permanently saved to a My Skills profile.
        {result.expiresAt
          ? ` Session expires around ${new Date(result.expiresAt).toLocaleString()}.`
          : null}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section
          className="rounded-[var(--radius-card)] border border-success/45 bg-surface p-6 shadow-[0_0_24px_rgba(65,214,173,0.1)]"
          aria-labelledby="demonstrated-heading"
        >
          <div className="flex items-center gap-2">
            <BadgeCheck className="text-success" aria-hidden />
            <h2 id="demonstrated-heading" className="text-xl font-semibold text-text">
              Demonstrated
            </h2>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Concepts proven through assessment ({demonstrated.length}).
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {demonstrated.length === 0 ? (
              <li className="text-sm text-text-muted">None yet in this session.</li>
            ) : (
              demonstrated.map((item) => (
                <li
                  key={item.conceptId}
                  className="flex items-start gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-[15px] text-text"
                >
                  <span className="mt-0.5 text-success" aria-hidden>
                    ✓
                  </span>
                  <span>{conceptLabel(session, item.conceptId)}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section
          className="rounded-[var(--radius-card)] border border-learning/35 bg-surface p-6"
          aria-labelledby="unverified-heading"
        >
          <div className="flex items-center gap-2">
            <Circle className="text-learning" size={20} aria-hidden />
            <h2 id="unverified-heading" className="text-xl font-semibold text-text">
              Still unverified
            </h2>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Concepts detected in the repository but not yet demonstrated ({unverified.length}).
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {unverified.length === 0 ? (
              <li className="text-sm text-text-muted">All assessed concepts were demonstrated.</li>
            ) : (
              unverified.map((item) => (
                <li
                  key={item.conceptId}
                  className="flex items-start gap-2 rounded-lg border border-learning/20 bg-learning/5 px-3 py-2 text-[15px] text-text"
                >
                  <span className="mt-0.5 text-learning" aria-hidden>
                    ○
                  </span>
                  <span>
                    {conceptLabel(session, item.conceptId)}
                    {item.evidence[0] ? (
                      <span className="mt-1 block font-mono text-[12px] text-text-muted">
                        {item.evidence[0].path}:{item.evidence[0].startLine}–
                        {item.evidence[0].endLine}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-on-primary transition-transform duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Analyze another repository
        </Link>
        <Link
          href="/my-skills"
          className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-text-muted"
        >
          Persistent My Skills (coming soon)
        </Link>
      </div>
    </main>
  );
}
