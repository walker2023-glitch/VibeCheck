import { describe, expect, it } from "vitest";
import { normalizeGitHubUrl, validateGitHubUrl } from "../../lib/github-url";

const INVALID_MESSAGE =
  "That doesn't look like a GitHub repository link. Try https://github.com/owner/repo.";

describe("GitHub URL validation (UI-HOME-01)", () => {
  it("accepts full https GitHub URLs and owner/repo shorthand", () => {
    expect(validateGitHubUrl("https://github.com/vercel/next.js")).toEqual({
      ok: true,
      url: "https://github.com/vercel/next.js"
    });
    expect(validateGitHubUrl("owner/repo")).toEqual({
      ok: true,
      url: "https://github.com/owner/repo"
    });
    expect(normalizeGitHubUrl("  owner/repo  ")).toBe("https://github.com/owner/repo");
  });

  it("rejects empty, non-GitHub, and malformed values with the approved message", () => {
    expect(validateGitHubUrl("")).toEqual({ ok: false, message: INVALID_MESSAGE });
    expect(validateGitHubUrl("https://gitlab.com/owner/repo")).toEqual({
      ok: false,
      message: INVALID_MESSAGE
    });
    expect(validateGitHubUrl("not a url")).toEqual({ ok: false, message: INVALID_MESSAGE });
  });
});
