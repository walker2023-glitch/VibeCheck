# VibeCheck Implementation Plan

> Derived from `docs/MASTER_SPEC.md`. The master specification governs if anything conflicts.

> **Hackathon caution:** Plan M0 through M3 first; reduce scope only with product-owner approval. Do not start parallel implementation before contracts are agreed.

## 24. Parallel Agent Coordination

### 24.1 Shared contracts first

Before parallel work, these must exist and be reviewed:

- Design tokens (`design/tokens.json` and `globals.css`).
- Component prop interfaces for the shared components in §12.
- OpenAPI contract for the MVP endpoints.
- Database migrations for MVP tables.
- Domain error codes list.

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

**Parallel after contracts:**
- Frontend page shells with mocked contract clients (mocks in tests only).
- Analysis pipeline with recorded GitHub fixtures.
- Assessment generation with fixtures and schema tests.
- Design system primitives.

### 24.4 Integration checkpoints

- Twice per week, or at each milestone exit: integration agent merges, runs the full suite, and resolves conflicts.
- No merge without the integration agent's review for shared files.

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
| **M1 Home and GitHub import** | Home page (initial state), URL validation, GitHub OAuth, repository list, import, consent | M0 | AC-1, UI-HOME-01 to 05 pass |
| **M2 Analysis and Code Detective shell** | Analysis runs, stage status, concept inventory, code viewer, evidence, explanation panel (basic), sample workspaces | M1 | AC-2, AC-6, UI-CD rules pass |
| **M3 Assessments and Knowledge Check** | Generation, schema validation, items, attempts, feedback, reporting | M2 | AC-3, AC-4, AC-5, UI-KC pass |
| **M4 My Skills** | Knowledge states, two-track progress, stale flags | M3 | AC-10, KM rules pass |
| **M5 Rubber Duck and Companion** | Duck sessions, flags, hints; companion panel grounded | M3 | AC-7, UI-RD pass; AI-COMP pass |
| **M6 MVP hardening** | Evaluation set, security review, accessibility audit, performance tests, closed beta | M4, M5 | Stage 1 gates (§26.2) pass |
| **M7 Plan** | Blueprint workflow | M6 | FR-23 criteria |
| **M8 Deploy** | Launchpad analysis, checklist | M6 | FR-24 criteria |
| **M9 Prompt Coach and skill reports** | Prompt coaching, PDF export | M4, M6 | FR-25, FR-26 criteria |

**Critical path:** M0 → M1 → M2 → M3 → M6.
**Parallel after M3:** M4 and M5.

Effort estimates are in the plan (`docs/plan/vibecheck.md` §13) and are AI-generated estimates until validated.

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
9. **D-09 Deletion window.** Approve 30 days for complete deletion of derived data (§20.2).
10. **D-10 Mobile companion behavior.** Approve the full-sheet mode below 640 px (§13.3).

**Requires research or decision by the team**

11. **Q-01 Go timer behavior.** Confirm the Go version semantics for the `time.After` claim before showing it (§4.1).
12. **Q-02 Assisted-track declaration UX.** Is per-attempt declaration enough, or should repositories also ask (plan Q4)?
13. **Q-03 Language scope for Stage 1.** Recommend JavaScript/TypeScript and Python (plan Q6).
14. **Q-04 Written grading display.** Shown immediately (Stage 1 labeled "AI-graded, reviewable") or after review?
15. **Q-05 Repository size limits.** Stage 1 file size limit of 1 MB and commit range limit of 50 are proposals.
16. **Q-06 Accessibility level.** This spec uses WCAG 2.1 AA with 2.2 target-size checks. Confirm.
17. **Q-07 Account requirement.** The homepage prototype's sample workspaces are available without sign-in. Confirm that reading samples is allowed without an account and that analysis of a user's own repository requires sign-in.
18. **Q-08 Mascot illustration style.** Confirm the mascot is a duck (the prototype's copy says "Duck") and approve its visual direction.

---
