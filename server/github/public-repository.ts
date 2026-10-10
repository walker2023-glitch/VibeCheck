export type SourceFile = { path: string; language: "javascript" | "typescript"; content: string; commitSha: string };
export type PublicSnapshot = { commitSha: string; files: SourceFile[]; skippedFiles: number; partial: boolean };

export class GithubError extends Error {
  constructor(public code: "REPOSITORY_NOT_FOUND" | "REPOSITORY_INACCESSIBLE" | "GITHUB_RATE_LIMITED" | "GITHUB_UNAVAILABLE" | "ANALYSIS_FAILED", public status: number, message: string) { super(message); }
}

const SHA = /^[a-f0-9]{40}$/i;
const MAX_FILE_BYTES = 1_048_576;
const MAX_FILES = 12;
const MAX_TOTAL_BYTES = 3 * MAX_FILE_BYTES;
const MAX_TREES = 8;
const MAX_ENTRIES = 1_200;
const MAX_RESPONSE_BYTES = 1_600_000;
const SKIP_DIRECTORY = /^(?:node_modules|\.next|\.git|dist|build|out|coverage|vendor|generated|__generated__|\.turbo)$/i;
const SKIP_FILE = /(?:^|\/)(?:.*(?:\.min\.|\.generated\.|\.gen\.|\.bundle\.)|package-lock\.json$)|(?:\.d\.ts$|\.map$)/i;

export function parseGithubUrl(input: string): { owner: string; repo: string; githubUrl: string } {
  if (typeof input !== "string" || input.length > 200) throw new Error("Expected a canonical GitHub repository URL.");
  const match = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)\/([A-Za-z0-9._-]+)$/.exec(input);
  if (!match || match[2] === "." || match[2] === ".." || match[2].length > 100) throw new Error("Expected a canonical GitHub repository URL.");
  const url = new URL(input);
  if (url.username || url.password || url.host !== "github.com" || url.search || url.hash || url.pathname !== `/${match[1]}/${match[2]}`) throw new Error("Expected a canonical GitHub repository URL.");
  return { owner: match[1], repo: match[2], githubUrl: input };
}

function safeSegment(value: string): boolean {
  return value.length > 0 && value !== "." && value !== ".." && !/[\\/\u0000-\u001f]/.test(value) && !value.includes("%") && !value.includes(":");
}

export function safeRelativePath(path: string): boolean {
  return path.length <= 400 && path.split("/").every(safeSegment);
}

async function readBounded(response: Response): Promise<unknown> {
  if (!response.body) throw new GithubError("GITHUB_UNAVAILABLE", 503, "GitHub returned an empty response.");
  const reader = response.body.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_RESPONSE_BYTES) throw new GithubError("ANALYSIS_FAILED", 500, "GitHub metadata exceeded the analysis budget.");
      parts.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(parts).toString("utf8"));
}

