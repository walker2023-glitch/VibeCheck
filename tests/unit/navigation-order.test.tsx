import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/"
}));

import { PRIMARY_NAV, SiteHeader } from "../../components/shell/SiteHeader";

describe("Primary navigation lifecycle order", () => {
  it("orders links as Home → Plan → Code Detective → Knowledge Check → Rubber Duck → Deploy → My Skills", () => {
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      "Home",
      "Plan",
      "Code Detective",
      "Knowledge Check",
      "Rubber Duck",
      "Deploy",
      "My Skills"
    ]);
  });

  it("renders that order in the header markup", () => {
    const markup = renderToStaticMarkup(<SiteHeader />);
    const positions = PRIMARY_NAV.map((item) => markup.indexOf(`>${item.label}<`));
    for (let i = 1; i < positions.length; i += 1) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });
});
