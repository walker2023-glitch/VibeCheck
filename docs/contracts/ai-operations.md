# AI service and operation contracts — proposal

Boundary: `feature → AI service → provider resolver → AIProvider interface → adapter`. Features know operation schemas, never Anthropic SDK types or credentials. The resolver selects one server-configured **managed Claude** provider for the hackathon. Future resolution may select managed or user-key mode, provider, and model under policy. BYOK, billing, encrypted user-key storage, and multiple provider implementations are explicitly deferred.

Conceptual `AIProvider.generate({operation, model, promptVersion, schemaVersion, boundedInput, timeout, idempotencyScope}) → {structuredOutput, provider, model, tokenUsage, finishReason, providerRequestId}`. Only the service can call it. The service enforces consent, secret scanning/redaction before code transfer, budget/rate limits, timeouts, cancellation, one bounded repair retry for malformed output, schema validation, provenance checks, and safe errors. Provider adapters never write application knowledge state. Raw keys are never in client output, ordinary tables, usage ledger, or logs.

Every operation output has `schemaVersion`, a list of claim objects `{kind: observed|inferred, text, evidenceRefs[]}`, and no chain-of-thought or hidden reasoning. **Observed requires at least one validated ref**; inferred is visibly labeled. Prompt version, provider/model, usage, error, and cost estimate are server metadata and may be shown only in appropriate transparency UI, never with credentials or raw prompts. Inputs are bounded, immutable snapshot refs plus selected excerpts. Source is delimited as untrusted data; no model tools can fetch other users' resources or perform writes.

| Operation | Structured output responsibility | Validation |
|---|---|---|
| `clarifyConcepts` | Candidate normalized concept IDs, evidence refs, observed/inferred claim, ambiguity note | Known taxonomy IDs; exact snapshot lines; no unsupported observed claim |
| `explainCode` | Plain-language summary, step explanation, one alternative/tradeoff, claims | All code claims cited or labeled inferred; no claim of execution |
| `generateAssessment` | Question type, concept/evidence refs, options or rubric, correct key, misconception tags, version notes | Server-only key/rubric; one defensible MCQ answer; no definition-only item |
| `evaluateWrittenAnswer` | `correct|partial|incorrect`, criterion-level rationale, cited evidence, review flag | Rubric-constrained; valid schema; display `AI-graded, reviewable` |
| `generateFeedback` | Misconception, what code does with line ref, concept explanation, follow-up question | Educational tone; no next-answer leakage; cite repository evidence |
| `guideRubberDuck` | First question, progressive hint level, optional solution only on explicit request | Question-first, hint-second; never claim fix works without test |
| `respondCompanion` | Scoped answer and suggested question with claims | Only selected page/repo/file/range and bounded surrounding lines |

Future persistent usage ledger: feature, owner/guest scope, operation, provider/model IDs, prompt/schema versions, token counts, cost estimate, timestamps, result/error. **Persistent ledger storage is deferred beyond the Hackathon Demo**; the demo still needs bounded provider use, rate limits, and operational cost visibility without logging source or credentials. The future ledger excludes raw prompts, source, answers, keys, and credentials. Future BYOK metadata is a restricted credential reference plus mode and selected provider/model; secret material belongs to a separate encrypted facility and is never implemented by this contract. Provider failure must not turn a failed grade into knowledge evidence. The demo uses deterministic multiple-choice grading; written-answer evaluation is Product Stage 1 work after the demo.

Tests before service implementation: each output schema, observed-claim evidence, inferred labels, answer-key secrecy, invalid/partial provider output, one repair retry, consent/secret-scan boundaries, prompt-injection fixtures, budget exhaustion, rate limits, model failure, usage-redaction assertions, and deterministic mocks in tests only.
