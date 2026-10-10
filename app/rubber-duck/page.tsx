import { ComingSoon } from "@/components/preview/ComingSoon";

export default function RubberDuckPage() {
  return (
    <ComingSoon
      title="Find and fix problems, one question at a time."
      description="Rubber Duck will guide debugging with questions and hints before any suggested fix. The backend for this tool is not part of the hackathon critical demo."
      badge="Rubber Duck · preview"
      accentClassName="text-warning"
      planned={[
        "Pick code from an analyzed repository",
        "Guiding questions first — no instant solutions",
        "Progressive hints with evidence labels"
      ]}
      preview={
        <ol className="flex flex-col gap-4">
          {[
            "What did you expect?",
            "What actually happened?",
            "Which assumption changed?",
            "Guided debugging"
          ].map((step, index) => (
            <li key={step} className="flex flex-col items-start gap-2">
              <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-text">
                {step}
              </div>
              {index < 3 ? (
                <span className="pl-4 text-warning" aria-hidden>
                  ↓
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      }
    />
  );
}
