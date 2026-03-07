# Funnel audit (Playwright)

## Install prerequisites

1. Install dependencies (includes `@playwright/test` as a devDependency):
   - `pnpm install`
2. Install Playwright browsers:
   - `pnpm run audit:pw:install`

## Run

- `npm run audit:funnel`

## Output

The audit writes to:

- `audit-output/funnel/latest/funnel_runs.json`
- `audit-output/funnel/latest/summary.md`
- `audit-output/funnel/latest/screens/*.png`
