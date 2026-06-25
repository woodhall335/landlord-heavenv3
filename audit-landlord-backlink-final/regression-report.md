# Regression Report

## Completed Checks

| Check | Result | Notes |
|---|---|---|
| `pnpm exec tsc --noEmit --pretty false` | PASS | Completed successfully after the QA changes and again after final report updates. |
| HRHeaven link count guard | PASS | Existing pages remain capped at 1 HRHeaven link; new pages remain capped at 2. |
| Sitemap presence guard | PASS | All five new articles are present in `src/app/sitemap.ts`. |
| E-E-A-T/metadata guard | PASS | Each new page has Twitter metadata, canonical metadata, Open Graph metadata, FAQs, related resources, and conclusion props. |

## Required Commands

The prompt requested:

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Actual results from this pass:

- `pnpm typecheck` failed because no `typecheck` command exists in `package.json`.
- `pnpm test` timed out after 5 minutes without returning actionable test output.
- `pnpm build` timed out after 10 minutes. The hanging child process was in the build pre-step path: `npm run validate:yaml-config` -> `npx -p node@20 -p tsx tsx scripts/validate-yaml-config.ts`.

Known related behaviour from the previous rollout validation:

- `pnpm run test:seo` had all 16 H1 assertions pass, but Vitest exited non-zero because existing analytics code fired relative `/api/analytics/events` requests in the test environment.

## Regression Assessment

No backlink implementation regression has been identified. The failing/timed-out commands appear related to existing repository execution/test-harness behaviour rather than the new article and backlink changes.
