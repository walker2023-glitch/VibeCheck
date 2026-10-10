import { ComingSoon } from "@/components/preview/ComingSoon";

export default function PlanPage() {
  return (
    <ComingSoon
      title="Plan a project you can build with AI."
      description="Plan will help you clarify ideas, milestones, prompts, and acceptance criteria. Coming in a later release — this page is an honest preview only."
      planned={[
        "Clarify requirements",
        "Milestones and tasks",
        "Architecture recommendation",
        "Concepts to learn",
        "AI coding prompts with rationale",
        "Acceptance criteria and progress tracking"
      ]}
    />
  );
}
