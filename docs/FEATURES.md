# VibeCheck Features

> Derived from `docs/MASTER_SPEC.md`. The master specification governs if anything conflicts.



## 6. Complete Feature Inventory

Status values reflect the prototype *and* the implementation as of this document. Prototype status is "Visual only" (static look, no behavior), "Simulated" (behavior exists but is fake), or "Absent."

| # | Feature | Prototype status | Required behavior | Stage | FR link | Implementation status |
|---|---|---|---|---|---|---|
| F1 | Homepage with repository input | Visual + simulated | Real input validation, real analysis start | 1 | FR-2 | [Not started] |
| F2 | Three tool choices on homepage | Visual only | Navigate with optional repo | 1 | UI-HOME | [Not started] |
| F3 | Repository import (GitHub OAuth) | Absent | OAuth, minimum scope | 1 | FR-1, FR-2 | [Not started] |
| F4 | Commit analysis | Absent | Fetch commits in range | 1 | FR-3 | [Not started] |
| F5 | Concept identification with evidence | Simulated (hardcoded labels) | Taxonomy mapping, evidence links | 1 | FR-6 | [Not started] |
| F6 | Code viewer with line focus | Visual only (static table) | Real file content, line selection | 1 | UI-CD | [Not started] |
| F7 | Code Detective explanation panel | Simulated text | Generated, observed/inferred labels | 1 | FR-18 | [Not started] |
| F8 | Alternative approaches with tradeoffs | Simulated tabs | Generated alternatives, labeled | 1 (basic) | FR-19 | [Not started] |
| F9 | Multiple-choice assessment | Simulated single quiz | Generated items, stored answer keys | 1 | FR-7, FR-10 | [Not started] |
| F10 | Written explanation grading | Absent | Rubric-based | 1 | FR-8 | [Not started] |
| F11 | Code prediction and modification | Absent | Generated, test-checked where possible | 1 (prediction) / 2 (modification) | FR-9 | [Not started] |
| F12 | Knowledge profile and states | Absent | Dual tracks, stale flags | 1 (basic) | FR-12–14 | [Not started] |
| F13 | Progress indicators | Visual only (static bars) | Computed from evidence | 1 | FR-13 | [Not started] |
| F14 | Text lessons | Absent | Structured specs, rendered by components | 1 | FR-15–17 | [Not started] |
| F15 | Rubber Duck guided sessions | Simulated chat | Guiding question, hints, flags | 1 (basic) | FR-20–22 | [Not started] |
| F16 | Floating companion | Visual + canned replies | Real assistant, scoped context | 1 | §13 | [Not started] |
| F17 | Blueprint (Plan) | Absent | Nine-step planner | 2 | FR-23 | [Not started] |
| F18 | Launchpad (Deploy) | Absent (simulated claims only) | Read-only analysis, checklist | 2 | FR-24 | [Not started] |
| F19 | Prompt coaching | Absent | Evidence-limited suggestions | 2 | FR-25 | [Not started] |
| F20 | Skill reports (PDF) | Absent | Evidence-linked export | 2 | FR-26 | [Not started] |
| F21 | Sample workspaces | Simulated ("Auth Workflow" buttons) | Labeled sample data | 1 | §9.1 | [Not started] |
| F22 | Sign in and profile | Absent | Supabase Auth | 1 (basic) | §15 | [Not started] |
| F23 | Video explanations and spoken follow-up | Absent | Recording, transcription | 3 | FR-28 | Not scheduled |
| F24 | Generated interactive JavaScript lessons | Absent | Sandboxed execution | 3 | FR-29 | Not scheduled |

---

## 7. MVP Scope and Future Roadmap

### 7.1 Stage 1 — Hackathon MVP (must be reliable end to end)

- Homepage with real repository input, validation, and three tools.
- GitHub import for public and private repositories the user authorizes.
- Commit analysis for a date range.
- Concept identification with evidence links (rule-based first, AI for ambiguous hunks).
- Code Detective workspace with real code, observed/inferred explanations, and one alternative.
- Multiple-choice and written assessments with stored answer keys and rubrics.
- Knowledge states on two tracks, progress indicators, and stale flags.
- Text lessons generated from structured specs.
- Basic Rubber Duck with guiding questions and progressive hints.
- Companion with grounded answers and suggested questions.
- Sample workspaces clearly labeled as samples.
- Light and dark themes; WCAG 2.1 AA.

### 7.2 Stage 2 — Functional product

- Plan (Blueprint), Deploy (Launchpad analysis and checklist), prompt coaching, skill reports, persistent profiles, richer analytics, personalized tutorials, more robust concurrent analysis.

### 7.3 Stage 3 — Advanced platform

- Recorded video explanations, adaptive spoken follow-ups, generated interactive lessons (sandboxed), deeper verification, portfolio and employer-facing features, optional deployment integrations with explicit approval.

These stages are planning priorities. Nothing in Stage 2 or 3 is implemented or claimed as available.

---
