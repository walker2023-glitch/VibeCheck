import type { ReactNode } from "react";
import { Suspense } from "react";
import { FixtureBanner } from "../dev/FixtureBanner";
import { AskVibeCheckCompanion } from "./AskVibeCheckCompanion";
import { SiteHeader } from "./SiteHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Keep chrome in one sticky stack so content never sits under a lone sticky header. */}
      <div className="sticky top-0 z-50">
        <FixtureBanner />
        <SiteHeader />
      </div>
      <div className="flex-1 pb-24">{children}</div>
      <Suspense fallback={null}>
        <AskVibeCheckCompanion />
      </Suspense>
    </div>
  );
}
