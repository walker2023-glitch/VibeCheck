import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { FixtureBanner } from "../dev/FixtureBanner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <FixtureBanner />
      <SiteHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
