import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  CODE_DETECTIVE_PREVIEW_LABEL,
  CodeDetectivePreview
} from "../../components/home/CodeDetectivePreview";

describe("Homepage Code Detective product preview", () => {
  it("labels the demo as an interactive product preview, not a live analysis", () => {
    const markup = renderToStaticMarkup(<CodeDetectivePreview />);

    expect(markup).toContain(CODE_DETECTIVE_PREVIEW_LABEL);
    expect(markup).toContain("illustrative example, not a live repository result");
    expect(markup).toContain("Async Functions");
    expect(markup).toContain("Observed in code");
    expect(markup).toContain("analyzeRepository");
    expect(markup).not.toContain("96.8%");
    expect(markup).not.toContain("0 vulnerabilities");
    expect(markup).not.toContain("Mapped 43 files");
  });

  it("includes a reduced-motion static fallback", () => {
    const source = readFileSync(
      join(process.cwd(), "components/home/CodeDetectivePreview.tsx"),
      "utf8"
    );
    expect(source).toContain("prefers-reduced-motion");
    expect(source).toContain('data-reduced-motion={reduceMotion ? "true" : "false"}');
    expect(source).toContain("Static preview:");
  });
});
