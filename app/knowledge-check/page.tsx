import { Suspense } from "react";
import { KnowledgeCheckFlow } from "@/components/learning/KnowledgeCheckFlow";

export default function KnowledgeCheckPage() {
  return (
    <Suspense
      fallback={
        <main className="px-5 py-16 text-text-muted" role="status">
          Loading Knowledge Check…
        </main>
      }
    >
      <KnowledgeCheckFlow />
    </Suspense>
  );
}
