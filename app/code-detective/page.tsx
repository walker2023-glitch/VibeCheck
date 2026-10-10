import { Suspense } from "react";
import { CodeDetectiveWorkspace } from "@/components/code/CodeDetectiveWorkspace";

export default function CodeDetectivePage() {
  return (
    <Suspense
      fallback={
        <main className="px-5 py-16 text-text-muted" role="status">
          Loading Code Detective…
        </main>
      }
    >
      <CodeDetectiveWorkspace />
    </Suspense>
  );
}
