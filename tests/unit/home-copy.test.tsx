import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeExperience } from "../../components/home/HomeExperience";

describe("Homepage copy (hackathon demo)", () => {
  it("shows the approved hero and supporting message without fabricated metrics", () => {
    const markup = renderToStaticMarkup(<HomeExperience />);

    expect(markup).toContain("Build with AI. Understand what you build.");
    expect(markup).toContain(
      "VibeCheck helps developers understand, learn from, and prove their understanding of AI-assisted code using their own repositories."
    );
    expect(markup).toContain("Analyze");
    expect(markup).not.toContain("Mapped 43 files");
    expect(markup).not.toContain("89% AI");
    expect(markup).not.toContain("0 vulnerabilities");
    expect(markup).not.toContain("Application foundation");
  });
});
