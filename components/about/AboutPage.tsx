import Link from "next/link";
import { ArrowRight } from "lucide-react";

const AUDIENCES = [
  {
    title: "Learning with AI",
    body: "Students, beginners, self-taught developers, and vibe coders who want AI's speed without skipping understanding."
  },
  {
    title: "Building with AI",
    body: "Professional developers using AI in languages, frameworks, or codebases outside their strongest expertise."
  },
  {
    title: "Responsible for AI-built software",
    body: "Educators and engineering teams that need confidence people understand the increasingly AI-assisted software they submit, maintain, and ship."
  }
] as const;

const LIFECYCLE = [
  {
    name: "Plan",
    status: "preview" as const,
    href: "/plan",
    body: "Requirements, milestones, acceptance criteria, and better instructions for humans and coding agents."
  },
  {
    name: "Code Detective",
    status: "live" as const,
    href: "/code-detective",
    body: "Connect concepts to real implementation evidence."
  },
  {
    name: "Knowledge Check",
    status: "live" as const,
    href: "/knowledge-check",
    body: "Prove understanding separately from generation."
  },
  {
    name: "Rubber Duck",
    status: "preview" as const,
    href: "/rubber-duck",
    body: "Debug through guided reasoning rather than immediately receiving the answer."
  },
  {
    name: "Deploy",
    status: "preview" as const,
    href: "/deploy",
    body: "Understand how software goes from local development to production."
  },
  {
    name: "My Skills",
    status: "preview" as const,
    href: "/my-skills",
    body: "Track demonstrated knowledge across projects."
  }
] as const;

const PLANS = [
  {
    title: "Free",
    status: "now" as const,
    body: "Core analysis and limited learning workflow."
  },
  {
    title: "Pro — Managed AI",
    status: "now" as const,
    body: "Subscription with managed AI usage, higher limits, persistent learning history, and advanced learning tools."
  },
  {
    title: "Bring Your Own Key",
    status: "planned" as const,
    body: "Advanced users can connect supported provider API keys and use VibeCheck as the learning/orchestration layer without being forced to purchase managed inference from VibeCheck."
  },
  {
    title: "Education & Teams",
    status: "planned" as const,
    body: "Organizational tools for project-based learning, onboarding, demonstrated skills, and understanding AI-assisted codebases."
  }
] as const;

const ARCHITECTURE = [
  "Repository",
  "Deterministic evidence",
  "Grounded Claude explanation",
  "Knowledge Check",
  "Deterministic grading"
] as const;

function StatusPill({ status }: { status: "live" | "preview" | "now" | "planned" }) {
  if (status === "live" || status === "now") {
    return (
      <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-success">
        {status === "live" ? "Live" : "Available"}
      </span>
    );
  }
  return (
    <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">
      {status === "preview" ? "Preview" : "Planned"}
    </span>
  );
}

