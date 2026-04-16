# Pack Quality Audit

Date: 2026-04-16
Repository: `landlord-heavenv3`

## Scope

This audit reviewed generated pack quality across the main paid product families:

- `notice_only`
- `complete_pack`
- `money_claim`
- `sc_money_claim`
- England tenancy agreement products:
  - `england_standard_tenancy_agreement`
  - `england_premium_tenancy_agreement`
  - `england_student_tenancy_agreement`
  - `england_hmo_shared_house_tenancy_agreement`
  - `england_lodger_agreement`
- legacy tenancy SKUs:
  - `ast_standard`
  - `ast_premium`
- Section 13 products:
  - `section13_standard`
  - `section13_defensive`

Evidence came from existing audit scripts, sample-generation scripts, and targeted Vitest suites.

## Overall Ratings

| Product family | Rating | Confidence | Summary |
| --- | --- | --- | --- |
| Notice Only Pack | 4/10 | High | Generates, but Section 8 legal/date logic and support-doc layout quality have material issues. |
| Complete Eviction Pack | 4/10 | High | England route logic is inconsistent; Scotland support-doc completeness is weak. |
| Money Claim Pack (England) | 7/10 | High | Strongest core pack overall, but one real totals-formatting defect remains and sample warnings are common. |
| Money Claim Pack (Scotland) | 6/10 | Medium | Generates successfully, but official form field mapping warnings and PDF timeout issues reduce confidence. |
| England tenancy packs | 6/10 | Medium-High | Core generation works, but clause coverage, governance, and consistency checks are messy. |
| Section 13 packs | 6/10 | Medium | Core pack generation is broadly healthy, but narrative/support docs have wording regressions. |

## Evidence Run

### Scripts

- `scripts/audit-tenancy-variants.ts`
  - Result: pass
- `scripts/audit-tenancy-clauses.ts`
  - Result: fail
  - `30` errors, `7` warnings, `41` clause mismatches
- `scripts/generate-england-tenancy-samples.ts`
  - Result: partial success
  - England standard pack generated `5` documents
  - PDF write step then failed after a Playwright navigation timeout
- `scripts/generate-ew-money-claim-pack.ts`
  - Result: success
  - Generated `9` pack documents
- `scripts/generate-scotland-money-claim-pack.ts`
  - Result: success with warnings
  - Generated `6` pack documents
- `scripts/generate-ew-section8-pack.ts`
  - Result: fail
  - Blocked by a `server-only` import path issue

### Key test suites

- `tests/regression/section8-pdf-quality-legal-accuracy.test.ts`
  - `15` failed, `15` passed
- `tests/documents/eviction-pack-validation.test.ts`
  - `6` failed, `9` passed, `4` skipped
- `src/lib/documents/__tests__/england-complete-pack-fixes.test.ts`
  - `2` failed, `15` passed
- `tests/complete-pack/england-complete-pack-dataflow.test.ts`
  - contains a live route/dataflow failure
- `tests/complete-pack/section8-grounds-consistency.test.ts`
  - failures on expiry/ground consistency
- `tests/regression/money-claim-end-to-end.test.ts`
  - `1` real failure on floating-point formatting
- `tests/documents/scotland-money-claim-pack.test.ts`
  - pass
- `tests/documents/ast-pack-unbundled.test.ts`
  - pass
- `tests/tenancy/scotland-prt-pack-fixes.test.ts`
  - `1` failure
- `tests/tenancy/premium-document-consistency.test.ts`
  - fail
- `tests/tenancy/england-deposit-cap.test.ts`
  - fail
- `src/lib/documents/__tests__/section13-pack-generation.test.ts`
  - `3` failed, `5` passed

## Product-by-Product Findings

### 1. Notice Only Pack

Rating: `4/10`

What looks healthy:

- Pack generation still runs.
- `tests/complete-pack/section8-document-hardening.test.ts` shows the notice-only path can still generate a 5-document pack.

Main problems:

- Section 8 legal timing is inconsistent.
  - Tests expect Ground 8-only cases to use a `14` day notice period, but current behavior returns `28`.
  - Earliest valid date calculations are therefore drifting.
- Ground 8 threshold logic appears to be using a `3` month threshold in some paths when tests expect `2` months.
- PDF support docs are not presentation-ready.
  - Missing page-break controls and structural classes in service instructions/checklists.
  - Missing expected legal summary wording such as `14 days`, `60 days (2 months) minimum`, and `Immediate (0 days)` in the regression suite.
- `scripts/generate-ew-section8-pack.ts` currently fails to run due to a `server-only` import issue, which makes the direct sample-generation route unreliable.

Main files/tests implicated:

- `tests/regression/section8-pdf-quality-legal-accuracy.test.ts`
- `tests/documents/eviction-pack-validation.test.ts`
- `tests/complete-pack/section8-grounds-consistency.test.ts`

### 2. Complete Eviction Pack

Rating: `4/10`

What looks healthy:

- England complete-pack generation still runs in several tests.
- Core N5/N119 generation is still functioning in the hardening suite.

Main problems:

- England Section 8 logic is inconsistent in the same way as Notice Only.
  - Ground 8 threshold blocker is still firing for arrears slightly above 2 months.
  - Expiry validation is returning dates based on `28` days where tests expect `14`.
