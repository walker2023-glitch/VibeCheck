import { FIXTURE_BANNER, isFixtureMode } from "@/lib/api/fixtures";

export function FixtureBanner() {
  if (!isFixtureMode()) return null;

  return (
    <div
      role="status"
      className="border-b border-warning/40 bg-surface px-5 py-2 text-center text-xs text-warning md:px-10"
      data-fixture-banner="true"
    >
      {FIXTURE_BANNER}
    </div>
  );
}
