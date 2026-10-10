import Link from "next/link";
import { FileCode2, Search } from "lucide-react";
import type { Concept } from "@/lib/api/types";

type Props = {
  concept: Concept;
  runId: string;
};

export function ConceptCard({ concept, runId }: Props) {
  const evidence = concept.evidence[0];
  const href = `/code-detective?runId=${encodeURIComponent(runId)}&conceptId=${encodeURIComponent(concept.id)}&evidenceId=${encodeURIComponent(evidence.id)}`;

  return (
    <article className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-text">{concept.label}</h3>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
          {evidence.kind}
        </span>
      </div>
      <p className="flex items-center gap-2 font-mono text-[13px] text-text-muted">
        <FileCode2 size={16} aria-hidden className="shrink-0 text-primary" />
        <span>
          {evidence.path}:{evidence.startLine}–{evidence.endLine}
        </span>
      </p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3 font-mono text-[13px] leading-5 text-text-muted">
        <code>{evidence.snippet.split("\n").slice(0, 4).join("\n")}</code>
      </pre>
      <Link
        href={href}
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium tracking-[0.02em] text-text transition-colors duration-150 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
      >
        <Search size={16} aria-hidden />
        Inspect
      </Link>
    </article>
  );
}
