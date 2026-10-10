# VibeCheck Architecture

> Derived from `docs/MASTER_SPEC.md`. The master specification governs if anything conflicts.

> **Gap:** The separate `docs/plan/vibecheck.md` originally referenced for the authoritative database schema was not provided. Do not treat a proposed schema as approved.

## 14. Frontend Architecture

### 14.1 Stack

- Next.js (App Router), TypeScript (strict), React, Tailwind CSS compiled in the build.
- Components: a small set of owned primitives built on accessible patterns (e.g., Radix UI primitives) styled with tokens. (Proposal; approval with CR-18.)
- Forms: React Hook Form with Zod schemas.
- Server state: TanStack Query for client fetches; server components for initial data where possible.
- Local UI state: React state; theme and companion visibility stored in local preferences only.

### 14.2 Proposed folder structure (not yet existing)

```
app/
  (marketing)/page.tsx                  # Home
  code-detective/page.tsx
  rubber-duck/page.tsx
  knowledge-check/page.tsx
  plan/page.tsx
  deploy/page.tsx
  my-skills/page.tsx
  sign-in/page.tsx
  profile/page.tsx
  samples/[id]/page.tsx
  api/...                               # route handlers (see §18)
components/
  ui/                                   # primitives (Button, Input, Card, Tabs, Dialog)
  brand/                                # Logo, Wordmark, Placeholder
  site/                                 # SiteHeader, Navigation
  repo/                                 # RepositoryInput, RepoSwitcher, StatusLine
  code/                                 # CodeViewer, CodeExplanationPanel
  learn/                                # QuestionCard, LearningFeedback, LessonRenderer
  skills/                               # SkillProgress, KnowledgeBar
  companion/                            # AICompanionBubble, AICompanionPanel
  states/                               # EmptyState, ErrorState, OfflineNotice
features/
  home/ code-detective/ rubber-duck/ knowledge-check/ plan/ deploy/ my-skills/
lib/
  api-client/                           # typed client generated from OpenAPI
  theme/                                # theme bootstrap, tokens
  format/                               # dates, numbers
styles/
  globals.css                           # tokens
design/
  tokens.json                           # source of truth for tokens (optional)
public/
  brand/                                # official SVG assets (pending)
  icons/
tests/
  unit/ integration/ e2e/ a11y/ visual/
```

### 14.3 Rendering rules

- Marketing and initial-state pages are server-rendered for fast first paint.
- Workspaces hydrate client-side for selection and companion interactions.
- No repository content is rendered via `dangerouslySetInnerHTML`.

### 14.4 Client data rules

- The client never receives answer keys, rubrics, or tokens (§18).
- All AI outputs are typed by schemas generated from the backend contracts.

---

## 15. Backend Architecture

### 15.1 Services (logical; may be one deployable in Stage 1)

| Service | Responsibility |
|---|---|
| Auth | GitHub OAuth, sessions, Supabase Auth integration |
| Repositories | Import, list, consent records |
| Analysis | Runs, stages, evidence storage |
| Taxonomy | Versioned concept definitions |
| Assessment | Generation, grading, answer keys, item reports |
| Knowledge | Knowledge state transitions, staleness, skill summaries |
| Lessons | Lesson specs, external resource allowlist |
| Duck | Session state, hints, flags |
| Companion | Scoped conversations and grounding |
| Usage | AI usage ledger, budgets |

Stage 1 implementation: one Next.js application with route handlers and a background worker process. Services are modules with explicit interfaces so they can split later. No microservices in Stage 1.

### 15.2 Background work

Analysis and AI-heavy tasks run as jobs in a database-backed queue (the `analysis_runs` table with status transitions and a polling worker). See §19.

### 15.3 Error handling model

- Domain errors have stable codes (for example `REPO_NOT_FOUND`, `GITHUB_RATE_LIMITED`, `AI_BUDGET_EXHAUSTED`, `AI_OUTPUT_INVALID`).
- Errors are logged server-side with correlation IDs; the client receives the code, a human message, and the request ID.

---

## 16. Database and Knowledge Model

The data model is defined in full in `docs/plan/vibecheck.md` §8 and is authoritative for schema. This section defines the **knowledge rules** that the schema must enforce.

### 16.1 Knowledge states

Per user per concept, two tracks:

- `independent_state`: `unassessed` | `assessed_correct` | `assessed_partial` | `assessed_incorrect`
- `assisted_state`: same values, for attempts self-declared as AI-assisted

Rules:

