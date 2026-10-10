import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeExperience } from "../../components/home/HomeExperience";

describe("Homepage shell", () => {
  it("renders VibeCheck hero without fabricated analysis claims", () => {
    const markup = renderToStaticMarkup(<HomeExperience />);

    expect(markup).toContain("VibeCheck");
    expect(markup).toContain("Build with AI.");
    expect(markup).toContain("Understand what you build.");
    expect(markup).toContain("Analyze");
    expect(markup).toContain("How VibeCheck works");
    expect(markup).toContain("Your repository");
    expect(markup).toContain("Understand code AI writes");
    expect(markup).toContain("Learn through your projects");
    expect(markup).toContain("Prove what you demonstrated");
    expect(markup).not.toContain("Mapped 43 files");
    expect(markup).not.toContain("Application foundation");
    expect(markup).not.toContain("96.8%");
    expect(markup).not.toContain("0 vulnerabilities");
  });
});
