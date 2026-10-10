import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PASTE_CODE_MAX_CHARS, validatePasteCode } from "../../lib/paste-code";

describe("Paste Code product preview", () => {
  it("keeps GitHub as the default homepage mode and offers Paste Code switching", () => {
    const home = readFileSync(join(process.cwd(), "components/home/HomeExperience.tsx"), "utf8");
    expect(home).toContain('useState<"github" | "paste">("github")');
    expect(home).toContain("GitHub Repository");
    expect(home).toContain("Paste Code");
    expect(home).toContain("PasteCodePreview");
  });

  it("rejects empty, oversized, and unsupported language input without executing source", () => {
    expect(validatePasteCode("   ", "typescript").ok).toBe(false);
    expect(validatePasteCode("const x = 1;", "python").ok).toBe(false);
    expect(validatePasteCode("x".repeat(PASTE_CODE_MAX_CHARS + 1), "javascript").ok).toBe(false);
    const ok = validatePasteCode("export const n = 1;\n", "typescript");
    expect(ok).toEqual({ ok: true, language: "typescript", source: "export const n = 1;\n" });
    const preview = readFileSync(join(process.cwd(), "components/home/PasteCodePreview.tsx"), "utf8");
    expect(preview).toContain("Product preview");
    expect(preview).not.toContain("eval(");
    expect(preview).not.toContain("Function(");
    expect(preview).not.toContain("new Worker");
    expect(preview).toContain("never executed");
  });

  it("does not fabricate GitHub repository metadata for pasted sources", () => {
    const preview = readFileSync(join(process.cwd(), "components/home/PasteCodePreview.tsx"), "utf8");
    expect(preview).toContain("will not fabricate");
    expect(preview).toContain("commit SHA");
    expect(preview).not.toMatch(/github\.com\/paste/i);
    expect(preview).not.toContain("createRepository");
  });

  it("adds a New to GitHub Plan preview without claiming a live Git course", () => {
    const plan = readFileSync(join(process.cwd(), "app/plan/page.tsx"), "utf8");
    expect(plan).toContain("New to GitHub?");
    expect(plan).toContain("Start where you are. Learn the professional workflow as you grow.");
    expect(plan).toContain("Product preview");
    expect(plan).toContain("not live in this demo");
  });
});
