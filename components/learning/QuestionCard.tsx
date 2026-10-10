"use client";

import { useId, useState } from "react";
import type { AiAssistance, AssessmentItem, Attempt } from "@/lib/api/types";
import { Button } from "../ui/Button";
import { LearningFeedback } from "./LearningFeedback";

type Props = {
  item: AssessmentItem;
  index: number;
  total: number;
  onSubmit: (answer: string, aiAssistance: AiAssistance) => Promise<Attempt>;
  onContinue: () => void;
};

export function QuestionCard({ item, index, total, onSubmit, onContinue }: Props) {
  const groupId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [aiAssistance, setAiAssistance] = useState<AiAssistance>("no");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answered = !!attempt;
  const options = item.options ?? [];

  async function handleSubmit() {
    if (!selected || answered) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await onSubmit(selected, aiAssistance);
      setAttempt(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit answer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
        Question {index + 1} of {total}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-text">{item.question}</h2>

      <fieldset className="mt-6" disabled={answered || submitting}>
        <legend className="sr-only">Answer choices</legend>
        <div className="flex flex-col gap-3" role="radiogroup" aria-labelledby={`${groupId}-q`}>
          <span id={`${groupId}-q`} className="sr-only">
            {item.question}
          </span>
          {options.map((option) => {
            const checked = selected === option.id;
            return (
              <label
                key={option.id}
                className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors duration-150 focus-within:ring-2 focus-within:ring-focus ${
                  checked
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background hover:border-primary/60"
                }`}
              >
                <input
                  type="radio"
                  name={`${groupId}-answer`}
                  value={option.id}
                  checked={checked}
                  onChange={() => setSelected(option.id)}
                  className="mt-1 h-4 w-4 accent-[var(--vc-primary)]"
                />
                <span className="text-[15px] leading-6 text-text">{option.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {!answered ? (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-text">
            Did you use AI help for this answer?
          </legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {(
              [
                ["no", "No"],
                ["yes", "Yes"],
                ["prefer_not_to_say", "Prefer not to say"]
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm text-text-muted"
              >
                <input
                  type="radio"
                  name={`${groupId}-ai`}
                  value={value}
                  checked={aiAssistance === value}
                  onChange={() => setAiAssistance(value)}
                  className="accent-[var(--vc-primary)]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {!answered ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || submitting}
          >
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        ) : (
          <Button type="button" onClick={onContinue}>
            Continue
          </Button>
        )}
      </div>

      {attempt ? (
        <div className="mt-6">
          <LearningFeedback attempt={attempt} />
        </div>
      ) : null}
    </article>
  );
}
