import Link from "next/link";

type Props = {
  title: string;
  description: string;
  planned?: string[];
};

export function ComingSoon({ title, description, planned = [] }: Props) {
  return (
    <main className="mx-auto max-w-[800px] px-5 py-16 md:px-10 lg:px-16">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Coming soon</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-text md:text-4xl">{title}</h1>
      <p className="mt-4 text-lg leading-7 text-text-muted">{description}</p>
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