- **KM-01** A concept that appears in code but has no assessment is `unassessed` and is displayed as "unverified."
- **KM-02** Commit history alone never changes a knowledge state (addresses the prompt's requirement that scores come from evidence).
- **KM-03** An attempt updates exactly one track, based on the declaration at attempt time.
- **KM-04** A state older than 180 days is displayed as stale; the underlying state is retained.
- **KM-05** Skill summaries include only assessed evidence in "Demonstrated." Everything else is listed as "Not yet verified."

### 16.2 Additions to the plan schema required by this spec

- `assessment_items.flagged_at` and `disabled_at` (item reporting and operator disable).
- `attempts.idempotency_key` for safe retries.
- `concepts.retired_at` and `replaced_by` for taxonomy evolution.
- `analysis_runs.stage` for progress display.

---

## 18. API Contracts and External Integrations

### 18.1 Conventions

- REST under `/api`, JSON, envelope `{ data, error }` (per the plan §9).
- Every route is described in OpenAPI 3.1 and checked in CI (API-001).
- Idempotency: `Idempotency-Key` on all POSTs that create attempts, analysis runs, or AI outputs (API-002).
- Pagination: cursor-based.
- Rate limits: per-user limits on AI-triggering endpoints; `429` responses with `Retry-After`.
- Auth: session cookie (HTTP-only, SameSite=Lax) for browser; no tokens in client JavaScript.

### 18.2 Key contracts (summary)

| Endpoint | Client receives | Client never receives |
|---|---|---|
| `POST /api/repositories` | Repository summary | GitHub token |
| `POST /api/repositories/:id/analysis-runs` | `202` with run ID | Model prompts |
| `GET /api/analysis-runs/:id` | Stage, progress, error code | Raw repository files beyond the displayed excerpt |
| `GET /api/repositories/:id/concepts` | Concepts with evidence references | Full file content |
| `POST /api/assessments` | Items without answers | Answer key, rubric, explanation |
| `POST /api/assessments/:id/attempts` | Outcome, misconception, explanation, follow-up | Other items' answers |
| `POST /api/assessment-items/:id/reports` | Acknowledgment | Reporter identity to other users |
| `POST /api/companion/messages` | Assistant message with grounding references | System prompt, usage internals |
| `POST /api/code-detective` | Explanations with tags and evidence | Model reasoning traces |

### 18.3 Companion endpoint rule

The companion receives a context object: page, repository ID, file path, and line range. It never receives arbitrary file contents beyond the selected range plus configured surrounding lines.

### 18.4 External integrations

| System | Use | Failure handling |
|---|---|---|
| GitHub API | Repositories, commits, contents | Retry transient failures; honor rate limits; show specific messages |
| GitHub OAuth/App | Authorization | Show re-authorization prompt on token revocation |
| Claude API | Generation and grading | Schema validation; one repair retry; circuit breaker; budget checks |
| Supabase | Database, Auth, Realtime (optional) | Retry reads; writes idempotent |
| Link checker | Resource URLs | 5 s timeout; cache 7 days |

### 18.5 Versioning

- API version prefix reserved (`/api/v1`) from first release; breaking changes require a new version.
- Schema versions for AI outputs are named (`assessment.v1.json`).

---

## 19. Concurrency and Background Processing

### 19.1 Principles

Concurrency is used only for independent, network-bound work. Bounded concurrency, timeouts, cancellation, retries, and observability are mandatory (CONC-001 through CONC-006).

### 19.2 Analysis pipeline

1. **Fetch commits** — sequential pagination per repository.
2. **Fetch file contents** for changed files — up to 4 concurrent requests via a semaphore; 10 s timeout each.
3. **Rule-based concept mapping** — CPU-bound; runs in the worker; no concurrency beyond one per run.
4. **AI concept detection for ambiguous hunks** — up to 3 concurrent calls; 60 s timeout; batched where token budget allows.
5. **Evidence persistence** — ordered writes per run.
6. **Progress updates** — stage transitions written to `analysis_runs`.

### 19.3 Other concurrent operations

- Link checks: up to 8 concurrent, 5 s timeout, 7-day cache.
- Assessment generation: one per user session at a time.

### 19.4 Run lifecycle

`queued → running (stage) → succeeded | failed | cancelled`. Cancellation is requested by the user and honored between stages. Failed runs record `error_code` and can be resumed from the last completed stage.

### 19.5 Worker

- Polls the queue every 2 s when idle, backs off to 10 s.
- Each job has a lease; expired leases return the job to the queue.
- Process limit: configurable; default 2 concurrent runs per worker.

### 19.6 Rate limiting and budgets

- GitHub: stay below 80% of authenticated quota; honor `X-RateLimit-Reset`.
- AI: per-user monthly budget; per-hour generation limit; circuit breaker after 5 consecutive failures for 60 s.

---
