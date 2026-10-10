import type { Evidence } from "@/lib/api/types";

type Props = {
  evidence: Evidence;
};

export function CodeViewer({ evidence }: Props) {
  const lines = evidence.snippet.split("\n");
  const start = evidence.startLine;

  return (
    <section
      className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-background"
      role="region"
      aria-label={`Source code: ${evidence.path}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <p className="font-mono text-[13px] text-text">
          {evidence.path}:{evidence.startLine}–{evidence.endLine}
        </p>
        <span className="rounded bg-surface-raised px-2 py-0.5 font-mono text-[12px] text-primary">
          {evidence.language}
        </span>
      </div>
      <div className="overflow-x-auto p-3">
        <table className="w-full border-collapse font-mono text-[13px] leading-5">
          <tbody>
            {lines.map((line, index) => {
              const lineNumber = start + index;
              const highlighted =
                lineNumber >= evidence.startLine && lineNumber <= evidence.endLine;
              return (
                <tr
                  key={lineNumber}
                  className={highlighted ? "bg-primary/10" : "text-text-muted"}
                >
                  <td
                    className={`w-10 select-none pr-4 text-right align-top ${
                      highlighted ? "font-semibold text-primary" : "opacity-40"
                    }`}
                    aria-hidden="true"
                  >
                    {lineNumber}
                  </td>
                  <td className={`whitespace-pre text-text ${highlighted ? "relative pl-2" : ""}`}>
                    {highlighted ? (
                      <span
                        className="absolute -left-1 top-0 bottom-0 w-1 rounded-r bg-primary"
                        aria-hidden
                      />
                    ) : null}
                    {line || " "}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border px-4 py-2 text-xs text-text-muted" aria-live="polite">
        Focus: lines {evidence.startLine}–{evidence.endLine} • {lines.length} lines
        {evidence.snippetTruncated ? " • snippet truncated" : ""}
      </p>
    </section>
  );
}
