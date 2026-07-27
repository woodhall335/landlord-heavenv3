# Tenancy legal-parity remediation audit

Generated: 27 July 2026

## What was wrong

- The Scottish equality clause was truncated, the deposit status could imply future dates as completed facts, and an agreement could say Schedule 1 was attached without physically appending it.
- Scottish supporting notes were mentioned without a package-level proof, and RPZ-only wizard wording did not reflect the 2026 rent-control-area framework.
- Both Welsh source-derived templates contained unresolved model instructions and known malformed copy; Rent Smart Wales registration and licensing were conflated.
- The Northern Ireland flow treated the rent book as conditional, omitted a generated rent-book component, and risked presenting uncommenced longer notice periods as current.

## What changed

- Attachment mode now appends the generated nine-page inventory to the agreement PDF and fails if the schedule cannot be generated. Later-supply mode uses different wording.
- Scottish deposit facts distinguish pending and completed protection and capture payer, scheme contact/address, dates, reference, deductions, repayment and disputes. Official April 2024 supporting notes are mandatory in the pack manifest.
- Welsh drafting instructions and copy defects were removed, a no-modification declaration is rendered, terms 14A/14B are regression-scanned, and registration/licensing/agent licensing are separate facts.
- Every Northern Ireland pack contains a populated rent book, the official blank Tenancy Information Notice, its official guidance, and current commenced notice-to-quit wording.
- Long Welsh and Northern Ireland agreements now include contents pages. All agreement samples retain the existing Landlord Heaven identity.

## Source position and limitations

The detailed sources, versions, dates and retained-file hashes are in `source-version-manifest.json`. Intentional differences are in `statutory-differences.json`.

The Scottish term 10/rent-control wording and term 22/equality wording are adapted from current authorities rather than represented as verbatim April 2024 model text. No external solicitor approval was obtained in this engineering run. The Northern Ireland prescribed Tenancy Information Notice remains the official blank form and must be completed and signed; the wizard explicitly requires that workflow. These documents must remain behind the existing certification/release gate pending qualified jurisdiction-specific legal review.

## Commands

- `npx -p node@20 -p tsx tsx scripts/generate-branded-non-england-certification-samples.ts`
- `python scripts/audit-non-england-tenancy-certification.py`
- `npm run validate:yaml-config`
- `npx tsc --noEmit`
- `npx -p node@20 node .\node_modules\vitest\vitest.mjs run tests/tenancy/branded-model-derived-agreements.test.ts tests/tenancy/non-england-legal-drift-2026.test.ts src/lib/documents/__tests__/ast-pack-generation.test.ts`
- `npm run lint`
- `npx next build --webpack` (the external IndexNow postbuild hook was not run)
- `git diff --check`

## Final agreement page counts

- Scotland PRT: 27
- Wales fixed term: 35
- Wales periodic: 40
- Northern Ireland: 24

Every agreement page is indexed in `rendered-page-index.json`; full-page PNGs, four complete contact sheets and 12 manual-review contact-sheet chunks are stored under this directory.
