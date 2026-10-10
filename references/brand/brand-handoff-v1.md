# VibeCheck — Brand Production & Developer Handoff v1

## Purpose

This document defines the approved visual identity and implementation direction for VibeCheck during the Ensign BUILD hackathon.

It exists to give designers and development agents—including Cursor, Codex, and Antigravity—a consistent source of brand guidance.

For implementation purposes, decisions are classified as:

- **APPROVED FOR HACKATHON** — Use this decision in the current implementation. Do not independently redesign it.
- **PROVISIONAL** — Use if needed, but it may be refined after the hackathon.
- **DEFERRED** — Do not spend hackathon development time resolving this unless it becomes necessary.

The production application should ultimately defer to `docs/DESIGN_SYSTEM.md` once these approved decisions have been incorporated there.

---

# 1. Brand Foundation

## Product Name

**VibeCheck**

Capitalization must remain:

`VibeCheck`

Do not use:

- Vibecheck
- VIBECHECK
- Vibe Check

**Status: APPROVED FOR HACKATHON**

## Primary Tagline

**Build with AI. Understand what you build.**

This is the primary VibeCheck message.

**Status: APPROVED FOR HACKATHON**

## Secondary Message

**Turn your codebase into your curriculum.**

Use this where the educational purpose of VibeCheck needs additional explanation.

**Status: APPROVED FOR HACKATHON**

---

# 2. Brand Personality

VibeCheck should feel:

- intelligent but approachable,
- technical but human,
- educational without feeling like school,
- calm but capable,
- credible to professional developers,
- approachable to students and newer developers,
- modern without depending on short-lived design trends,
- supportive rather than judgmental.

VibeCheck should communicate:

> AI can help you build quickly, while VibeCheck helps you understand what you built.

The product should not shame developers for using AI.

---

# 3. Logo Identity

## Primary Concept

The VibeCheck logo is a geometric four-direction compass contained within a circular ring.

The mark contains:

- a circular outer ring,
- four directional points,
- a central four-point form,
- a small diamond-shaped negative space at the center.

**Status: APPROVED FOR HACKATHON**

## Meaning

The compass represents:

- guidance,
- understanding,
- exploration,
- learning,
- direction,
- progress through unfamiliar code.

The central diamond represents clarity and focus.

The compass is a metaphor for **intellectual direction through software**, not geographic navigation.

It should not be presented as:

- a maps/navigation product,
- a security badge,
- a certification seal,
- a generic AI symbol.

---

# 4. Logo Variants

The approved asset family should include:

## Horizontal Logo

Compass + VibeCheck wordmark.

Required variants:

- light-background version,
- dark-background version.

Primary use:

- website header,
- marketing,
- presentations,
- social materials.

## Standalone Compass

Required variants:

- full color for light backgrounds,
- full color for dark backgrounds,
- monochrome black,
- monochrome white.

Primary use:

- app icon,
- favicon,
- avatar,
- compact navigation,
- social identity.

## Small Compass

A simplified compass should be used where the full mark becomes visually unclear.

Target sizes:

- 32 px,
- 24 px,
- 16 px.

## App Icon

Use the standalone compass centered on the approved dark or light brand surface.

Do not introduce unrelated symbols into the app icon.

---

# 5. Logo Clear Space

Minimum clear space around the compass should equal approximately the radius of the compass ring.

No text, icon, border, or unrelated visual element should enter this area.

For the hackathon implementation, this is sufficient as the enforceable spacing rule.

**Status: APPROVED FOR HACKATHON**

---

# 6. Primary Color Palette

The core identity moves from deep navy through teal and turquoise into mint.

## Deep Navy

`#071B2C`

Primary uses:

- dark application background,
- major dark surfaces,
- strong headings where appropriate.

## Midnight Blue

`#0B2940`

Primary uses:

- cards,
- elevated dark surfaces,
- secondary dark backgrounds.

## Deep Teal

`#087E89`

Primary uses:

- brand identity,
- supporting accents,
- logo treatments.

## Turquoise

`#16B8B0`

Primary uses:

- primary interactive accent,
- buttons,
- active states,
- important links,
- focus emphasis.

## Mint Green

`#41D6AD`

Primary uses:

- highlights,
- progress,
- positive states,
- supporting accents.

## Pale Mint

`#C8F5E3`

Primary uses:

- subtle light-theme backgrounds,
- soft highlighted regions,
- restrained informational surfaces.

**Status: APPROVED FOR HACKATHON**

---

# 7. Secondary Accent Colors

Secondary colors should be used sparingly.

They must not compete with the teal/turquoise/mint brand identity.

## Electric Blue

`#2478F2`

Use for:

- links,
- occasional informational emphasis.

## Indigo

`#4535D5`

Use for:

- secondary visual accents,
- selected supporting states.

## Soft Violet

`#A18BFF`

Use for:

- educational highlights,
- restrained secondary accents.

**Status: APPROVED FOR HACKATHON**

---

# 8. Semantic Colors

Semantic colors should prioritize usability and accessibility over forcing every state into the primary brand palette.

