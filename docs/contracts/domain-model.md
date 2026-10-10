# Proposed domain and persistence contract (M0-02A)

Derived from [MASTER_SPEC](../MASTER_SPEC.md) §§16–20 and the [reconstructed plan](../plan/vibecheck.md). This is a logical PostgreSQL model, **not** SQL migration approval. `user_id` means a Supabase Auth subject; `guest_session_hash` means an opaque server-only, short-lived scope. Exactly one owner applies to guest-capable records. Client IDs are opaque. Every foreign key must be checked for the same owner and snapshot. `required` below means required for the hackathon critical path, not necessarily a durable table for guests.

| Entity | Purpose and important fields | Owner / relations | Sensitive data and retention | Demo need |
|---|---|---|---|---|
| `profiles` | Minimal user display/preferences; `user_id`, timestamps | One per Auth user | Personal data; delete with account | Persistent My Skills only |
| `github_identities` | Linked GitHub subject and status; provider subject ID, linked/revoked times | User → identity | Provider IDs; no token column; delete/revoke with account | Private support later |
| `repository_authorizations` | Per-repository grant; repository ID, identity reference, scope, grant/revocation times, credential **reference** | User → repository + identity | Credential reference is restricted server metadata, never a raw token; revoke invalidates access | Private support later |
| `repositories` | Canonical GitHub coordinates, visibility, owner, selected default branch, created/expires times | User **or** guest → runs/consent | URLs may reveal private project names; guest public only; delete children | Yes |
| `repository_ai_consents` | Auditable code-sharing consent; repository, provider purpose/version, actor, grant/revoke times | Same repository owner | Consent evidence; revoke stops new transfers; retention policy open | Required before sending code to AI |
| `analysis_runs` | Snapshot SHA, requested commit range, status, stage, progress, error code, lease/attempt, idempotency digest, timestamps | Repository → files/evidence | Run metadata and error detail; purge with repository | Yes |
| `analyzed_files` | Snapshot path, language, byte size, content digest, line count, skip reason; bounded content reference if retained | Run → evidence | Source content is sensitive; short retention, delete with run | Yes |
| `evidence_refs` | Immutable snapshot SHA, file ID/path, start/end lines, detection source/version | Run/file → concept evidence and AI claims | Paths/excerpts potentially sensitive; deletion cascades | Yes |
| `concepts` | Stable taxonomy ID, label, language-neutral definition, version, `retired_at`, `replaced_by` | Shared versioned catalog | Public metadata; retain version history | Yes |
| `repository_concept_evidence` | Concept ID, evidence ID, observed/inferred, detector provenance, validation state | Repository/run → concept/evidence | Owner-scoped; delete with run | Yes |
| `assessments` | Run/concept scope, status, schema/prompt version, created/expires times | Same repository/run owner → items/attempts | Questions derived from private code; delete with run | Yes |
| `assessment_items` | Type, prompt, options, evidence IDs, server-only correct choice or written rubric, misconception tags, `flagged_at`, `disabled_at` | Assessment → attempts | **Answer keys/rubrics and withheld explanation never in pre-submit response**; delete with assessment | Yes |
| `attempts` | Item/assessment, owner, assistance declaration, answer, grading source/version, outcome, feedback/evidence, `idempotency_key`, validity, timestamps | User or guest → assessment/item | Answers are personal learning data; append-only; delete with assessment/account/guest expiry | Yes |
| `knowledge_states` | `user_id`, concept ID, independent and assisted state, source attempt IDs, assessed/stale timestamps | Auth user + concept | Learning profile; recompute after removal/correction; delete with user | Signed-in My Skills only |
| `ai_calls` | Feature, owner/run correlation, provider/model, prompt/schema versions, input/output token counts, cost estimate, status/error, timing | User or guest + optional run | **No raw keys, prompts, source, response body, or answer keys**; deletion/aggregation policy open | Persistent ledger deferred beyond demo |
| `assessment_item_reports` | User report reason/status for invalid item | User/guest + item | Reporter identity private | Stage 1 after core demo |
| `lesson_specs` | Structured text lesson, concept/evidence refs, version | User/guest + run | Derived source; delete with run | Product Stage 1 after demo |
| `duck_sessions`, `companion_sessions` | Bounded conversation state, context refs, expiry | User or guest + run | Conversation may contain code; explicit clear and retention | After critical path |

