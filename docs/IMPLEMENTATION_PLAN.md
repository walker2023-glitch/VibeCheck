# VibeCheck Implementation Plan

> Derived from `docs/MASTER_SPEC.md`. The master specification governs if anything conflicts.

> **Hackathon caution:** The narrower public-repository demo path is approved in the M0-02A decisions. Product Stage 1 scope remains in `docs/MASTER_SPEC.md` §7.1. Do not start parallel implementation before shared contracts are reviewed.

## 24. Parallel Agent Coordination

### 24.1 Shared contracts first

Before parallel work, these must exist and be reviewed:

- Design tokens (`design/tokens.json` and `globals.css`).
- Component prop interfaces for the shared components in §12.
- OpenAPI contract for the MVP endpoints.
- Database migrations for MVP tables.
- Domain error codes list.

M0-02A proposes the API, domain, AI, language, and error contracts in `docs/contracts/`. The reconstructed `docs/plan/vibecheck.md` is not the missing original. Tokens, migrations, and implementation remain later tasks and require their own approval.

### 24.2 Ownership and branches

- Each agent works in its own Git worktree and branch.
- File ownership:
  - **Frontend agent:** `app/`, `components/`, `features/`, `styles/`.
  - **Design agent:** `design/`, `styles/globals.css`, `public/brand/`.
  - **Backend agent:** `app/api/`, `server/`, `lib/api-client` (generated only).
  - **Analysis agent:** `server/analysis/`, `server/github/`, `taxonomy/`.
  - **Assessment agent:** `server/assessment/`, `schemas/`, `prompts/`.
  - **Testing agent:** `tests/` and CI configuration.
- Shared files (`package.json`, `tailwind.config.ts`, `globals.css`, migrations, OpenAPI) are changed only by the integration agent or through a contract-change task.

### 24.3 Dependency-based sequencing

**Sequential:** contracts → migrations → backend endpoints → frontend integration → end-to-end tests.

For the public demo, guest-scoped import and analysis, run-scoped concepts with bounded snippets, Code Detective, multiple-choice Knowledge Check, and session completion precede authenticated history and My Skills. Private repository authorization follows the public path; this does not remove Product Stage 1 private support.

**Parallel after contracts:**
- Frontend page shells with mocked contract clients (mocks in tests only).
- Analysis pipeline with recorded GitHub fixtures.
- Assessment generation with fixtures and schema tests.
- Design system primitives.

### 24.4 Integration checkpoints

- Twice per week, or at each milestone exit: integration agent merges, runs the full suite, and resolves conflicts.
- No merge without the integration agent's review for shared files.

For named agents, Codex owns backend/API, analysis, database proposals, and integration tests; Cursor owns UI and interactions against frozen OpenAPI types; Antigravity may independently audit requirements, authorization, browser behavior, and security. T3 Code or a named integration owner coordinates contract changes and shared-file merges. Each uses a separate branch/worktree. Only the integration owner edits `docs/contracts/`, migrations, generated API client, `package.json`, shared CSS/tokens, and CI configuration after contracts freeze. All implementation tasks follow plan → acceptance criteria → failing tests → implementation → refactor → verification → independent review → human approval → merge.

### 24.5 Suggested assignment strategy

- **Frontend:** homepage, navigation, companion, workspace shell.
- **Design:** tokens, primitives, brand assets (placeholder), theme switching, contrast checks.
- **Backend:** auth, repositories, analysis runs, API contract.
- **Analysis:** GitHub client, rate limiting, concept detection, evidence.
- **Assessments:** generation, grading, knowledge states.
- **Testing:** fixtures, E2E, accessibility, evaluation harness.
- **Integration (one agent):** shared files, merges, final verification.

---

## 25. Implementation Milestones and Dependencies

These follow the plan's milestones (M0–M9), with the UI scope added.

| Milestone | Scope | Depends on | Exit criteria |
|---|---|---|---|
| **M0 Foundations** | Repo, CI, tokens, theme, primitives, placeholder logo, Inter, layout shell, header and navigation (responsive) | — | Tokens tested in both themes; header passes axe; navigation keyboard test passes |
| **M1 Home and GitHub import** | Public guest URL validation/import/consent first; authenticated history and private GitHub authorization later in Product Stage 1 | M0 | Public demo flow first; full AC-1 and UI-HOME-01 to 05 at Stage 1 gate |
| **M2 Analysis and Code Detective shell** | Analysis runs, stage status, concept inventory, code viewer, evidence, explanation panel (basic), sample workspaces | M1 | AC-2, AC-6, UI-CD rules pass |
| **M3 Assessments and Knowledge Check** | Generation, schema validation, items, attempts, feedback, reporting | M2 | AC-3, AC-4, AC-5, UI-KC pass |
| **M4 My Skills** | Knowledge states, two-track progress, stale flags | M3 | AC-10, KM rules pass |
| **M5 Rubber Duck and Companion** | Duck sessions, flags, hints; companion panel grounded | M3 | AC-7, UI-RD pass; AI-COMP pass |
| **M6 MVP hardening** | Evaluation set, security review, accessibility audit, performance tests, closed beta | M4, M5 | Stage 1 gates (§26.2) pass |
| **M7 Plan** | Blueprint workflow | M6 | FR-23 criteria |
| **M8 Deploy** | Launchpad analysis, checklist | M6 | FR-24 criteria |
| **M9 Prompt Coach and skill reports** | Prompt coaching, PDF export | M4, M6 | FR-25, FR-26 criteria |

