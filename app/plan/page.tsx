import { ComingSoon, FlowPreview } from "@/components/preview/ComingSoon";

export default function PlanPage() {
  return (
    <>
      <ComingSoon
        title="Plan a project you can build with AI."
        description="Plan will help you clarify ideas, milestones, prompts, and acceptance criteria. Coming in a later release — this page is an honest preview only."
        badge="Plan · preview"
        accentClassName="text-information"
        planned={[
          "Clarify requirements",
          "Milestones and tasks",
          "Architecture recommendation",
          "Concepts to learn",
          "AI coding prompts with rationale",
          "Acceptance criteria and progress tracking"
        ]}
        preview={
          <FlowPreview
            steps={["Idea", "Requirements", "Milestones", "Acceptance criteria", "Build"]}
            accentClassName="border-information/40 bg-information/15 text-information"
          />
        }
      />
      <section className="mx-auto max-w-[960px] px-5 pb-16 md:px-10 lg:px-16">
        <div className="rounded-[var(--radius-card)] border border-information/35 bg-surface p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-text">New to GitHub?</h2>
            <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">
              Product preview
            </span>
          </div>
          <p className="mt-3 text-[15px] leading-6 text-text-muted">
            Start where you are. Learn the professional workflow as you grow. Future guided planning
            will teach what Git tracks, repositories, commits, pushing to GitHub, and basic branches —
            not a full Git course, and not live in this demo.
          </p>
        </div>
      </section>
    </>
  );
}
