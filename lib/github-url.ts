const INVALID_MESSAGE =
  "That doesn't look like a GitHub repository link. Try https://github.com/owner/repo.";

const FULL_URL =
  /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/i;
const SHORT = /^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/;

export type GitHubUrlResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export function normalizeGitHubUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const short = trimmed.match(SHORT);
  if (short) {
    return `https://github.com/${short[1]}/${short[2]}`;
  }

  const full = trimmed.match(FULL_URL);
  if (full) {
    return `https://github.com/${full[1]}/${full[2]}`;
  }

  return null;
}

export function validateGitHubUrl(raw: string): GitHubUrlResult {
  const url = normalizeGitHubUrl(raw);
  if (!url) {
    return { ok: false, message: INVALID_MESSAGE };
  }
  return { ok: true, url };
}
