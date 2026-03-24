# England Renters' Rights Follow-up

## What changed

- England tenancy-agreement reform logic now branches on `england_tenancy_purpose` instead of treating all England cases as post-reform.
- New England agreements are treated as post-reform only when the tenancy start date is on or after 1 May 2026 and the purpose is `new_agreement`.
- Existing written England tenancies include the exact local `Renters' Rights Act Information Sheet 2026` PDF in preview metadata and the generated bundle.
- Existing verbal England tenancies do not include that PDF and instead keep a blocking written-information acknowledgement.
- The standalone England checklist and the legal-validity summary now refer to England written information and transition duties instead of stale `How to Rent` wording.
- Active England tenancy-agreement surfaces now use human-readable dates such as 1 May 2026 and 31 May 2026.
- Older England cases with no recorded tenancy purpose now show a visible warning in review and dashboard surfaces instead of silently implying that the branch is confirmed.

## What is now enforced

- `existing_written_tenancy`
  - The exact local `Renters' Rights Act Information Sheet 2026` PDF is included in preview metadata and the generated pack.
  - The transition acknowledgement remains blocking.
- `existing_verbal_tenancy`
  - The Information Sheet 2026 PDF is excluded.
  - The written-information acknowledgement remains blocking.
  - Review and checklist surfaces remind the user that the written information must be given by 31 May 2026.
- `new_agreement`
  - England fixed-term blocking is tied to the post-reform branch and the tenancy start date.
  - England rent-increase options are section 13 only.
  - The active wizard prompt tracks England written information or guidance rather than stale AST-era review clauses.
- Missing or invalid dates
  - Partial or invalid tenancy start dates no longer count as valid reform-boundary dates.
  - Missing England tenancy purpose does not trigger auto-inference.
  - England review and dashboard surfaces show a warning when the tenancy purpose is missing but the tenancy start date suggests transition relevance.

## Existing verbal tenancy coverage

- Currently covered
  - Blocking acknowledgement in `config/mqs/tenancy_agreement/england.yaml`
  - Validator enforcement in `src/lib/validation/tenancy-details-validator.ts`
  - Review reminder in `src/app/(app)/wizard/review/page.tsx`
  - Checklist wording in `config/jurisdictions/_shared/standalone/checklist_standalone.hbs`
- Not yet generated as a formal annex or schedule
  - There is no dedicated England written-information annex for existing verbal tenancies in the generated agreement output.
  - The current output relies on acknowledgement, checklist, review reminder, and general tenancy wording rather than a separate formal written-information schedule.
- If legal asks for a formal annex or schedule
  - Update `config/jurisdictions/uk/england/templates/standard_ast_formatted.hbs`
  - Update `config/jurisdictions/uk/england/templates/premium_ast_formatted.hbs`
  - Consider adding a shared England written-information partial and wiring it in `src/lib/documents/ast-generator.ts`

## Intentionally not covered here

- SEO, blog, and historic AST search-intent content
- Notice-only and Section 21 product flows
- Automatic inference of `england_tenancy_purpose` for older saved cases
- A broad rename of internal identifiers such as `ast_*` and `how_to_rent_guide_provided`

## Legal and product signoff still needed

- Whether the current new-agreement guidance-tracking prompt should remain blocking or become advisory only
- Whether existing verbal tenancies need a formal generated written-information schedule in addition to the current acknowledgement and reminder flow
- Whether any shared explanatory surfaces should mention optional government guidance separately or leave that entirely to operational process

## Tests covering the change

- `src/lib/tenancy/__tests__/england-reform.test.ts`
- `src/lib/validation/__tests__/tenancy-details-validator.test.ts`
- `src/lib/documents/__tests__/ast-pack-generation.test.ts`
- `src/lib/documents/__tests__/england-transition-document-configs.test.ts`
- `src/lib/documents/__tests__/england-assured-periodic-output.test.ts`
- `tests/lib/checklist-standalone-england-transition.test.ts`
- `tests/ui/tenancy-product-lock-ui.test.tsx`
- `tests/lib/dashboard-document-display.test.ts`
- `tests/documents/ast-pack-unbundled.test.ts`

## Manual QA before release

1. New England agreement
   - Start date: 2 May 2026
   - Purpose: `new_agreement`
   - Confirm the flow blocks fixed-term setup, shows section 13-only rent wording, and does not include the Information Sheet 2026 in preview or bundle output.
2. Existing written England tenancy
   - Start date: 30 April 2026 or earlier
   - Purpose: `existing_written_tenancy`
   - Confirm the review page names the Information Sheet 2026, preview shows the extra document card, and the final bundle contains the exact local PDF.
   - Confirm the checklist includes the transition row that says the exact PDF must be given by 31 May 2026.
3. Existing verbal England tenancy
   - Start date: 30 April 2026 or earlier
   - Purpose: `existing_verbal_tenancy`
   - Confirm the acknowledgement is blocking, the review page shows the written-information reminder, and the Information Sheet 2026 is excluded from preview and bundle output.
   - Confirm the checklist includes the written-information duty due by 31 May 2026.
4. Older saved England case with missing tenancy purpose
   - Start date: before 1 May 2026
   - Leave `england_tenancy_purpose` empty or absent
   - Confirm the review page and dashboard show a warning that the tenancy purpose is missing and transition paperwork should be checked before relying on the pack.
5. Older saved England case with missing tenancy purpose after reform start
   - Start date: 2 May 2026
   - Leave `england_tenancy_purpose` empty or absent
   - Confirm the review page and dashboard show a warning that the case starts on or after 1 May 2026 but does not record whether it is a new agreement or a transition case.
6. Negative validation checks
   - Existing written tenancy without the written transition acknowledgement should fail validation.
   - Existing verbal tenancy without the written-information acknowledgement should fail validation.
   - A malformed tenancy start date should not be treated as a valid reform-boundary date.
7. Checklist PDF checks
   - Confirm the active England checklist path does not show `How to Rent Guide (Mandatory)`.
   - Confirm the checklist wording matches the correct branch for new, existing written, and existing verbal cases.
8. Legal-validity summary checks
   - Confirm the summary refers to England written information or government guidance, not the `How to Rent` guide.
   - Confirm no user-facing date in the summary, review page, or checklist appears in ISO format.

## CI and local run instructions

- Required Node version for CI and release validation
  - `next` requires Node `>=20.9.0`
  - `vitest` requires Node `^18.0.0 || >=20.0.0`
  - Use Node `20.9.0` or later for merge validation
- Required commands
  - Typecheck: `pnpm exec tsc --noEmit --pretty false`
  - Main tests: `pnpm test`
  - Targeted tests if needed: `pnpm vitest run src/lib/tenancy/__tests__/england-reform.test.ts src/lib/validation/__tests__/tenancy-details-validator.test.ts src/lib/documents/__tests__/ast-pack-generation.test.ts src/lib/documents/__tests__/england-transition-document-configs.test.ts src/lib/documents/__tests__/england-assured-periodic-output.test.ts tests/lib/checklist-standalone-england-transition.test.ts tests/ui/tenancy-product-lock-ui.test.tsx`
- Current local shell limitation
  - This workstation shell is running Node `14.17.6`, so Vitest could not be executed locally in this session.
  - TypeScript typecheck was run successfully with `.\node_modules\.bin\tsc.cmd --noEmit --pretty false`.