Misconceptions begin as versioned taxonomy tags on options/feedback; a separate table is only needed for editorial workflows. Provider/model metadata and prompt versions can initially be immutable configuration identifiers recorded in `ai_calls` and assessments; catalog tables are future-facing. BYOK credential **storage** is future work in a separate encrypted secret facility, with only a restricted reference in account configuration. Samples are labeled, curated static assets and require no user row.

## Hackathon implementation minimum

The table above is the **Product domain model**, not a migration checklist. The critical demo can use approximately five logical groups: short-lived guest session/repository state, analysis run, normalized concepts/evidence, multiple-choice assessment, and append-only attempts with a derived session completion result. These groups may share storage structures. No `knowledge_states`, persistent AI usage ledger, profiles, GitHub identities/authorizations, item reports, lessons, or conversation tables are required before the demo. Consent must still be recorded for sending code to the managed provider, but it may be session-scoped. Do not create migrations from this document during M0-02A.

An evidence response projects `id`, immutable `commitSha`, `path`, `language`, `startLine`, `endLine`, `kind`, and a secret-redacted `snippet` capped at 2,000 characters with `snippetTruncated`. It never projects an entire file. Internal file IDs may still exist, but the demo client does not need one. `Repository.latestRunId` selects the current owned run for refresh/navigation without exposing run history. The session completion projection derives `demonstrated` or `unverified` per concept from valid graded attempts in the current assessment; a `prefer_not_to_say` attempt is practice evidence only. Guest completion expires with the session and never writes a persistent knowledge row.

## Ownership, deletion, and access invariants

- Authenticated resources use RLS **and** service-layer checks. Guest resources are accessed only through a server-validated HTTP-only session, not a browser Supabase client; guests cannot touch private resources or `knowledge_states`. Foreign-owner IDs return `RESOURCE_NOT_FOUND`.
- Guest runs, items, attempts, and AI-call metadata have `expires_at` and cleanup; the exact TTL and physical storage mechanism are open. Guest attempts are practice records until expiry, with no account migration implicitly promised.
- Repository deletion cascades to consents, runs, files, evidence, assessment items and attempts, derived lessons/conversations, and owner-scoped AI-call links. Recompute `knowledge_states` from **remaining** valid graded attempts; a state is not simply deleted if another repository supplies evidence.
- Account deletion removes profile, identities/grants, repositories and descendants, knowledge states, and personal usage metadata. Revoking a private grant blocks new reads immediately; existing derived content follows the user's deletion choice and policy. Physical deletion SLA and audit/legal exceptions require later approval.
- Do not store raw GitHub or AI credentials in these tables. An encrypted credential facility, access controls, rotation, and revocation belong to a later private/BYOK design. Code excerpts are bounded, escaped, and never included in ordinary logs.

## State rules

Run: `queued → running(fetching | detecting | clarifying | persisting) → succeeded | failed | cancelled`. Cancellation is effective between stages; lease expiry permits safe retry with idempotent writes. Partial results must carry completion/skip status and cannot be presented as full analysis.

Assessment: `generating → ready | unavailable`; disabled items cannot accept new attempts. Attempt: immutable submitted record → graded/invalid; an auditable correction event may supersede a grade later. Multiple-choice is deterministically `correct` or `incorrect`; written validated grading may be `correct`, `partial`, or `incorrect` and is visibly `AI-graded, reviewable`.

For each user/concept/track, choose the latest **valid graded** attempt on that track, ordered by graded timestamp then stable attempt ID. `no` chooses independent, `yes` assisted, `prefer_not_to_say` neither. Without one, state is `unassessed`. Observed code, commits, guest attempts, and invalid grades never update demonstrated knowledge. Preserve append-only history and flag states over 180 days old as stale.
