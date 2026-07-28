# Verification results

## Passed

- YAML configuration validation: 40 files.
- Focused non-England release, legal-copy, field-validation and mapper suite:
  228 tests across 8 test files.
- Immutable tenancy-output snapshot tests.
- Document ownership and signed-download route tests.
- Order regeneration storage-path compatibility tests.
- TypeScript: `tsc --noEmit`.
- Focused ESLint: zero errors (existing warnings remain).
- Production Next.js 16.1.1 webpack build: passed, including internal
  TypeScript validation and 518/518 statically generated pages.
- Final build ID: `rl9UthzbUbze7YeUkFmeq`.
- Local production-server smoke test: Wales fixed and periodic, Scotland
  standard, and Northern Ireland standard wizard entry URLs returned HTTP 200.
- `git diff --check`.

## Deployment-dependent verification

- Live production E2E: requires a deployment from a linked production project.
