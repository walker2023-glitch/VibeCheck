# VibeCheck Design System

> Derived from `docs/MASTER_SPEC.md`. The master specification governs if anything conflicts.



## 10. Visual Design System

### 10.1 Foundations

- **Typeface:** Inter for all UI text (Brand Guide §4). Weights: 400, 500, 600, 700.
- **Code typeface (proposal):** JetBrains Mono, 400 and 500, for code only. It is not a brand typeface. Approval needed (CR-01).
- **Base size:** 16 px. Body text is never below 14 px for interface text, and never below 12 px for any text.

### 10.2 Color tokens

Brand values from Document B, marked provisional. Tokens are semantic: components use role names, never raw HEX.

**Brand palette (source values):**

| Brand name | HEX | Role |
|---|---|---|
| Deep Navy | `#071B2C` | Dark background, dark text on light |
| Midnight Blue | `#0B2940` | Dark surfaces |
| Deep Teal | `#087E89` | Light-theme accent, logo details |
| Turquoise | `#16B8B0` | Dark-theme accent, highlights |
| Mint Green | `#41D6AD` | Positive state and progress (dark theme) |
| Pale Mint | `#C8F5E3` | Light highlight backgrounds |
| Electric Blue | `#2478F2` | Technical visualization accent |
| Indigo | `#4535D5` | Occasional secondary accent |
| Soft Violet | `#A18BFF` | Learning accent (Rubber Duck, Knowledge Check) |
| Off White | `#F7FAFC` | Light background |
| White | `#FFFFFF` | Light cards, text on dark |

**Semantic mapping (proposed starting values; verify before approval):**

| Token | Dark theme | Light theme | Use |
|---|---|---|---|
| `--bg` | `#071B2C` | `#F7FAFC` | Page background |
| `--surface` | `#0B2940` | `#FFFFFF` | Cards, panels |
| `--surface-raised` | `#12334F` *(proposed tint)* | `#FFFFFF` + border `#D5E0E8` | Popovers, active cards |
| `--surface-sunken` | `#051420` *(proposed)* | `#EAF0F5` *(proposed)* | Code viewer background |
| `--text` | `#FFFFFF` | `#071B2C` | Primary text |
| `--text-muted` | `#B7C8D4` *(proposed; verify ≥ 4.5:1)* | `#4B5F70` *(proposed; verify)* | Secondary text |
| `--accent` | `#16B8B0` | `#087E89` | Links, focus, active nav |
| `--accent-fg` | `#071B2C` | `#FFFFFF` | Text on accent buttons |
| `--success` | `#41D6AD` | `#0E7A5A` *(proposed darker mint for text)* | Positive states |
| `--learn` | `#A18BFF` | `#5B43D6` *(proposed)* | Rubber Duck and learning accents |
| `--info` | `#2478F2` | `#1F5FD1` *(proposed)* | Technical visualization |
| `--warning` | `#E8B04A` *(proposed, approval needed)* | `#8A5A00` *(proposed)* | Caution (CR-02) |
| `--danger` | `#F4837D` *(proposed, approval needed)* | `#B42318` *(proposed)* | Errors |
| `--focus` | `#16B8B0` | `#087E89` | Focus ring |

**Contrast checks.** Ratios below are computed from the brand HEX values with WCAG relative luminance. Re-verify with tooling before release.

| Pairing | Ratio | Result |
|---|---|---|
| Navy text on Turquoise (dark primary button) | ≈ 7.1 : 1 | Pass AA |
| White on Deep Teal (light primary button) | ≈ 4.8 : 1 | Pass AA |
| Mint on Navy | ≈ 9.6 : 1 | Pass AA |
| Soft Violet on Navy | ≈ 6.4 : 1 | Pass AA |
| Deep Teal on Off White | ≈ 4.6 : 1 | Pass AA (small text, verify) |
| Turquoise on White | ≈ 2.5 : 1 | **Fail** for text; use only for non-text |
| Mint on White | ≈ 1.8 : 1 | **Fail**; use darker success token on light |

**Rule (BRAND-010):** Turquoise and mint are not used for text on light backgrounds. The light theme uses Deep Teal and the proposed dark variants.

