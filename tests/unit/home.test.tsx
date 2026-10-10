import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import HomePage from "../../app/page";

describe("M0-01 neutral application shell", () => {
  it("renders the application name without fabricated analysis", () => {
    const markup = renderToStaticMarkup(<HomePage />);

    expect(markup).toContain("VibeCheck");
    expect(markup).toContain("Application foundation");
    expect(markup).not.toContain("Mapped 43 files");
  });
});
