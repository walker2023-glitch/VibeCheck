import type { ReactNode } from "react";
import { FixtureBanner } from "../dev/FixtureBanner";
import { AskVibeCheckCompanion } from "./AskVibeCheckCompanion";
import { SiteHeader } from "./SiteHeader";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <FixtureBanner />
      <SiteHeader />
      <div className="flex-1 pb-24">{children}</div>
      <AskVibeCheckCompanion />
    </div>
  );
}