export function AboutPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="vc-hero-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[640px]" aria-hidden>
        <div className="vc-hero-glow-primary absolute left-1/2 top-[-6rem] h-[24rem] w-[48rem] -translate-x-1/2 rounded-full" />
        <div className="vc-hero-grid absolute inset-x-0 top-0 h-[36rem]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col gap-20 px-5 py-16 md:px-10 lg:gap-24 lg:px-16 lg:py-20">
        <section className="max-w-3xl" aria-labelledby="about-hero-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Why VibeCheck?</p>
          <h1
            id="about-hero-heading"
            className="mt-4 text-4xl font-bold tracking-[-0.02em] text-text sm:text-5xl lg:text-[52px] lg:leading-[1.1]"
          >
            We&apos;re generating software faster than we&apos;re learning it.
          </h1>
          <p className="mt-6 text-lg leading-7 text-text-muted">
            AI lets people build software beyond what they could create alone. VibeCheck helps make
            sure their understanding grows with what they build.
          </p>
          <p className="mt-4 text-[17px] font-medium leading-7 text-text">
            VibeCheck turns the software you build with AI into the material you learn from.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary transition-transform duration-150 hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Try VibeCheck
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>

        <section aria-labelledby="audience-heading">
          <h2 id="audience-heading" className="text-2xl font-semibold tracking-tight text-text">
            Who it&apos;s for
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-text-muted">
            For anyone whose ability to build with AI is growing faster than their understanding.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {AUDIENCES.map((item) => (
              <article
                key={item.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
              >
                <h3 className="text-base font-semibold text-text">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="lifecycle-heading">
          <h2 id="lifecycle-heading" className="text-2xl font-semibold tracking-tight text-text">
            Product lifecycle
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-text-muted">
            Plan → Code Detective → Knowledge Check → Rubber Duck → Deploy → My Skills
          </p>
          <ol className="mt-8 grid gap-4 md:grid-cols-2">
            {LIFECYCLE.map((item, index) => (
              <li
                key={item.name}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-text-muted">{index + 1}</span>
                  <h3 className="text-base font-semibold text-text">
                    <Link
                      href={item.href}
                      className="rounded-sm hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      {item.name}
                    </Link>
                  </h3>
                  <StatusPill status={item.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="rounded-[var(--radius-card)] border border-primary/30 bg-surface p-6 shadow-[0_0_28px_rgba(22,184,176,0.08)] md:p-8"
          aria-labelledby="principle-heading"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Core principle</p>
          <h2 id="principle-heading" className="mt-3 text-2xl font-semibold tracking-tight text-text md:text-3xl">
            Found in your code ≠ Demonstrated knowledge
          </h2>
          <p className="mt-6 text-sm font-medium text-text md:text-base">
            Real evidence → Learn → Knowledge Check → Demonstrated
          </p>
        </section>

        <section aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-2xl font-semibold tracking-tight text-text">
            Why not ChatGPT / Claude / Cursor / Codex?
          </h2>
          <p className="mt-4 max-w-3xl text-lg font-medium leading-7 text-text">
            Coding agents help you produce. VibeCheck helps you understand what you produced.
          </p>
          <p className="mt-4 max-w-3xl text-[15px] leading-6 text-text-muted">
            Those tools already generate and explain code extremely well. VibeCheck builds a
            structured learning process around AI-assisted development instead:
          </p>
          <p className="mt-4 font-mono text-sm leading-6 text-primary">
            Plan → Evidence → Teach → Assess → Debug → Deploy → Track demonstrated skills
          </p>
          <p className="mt-6 max-w-3xl text-[15px] leading-6 text-text-muted">
            The difference is between an AI that helps you get the answer and a system designed to
            help you become the person who understands the answer.
          </p>
        </section>

        <section aria-labelledby="architecture-heading">
          <h2 id="architecture-heading" className="text-2xl font-semibold tracking-tight text-text">
            Trustworthy AI architecture
          </h2>
          <ol className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            {ARCHITECTURE.map((step, index) => (
              <li key={step} className="flex items-center gap-3">
                <span className="inline-flex min-h-8 items-center rounded-lg border border-primary/35 bg-primary/10 px-3 py-1.5 text-sm font-medium text-text">
                  {step}
                </span>
                {index < ARCHITECTURE.length - 1 ? (
                  <span className="hidden text-text-muted md:inline" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-[15px] leading-6 text-text-muted">
            VibeCheck doesn&apos;t ask the LLM to decide what&apos;s true about the repository. It
            establishes code evidence first. Claude can help teach from that evidence, while
            assessment and demonstrated knowledge remain separate.
          </p>
          <p className="mt-3 max-w-3xl text-[15px] leading-6 text-text-muted">
            Sending repository evidence to managed AI requires explicit user consent.
          </p>
        </section>

        <section aria-labelledby="business-heading">
          <h2 id="business-heading" className="text-2xl font-semibold tracking-tight text-text">
            Business model
          </h2>
          <p className="mt-3 text-[15px] text-text-muted">
            No invented prices — only product direction.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {PLANS.map((plan) => (
              <article
                key={plan.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-text">{plan.title}</h3>
                  <StatusPill status={plan.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-text-muted">{plan.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm font-medium text-text">
            Individual developers → Education → Engineering teams
          </p>
        </section>

        <section
          className="rounded-[var(--radius-card)] border border-learning/35 bg-surface p-6 md:p-8"
          aria-labelledby="education-heading"
        >
          <h2 id="education-heading" className="text-2xl font-semibold tracking-tight text-text">
            Education opportunity
          </h2>
          <p className="mt-4 max-w-3xl text-lg font-medium leading-7 text-text">
            In an AI world, the better question isn&apos;t only “Did the student use AI?” It&apos;s
            “Does the student understand what they submitted?”
          </p>
          <p className="mt-4 text-sm leading-6 text-text-muted">
            Educator dashboards are not part of this demo — Education &amp; Teams remains planned.
          </p>
        </section>

        <section className="pb-8 text-center" aria-labelledby="closing-heading">
          <h2 id="closing-heading" className="text-3xl font-bold tracking-tight text-text md:text-4xl">
            Keep the speed. Gain the understanding.
          </h2>
          <p className="mt-4 text-lg text-text-muted">
            Build with AI. Understand what you build.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-on-primary transition-transform duration-150 hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Try VibeCheck
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
      </div>
    </main>
  );
}
