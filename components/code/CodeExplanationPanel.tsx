import type { Claim, Explanation } from "@/lib/api/types";
import { AIDisclosure } from "../learning/AIDisclosure";

type Props = {
  conceptLabel: string;
  explanation: Explanation;
};

function ClaimBlock({ claim }: { claim: Claim }) {
  if (process.env.NODE_ENV !== "production" && claim.kind === "observed" && claim.evidenceRefs.length === 0) {
    throw new Error("Observed claims require evidence refs");
  }

  const evidence = claim.evidenceRefs[0];

  return (
    <li className="rounded-lg border border-border bg-background p-3 transition-colors duration-150 hover:border-primary/40">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
            claim.kind === "observed"
              ? "bg-success/15 text-success"
              : "bg-learning/15 text-learning"
          }`}
        >
          {claim.kind}
        </span>
        {evidence ? (
          <span className="font-mono text-[12px] text-text-muted">
            {evidence.path}:{evidence.startLine}–{evidence.endLine}
          </span>
        ) : null}
      </div>
      <p className="text-[15px] leading-6 text-text">{claim.text}</p>
    </li>
  );
}

export function CodeExplanationPanel({ conceptLabel, explanation }: Props) {
  const whatClaims = explanation.claims.filter((c) => c.kind === "observed");
  const whyClaims = explanation.claims.filter((c) => c.kind === "inferred");

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[var(--radius-card)] border border-primary/25 bg-surface p-5 shadow-[0_0_28px_rgba(22,184,176,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Concept</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-text">{conceptLabel}</h2>
      </div>

      <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-text">What this code does</h3>
        <p className="mt-2 text-[15px] leading-6 text-text-muted">{explanation.summary}</p>
        <ul className="mt-4 flex flex-col gap-3">
          {(whatClaims.length ? whatClaims : explanation.claims.slice(0, 2)).map((claim, i) => (
            <ClaimBlock key={`what-${i}`} claim={claim} />
          ))}
        </ul>
      </section>

      <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h3 className="text-base font-semibold text-text">Why it matters</h3>
        <p className="mt-2 text-sm text-text-muted">
          We can&apos;t see how this code was written, only what it contains.
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {(whyClaims.length ? whyClaims : explanation.claims.filter((c) => c.kind === "inferred")).map(
            (claim, i) => (
              <ClaimBlock key={`why-${i}`} claim={claim} />
            )
          )}
        </ul>
        {explanation.alternative ? (
          <p className="mt-4 rounded-lg border border-border bg-background p-3 text-sm text-text-muted">
            <span className="font-medium text-text">Worth checking: </span>
            {explanation.alternative}
          </p>
        ) : null}
      </section>

      <AIDisclosure />
      <p className="text-sm text-text-muted">Authorship: unknown</p>
    </div>
  );
}
