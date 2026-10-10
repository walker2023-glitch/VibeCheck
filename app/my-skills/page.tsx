import { ComingSoon } from "@/components/preview/ComingSoon";

const PREVIEW_SKILLS = [
  { label: "Async/Await", status: "Demonstrated" as const },
  { label: "React State", status: "Demonstrated" as const },
  { label: "Error Handling", status: "Unverified" as const },
  { label: "API Design", status: "Learning" as const }
];

export default function MySkillsPage() {
  return (
    <ComingSoon
      title="My Skills"
      description="Persistent independent and assisted skill tracks require signing in. Guest Knowledge Check results stay ephemeral and never create a My Skills profile."
      badge="My Skills · preview"
      accentClassName="text-indigo"
      planned={[
        "Independent vs assisted tracks",
        "Stale flags for older assessments",
        "Evidence-linked concept history"
      ]}
      preview={
        <div>
          <p className="mb-4 text-sm text-text-muted">
            Example skill board for product vision only — not your session result.
          </p>
          <ul className="flex flex-col gap-3">
            {PREVIEW_SKILLS.map((skill) => (
              <li
                key={skill.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-medium text-text">{skill.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${
                    skill.status === "Demonstrated"
                      ? "bg-success/15 text-success"
                      : skill.status === "Learning"
                        ? "bg-indigo/20 text-learning"
                        : "bg-learning/10 text-learning"
                  }`}
                >
                  {skill.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
