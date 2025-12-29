# E2E Upload Evidence Smoke Test

This suite is optional and requires Playwright to be installed in an environment
with network access to download browser binaries.

## Setup

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

## Running

```bash
E2E_CASE_ID=<case-id> pnpm exec playwright test tests/e2e/upload-evidence.spec.ts
```

Notes:
- The tests expect a running Next.js dev server. The Playwright config
  starts `pnpm dev` on port 5000 automatically.
- Ensure the `E2E_CASE_ID` belongs to the signed-in user used in the session.
