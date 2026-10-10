import { describe, expect, it, vi } from "vitest";
import { parseGithubUrl, retrievePublicSource } from "../../server/github/public-repository";
import { analyzeSources } from "../../server/analysis/concepts";

const sha = "a".repeat(40);
const blobSha = "b".repeat(40);

function githubFetch(source: string, size = Buffer.byteLength(source)) {
  const calls: string[] = [];
  const fetcher = vi.fn(async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith("/repos/acme/demo")) return Response.json({ default_branch: "main", private: false });
    if (url.endsWith("/repos/acme/demo/commits/main")) return Response.json({ sha });
    if (url.endsWith(`/repos/acme/demo/git/trees/${sha}`)) return Response.json({
      tree: [
        { path: "node_modules", type: "tree", sha: "c".repeat(40) },
        { path: "src", type: "tree", sha: "d".repeat(40) },
      ],
    });
    if (url.endsWith(`/repos/acme/demo/git/trees/${"d".repeat(40)}`)) return Response.json({
      tree: [
        { path: "app.ts", type: "blob", sha: blobSha, size },
        { path: "generated.min.js", type: "blob", sha: "e".repeat(40), size: 100 },
      ],
    });
    if (url.endsWith(`/repos/acme/demo/git/blobs/${blobSha}`)) return Response.json({
      encoding: "base64", content: Buffer.from(source).toString("base64"), size,
    });
    throw new Error(`Unexpected request: ${url}`);
  });
  return { fetcher, calls };
}

describe("FR-2 SEC-11 public GitHub ingestion", () => {
  it.each([
    "https://evil.com/acme/demo",
    "https://github.com.evil.com/acme/demo",
    "https://github.com/acme",
    "https://github.com/acme/demo/tree/main",
    "https://github.com/acme/../demo",
    "https://user:pass@github.com/acme/demo",
    "http://github.com/acme/demo",
    "not a URL",
  ])("rejects noncanonical or unsafe URL %s", (url) => {
    expect(() => parseGithubUrl(url)).toThrow();
  });

  it("accepts only a canonical owner/repository URL", () => {
    expect(parseGithubUrl("https://github.com/acme/demo")).toEqual({ owner: "acme", repo: "demo", githubUrl: "https://github.com/acme/demo" });
  });

  it("fetches a real immutable snapshot through fixed GitHub API paths and skips generated directories", async () => {
    const { fetcher, calls } = githubFetch("export async function load() {\n  try {\n    return await fetch('/api');\n  } catch (error) {\n    throw error;\n  }\n}\n");
    const result = await retrievePublicSource("https://github.com/acme/demo", fetcher);
    expect(result.commitSha).toBe(sha);
    expect(result.files).toEqual([{ path: "src/app.ts", language: "typescript", content: expect.stringContaining("await fetch"), commitSha: sha }]);
    expect(calls).toHaveLength(5);
    expect(calls.every((url) => url.startsWith("https://api.github.com/repos/acme/demo/" ) || url === "https://api.github.com/repos/acme/demo")).toBe(true);
  });

  it("skips an oversized file before fetching its blob", async () => {
    const { fetcher, calls } = githubFetch("x", 1_048_577);
    const result = await retrievePublicSource("https://github.com/acme/demo", fetcher);
    expect(result.files).toEqual([]);
    expect(result.skippedFiles).toBeGreaterThan(0);
    expect(calls.some((url) => url.includes("/git/blobs/"))).toBe(false);
  });

  it("rejects traversal-like paths supplied by a GitHub tree", async () => {
    const { fetcher } = githubFetch("const x = 1");
    const unsafe = vi.fn(async (input: string | URL | Request) => {
      if (String(input).endsWith(`/git/trees/${"d".repeat(40)}`)) return Response.json({ tree: [{ path: "../escape.ts", type: "blob", sha: blobSha, size: 10 }] });
      return fetcher(input);
    });
    const result = await retrievePublicSource("https://github.com/acme/demo", unsafe);
    expect(result.files).toEqual([]);
    expect(unsafe.mock.calls.some(([url]) => String(url).includes("/git/blobs/"))).toBe(false);
  });

  it("skips a source blob that is not valid UTF-8", async () => {
    const { fetcher } = githubFetch("xx", 2);
    const invalid = vi.fn(async (input: string | URL | Request) => {
      if (String(input).endsWith(`/git/blobs/${blobSha}`)) return Response.json({ encoding: "base64", content: Buffer.from([0xff, 0xfe]).toString("base64"), size: 2 });
      return fetcher(input);
    });
    const result = await retrievePublicSource("https://github.com/acme/demo", invalid);
    expect(result.files).toEqual([]);
    expect(result.skippedFiles).toBeGreaterThan(0);
  });
});

describe("FR-6 evidence-based concept detection", () => {
  it("detects actual syntax with one-based line references and no code execution", () => {
    const source = "// ignore this comment\nexport async function load() {\n  try {\n    return await fetch('/api');\n  } catch (error) {\n    throw error;\n  }\n}\n";
    const concepts = analyzeSources([{ path: "src/app.ts", language: "typescript", content: source, commitSha: sha }]);
    expect(concepts.find((item) => item.id === "async-await")?.evidence[0]).toMatchObject({ commitSha: sha, path: "src/app.ts", startLine: 2, language: "typescript", kind: "observed" });
    expect(concepts.find((item) => item.id === "fetch-api")?.evidence[0].startLine).toBe(4);
    expect(concepts.find((item) => item.id === "error-handling")?.evidence[0].startLine).toBe(3);
    expect(concepts.every((item) => item.evidence.every((evidence) => source.split("\n")[evidence.startLine - 1].includes(evidence.snippet)))).toBe(true);
  });

  it("redacts secrets and never derives a concept from comments alone", () => {
    const concepts = analyzeSources([{ path: "x.js", language: "javascript", content: "// await fetch('/api')\nconst token = 'ghp_abcdefghijklmnopqrstuvwxyz1234567890';\n", commitSha: sha }]);
    expect(concepts.some((item) => item.id === "async-await" || item.id === "fetch-api")).toBe(false);
    expect(JSON.stringify(concepts)).not.toContain("ghp_abcdefghijklmnopqrstuvwxyz1234567890");
  });

  it("treats repository source as text and never executes it", () => {
    const marker = "__vibecheckSourceExecuted";
    const source = `globalThis.${marker} = true;\nexport async function load() { return await fetch('/api'); }`;
    analyzeSources([{ path: "x.js", language: "javascript", content: source, commitSha: sha }]);
    expect((globalThis as Record<string, unknown>)[marker]).toBeUndefined();
  });

  it("prioritizes more instructive concepts when the six-concept projection is full", () => {
    const source = "import React from 'react';\nfunction App() {\n const [count, setCount] = useState(0);\n useEffect(() => {}, []);\n try {\n  return await fetch('/api');\n } catch (error) {}\n}\nPromise.all([]);";
    const found = analyzeSources([{ path: "app.tsx", language: "typescript", content: source, commitSha: sha }]);
    expect(found).toHaveLength(6);
    expect(found[0].id).toBe("async-await");
    expect(found.map((concept) => concept.id)).toContain("fetch-api");
  });
});