async function githubJson(path: string, fetcher: typeof fetch): Promise<unknown> {
  const url = `https://api.github.com${path}`;
  let response: Response;
  try {
    response = await fetcher(url, {
      method: "GET", redirect: "error", signal: AbortSignal.timeout(10_000),
      headers: {
        Accept: "application/vnd.github+json", "User-Agent": "VibeCheck-Demo",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
  } catch {
    throw new GithubError("GITHUB_UNAVAILABLE", 503, "GitHub could not be reached.");
  }
  if (!response.ok) {
    if (response.status === 404) throw new GithubError("REPOSITORY_NOT_FOUND", 404, "GitHub could not find this public repository.");
    if (response.status === 403 || response.status === 401) {
      if (response.headers.get("x-ratelimit-remaining") === "0") throw new GithubError("GITHUB_RATE_LIMITED", 429, "GitHub temporarily limited requests.");
      throw new GithubError("REPOSITORY_INACCESSIBLE", 403, "This public repository is unavailable.");
    }
    if (response.status === 429) throw new GithubError("GITHUB_RATE_LIMITED", 429, "GitHub temporarily limited requests.");
    throw new GithubError("GITHUB_UNAVAILABLE", 503, "GitHub could not be reached.");
  }
  try { return await readBounded(response); }
  catch (error) {
    if (error instanceof GithubError) throw error;
    throw new GithubError("GITHUB_UNAVAILABLE", 503, "GitHub returned invalid data.");
  }
}

type TreeEntry = { path?: unknown; type?: unknown; sha?: unknown; size?: unknown };
const directoryPriority = (path: string) => /^(src|app|pages|lib|components|hooks|utils)$/i.test(path) ? 0 : 1;
const filePriority = (path: string) => /(^|\/)(index|app|page|route|main)\.[jt]sx?$/.test(path) ? 0 : 1;

export async function retrievePublicSource(input: string, fetcher: typeof fetch = fetch): Promise<PublicSnapshot> {
  const { owner, repo } = parseGithubUrl(input);
  const root = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const metadata = await githubJson(root, fetcher) as { default_branch?: unknown; private?: unknown };
  if (metadata.private !== false || typeof metadata.default_branch !== "string" || !safeSegment(metadata.default_branch)) throw new GithubError("REPOSITORY_INACCESSIBLE", 403, "This public repository is unavailable.");
  const commit = await githubJson(`${root}/commits/${encodeURIComponent(metadata.default_branch)}`, fetcher) as { sha?: unknown };
  if (typeof commit.sha !== "string" || !SHA.test(commit.sha)) throw new GithubError("ANALYSIS_FAILED", 500, "GitHub did not provide a valid commit snapshot.");
  const commitSha = commit.sha;
  const pending = [{ path: "", sha: commitSha }];
  const candidates: { path: string; sha: string; size: number }[] = [];
  let trees = 0, entriesSeen = 0, skippedFiles = 0, partial = false;
  while (pending.length && trees < MAX_TREES && entriesSeen < MAX_ENTRIES) {
    const directory = pending.shift()!;
    const tree = await githubJson(`${root}/git/trees/${directory.sha}`, fetcher) as { tree?: TreeEntry[]; truncated?: boolean };
    trees++;
    if (!Array.isArray(tree.tree)) throw new GithubError("ANALYSIS_FAILED", 500, "GitHub returned an invalid source tree.");
    if (tree.truncated) partial = true;
    for (const entry of tree.tree) {
      entriesSeen++;
      if (entriesSeen > MAX_ENTRIES) { partial = true; break; }
      if (typeof entry.path !== "string" || !safeSegment(entry.path) || typeof entry.sha !== "string" || !SHA.test(entry.sha)) { skippedFiles++; continue; }
      const path = directory.path ? `${directory.path}/${entry.path}` : entry.path;
      if (!safeRelativePath(path)) { skippedFiles++; continue; }
      if (entry.type === "tree") {
        if (!SKIP_DIRECTORY.test(entry.path) && path.split("/").length <= 5) pending.push({ path, sha: entry.sha });
        continue;
      }
      if (entry.type !== "blob") continue;
      if (!/\.[jt]sx?$/i.test(path) || SKIP_FILE.test(path)) { skippedFiles++; continue; }
      if (typeof entry.size !== "number" || entry.size < 0 || entry.size > MAX_FILE_BYTES) { skippedFiles++; partial = true; continue; }
      candidates.push({ path, sha: entry.sha, size: entry.size });
    }
    pending.sort((a, b) => directoryPriority(a.path) - directoryPriority(b.path) || a.path.localeCompare(b.path));
  }
  if (pending.length) partial = true;
  candidates.sort((a, b) => filePriority(a.path) - filePriority(b.path) || a.size - b.size || a.path.localeCompare(b.path));
  const files: SourceFile[] = [];
  let totalBytes = 0;
  for (const candidate of candidates) {
    if (files.length >= MAX_FILES || totalBytes + candidate.size > MAX_TOTAL_BYTES) { skippedFiles++; partial = true; continue; }
    const blob = await githubJson(`${root}/git/blobs/${candidate.sha}`, fetcher) as { encoding?: unknown; content?: unknown; size?: unknown };
    if (blob.encoding !== "base64" || typeof blob.content !== "string" || typeof blob.size !== "number" || blob.size > MAX_FILE_BYTES) { skippedFiles++; partial = true; continue; }
    const bytes = Buffer.from(blob.content.replace(/\s/g, ""), "base64");
    if (bytes.length !== blob.size || bytes.includes(0)) { skippedFiles++; partial = true; continue; }
    let content: string;
    try { content = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
    catch { skippedFiles++; partial = true; continue; }
    totalBytes += bytes.length;
    files.push({ path: candidate.path, language: /\.tsx?$/i.test(candidate.path) ? "typescript" : "javascript", content, commitSha });
  }
  return { commitSha, files, skippedFiles, partial };
}

export async function checkPublicRepository(input: string, fetcher: typeof fetch = fetch): Promise<void> {
  const { owner, repo } = parseGithubUrl(input);
  const metadata = await githubJson(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, fetcher) as { private?: unknown };
  if (metadata.private !== false) throw new GithubError("REPOSITORY_INACCESSIBLE", 403, "This public repository is unavailable.");
}