### 10.3 Tailwind configuration (example, mapped to tokens)

```ts
// tailwind.config.ts (illustrative; implementation must follow this structure)
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--surface-raised) / <alpha-value>)',
        'surface-sunken': 'rgb(var(--surface-sunken) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-fg': 'rgb(var(--accent-fg) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        learn: 'rgb(var(--learn) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        focus: 'rgb(var(--focus) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
} satisfies Config;
```

```css
/* globals.css — tokens as RGB triplets so Tailwind alpha works */
:root, [data-theme="light"] {
  --bg: 247 250 252;        /* #F7FAFC */
  --surface: 255 255 255;
  --surface-raised: 255 255 255;
  --surface-sunken: 234 240 245;
  --text: 7 27 44;          /* #071B2C */
  --text-muted: 75 95 112;
  --accent: 8 126 137;      /* #087E89 */
  --accent-fg: 255 255 255;
  --success: 14 122 90;
  --learn: 91 67 214;
  --info: 31 95 209;
  --warning: 138 90 0;
  --danger: 180 35 24;
  --focus: 8 126 137;
}
[data-theme="dark"] {
  --bg: 7 27 44;            /* #071B2C */
  --surface: 11 41 64;      /* #0B2940 */
  --surface-raised: 18 51 79;
  --surface-sunken: 5 20 32;
  --text: 255 255 255;
  --text-muted: 183 200 212;
  --accent: 22 184 176;     /* #16B8B0 */
  --accent-fg: 7 27 44;
  --success: 65 214 173;    /* #41D6AD */
  --learn: 161 139 255;     /* #A18BFF */
  --info: 36 120 242;       /* #2478F2 */
  --warning: 232 176 74;
  --danger: 244 131 125;
  --focus: 22 184 176;
}
```

Theme selection: follow `prefers-color-scheme` by default, with a manual toggle stored in local preferences. The theme must be set before first paint to avoid a flash.

### 10.4 Light and dark theme rules

- Light: off-white page, white cards, navy text, deep teal accents, soft gray borders, minimal shadow.
- Dark: navy page, midnight cards, white text, turquoise and mint accents, subtle borders instead of heavy shadows.
- Each theme is tested for contrast (§20.3).

### 10.5 Typography scale

| Token | Size / line height | Weight | Use |
|---|---|---|---|
| `display` | 56 / 64 (mobile 36 / 44) | 700 | Homepage hero only |
| `h1` | 40 / 48 (mobile 28 / 36) | 700 | Page headings |
| `h2` | 28 / 36 | 600 | Section headings |
| `h3` | 20 / 28 | 600 | Cards, panels |
| `body-lg` | 18 / 28 | 400 | Intro paragraphs |
| `body` | 15 / 24 | 400 | Default text |
| `body-sm` | 13 / 20 | 400 | Secondary text, helper text |
| `label` | 14 / 20 | 500–600 | Buttons, nav, labels |
| `caption` | 12 / 16 | 500 | Metadata, badges (min size) |
| `code` | 13 / 20 | 400 | Code viewer (JetBrains Mono) |

Letter spacing: headings −0.02 em; labels +0.02 em; uppercase badges +0.08 em.

### 10.6 Spacing, layout, breakpoints

- **Spacing scale (4 px base):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.
- **Breakpoints:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- **Container:** max width 1200 px for content; 1280 px for the workspace header. Horizontal page margin 20 px (mobile), 40 px (tablet), 64 px (desktop).
- **Grid:** 12 columns, 24 px gutter (desktop), 16 px (mobile).
- **Homepage hero:** vertical centering with generous top space; no content above the fold other than the header.

### 10.7 Radii, shadows, icons

- **Radii:** controls 8 px; cards 12–16 px; large panels 16–20 px; pills (inputs and badges) full; app icons 22%.
- **Shadows:** elevation 1 (cards, light: `0 1px 2px rgba(7,27,44,0.06)`; dark: border instead). Elevation 2 (popovers only). No colored glows except one ambient element per page at ≤ 10% opacity.
- **Icons:** Lucide (proposed, approval needed; CR-18), 24 px grid, 1.75 px stroke, round caps. Icons are inline SVG from the package, self-hosted. The prototype's Material Symbols CDN is removed.
- The compass symbol is reserved for the logo, the header, the companion's panel header (small), and onboarding moments. It is not used as a generic feature icon (Brand Guide §6).

