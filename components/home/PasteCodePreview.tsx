"use client";

import { useState } from "react";
import { PASTE_CODE_MAX_CHARS, validatePasteCode, type PasteLanguage } from "@/lib/paste-code";
import { Button } from "../ui/Button";

export function PasteCodePreview() {
  const [language, setLanguage] = useState<PasteLanguage>("typescript");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  function onAnalyze() {
    const validated = validatePasteCode(source, language);
    if (!validated.ok) {
      setAcknowledged(false);
      setError(validated.message);
      return;
    }
    setError(null);
    setAcknowledged(true);
  }

  return (
    <div className="w-full max-w-2xl text-left">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-warning">
          Product preview
        </span>
        <p className="text-sm text-text-muted">
          Don&apos;t use GitHub yet? Paste AI-generated code directly and VibeCheck will help you
          understand the concepts inside it.
        </p>
      </div>

      <div className="mb-3 flex gap-2" role="group" aria-label="Language">
        {(["typescript", "javascript"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            className={`min-h-10 rounded-lg border px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              language === option
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-surface text-text-muted hover:text-text"
            }`}
          >
            {option === "typescript" ? "TypeScript" : "JavaScript"}
          </button>
        ))}
      </div>

      <label htmlFor="paste-code-editor" className="sr-only">
        Paste JavaScript or TypeScript
      </label>
      <textarea
        id="paste-code-editor"
        value={source}
        onChange={(event) => {
          setSource(event.target.value);
          setAcknowledged(false);
        }}
        spellCheck={false}
        rows={10}
        maxLength={PASTE_CODE_MAX_CHARS + 1}
        placeholder={"// paste AI-generated JavaScript or TypeScript\nexport async function load() {\n  return await fetch('/api');\n}"}
        className="w-full resize-y rounded-lg border border-border bg-surface p-4 font-mono text-[13px] leading-5 text-text shadow-[0_8px_28px_rgba(7,27,44,0.25)] placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      />
      <p className="mt-2 text-xs text-text-muted">
        Up to {PASTE_CODE_MAX_CHARS.toLocaleString()} characters. Code is never executed. JS/TS only —
        no ZIP or file upload.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onAnalyze}>
          Analyze Code
        </Button>
        <p className="text-sm text-text-muted">
          Start where you are. Learn the professional workflow as you grow.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {acknowledged ? (
        <div
          className="mt-4 rounded-[var(--radius-card)] border border-warning/40 bg-warning/10 p-4 text-sm leading-6 text-text"
          role="status"
        >
          <p className="font-semibold text-text">Paste Code is a product preview</p>
          <p className="mt-2 text-text-muted">
            Full direct-code analysis is not wired yet because the frozen API treats sources as GitHub
            repositories with commit evidence. We will not fabricate a GitHub URL, owner, or commit SHA.
            GitHub Repository remains the live path for Code Detective and Knowledge Check today.
          </p>
        </div>
      ) : null}
    </div>
  );
}
