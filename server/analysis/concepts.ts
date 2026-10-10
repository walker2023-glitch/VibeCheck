import { createHash } from "node:crypto";
import type { SourceFile } from "../github/public-repository";

export type Evidence = { id: string; commitSha: string; path: string; startLine: number; endLine: number; language: string; kind: "observed" | "inferred"; snippet: string; snippetTruncated: boolean };
export type Concept = { id: string; label: string; evidence: Evidence[] };

const detectors = [
  { id: "async-await", label: "Async and await", pattern: /\b(?:async\s+(?:function\b|\([^)]*\)\s*=>|[A-Za-z_$][\w$]*\s*\()|await\b)/ },
  { id: "promise", label: "Promises", pattern: /\bPromise(?:\.all|\.race|\.resolve|\.reject)?\s*\(/ },
  { id: "error-handling", label: "Error handling", pattern: /\b(?:try\s*\{|catch\s*\()/ },
  { id: "react-state", label: "React state", pattern: /\buseState\s*\(/ },
  { id: "react-effect", label: "React effects", pattern: /\buseEffect\s*\(/ },
  { id: "fetch-api", label: "API calls with fetch", pattern: /\bfetch\s*\(/ },
  { id: "functions", label: "Functions and components", pattern: /\bfunction\s+[\w$]+\s*\(|(?:const|let)\s+[\w$]+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>/ },
  { id: "modules", label: "Imports and modules", pattern: /\b(?:import\s+(?:[\w$*{]|\()|export\s+(?:default\s+)?(?:function|const|class|\{))/ },
] as const;

function codeOnly(line: string, inBlock: boolean): { code: string; inBlock: boolean } {
  let result = "", quote = "";
  for (let i = 0; i < line.length; i++) {
    const char = line[i], next = line[i + 1];
    if (inBlock) { if (char === "*" && next === "/") { inBlock = false; i++; } continue; }
    if (quote) { if (char === "\\") { i++; continue; } if (char === quote) quote = ""; continue; }
    if (char === "'" || char === '"' || char === "`") { quote = char; continue; }
    if (char === "/" && next === "/") break;
    if (char === "/" && next === "*") { inBlock = true; i++; continue; }
    result += char;
  }
  return { code: result, inBlock };
}

export function redactSnippet(value: string): string {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, "[REDACTED]")
    .replace(/(?:sk|rk)-[A-Za-z0-9_-]{20,}/g, "[REDACTED]")
    .replace(/((?:api[_-]?key|token|secret|password)\s*[:=]\s*["'`])[^"'`]+/gi, "$1[REDACTED]");
}

export function analyzeSources(files: SourceFile[]): Concept[] {
  const found = new Map<string, Concept>();
  for (const file of files) {
    let inBlock = false;
    const lines = file.content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const parsed = codeOnly(lines[index], inBlock);
      inBlock = parsed.inBlock;
      for (const detector of detectors) {
        if (!detector.pattern.test(parsed.code)) continue;
        const existing = found.get(detector.id) ?? { id: detector.id, label: detector.label, evidence: [] };
        if (existing.evidence.length >= 2) continue;
        const redacted = redactSnippet(lines[index].trim());
        const snippetTruncated = redacted.length > 2_000;
        const evidence: Evidence = {
          id: createHash("sha256").update(`${file.commitSha}:${file.path}:${index + 1}:${detector.id}`).digest("hex").slice(0, 24),
          commitSha: file.commitSha, path: file.path, startLine: index + 1, endLine: index + 1,
          language: file.language, kind: "observed", snippet: redacted.slice(0, 2_000), snippetTruncated,
        };
        existing.evidence.push(evidence);
        found.set(detector.id, existing);
      }
    }
  }
  return detectors.map((detector) => found.get(detector.id)).filter((concept): concept is Concept => concept !== undefined).slice(0, 6);
}
