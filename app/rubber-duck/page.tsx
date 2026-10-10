import { ComingSoon } from "@/components/preview/ComingSoon";

export default function RubberDuckPage() {
  return (
    <ComingSoon
      title="Find and fix problems, one question at a time."
      description="Rubber Duck will guide debugging with questions and hints before any suggested fix. The backend for this tool is not part of the hackathon critical demo."
      planned={[
        "Pick code from an analyzed repository",
        "Guiding questions first — no instant solutions",
        "Progressive hints with evidence labels"
      ]}
    />
  );
}
