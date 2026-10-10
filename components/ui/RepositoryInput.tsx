"use client";

import type { FormEvent } from "react";
import { Button } from "./Button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (url: string) => void;
  error?: string | null;
  disabled?: boolean;
  submitting?: boolean;
  buttonLabel?: string;
  id?: string;
};

export function RepositoryInput({
  value,
  onChange,
  onSubmit,
  error,
  disabled,
  submitting,
  buttonLabel = "Analyze",
  id = "repository-url"
}: Props) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(value.trim());
  }

  const errorId = `${id}-error`;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl" noValidate>
      <label htmlFor={id} className="sr-only">
        GitHub repository URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <input
          id={id}
          name="githubUrl"
          type="text"
          inputMode="url"
          autoComplete="url"
          placeholder="Paste a GitHub repository URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || submitting}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="min-h-10 w-full flex-1 rounded-lg border border-border bg-surface px-4 text-[15px] text-text shadow-[0_8px_28px_rgba(7,27,44,0.25)] placeholder:text-text-muted transition-shadow duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[0_0_0_1px_rgba(22,184,176,0.35),0_8px_28px_rgba(22,184,176,0.12)] disabled:opacity-60"
        />
        <Button type="submit" disabled={disabled || submitting} className="sm:min-w-[120px]">
          {submitting ? "Working…" : buttonLabel}
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 flex items-start gap-2 text-sm text-danger">
          <span aria-hidden="true">!</span>
          <span>{error}</span>
        </p>
      ) : null}
    </form>
  );
}