## Success

`#22C55E`

## Warning

`#E8B04A`

## Danger

`#F4837D`

## Information

`#3B82F6`

These values must still be checked for appropriate WCAG contrast when paired with final foreground/background colors.

Do not communicate warning, error, or success using color alone.

**Status: APPROVED FOR HACKATHON, SUBJECT TO ACCESSIBILITY VALIDATION**

---

# 9. Neutral Colors

## White

`#FFFFFF`

## Off White

`#F7FAFC`

## Gray 100

`#E5E7EB`

## Gray 600

Approximately `#475569`

## Gray 800 / 900

Use a dark neutral near:

`#1F2937`

for appropriate neutral dark UI treatments.

The navy brand surfaces should remain visually dominant over generic gray surfaces.

---

# 10. Typography

## Primary UI Typeface

**Inter**

Use Inter for:

- body text,
- headings,
- navigation,
- buttons,
- labels,
- forms,
- cards,
- educational explanations.

Recommended weights:

- Regular — 400
- Medium — 500
- Semibold — 600
- Bold — 700

**Status: APPROVED FOR HACKATHON**

## Code Typeface

**JetBrains Mono**

Use JetBrains Mono for:

- source code,
- filenames,
- line numbers,
- terminal output,
- repository paths,
- technical identifiers where monospace improves clarity.

Do not use JetBrains Mono for ordinary application body copy.

**Status: APPROVED FOR HACKATHON**

---

# 11. Icon System

Use **Lucide** as the production icon system.

Recommended characteristics:

- approximately 2 px stroke,
- rounded corners,
- simple line treatment,
- visually consistent sizing.

Do not mix Lucide, Material Symbols, Heroicons, and unrelated icon libraries throughout the production interface.

The Google Stitch prototype currently contains Material Symbols. Those are reference placeholders and should be translated to the closest appropriate Lucide icons.

**Status: APPROVED FOR HACKATHON**

---

# 12. Core UI Language

## Spacing

Use an **8 px spacing grid** as the primary rhythm.

Smaller 4 px increments may be used where necessary for compact internal spacing.

## Cards

Recommended:

- 12 px corner radius,
- 1 px subtle border,
- restrained elevation,
- generous internal spacing.

Avoid excessive glassmorphism or dramatic floating-card effects.

## Buttons

Primary buttons should:

- use Turquoise or an accessible related brand treatment,
- have clear hover and focus states,
- use readable text contrast,
- avoid excessive gradients.

Secondary buttons should use:

- restrained borders,
- subtle surfaces,
- clear hover states.

## Shadows

Use subtle shadows.

Shadows should establish hierarchy rather than make every element appear to float.

## Gradients

Gradients may be used selectively in:

- logo artwork,
- hero accents,
- major brand moments.

Do not cover the entire application in gradients.

## Motion

Motion should communicate state.

Use subtle transitions for:

- hover,
- selection,
- loading,
- panel opening,
- progress.

Avoid distracting continuous animation.

Respect `prefers-reduced-motion`.

---

# 13. Themes

VibeCheck requires both dark and light themes.

For the hackathon:

**Dark theme is the primary visual target.**

The light theme should still be supported through semantic design tokens where practical.

Do not hardcode colors directly into reusable components when a semantic token should be used.

Examples of semantic concepts include:

- background,
- surface,
- elevated surface,
- text,
- muted text,
- border,
- primary,
- primary hover,
- success,
- warning,
- danger.

**Status: APPROVED FOR HACKATHON**

---

# 14. AI Companion / Mascot

## Mascot Direction

Use a **friendly duck** as the VibeCheck AI companion direction.

The duck connects naturally to the programming concept of rubber duck debugging.

It should communicate:

- curiosity,
- friendliness,
- mentorship,
- technical competence.

It should not appear:

- childish,
- chaotic,
- judgmental,
- like the company logo.

The compass represents **VibeCheck as the product**.

The duck represents **VibeCheck as a mentor**.

**Status: APPROVED DIRECTION; FINAL ARTWORK PROVISIONAL**

## Preferred Visual Direction

Prefer the yellow rubber-duck-inspired character with modern technical goggles over a generic white futuristic robot-like duck.

This creates a clearer connection to rubber duck debugging while remaining visually distinct from the compass.

## Companion Launcher

Primary launcher label:

**Ask VibeCheck**

Do not require a permanent character name for the hackathon.

**Status: APPROVED FOR HACKATHON**

---

# 15. Companion Behavior

Desktop:

- persistent circular launcher in the bottom-right,
- approximately 56 px,
- expanded companion may use a side/floating panel around 380 px wide.

Mobile:

- use a bottom/full-width sheet rather than forcing the desktop floating panel into a narrow viewport.

The companion must never obscure critical application controls.

**Status: APPROVED FOR HACKATHON**

The companion backend itself is not required for the hackathon critical demo path.

---

# 16. Plan and Deploy

Plan and Deploy should remain visible as part of the broader VibeCheck product vision.

For the hackathon they should use **honest preview states** rather than pretending functionality exists.