### 10.8 Motion

- Analysis start: the compass needle rotates gently while analysis runs (one slow rotation per 2 s, stopped when reduced-motion is on; then a static icon with a status label).
- Completion: needle settles, 200 ms ease-out.
- Hover transitions: 150 ms, turquoise or accent highlight.
- Page transitions: 200 ms fade. No parallax, no 3D transforms, no continuous pulsing, no `animate-ping` on idle elements.
- **Reduced motion (A11Y-MOTION):** when `prefers-reduced-motion: reduce`, all non-essential animation is disabled; progress is shown as text and a static bar.

### 10.9 Component styling rules

- **Buttons:** Primary (accent background, accent-fg text; min height 40 px; hover darkens 8%; focus ring 2 px with 2 px offset). Secondary (surface background, 1 px border). Ghost (text only, for low-priority actions). Destructive (danger, always confirmed).
- **Inputs:** surface-sunken background, 1 px border, 40 px height, focus ring; error text below in danger with an icon.
- **Cards:** surface background, 12–16 px radius, 1 px border in light theme.
- **Badges:** caption text, uppercase only for category labels, always paired with text (never color alone).
- **Tabs:** segmented control with `role="tablist"`.
- **Modals:** focus trap, Escape closes, focus returns to trigger, scrim at 60% navy.
- **Tooltips:** delayed 400 ms on hover; available on focus; never contain essential information.

---

## 11. Logo and Brand Asset Rules

### 11.1 The mark

The compass: a clean circular ring, four directional points at the cardinal positions, a central four-pointed needle, and a small diamond negative-space opening at the center. Meaning: the center diamond is clarity; the points are guidance and progress; the ring is continuous learning.

### 11.2 Asset requirements (BRAND-020 series)

| Asset | Format | Required for |
|---|---|---|
| Primary horizontal lockup (compass + wordmark) | SVG, light and dark variants | Header, docs, marketing |
| Standalone compass | SVG, light and dark | Favicon source, avatars, app icon |
| Monochrome black and white | SVG | Print, single-color contexts |
| Favicon set | ICO, 16/32/48 px PNG, 180 px apple-touch | Browser tabs |
| Small-size simplified compass | SVG | Under 24 px |
| Social card | PNG 1200 × 630 | Link previews |

### 11.3 Logo rules

- Preserve proportions; never stretch, rotate arbitrarily, or redesign.
- Keep the central diamond visible at all sizes. At 16 px, remove interior detail that becomes noise.
- Wordmark: "Vibe" in Deep Navy on light, White on dark; "Check" in Deep Teal or Turquoise on light, Mint or Turquoise on dark. Capital V and C, no space.
- Minimum size: horizontal lockup 120 px wide; standalone compass 16 px.
- **Clear space (proposal, not in Brand Guide):** a margin equal to the compass ring's radius on all sides.
- Do not place the logo on busy imagery or on mid-tone backgrounds that reduce contrast below 3:1.

### 11.4 Placeholder rule

Until official artwork is supplied:

- Use a neutral placeholder in the header that reads "VibeCheck" in Inter (text only, no fake compass) and is marked with `data-asset="placeholder-logo"`.
- Do not recreate the compass from memory and present it as official.
- The placeholder must be replaced before any public release. A release check fails if `placeholder-logo` is present in the production build (TEST-BRAND-01).

### 11.5 Mascot versus logo

- The companion mascot is a separate illustration, not a logo variant.
- The compass logo never appears as the companion's face.
- In the companion's panel header, use the mascot avatar (small) and the wordmark in text. Do not place the compass beside the mascot in the same control.

---

## 12. Component Library and Interaction States

### 12.1 Shared components

