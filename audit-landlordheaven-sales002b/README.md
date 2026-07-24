# LandlordHeaven SALES-002B browser QA certification

Date: 24 July 2026

## Outcome

SALES-002B rendered-browser QA has been completed using an independent Puppeteer browser runner after the in-app browser runtime failed with `Cannot redefine property: process`.

The rendered audit covered 24 changed or affected public routes across three viewports:

- mobile: 390px
- tablet: 768px
- desktop: 1440px

This produced 72 full-page screenshots in `screenshots/` and the required CSV evidence files in this folder.

## Certification summary

| Area | Result | Evidence |
| --- | --- | --- |
| Browser runtime fallback | Complete | `browser-runtime-root-cause.md`, `scripts/sales002b-browser-qa.mjs` |
| Routes rendered | Complete | 24 routes / 72 viewport checks |
| Screenshots captured | Complete | 72 PNG files |
| Network failures | Pass | `network-failures.csv` contains no runtime failures after local-only telemetry noise filtering |
| Product first-view checks | Pass | 15/15 product viewport checks passed |
| Rendered copy scan | Pass | 72/72 checks passed |
| HMO checker state coverage | Pass with manual-state limitation | Route and controls rendered at all viewports; scenario submission remains manual |
| Rent arrears state coverage | Pass with manual-state limitation | Route and controls rendered at all viewports; scenario submission remains manual |
| Experiment variant validation | Review | Variant assignment did not match the two expected identities |
| Accessibility | Review | Empty links and one missing input id/name pattern remain |
| Browser console | Review | React hydration error #418 remains on selected marketing/blog routes |

## Key files

- `route-rendered-qa.csv`
- `mobile-rendered-qa.csv`
- `tablet-rendered-qa.csv`
- `desktop-rendered-qa.csv`
- `browser-console-errors.csv`
- `network-failures.csv`
- `product-first-view-validation.csv`
- `rendered-copy-scan.csv`
- `accessibility-validation.csv`
- `remaining-defects.csv`
- `validation.md`

## Source change made during SALES-002B

One genuine page-level accessibility defect was fixed:

- `/eviction-cost-uk` no longer renders a duplicate page-level H1 from the nested `StandardHero`; the nested hero title is now rendered as `h2`.

## Release position

The product sales pages rendered successfully and passed first-view checks, rendered-copy checks and network checks. However, this is not a fully clean browser certification because React hydration errors and accessibility warnings remain. These are documented as follow-up defects rather than hidden.

