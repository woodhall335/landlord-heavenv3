# Verification results

Date: 29 July 2026

- Tenancy, jurisdiction parity, package generation, fulfilment, ownership and
  signed-download tests: **508 passed, 0 failed** across 27 test files.
- Canonical inventory and package-consistency focused tests are included in the
  508-test result.
- TypeScript (`tsc --noEmit`): **passed**.
- ESLint on every changed TypeScript/TSX file with zero warnings allowed:
  **passed**.
- YAML configuration validation: **40 files passed**.
- Production build: **passed** using Next.js 16.1.1 and webpack.
- Static page generation: **518/518 passed**.
- Build ID: `bpm9tG1r8YxtSj-FOb68T`.
- `git diff --check`: **passed** (line-ending conversion notices only).
- Four representative regional packs regenerated.
- 16 PDFs / 197 pages opened, rasterised and visually reviewed.
- 20/20 external manifest file entries (16 PDFs and four JSON manifests) passed
  byte, page-count and SHA-256 verification; four internal package manifests
  passed state/title checks.
- Known-defect scan: zero `Act()`, `breach..`, unresolved Handlebars, empty
  statutory parentheses or replacement-character findings.
- Deployment: **not performed**.
- Live verification: **not performed**.
