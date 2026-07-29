# Tenancy PDF quality remediation

Generated and reviewed: 29 July 2026

## Outcome

The four standard non-England tenancy agreements are release candidates. Their generated values, text layer, page rendering, structural checks and package assets pass the targeted release evidence. They have not been deployed.

The repository-wide tenancy collection remains red because 23 older assertions conflict with the current standard-only regional product scope or unrelated England/inventory changes. Those failures are recorded in `test-results.txt`; none exercise the defects remediated here.

## Root causes corrected

- Scotland and Wales first payments were valid numeric strings in canonical mapped data. The shared Handlebars `currency` helper accepted only JavaScript numbers and silently rendered every numeric string as `£0.00`. It now parses supported numeric strings and throws on invalid data instead of inventing a zero.
- The Scotland rent-control-area status was passed directly to the template. It now uses the central typed document display-label formatter.
- `breach..` was produced by punctuation in both the wizard fragment and the template. Dynamic sentence fragments are now normalized once before template punctuation is applied.
- The apparent break in “dispute-resolution” was ordinary PDF line wrapping, not source corruption. The reusable text lint confirms there are no replacement characters, malformed encoding markers or soft-hyphen artefacts.
- Page imbalance comes primarily from controlled long-form legal wording followed by deliberately structured schedules. Orphan-avoidance/table rules and running document furniture improve navigation without reordering or rewriting controlled clauses.

## Canonical payment policy

The standard Wales and Scotland flows support a positive full or pro-rata first payment no greater than the normal rent. A zero-value waiver is not supported by these products and now fails validation rather than appearing unexplained in a contract.

## Generated samples and QA

| Sample | Pages | Legal structure | Data accuracy | Readability | Hierarchy | Pagination | Consistency | Trust | Supporting pack | Production readiness |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Northern Ireland private tenancy | 25 | 9 | 9 | 9 | 9 | 8 | 9 | 9 | 9 | 9 |
| Scotland PRT | 27 | 9 | 9 | 8 | 8 | 8 | 9 | 9 | 9 | 9 |
| Wales fixed-term | 35 | 9 | 9 | 8 | 8 | 8 | 9 | 9 | 9 | 9 |
| Wales periodic | 40 | 9 | 9 | 8 | 8 | 8 | 9 | 9 | 9 | 9 |

The lower readability/pagination scores reflect the unavoidable density of the source-derived model terms and intentionally separate inventory schedule pages, not visible data defects.

## Evidence

- `PDF-structural-validation.csv` — A4 geometry, render counts, blank-page checks, execution headings and running page navigation.
- `PDF-text-quality-validation.csv` — extracted-text lint for raw values, unresolved tokens, encoding, entities, repeated words and punctuation.
- `payment-schedule-validation.csv` — rent/first-payment/deposit values and unexplained-zero checks.
- `visual-QA.csv` — manual contact-sheet results and the nine required scoring dimensions.
- `cross-document-consistency.csv` — title, jurisdiction, deterministic document ID and frozen snapshot values.
- `supporting-document-manifest.json` — generated pack inventory and verified SHA-256 hashes.
- `rendered/` and `contact-sheets/` — every rendered page and four whole-document visual overviews.
- `test-results.txt` — exact command results and known red baseline.

## Deployment recommendation

Do not deploy automatically from this audit. The regenerated standard agreement outputs are suitable to replace the current standard Scotland, Wales and Northern Ireland outputs after the normal release review. Reconcile or explicitly quarantine the 23 stale repository-wide tenancy assertions before treating the whole tenancy CI collection as green.