| Component | Purpose |
|---|---|
| `SiteHeader` | Logo lockup, navigation, sign-in or avatar menu, responsive menu button |
| `Navigation` | Primary nav list with active state; mobile panel |
| `RepositoryInput` | URL input with validation, paste handling, sample pills |
| `FeatureLauncher` | Three tool cards with optional repo carry-over |
| `FeatureIntro` | Initial-state header block: badge, headline, subtitle, optional visual |
| `RepoSwitcher` | Repository list menu with search |
| `CodeViewer` | Read-only, line-numbered, highlighted range, copy |
| `CodeExplanationPanel` | Stacked explanation cards with observed/inferred tags |
| `EvidenceLink` | Link to file and lines or commit, with preview on focus |
| `AIDisclosure` | "AI-generated, may be wrong" label with evidence link |
| `QuestionCard` | Question, choices or input, submit, feedback slot |
| `LearningFeedback` | Correct/partial/incorrect with misconception and next step |
| `SkillProgress` | Two-track progress indicator with legend and text alternative |
| `KnowledgeBar` | Single track bar (used within SkillProgress) |
| `ProjectPlanner` | Stage 2: stepper for Plan |
| `DeploymentChecklist` | Stage 2: checklist with status and reasons |
| `LessonRenderer` | Renders validated lesson blocks |
| `AICompanionBubble` | Closed-state launcher |
| `AICompanionPanel` | Open-state chat panel |
| `StatusLine` | Analysis stage and progress text |
| `EmptyState`, `ErrorState`, `OfflineNotice` | Standard state blocks |

### 12.2 Component specifications (summary)

**RepositoryInput** — Props: `value`, `onSubmit(url)`, `placeholder`, `error`, `samples`. State: `draft`, `validation`. Interaction: Enter submits; invalid input shows inline error; paste trims whitespace and accepts `owner/repo`. Accessibility: label associated with input (visible label optional but present for screen readers), error linked via `aria-describedby`, button disabled only while submitting. Reuse: homepage, Code Detective, Rubber Duck, Deploy.

**CodeViewer** — Props: `file`, `language`, `highlightRange`, `onSelectRange`. State: `selection`. Renders escaped text; syntax highlighting uses a token list from the server or a client highlighter with an allowlist of languages. Loading: skeleton lines. Accessibility: `role="region"` with `aria-label` "Source code: {file}"; line numbers `aria-hidden`; selected range announced via live region. Keyboard: arrow keys move the focus line; Shift+arrow extends selection.

**CodeExplanationPanel** — Props: `explanations[]` where each item has `text`, `tag: 'observed' | 'inferred'`, `evidence`. Renders tag as text badge. Rule: `observed` items require `evidence`; the component throws in development if missing.

**QuestionCard** — Props: `item`, `onSubmit`, `disabled`. States: `unanswered`, `submitting`, `answered`, `error`. After submit, choices become read-only and the correct choice is marked with text and icon, not color alone (correct answer revealed only after submission).

**LearningFeedback** — Props: `outcome`, `misconception`, `explanation`, `followUpAvailable`. Always states the next step. Never uses the words "wrong" alone.

**SkillProgress** — Props: `independent`, `assisted`, `staleAt`. Two bars with labels, legend, and a text summary ("Independent: 3 of 5 checks passed. Assisted: 1 check.").

**AICompanionPanel** — see §13.

### 12.3 Interaction states (all interactive components)

Every interactive component defines: default, hover, focus-visible, active, disabled, loading, error, success. Focus-visible uses the 2 px focus ring token. Hover never changes meaning alone.

### 12.4 Forms

- Labels visible or programmatically associated.
- Errors shown beneath the field and in a summary for multi-field forms.
- No placeholder used as the only label.

### 12.5 Progress indicators

- Each indicator shows a numeric value or explicit text, not only a bar.
- Two tracks always shown separately (UI-PROG-01 = UX-3).
- Stale items are labeled "Last checked 200 days ago. Re-check to update."
- A legend explains independent vs assisted.
- Charts have a text alternative in a visually hidden element and a visible summary.

### 12.6 Loading, empty, error, offline

- **Loading:** skeletons for content; a status line for analysis stages; no spinner longer than 2 s without text.
- **Empty:** one sentence and one primary action. Example: "No repositories yet. Paste a GitHub link to begin."
- **Error:** what failed, why (in plain language), and what to do next. No stack traces, no internal codes shown except a support reference.
- **Offline:** banner "You're offline. Saved results are available. New analysis will start when you reconnect." Writes are disabled with a message in Stage 1.

