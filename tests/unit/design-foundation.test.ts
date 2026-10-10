import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const roles = [
  "background",
  "surface",
  "surface-raised",
  "text",
  "text-muted",
  "border",
  "primary",
  "primary-hover",
  "on-primary",
  "focus",
  "success",
  "warning",
  "danger",
  "information",
  "learning"
];

describe("shared design foundation", () => {
  it("defines each semantic role in both themes and wires it into compiled Tailwind", () => {
    const tokens = JSON.parse(read("design/tokens.json")) as {
      colors: { semantic: Record<"dark" | "light", Record<string, string>> };
    };
    const css = read("app/globals.css");

    expect(css).toContain('@import "tailwindcss"');
    for (const [theme, selector] of [
      ["dark", ":root"],
      ["light", '[data-theme="light"]']
    ] as const) {
      const block = css.match(
        new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]+)\\}`)
      )?.[1];
      expect(block, `${theme} theme CSS block`).toBeDefined();
      for (const role of roles) {
        const value = tokens.colors.semantic[theme][role];
        expect(value, `${theme}.${role}`).toMatch(/^#[0-9a-fA-F]{6}$/);
        expect(block).toContain(`--vc-${role}: ${value};`);
        expect(css).toContain(`--color-${role}: var(--vc-${role});`);
      }
    }
    expect(css).toContain("@theme inline");
    expect(css).not.toContain("cdn.tailwindcss.com");
  });

  it("loads approved fonts and defaults the shell to dark", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toContain('from "next/font/google"');
    expect(layout).toContain("Inter");
    expect(layout).toContain("JetBrains_Mono");
    expect(layout).toContain('data-theme="dark"');
    expect(layout).toContain("--font-inter");
    expect(layout).toContain("--font-jetbrains-mono");
    expect(read("app/page.tsx")).toContain("HomeExperience");
  });

  it("keeps Stitch technology out of production and exposes the approved compass", () => {
    const appSource = ["app/layout.tsx", "app/page.tsx", "app/globals.css"]
      .map(read)
      .join("\n");
    expect(appSource).not.toMatch(/cdn\.tailwindcss\.com|material-symbols|stitch\.html/i);
    for (const variant of ["light", "dark", "black", "white"]) {
      expect(existsSync(join(root, `public/brand/compass-${variant}.svg`))).toBe(true);
    }
  });
});
