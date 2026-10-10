import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Code Detective workspace exclusivity", () => {
  it("renders empty copy only on the empty branch and evidence UI only on the ready branch", () => {
    const source = readFileSync(
      join(process.cwd(), "components/code/CodeDetectiveWorkspace.tsx"),
      "utf8"
    );

    expect(source).toContain("getCodeDetectiveViewState");
    expect(source).toContain('viewState === "empty"');
    expect(source).toContain("{CODE_DETECTIVE_EMPTY_MESSAGE}");
    expect(source).toContain("Check my understanding");

    const emptyStart = source.indexOf('if (viewState === "empty" || !runId || !evidence)');
    const readyStart = source.indexOf("<h1 className=\"sr-only\">Code Detective workspace</h1>");
    expect(emptyStart).toBeGreaterThan(-1);
    expect(readyStart).toBeGreaterThan(emptyStart);

    const emptyBranch = source.slice(emptyStart, readyStart);
    const readyBranch = source.slice(readyStart);

    expect(emptyBranch).toContain("{CODE_DETECTIVE_EMPTY_MESSAGE}");
    expect(emptyBranch).not.toContain("<CodeViewer");
    expect(readyBranch).toContain("<CodeViewer");
    expect(readyBranch).not.toContain("{CODE_DETECTIVE_EMPTY_MESSAGE}");
  });
});