**Critical path:** M0 → M1 → M2 → M3 → M6.
The demo gate is public guest M1–M3 plus deterministic multiple-choice feedback and ephemeral session completion; authenticated My Skills M4 demonstrates persistence when ready. Before the demo, defer item reports, companion messages, cancellation, repository deletion/listing/history, private authorization, written grading, persistent BYOK/billing/AI usage ledger, and Rubber Duck/Plan/Deploy backends. Full Stage 1 gates still include their applicable broader requirements. Design tokens follow contract freeze using the newer approved brand inputs; none are created in this correction.

### Contract-first tests for later implementation

| Boundary | Failing tests required before implementation |
|---|---|
| OpenAPI/API | Parse OpenAPI 3.1, resolve every `$ref`, validate request/response envelopes, enforce `/api/v1`, stable error status/body, and required `Idempotency-Key` replay/conflict for repository creation, analysis runs, and attempts. |
| Guest/auth | Guest can analyze public code but cannot list persistent history, read private content, or access My Skills; foreign IDs return 404; signed-in RLS and service checks agree; CSRF protection on writes. |
| GitHub/analysis | Strict GitHub URL allowlist, no arbitrary remote fetch or path traversal, inaccessible/not-found/rate-limited/unavailable repo, file/commit bounds, unsupported language, retries, lease races, duplicate runs, immutable evidence lines, bounded/redacted snippet, and zero analyzed-code execution. Cancellation tests follow its later task. |
| Assessments/knowledge | Pre-submit response contains no key/rubric/explanation; deterministic multiple-choice grading; append-only attempts; guest completion from current session only; latest valid attempt per track; Prefer not to say does not update either track. Written grading/review tests follow its later task. |
| AI/privacy | Structured output validation, observed evidence and inferred labels, prompt injection in source/README/commits, no raw keys/source in logs or ledger, consent/revocation, budgets, model failure, and one bounded repair retry. |
| Deletion | Repository/account cascade and knowledge recomputation; guest expiry; no fixed deletion SLA assumed until approved. |

These are future RED tests, not tests claimed as implemented in M0-02A. `docs/contracts/openapi-v1.yaml` is the route source for generated types only after review.
**Parallel after M3:** M4 and M5.

The reconstructed plan does not include effort estimates; validate estimates during implementation task planning.

---

## 29. Open Questions and Decisions Requiring Approval

**Requires human approval**

1. **D-01 Code font.** Approve JetBrains Mono for code (CR-01).
2. **D-02 Warning and danger colors.** Approve the proposed warning and danger tokens (CR-02).
3. **D-03 Icon set.** Approve Lucide over Material Symbols (CR-18).
4. **D-04 Companion name.** Approve "VibeCheck Duck" for the panel and "Ask VibeCheck" for the launcher (CR-12).
5. **D-05 Stage 1 Plan and Deploy.** Approve "Coming soon" and preview pages with no fabricated content (CR-20).
6. **D-06 Logo asset.** Supply the official compass artwork (SVG) and a mascot illustration. Until then, the placeholder rule applies (CR-03, CR-04).
7. **D-07 Light-theme token values.** Approve or adjust the proposed light variants for success, learn, info, and muted text, and verify contrast (§10.2).
8. **D-08 Clear space and minimum sizes.** Approve the logo clear-space proposal (§11.3).
9. **D-09 Retention and deletion SLA.** Ownership/deletion relationships are proposed; exact periods and production completion SLA await approval (§20.2).
10. **D-10 Mobile companion behavior.** Approve the full-sheet mode below 640 px (§13.3).

**Requires research or decision by the team**

11. **Q-01 Go timer behavior.** Confirm the Go version semantics for the `time.After` claim before showing it (§4.1).
12. **Q-02 resolved.** Per-attempt declaration; Prefer not to say is practice only (KM-03).
13. **Q-03 resolved.** JavaScript/TypeScript first, Python next, extensible adapters.
14. **Q-04 resolved.** Validated written grading is shown as "AI-graded, reviewable."
15. **Q-05 resolved for demo.** Configurable 1 MB source-file and 50-commit limits.
16. **Q-06 resolved.** WCAG 2.1 AA baseline with sensible 2.2 target-size improvements.
17. **Q-07 resolved.** Anonymous ephemeral public analysis and labeled samples; persistent history, My Skills, private access, and settings require sign-in.
18. **Q-08 Mascot illustration style.** Confirm the mascot is a duck (the prototype's copy says "Duck") and approve its visual direction.

---
