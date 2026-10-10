"use client";

import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export function AskVibeCheckCompanion() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <aside
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          className="pointer-events-auto w-[min(100vw-2rem,380px)] rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[0_16px_40px_rgba(7,27,44,0.45)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/compass-dark.svg"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              <div>
                <h2 id={`${panelId}-title`} className="text-base font-semibold text-text">
                  VibeCheck Companion
                </h2>
                <p className="text-xs text-text-muted">Guidance preview</p>
              </div>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Close"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <p className="mt-4 text-[15px] leading-6 text-text-muted">
            Context-aware guidance is coming next. For now, explore Code Detective or test your
            understanding.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/code-detective"
              className="inline-flex min-h-10 items-center rounded-lg border border-primary/40 bg-primary/10 px-3 text-sm font-medium text-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={() => setOpen(false)}
            >
              Open Code Detective
            </Link>
            <Link
              href="/knowledge-check"
              className="inline-flex min-h-10 items-center rounded-lg border border-learning/40 bg-learning/10 px-3 text-sm font-medium text-learning hover:bg-learning/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              onClick={() => setOpen(false)}
            >
              Try Knowledge Check
            </Link>
          </div>
        </aside>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        className="pointer-events-auto inline-flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-primary/40 bg-surface px-4 text-sm font-semibold text-text shadow-[0_0_24px_rgba(22,184,176,0.2)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-w-0"
        aria-expanded={open}
        aria-controls={panelId}
        title="Ask VibeCheck"
        onClick={() => setOpen((value) => !value)}
      >
        <MessageCircle size={20} className="text-primary" aria-hidden strokeWidth={1.75} />
        <span className="hidden sm:inline">Ask VibeCheck</span>
        <span className="sr-only sm:hidden">Ask VibeCheck</span>
      </button>
    </div>
  );
}