- England route/dataflow is internally conflicted.
  - `tests/complete-pack/england-complete-pack-dataflow.test.ts` currently shows a Section 21 route being normalized to `section_8`.
- Witness statement evidence references are degraded.
  - Evidence references no longer include expected named source documents like `Tenancy Agreement.pdf` and compliance artefacts.
- Scotland support docs are incomplete.
  - Missing templates:
    - `config/jurisdictions/uk/scotland/templates/eviction/court_bundle_index.hbs`
    - `config/jurisdictions/uk/scotland/templates/eviction/hearing_checklist.hbs`
  - Scotland witness statement still leaks placeholder dates like `[Date]`.

Main files/tests implicated:

- `tests/documents/eviction-pack-validation.test.ts`
- `tests/complete-pack/england-complete-pack-dataflow.test.ts`
- `tests/complete-pack/section8-grounds-consistency.test.ts`
- `src/lib/documents/__tests__/england-complete-pack-fixes.test.ts`

### 3. Money Claim Pack (England)

Rating: `7/10`

What looks healthy:

- Sample generator produced a full `9` document pack.
- Most money-claim suites are passing.
- The official N1 generation path still works.

Main problems:

- One confirmed end-to-end precision defect remains.
  - `tests/regression/money-claim-end-to-end.test.ts` shows floating-point decimals leaking into totals.
- Repeated pack warnings suggest operational gaps in typical sample data:
  - missing court fee
  - missing Letter Before Claim date

Main files/tests implicated:

- `tests/regression/money-claim-end-to-end.test.ts`
- `tests/regression/money-claim-document-consistency.test.ts`
- `tests/regression/money-claim-court-readiness.test.ts`

### 4. Money Claim Pack (Scotland)

Rating: `6/10`

What looks healthy:

- Sample generator produced a `6` document pack.
- Core Scotland money-claim pack test passes.

Main problems:

- PDF generation had a navigation timeout warning.
- Official form mapping still throws many `field not found` warnings, which lowers confidence in the current form-fill mapping.
- One upstream normalization gap is still being auto-fixed during generation.

Main files/tests implicated:

- `tests/documents/scotland-money-claim-pack.test.ts`
- `scripts/generate-scotland-money-claim-pack.ts`

### 5. England Tenancy Agreement Packs

Rating: `6/10`

What looks healthy:

- Core unbundled pack generation passes.
- England standard sample generation successfully built `5` documents before the PDF export step timed out.
- Variant architecture audit is healthy.

Main problems:

- Clause/governance alignment is poor.
  - `scripts/audit-tenancy-clauses.ts` failed with heavy mismatch counts.
- Several consistency tests are no longer aligned with actual generated outputs.
  - England includes extra deposit-related documents not reflected in some cross-jurisdiction assumptions.
- Scotland premium tenancy pack expectations appear stale or the bundle definition has drifted.
- Some tenancy compliance wording has drifted from test expectations.

Main files/tests implicated:

- `scripts/audit-tenancy-clauses.ts`
- `tests/documents/ast-pack-unbundled.test.ts`
- `tests/tenancy/premium-document-consistency.test.ts`
- `tests/tenancy/scotland-prt-pack-fixes.test.ts`
- `tests/tenancy/england-deposit-cap.test.ts`

### 6. Section 13 Packs

Rating: `6/10`

What looks healthy:

- Core pack generation path still works well enough for the test suite to mostly pass.

Main problems:

- Narrative and support-doc quality has slipped.
  - cover letter wording no longer matches the intended explanatory standard
  - tribunal argument summary copy has regressed
  - premium comparable-summary wording has drifted

Main files/tests implicated:

- `src/lib/documents/__tests__/section13-pack-generation.test.ts`

## Main Cross-Cutting Issues

### Critical

- Section 8 / Form 3A timing and threshold logic is not stable across notice and complete-pack flows.
- Scotland complete-pack support templates are missing.
- Witness statement quality is inconsistent and still leaks placeholders in Scotland.

### High

- Tenancy clause coverage claims do not reliably match generated template content.
- England complete-pack evidence references have become too generic, reducing court-readiness value.
- England tenancy sample PDF export is fragile under Playwright timeout conditions.

### Medium

- Money claim totals still leak floating-point precision in at least one end-to-end path.
- Scotland money-claim official-form field mapping produces many skipped-field warnings.
- Several tests appear stale relative to newer pack contents, especially around cross-jurisdiction bundle comparisons.

## Recommended Fix Order

1. Fix Section 8 legal timing and Ground 8 threshold logic across Notice Only and Complete Pack.
2. Restore Scotland complete-pack missing templates and remove witness-statement placeholders.
3. Fix England complete-pack witness evidence references so they name real supporting documents again.
4. Fix money-claim totals formatting to eliminate floating-point leakage.
5. Reconcile tenancy clause audits and cross-jurisdiction pack expectations with the actual current bundles.
6. Tighten Section 13 narrative/support-doc wording back to the intended standard.

## Bottom Line

The strongest pack family today is Money Claim.

The weakest area today is the eviction stack, especially Section 8 / Form 3A support logic and Scotland complete-pack completeness.

The tenancy products are commercially usable, but the quality/governance layer around them is not yet clean enough to claim they are uniformly polished across all variants.
