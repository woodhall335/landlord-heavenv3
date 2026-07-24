# Production build validation

Final deployed source state: `68347e32e96bf28a1d626164f3e999865265839c`.

## Production build

- Command 1: `pnpm run validate:yaml-config`
- Result: PASS — 40 YAML configuration files validated.
- Command 2: `pnpm exec next build --webpack`
- Framework: Next.js 16.1.1
- Result: PASS
- Compile: PASS in 4.2 minutes
- TypeScript phase: PASS
- Static generation: PASS, 517/517 pages in 114 seconds
- Build and YAML validation wall time: 813.5 seconds
- Completed: 2026-07-24 21:42:34 BST
- Full log: `tmp/sales003b/production-build-current.log`

The local full build was run immediately before the final two-line duplicate
CTA suppression change. The exact final commit then passed targeted ESLint,
`tsc --noEmit`, 10 relevant tests, and the Vercel production build for deployment
`AmN6WgT7umUU3bFEsG7qfzmMFZjm`.

## Additional validation

- `pnpm exec tsc --noEmit`: PASS
- Focused Vitest run: PASS, 5 files and 18 tests
- Exact final CTA change: PASS, 2 files and 10 tests
- Targeted changed-file ESLint: PASS
- Full-project ESLint: PASS with 0 errors and 764 warnings across 2,045 files
- `node --check scripts/sales003b-live-certification.mjs`: PASS
- `git diff --check`: PASS

The warning count is reported without suppression in `eslint-summary.csv` and
`eslint-results.json`.
