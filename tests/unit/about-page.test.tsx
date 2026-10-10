import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AboutPage } from "../../components/about/AboutPage";

describe("About product story page", () => {
  it("renders the judge pitch without fabricated prices or live claims for planned work", () => {
    const markup = renderToStaticMarkup(<AboutPage />);

    expect(markup).toContain("Why VibeCheck?");
    expect(markup).toContain("We&#x27;re generating software faster than we&#x27;re learning it.");
    expect(markup).toContain(
      "VibeCheck turns the software you build with AI into the material you learn from."
    );
    expect(markup).toContain("Try VibeCheck");
    expect(markup).toContain("Learning with AI");
    expect(markup).toContain("Building with AI");
    expect(markup).toContain("Responsible for AI-built software");
    expect(markup).toContain(
      "For anyone whose ability to build with AI is growing faster than their understanding."
    );
    expect(markup).toContain("Found in your code ≠ Demonstrated knowledge");
    expect(markup).toContain("Real evidence → Learn → Knowledge Check → Demonstrated");
    expect(markup).toContain("Coding agents help you produce. VibeCheck helps you understand what you produced.");
    expect(markup).toContain("Deterministic evidence");
    expect(markup).toContain("Grounded Claude explanation");
    expect(markup).toContain("Deterministic grading");
    expect(markup).toContain("Sending repository evidence to managed AI requires explicit user consent.");
    expect(markup).toContain("Bring Your Own Key");
    expect(markup).toContain("Planned");
    expect(markup).toContain("Education &amp; Teams");
    expect(markup).toContain("Does the student understand what they submitted?");
    expect(markup).toContain("Educator dashboards are not part of this demo");
    expect(markup).toContain("Keep the speed. Gain the understanding.");
    expect(markup).toContain("Build with AI. Understand what you build.");
    expect(markup).not.toContain("$");
    expect(markup).not.toContain("/month");
  });

  it("labels preview lifecycle tools distinctly from live Code Detective and Knowledge Check", () => {
    const markup = renderToStaticMarkup(<AboutPage />);
    expect(markup).toContain("Code Detective");
    expect(markup).toContain("Knowledge Check");
    expect(markup).toContain("Live");
    expect(markup).toContain("Plan");
    expect(markup).toContain("Rubber Duck");
    expect(markup).toContain("Deploy");
    expect(markup).toContain("My Skills");
    expect(markup).toContain("Preview");
  });
});
