import { ComingSoon } from "@/components/preview/ComingSoon";

export default function MySkillsPage() {
  return (
    <ComingSoon
      title="My Skills"
      description="Persistent independent and assisted skill tracks require signing in. Guest Knowledge Check results stay ephemeral and never create a My Skills profile."
      planned={[
        "Independent vs assisted tracks",
        "Stale flags for older assessments",
        "Evidence-linked concept history"
      ]}
    />
  );
}
