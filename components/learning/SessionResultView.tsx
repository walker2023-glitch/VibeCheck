"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, CircleDashed } from "lucide-react";
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
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        Guest session result
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-text md:text-4xl">
        Demonstrated vs still unverified
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-text-muted">
        Seeing a concept in your code doesn&apos;t prove you understand it. VibeCheck tracks what
        you&apos;ve actually demonstrated.
      </p>
      <p className="mt-3 text-sm text-text-muted">
        This guest result is temporary and is not permanently saved to a My Skills profile.
        {result.expiresAt
          ? ` Session expires around ${new Date(result.expiresAt).toLocaleString()}.`
          : null}
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section
          className="rounded-[var(--radius-card)] border border-success/40 bg-surface p-6"
          aria-labelledby="demonstrated-heading"
        >
          <div className="flex items-center gap-2">
            <BadgeCheck className="text-success" aria-hidden />
            <h2 id="demonstrated-heading" className="text-xl font-semibold text-text">
              Demonstrated
            </h2>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Concepts you showed through this assessment ({demonstrated.length}).
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {demonstrated.length === 0 ? (
              <li className="text-sm text-text-muted">None yet in this session.</li>
            ) : (
              demonstrated.map((item) => (
                <li
                  key={item.conceptId}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-[15px] text-text"
                >
                  {conceptLabel(session, item.conceptId)}
                </li>
              ))
            )}
          </ul>
        </section>

        <section
          className="rounded-[var(--radius-card)] border border-border bg-surface p-6"
          aria-labelledby="unverified-heading"
        >
          <div className="flex items-center gap-2">
            <CircleDashed className="text-warning" aria-hidden />
            <h2 id="unverified-heading" className="text-xl font-semibold text-text">
              Still unverified
            </h2>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            Detected in code or not yet demonstrated ({unverified.length}).
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {unverified.length === 0 ? (
              <li className="text-sm text-text-muted">All assessed concepts were demonstrated.</li>
            ) : (
              unverified.map((item) => (
                <li
                  key={item.conceptId}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-[15px] text-text"
                >
                  {conceptLabel(session, item.conceptId)}
                  {item.evidence[0] ? (
                    <span className="mt-1 block font-mono text-[12px] text-text-muted">
                      {item.evidence[0].path}:{item.evidence[0].startLine}–
                      {item.evidence[0].endLine}
                    </span>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
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
