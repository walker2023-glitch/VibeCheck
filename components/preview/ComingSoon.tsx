import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  badge?: string;
  accentClassName?: string;
  planned?: string[];
  preview: ReactNode;
};

export function ComingSoon({
  title,
  description,
  badge = "Coming soon",
  accentClassName = "text-primary",
  planned = [],
  preview
}: Props) {
  return (
    <main className="mx-auto max-w-[960px] px-5 py-16 md:px-10 lg:px-16">
      <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${accentClassName}`}>
        {badge}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text md:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-7 text-text-muted">{description}</p>

      <section
        className="mt-10 rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[0_8px_28px_rgba(7,27,44,0.28)]"
        aria-labelledby="product-preview-heading"
      >
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <h2 id="product-preview-heading" className="text-lg font-semibold text-text">
            Product preview
          </h2>
          <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">
            Conceptual example — not live data
          </span>
        </div>
        {preview}
      </section>

      {planned.length ? (
        <ul className="mt-8 list-disc space-y-2 pl-5 text-[15px] text-text-muted">
          {planned.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      <p className="mt-8 text-sm text-text-muted">
        This preview is honest about unfinished work — nothing here is simulated as working.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-on-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to homepage
      </Link>
    </main>
  );
}

export function FlowPreview({
  steps,
  accentClassName = "border-primary bg-primary text-on-primary"
}: {
  steps: string[];
  accentClassName?: string;
}) {
  return (
    <ol className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      {steps.map((step, index) => (
        <li key={step} className="flex items-center gap-3">
          <span
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${accentClassName}`}
          >
            {index + 1}
          </span>
          <span className="text-sm font-medium text-text">{step}</span>
          {index < steps.length - 1 ? (
            <span className="hidden text-text-muted md:inline" aria-hidden>
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