Do not fabricate:

- successful deployments,
- SSL provisioning,
- infrastructure scans,
- build results,
- latency numbers,
- production readiness.

**Status: APPROVED FOR HACKATHON**

---

# 17. Google Stitch Reference Policy

Google Stitch prototypes are **visual and interaction references only**.

They are not production source code.

Developers and coding agents may use Stitch to understand:

- layout,
- hierarchy,
- spacing,
- page composition,
- interaction ideas,
- responsive intent.

They must NOT directly copy:

- inline JavaScript architecture,
- CDN Tailwind configuration,
- fake repository results,
- fake security results,
- fabricated performance metrics,
- fake AI attribution percentages,
- unsupported technical claims.

The production application must use:

- React,
- Next.js,
- compiled Tailwind,
- approved semantic design tokens,
- real repository analysis,
- real evidence.

---

# 18. Claims and Metrics

VibeCheck must not fabricate technical authority.

Do not display invented claims such as:

- "96.8% AI confidence,"
- "99.4% trace efficiency,"
- "0 vulnerabilities found,"
- "Verified Clean,"
- "sub-second AST mapping,"
- "89% AI generated,"
- fake latency measurements,
- fake deployment success.

If a metric is displayed, it must come from actual measured or analyzed data.

Observed facts should be distinguishable from AI inference.

---

# 19. Accessibility

Target:

**WCAG 2.1 AA**

with sensible WCAG 2.2 improvements.

Requirements include:

- keyboard-accessible controls,
- visible focus states,
- sufficient color contrast,
- meaningful labels,
- appropriate semantic HTML,
- reduced-motion support,
- reasonable mobile touch targets.

Color must never be the sole indicator of state.

---

# 20. What VibeCheck Should Not Look Like

Avoid:

- generic AI brains,
- robot-head branding,
- graduation caps,
- security shields as the main identity,
- excessive checkmarks,
- complicated circuit-board motifs,
- excessive neon,
- excessive gradients,
- traditional school/LMS styling,
- aggressive cybersecurity styling,
- judgmental code-quality dashboards,
- overly playful children's-product aesthetics.

The desired visual feeling is:

> A calm technical guide helping you navigate and understand your software.

---

# 21. Production Asset Inventory

## Required Production Assets

Place approved application assets under:

`public/brand/`

Target files:

- `logo-horizontal-light.svg`
- `logo-horizontal-dark.svg`
- `compass-light.svg`
- `compass-dark.svg`
- `compass-black.svg`
- `compass-white.svg`
- `compass-small.svg`
- `app-icon.svg`
- `social-card.svg` or `.png`
- approved mascot/avatar asset when available

## Reference Assets

Place non-production references under:

`references/brand/`

Examples:

- brand boards,
- generated concept images,
- mascot explorations,
- previous logo concepts,
- this brand handoff.

Google Stitch references belong under:

`references/stitch/`

---

# 22. Production Asset Status

The available compass SVG assets are reconstructed editable vector implementations based on the selected compass concept.

They are suitable for hackathon implementation.

However:

- they are not exact vector traces of the original generated concept,
- final trademark clearance has not been completed,
- exact geometric refinement may occur after the hackathon,
- the small compass should eventually receive real 16 px raster testing,
- final mascot artwork remains provisional.

These limitations should not block the hackathon implementation.

---

# 23. Decision Summary

## APPROVED FOR HACKATHON

- Product name: VibeCheck
- Primary tagline
- Compass identity
- Navy → teal → turquoise → mint brand family
- Inter
- JetBrains Mono
- Lucide icons
- 8 px spacing system
- 12 px card radius
- restrained 1 px borders
- subtle shadows
- dark-theme-first implementation
- light-theme token support
- Ask VibeCheck companion launcher
- duck mascot direction
- mobile companion sheet behavior
- honest Plan/Deploy previews
- compass clear-space rule

## PROVISIONAL

- exact mascot artwork
- exact final logo geometry
- final wordmark spacing
- secondary accent usage
- semantic color tuning after accessibility testing
- final light-theme tuning
- social-card composition

## DEFERRED

- trademark clearance
- exhaustive brand guidelines
- production marketing campaign system
- sophisticated mascot animation system
- final long-term companion character naming
- broader marketing illustration system

---

# 24. Implementation Priority

For the Ensign BUILD hackathon, visual implementation priority is:

1. Establish semantic design tokens.
2. Load Inter and JetBrains Mono.
3. Configure Lucide.
4. Implement the approved dark theme.
5. Add the official compass SVG.
6. Build the homepage from Stitch composition references.
7. Build the Code Detective workspace.
8. Build Knowledge Check and session skill-result states.
9. Verify responsive behavior.
10. Verify accessibility.
11. Add mascot/companion visuals only if the critical demo path is already functional.

The core working VibeCheck experience takes priority over decorative brand completeness.

---

# Final Brand Principle

VibeCheck exists to help developers move from:

**"AI built this for me."**

to:

**"I understand what I built."**

Every brand and interface decision should reinforce clarity, guidance, learning, and confidence.