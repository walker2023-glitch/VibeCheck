# Temporary npm audit exception — M0-01

Recorded: 2026-10-09. Status: open; review before release and when the Next.js ESLint toolchain is updated.

`npm audit` reports five high-severity findings in the development-only ESLint dependency chain:
`eslint-config-next@16.4.0` → `@next/eslint-plugin-next@16.4.0` → `fast-glob@3.3.1` → `micromatch@4.0.8` → `braces@3.0.3`.
The five reported package entries are `eslint-config-next`, `@next/eslint-plugin-next`, `fast-glob`, `micromatch`, and `braces`. `npm ls braces` confirmed this installed chain. The exception applies only to these current audit findings; it does not waive the master spec's release security gate or future findings.

No dependency versions are changed in this corrective pass. Recheck the advisory and dependency path before release, then remove this exception when the finding is resolved or a reviewed mitigation is adopted.