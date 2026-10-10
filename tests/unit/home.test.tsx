import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeExperience } from "../../components/home/HomeExperience";

describe("Homepage shell", () => {
  it("renders VibeCheck hero without fabricated analysis claims", () => {
    const markup = renderToStaticMarkup(<HomeExperience />);

    expect(markup).toContain("VibeCheck");
    expect(markup).toContain("Build with AI. Understand what you build.");
    expect(markup).not.toContain("Mapped 43 files");
    expect(markup).not.toContain("Application foundation");
  });
});
