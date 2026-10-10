"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/api/client";
import { ApiError, userMessageForError } from "@/lib/api/errors";
import { loadGuestSession } from "@/lib/session-state";

type ChatMessage = { role: "assistant" | "user"; text: string };

const PRODUCT_SUGGESTIONS = [
  "What does VibeCheck do?",
  "What is Code Detective?",
  "Why not just use Cursor?",
  "Can I bring my own API key?"
] as const;

const CODE_SUGGESTIONS = [
  "Explain this more simply.",
  "Why is this concept used here?",
  "What should I understand before learning this?",
  "Quiz me on this concept."
] as const;

export function AskVibeCheckCompanion() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask about VibeCheck, or ask follow-up questions about the code you're exploring."
    }
  ]);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const session = open ? loadGuestSession() : null;
  const runId = searchParams.get("runId") ?? session?.runId ?? undefined;
  const evidenceId =
    searchParams.get("evidenceId") ?? session?.selectedEvidenceId ?? session?.concepts[0]?.evidence[0]?.id;
  const concept =
    session?.concepts.find((item) => item.evidence.some((entry) => entry.id === evidenceId)) ??
    session?.concepts.find((item) => item.id === session.selectedConceptId) ??
    session?.concepts[0];
  const evidence =
    concept?.evidence.find((entry) => entry.id === evidenceId) ?? concept?.evidence[0] ?? null;
  const hasCodeContext = pathname.startsWith("/code-detective") && Boolean(runId && evidence);
  const suggestions = hasCodeContext ? CODE_SUGGESTIONS : PRODUCT_SUGGESTIONS;

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

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, loading]);

  async function sendQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setError(null);
    setInput("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const page = pathname.replace(/^\//, "") || "home";
      const result = await api.askCompanion(
        page,
        trimmed,
        hasCodeContext && runId && evidence
          ? { runId, evidenceId: evidence.id }
          : undefined
      );
      setMessages((current) => [...current, { role: "assistant", text: result.summary }]);
    } catch (err) {
      setError(
        userMessageForError(
          err instanceof ApiError
            ? err
            : { code: "AI_UNAVAILABLE", message: "Could not reach Ask VibeCheck." }
        )
      );
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendQuestion(input);
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <aside
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          className="pointer-events-auto flex w-[min(100vw-2rem,400px)] max-h-[min(70vh,560px)] flex-col rounded-[var(--radius-card)] border border-border bg-surface shadow-[0_16px_40px_rgba(7,27,44,0.45)]"
        >
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/compass-dark.svg" alt="" width={28} height={28} className="h-7 w-7" />
              <div>
                <h2 id={`${panelId}-title`} className="text-base font-semibold text-text">
                  Ask VibeCheck
                </h2>
                <p className="text-xs text-text-muted">
                  {hasCodeContext && evidence
                    ? `Using evidence from ${evidence.path}:${evidence.startLine}–${evidence.endLine}`
                    : "Product guidance and selected-code follow-ups"}
                </p>
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

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-3 py-2 text-sm leading-6 ${
                  message.role === "user"
                    ? "ml-6 bg-primary/15 text-text"
                    : "mr-2 border border-border bg-background text-text-muted"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading ? (
              <p className="text-sm text-text-muted" role="status">
                Thinking…
              </p>
            ) : null}
            {error ? (
              <p className="text-sm text-danger" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendQuestion(suggestion)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-text-muted transition-colors hover:border-primary/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-border p-3">
            <label className="sr-only" htmlFor={`${panelId}-input`}>
              Message
            </label>
            <input
              ref={inputRef}
              id={`${panelId}-input`}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={2000}
              disabled={loading}
              placeholder="Ask a question…"
              className="min-h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-primary text-on-primary transition-transform hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-50"
              aria-label="Send"
            >
              <Send size={16} aria-hidden />
            </button>
          </form>
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
