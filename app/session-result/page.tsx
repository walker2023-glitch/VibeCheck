import { Suspense } from "react";
import { SessionResultView } from "@/components/learning/SessionResultView";

export default function SessionResultPage() {
  return (
    <Suspense
      fallback={
        <main className="px-5 py-16 text-text-muted" role="status">
          Loading session result…
        </main>
      }
    >
      <SessionResultView />
    </Suspense>
  );
}