### 12.7 Language rules (BRAND-011)

- Use "unverified" for concepts not yet assessed. Do not use "unknown" for user skills.
- Use "inferred" for interpretations. Use "observed" only for direct code evidence.
- Use "AI-generated, may be wrong" on every AI surface.
- Do not use "AI attribution," "AI confidence," or any percentage of AI authorship.
- Avoid "verified" unless a named check ran; then say which check.

---

## 13. AI Companion Specification

### 13.1 Identity

- **Launcher label:** "Ask VibeCheck."
- **Panel title:** "VibeCheck Duck" (working name; approval needed, CR-12).
- **Role:** patient programming mentor. Guides understanding, asks questions, and gives explanations grounded in the current page's context.
- **Visual:** mascot avatar, distinct from the compass logo (§11.5).

### 13.2 Closed state (launcher)

- Circular avatar, 56 px, bottom-right, 24 px from edges (mobile 16 px).
- Fixed position; does not move with scroll; does not cover primary content on small screens (a safe area of 88 px above the bottom edge on mobile when content is interactive, or the launcher collapses to 48 px).
- Tooltip on hover and focus: "Ask VibeCheck."
- **No automatic opening.** It opens only when the user activates it. The prototype's auto-expanded state is not used as default.
- An unread-dot indicator appears only when the companion has a response the user hasn't seen.

### 13.3 Open state (panel)

- Width 380 px desktop, full-width sheet on mobile below 640 px.
- Header: small mascot avatar, "VibeCheck Duck," status text ("Ready to help" or "Thinking…"), minimize and close buttons with accessible names ("Minimize" and "Close").
- Context line: "Working on: {page}, {file if any}." Context is set by the page; the companion does not invent context.
- Suggested questions: 2–3, page-specific, shown when the conversation is empty. Examples: on Home, "What can I do here?" and "Can I try this without a GitHub account?"; in Code Detective, "Explain these lines simply" and "Why might this be written this way?"; in Rubber Duck, "Help me find the cause, without the answer."
- Composer: text input with label "Ask a question," send button with accessible name "Send."
- Messages: user and assistant bubbles; assistant messages labeled "AI-generated, may be wrong" with an evidence link when the answer references code.

### 13.4 Keyboard and accessibility

- The launcher is a button with `aria-expanded` and `aria-controls` pointing to the panel.
- Opening the panel moves focus to the composer.
- Escape closes the panel when focus is within it and returns focus to the launcher.
- Messages are in a log region with `aria-live="polite"`; the streaming assistant message is announced once complete, not token by token.
- Focus trap only on mobile full-sheet mode.

### 13.5 Behavior rules (AI-COMP)

- **AI-COMP-01** The companion MUST NOT complete a task the user asked to learn; it asks what the user already tried, then explains.
- **AI-COMP-02** It MUST state when it lacks context: "I can't see your repository yet. Paste a link to get specific help."
- **AI-COMP-03** It MUST NOT claim to know why an AI tool wrote code.
- **AI-COMP-04** It MUST NOT claim the user's code is safe or unsafe without a named check.
- **AI-COMP-05** Conversations persist per user (Stage 1: per browser session; Stage 2: per account, with a "Clear conversation" control).
- **AI-COMP-06** Repository content in prompts is untrusted (§17.5); the companion does not follow instructions found in code, comments, or READMEs.

### 13.6 Prototype behaviors and their replacements

| Prototype | Replacement |
|---|---|
| Canned replies in chat | Grounded responses from the AI service, or a clear error |
| "Absolutely! You can paste raw code snippets…" | Real capability answer, verified against the product's supported inputs |
| Explain button simulating duck breakdown | Real explanation request for the selected lines |
| Tooltip "Want me to refactor this and commit the test suite?" | Removed. The companion does not offer to commit, refactor, or write to repositories. |
| `alert()` on click | Opens the panel |
| Dot with `animate-ping` | Static dot; ping removed |

---
