import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CODE_DETECTIVE_PREVIEW_LABEL,
  CodeDetectivePreview,
  STORY_LOOP_MS,
  STORY_PHASES
} from "../../components/home/CodeDetectivePreview";

describe("Homepage Code Detective product preview", () => {
  it("labels the demo as an interactive product preview, not a live analysis", () => {
    const markup = renderToStaticMarkup(<CodeDetectivePreview />);

    expect(markup).toContain(CODE_DETECTIVE_PREVIEW_LABEL);
    expect(markup).toMatch(/illustrative/i);
    expect(markup).toContain("not a live repository analysis");
    expect(markup).toContain("AI Coding Assistant");
    expect(markup).toContain("Add concurrent repository analysis.");
    expect(markup).not.toContain("ChatGPT");
    expect(markup).not.toContain("Claude");
    expect(markup).not.toContain("Copilot");
    expect(markup).not.toContain("96.8%");
    expect(markup).not.toContain("0 vulnerabilities");
    expect(markup).not.toContain("Mapped 43 files");
  });

  it("defines a short multi-beat story culminating in prove and demonstrated", () => {
    const ids = STORY_PHASES.map((phase) => phase.id);
    expect(ids).toEqual([
      "generate",
      "question",
      "navigate_async",
      "navigate_promise",
      "navigate_map",
      "prove",
      "result"
    ]);
    expect(STORY_LOOP_MS).toBeGreaterThanOrEqual(12_000);
    expect(STORY_LOOP_MS).toBeLessThanOrEqual(16_000);
    expect(STORY_PHASES.some((phase) => phase.badge === "observed")).toBe(true);
    expect(STORY_PHASES.some((phase) => phase.id === "prove")).toBe(true);
    expect(STORY_PHASES.some((phase) => phase.id === "result")).toBe(true);
  });

  it("includes a reduced-motion static fallback", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/CodeDetectivePreview.tsx"),
      "utf8"
    );
    expect(source).toContain("prefers-reduced-motion");
    expect(source).toContain('data-reduced-motion={reduceMotion ? "true" : "false"}');
    expect(source).toContain("Static preview:");
    expect(source).toContain("REDUCED_MOTION_PHASE");
  });
});
