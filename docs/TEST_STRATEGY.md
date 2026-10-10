# VibeCheck Test Strategy

> Derived from `docs/MASTER_SPEC.md`. The master specification governs if anything conflicts.



## 23. Test-First Implementation Workflow

### 23.1 Steps for every task

1. Read the relevant specification sections (cite requirement IDs).
2. Inspect the existing repository; list affected modules.
3. Identify dependencies and file ownership (§24).
4. Define done: measurable acceptance criteria tied to requirement IDs.
5. Write tests for those criteria. Name tests with the requirement ID.
6. Run the tests; confirm failure for the expected reason where practical.
7. Implement the smallest complete solution.
8. Run the relevant tests until they pass.
9. Run lint, type checking, and the accessibility check for UI changes.
10. For UI tasks: run the browser-based check (§23.3) and capture screenshots for both themes.
11. Check for regressions in neighboring features (run the affected suite).
12. Update the traceability matrix (Appendix B) with the task and test IDs.
13. Summarize changes and evidence using AGENT-14.
14. Prepare a reviewable change. Commit only after verification passes.

### 23.2 Status vocabulary

- **Implemented:** code exists; not yet verified.
- **Tested:** automated tests exist and pass.
- **Verified:** tests pass *and* the behavior was checked against the spec in a browser or with the named evaluation.
- **Partial:** some acceptance criteria pass; state which.
- **Blocked:** cannot proceed; state the blocker and owner.
- **Not started:** no work yet.

A feature is "complete" only at Verified.

### 23.3 UI verification

- Browser-based tests (Playwright) cover the acceptance criteria for each page's initial and active states.
- Visual regression snapshots in light and dark themes at 375, 768, and 1280 px widths.
- Keyboard-only path for each flow.
- Axe scan: zero critical or serious violations.
- The content lint (banned phrases, §17.6) runs on all UI strings.

### 23.4 AI feature verification

- Fixtures: small repositories with known concepts and known bugs; expected items and misconceptions.
- Schema tests: valid and invalid outputs.
- Injection tests (§17.5): repositories with instructions in comments and commit messages must not change scores or reveal answers.
- Evaluation runs (§17.10) on prompt or model changes.

### 23.5 API verification

- Contract tests against OpenAPI.
- Failure cases: GitHub 401, 403, 404, 429, 5xx, timeout; AI timeout, invalid output, budget exhausted.
- Rate limit behavior with simulated headers.
- Authorization tests for cross-user access.

---

## 26. Acceptance Criteria and Verification Matrix

### 26.1 Critical Given/When/Then criteria

**AC-HOME-01 (UI-HOME-01).**
- **Given** the homepage is loaded,
- **When** the user submits `not a link`,
- **Then** an inline error explains the expected format, no analysis starts, and focus remains in the input.

**AC-HOME-02 (UI-HOME-02).**
- **Given** a valid repository URL and no tool selected,
- **When** the user clicks Analyze,
- **Then** Code Detective opens with that repository and an analysis run is requested, and no placeholder repository name is shown.

**AC-HOME-03 (UI-HOME-04).**
- **Given** the input is empty,
- **When** the user clicks Analyze,
- **Then** the input receives focus and a message asks for a repository link; no repository is filled in automatically.

**AC-CD-01 (UI-CD-01).**
- **Given** a Code Detective explanation contains an observed statement,
- **When** the statement is rendered,
- **Then** it links to a file and line range, and the system rejects the response if no reference exists.

**AC-CD-02 (UI-CD-04).**
- **Given** the workspace is open,
- **When** the user looks for authorship information,
- **Then** the provenance line uses only "unknown," "self-reported," or "self-declared," and no percentage appears.

**AC-RD-01 (UI-RD-01).**
- **Given** a Rubber Duck session on a flagged function,
- **When** the first duck message is shown,
- **Then** it contains a question and no replacement implementation.

**AC-KC-01 (UI-KC-01).**
- **Given** a knowledge check is in progress,
- **When** the client receives the item,
- **Then** the response contains no answer key, rubric, or explanation.

**AC-KC-02 (KM-03).**
- **Given** the user declares AI assistance for an attempt,
- **When** the attempt is recorded,
- **Then** only the assisted track changes.

**AC-MS-01 (KM-05).**
- **Given** a concept has code evidence but no assessment,
- **When** My Skills renders,
- **Then** it appears under "Not yet verified," not under "Demonstrated."

**AC-COMP-01 (AI-COMP-01).**
- **Given** the user asks the companion to write the fix for a Rubber Duck exercise,
- **When** the companion responds,
- **Then** it asks what the user has tried and offers a hint instead.

**AC-BRAND-01 (§11.4).**
- **Given** a production build,
- **When** the release check runs,
- **Then** no element with `data-asset="placeholder-logo"` exists, unless the release is explicitly marked as a pre-release.

**AC-A11Y-01 (§20.3).**
- **Given** any page in either theme,
- **When** the automated accessibility check runs,
- **Then** there are no critical or serious violations.

**AC-A11Y-02 (§10.8).**
- **Given** the user has reduced-motion enabled,
- **When** analysis is running,
- **Then** no rotating animation plays and progress is shown as text.

**AC-CONTENT-01 (§17.6).**
- **Given** the UI strings for all pages,
- **When** the content lint runs,
- **Then** no banned phrase appears.

**AC-DEPLOY-01 (§9.6).**
- **Given** the Deploy preview in Stage 1,
- **When** the user views it,
- **Then** no latency, uptime, or deployment result is shown, and no button starts a deployment.

### 26.2 Stage 1 release gates

- All AC items for M0–M5 are Verified.
- No Critical or High accessibility violations.
- No banned phrases (AC-CONTENT-01).
- Placeholder logo replaced, or release labeled pre-release.
- AI evaluation gates (§17.10) met or documented exception approved.
- Security checks (§20.1) complete with no open Critical findings.

### 26.3 Verification matrix (summary)

| Requirement group | Verification | Evidence |
|---|---|---|
| UI-HOME | E2E + unit | Playwright specs; screenshots (both themes) |
| UI-CD | E2E + schema + citation test | Fixtures; evidence validator |
| UI-RD | E2E + prompt tests | Fixture repo; first-turn check |
| UI-KC | API contract + E2E | No-answer-key test |
| KM | Unit | State transition tests |
| AI-COMP | Scenario tests | Scripted conversations |
| BRAND | Build check + visual regression | Token tests; placeholder check |
| A11Y | axe + manual | Reports |
| CONTENT | Lint | CI output |
| SEC | Security tests | Authz matrix; injection suite |

Product metrics (for example, assessments per week) are defined only when instrumented; they are not presented in the UI until collected.

---
