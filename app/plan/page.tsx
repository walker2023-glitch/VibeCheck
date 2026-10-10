import { ComingSoon, FlowPreview } from "@/components/preview/ComingSoon";

export default function PlanPage() {
  return (
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
  );
}
