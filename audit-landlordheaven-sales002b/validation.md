# Validation

## Browser QA

Command:

```powershell
node scripts\sales002b-browser-qa.mjs
```

Result:

- Routes: 24
- Viewport checks: 72
- Screenshots: 72
- Network failures: 0
- Product first-view checks: 15/15 pass
- Rendered copy checks: 72/72 pass
- Browser console/page errors: 24 review findings
- Accessibility review findings: 72 viewport rows with at least one issue

## Focused tests

Command:

```powershell
pnpm.cmd exec vitest run tests/sales/sales002-live-funnel.test.ts tests/unit/conversion-registry.test.ts tests/seo/sales001-public-copy.test.ts src/lib/marketing/__tests__/golden-pack-rollout-pages.test.ts --reporter=basic
```

Result: passed.

Coverage:

- SALES-002 live funnel tests
- conversion registry tests
- public copy tests
- golden-pack rollout page tests

## Focused ESLint

Command:

```powershell
pnpm.cmd exec eslint src/components/conversion/ContextualOffer.tsx src/components/marketing/PublicProductSalesPage.tsx src/app/tools/hmo-license-checker/page.tsx src/app/tools/rent-arrears-calculator/page.tsx tests/sales/sales002-live-funnel.test.ts tests/unit/conversion-registry.test.ts
```

Result: passed.

## Full ESLint

Command:

```powershell
pnpm.cmd exec eslint .
```

Result: timed out after 120 seconds in the local workspace. No pass is claimed for the full repository lint run.

## Production build / TypeScript

Command:

```powershell
pnpm.cmd exec next build --webpack
```

Result: passed.

The Next build completed compilation, TypeScript validation and static generation.

Note: `pnpm.cmd run build` was not used as the certification signal because the pre-build wrapper attempted an external package/tool download and failed locally with a certificate chain error. The direct Next production build was used for app validation.

## Git diff check

Command:

```powershell
git diff --check
```

Result: passed with Windows line-ending warnings only. No whitespace errors were reported.

## Remaining validation findings

These are intentionally recorded rather than treated as certified clean:

- React hydration error #418 remains on `/eviction-cost-uk` and selected blog routes.
- Accessibility warnings remain for empty links across shared page chrome/content areas.
- Rent arrears has one field pattern without an `id` or `name` attribute.
- Experiment variant validation did not match the two expected identity assignments.

