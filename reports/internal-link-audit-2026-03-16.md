# Internal Link Audit

Date: 2026-03-16
Repo: `landlord-heavenv3`

## Scope

This audit was produced from the repo, using:

- `reports/seo-keyword-mapping.csv`
- `docs/audit-reports/blog-cta-coverage.csv`
- `SEO_LINK_AUTHORITY_MAP.md`
- `SEO_INTERNAL_LINK_MAP.md`
- shared route templates in:
  - `src/app/(marketing)/blog/[slug]/page.tsx`
  - `src/app/(marketing)/page.tsx`
  - `src/app/tools/page.tsx`
  - `src/app/tools/validators/page.tsx`
  - `src/app/(marketing)/products/money-claim-pack/page.tsx`

## Executive Summary

- The repo-level keyword mapping report flags `127` routes with `No internal links detected`.
- That number materially overstates the problem.
- `115` of those flagged routes are blog posts, but the shared blog page template already injects multiple internal-link surfaces:
  - hero CTA
  - inline product CTA card
  - core eviction guide links
  - related guides carousel
  - breadcrumb links
- `12` flagged non-blog routes are mostly false positives or non-indexable internal routes.
- The real issue is not total absence of internal links. The real issue is weak contextual linking on a smaller set of pages that currently lean too hard on:
  - `View All Products`
  - Ask Heaven links
  - broad pricing links

## Key Findings

### 1. Blog template coverage exists, but depth is uneven

`docs/audit-reports/blog-cta-coverage.csv` audits `105` blog pages:

- `77` pages: `Good coverage`
- `19` pages: `Limited CTA coverage`
- `9` pages: medium/partial coverage with 3 CTAs but no explicit "Good coverage" note

Conclusion:

- The blog system is not missing internal links structurally.
- It is missing stronger intent-matched deep links on a defined subset of pages.

### 2. The CSV "No internal links detected" flag has false positives

Confirmed false positives or inherited-link routes:

- `/`
- `/tools`
- `/tools/validators`
- `/products/money-claim-pack`

These pages do have internal links in their shared or direct templates.

### 3. Internal/non-indexable routes should not drive SEO priorities

These appear in the keyword mapping output but should not be prioritized for SEO internal-link work:

- `/dashboard/admin/orders`
- `/dashboard/admin/users`
- `/dashboard/profile`
- `/success/[product]/[caseId]`
- `/wizard`
- `/wizard/flow`
- `/wizard/preview/[caseId]`
- `/wizard/review`

### 4. Your actual opportunity is contextual authority routing

The authority model in `SEO_LINK_AUTHORITY_MAP.md` and `SEO_INTERNAL_LINK_MAP.md` is directionally correct:

- problem pages -> notice pages -> process pages -> court pages -> product pages

The gap is rollout consistency, especially on:

- eviction-process content
- compliance content
- property-management content
- money-claim support content

## Route Family Audit

### A. Homepage

Route: `/`

Status: structurally linked

Evidence:

- quick-link nav
- wizard entry links
- product card links
- Ask Heaven link

Audit outcome:

- false positive in `seo-keyword-mapping.csv`
- no urgent internal-link fix needed

### B. Tools Hub

Route: `/tools`

Status: structurally linked

Evidence:

- featured tool links
- full tool grid
- `CommercialWizardLinks` block to product pages
- Ask Heaven link in hero

Audit outcome:

- false positive in `seo-keyword-mapping.csv`
- no urgent internal-link fix needed

### C. Validators Hub

Route: `/tools/validators`

Status: structurally linked

Evidence:

- links to both validator detail pages
- shared hero and card grid

Audit outcome:

- false positive in `seo-keyword-mapping.csv`
- still worth adding one explicit "related paid routes" block later, but not broken

### D. Money Claim Pack Alias

Route: `/products/money-claim-pack`

Status: alias route

Evidence:

- re-exports `../money-claim/page`
- canonical points to `/products/money-claim`

Audit outcome:

- not a true standalone internal-link gap
- no direct linking work required on the alias itself

### E. Blog Detail Pages

Route family: `/blog/[slug]`

Status: structurally linked, but uneven contextual depth

Evidence from shared template:

- breadcrumb links
- hero CTA links
- inline product CTA
- core guide block
- related guides carousel

Audit outcome:

- not a zero-link family
- priority is improving page-specific contextual links for the weaker posts listed below

## High-Priority Page-by-Page Upgrades

These are the `19` blog posts marked `Limited CTA coverage` in `docs/audit-reports/blog-cta-coverage.csv`.

### Eviction Guides / Court Journey

| Route | Current state | Recommended internal links to add |
|---|---|---|
| `/blog/how-to-serve-eviction-notice` | Only `Complete Eviction Pack` + `/pricing` | `/section-21-notice-template`, `/section-8-notice-template`, `/serve-section-21-notice`, `/serve-section-8-notice` |
| `/blog/how-long-does-eviction-take-uk` | Only `Complete Eviction Pack` + `/pricing` | `/eviction-timeline-uk`, `/possession-order-timeline`, `/court-possession-order-guide`, `/products/complete-pack` |
| `/blog/england-possession-hearing` | Only `Complete Eviction Pack` + `/pricing` | `/court-possession-order-guide`, `/eviction-court-hearing-guide`, `/eviction-court-forms-england`, `/products/complete-pack` |
| `/blog/england-bailiff-eviction` | Only `Complete Eviction Pack` + `/pricing` | `/warrant-of-possession-guide`, `/court-bailiff-eviction-guide`, `/eviction-timeline-england`, `/products/complete-pack` |
| `/blog/england-county-court-forms` | Only `Complete Eviction Pack` + `/pricing` | `/eviction-court-forms-england`, `/n5b-possession-claim-guide`, `/n5b-form-guide`, `/products/complete-pack` |

### Compliance / Legal Compliance

| Route | Current state | Recommended internal links to add |
|---|---|---|
| `/blog/england-deposit-protection` | Ask Heaven + `/pricing` | `/assured-shorthold-tenancy-agreement-template`, `/inventory-schedule-of-condition-england`, `/landlord-documents-england` |
| `/blog/england-hmo-licensing` | Ask Heaven + `/pricing` | `/products/ast`, `/guarantor-agreement-england`, `/landlord-documents-england` |
| `/blog/uk-right-to-rent-checks` | Ask Heaven + `/pricing` | `/products/ast`, `/assured-shorthold-tenancy-agreement-template`, `/landlord-documents-england` |
| `/blog/uk-hmo-regulations-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/guarantor-agreement-england`, `/landlord-documents-england` |
| `/blog/uk-deposit-protection-guide` | Ask Heaven + `/pricing` | `/inventory-schedule-of-condition-england`, `/rental-inspection-report-england`, `/products/ast` |
| `/blog/uk-epc-requirements-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/landlord-documents-england`, `/rental-inspection-report-england` |
| `/blog/uk-landlord-licensing-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/landlord-documents-england`, `/guarantor-agreement-england` |
| `/blog/uk-right-to-rent-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/assured-shorthold-tenancy-agreement-template`, `/landlord-documents-england` |
| `/blog/uk-smoke-co-alarm-regulations-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/landlord-documents-england`, `/rental-inspection-report-england` |
| `/blog/uk-electrical-safety-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/landlord-documents-england`, `/rental-inspection-report-england` |

### Safety / Property Management

| Route | Current state | Recommended internal links to add |
|---|---|---|
| `/blog/uk-gas-safety-landlords` | Ask Heaven + `/pricing` | `/products/ast`, `/landlord-documents-england`, `/rental-inspection-report-england` |
| `/blog/uk-electrical-safety-landlords` | Ask Heaven + `/pricing` | `/products/ast`, `/rental-inspection-report-england`, `/landlord-documents-england` |
| `/blog/uk-end-of-tenancy-guide` | Ask Heaven + `/pricing` | `/inventory-schedule-of-condition-england`, `/rental-inspection-report-england`, `/money-claim-deposit-shortfall` |
| `/blog/uk-hmo-management-guide` | Ask Heaven + `/pricing` | `/products/ast`, `/guarantor-agreement-england`, `/landlord-documents-england` |

## Medium-Priority Page-by-Page Upgrades

These `9` posts have better coverage than the pages above, but still rely on broad CTAs and need stronger deep links.

| Route | Current state | Recommended internal links to add |
|---|---|---|
| `/blog/england-money-claim-online` | `Money Claim Pack` + calculator + `/pricing` | `/money-claim-online-mcol`, `/money-claim-unpaid-rent`, `/money-claim-ccj-enforcement` |
| `/blog/england-particulars-of-claim` | `Money Claim Pack` + calculator + `/pricing` | `/money-claim-n1-claim-form`, `/money-claim-letter-before-action`, `/money-claim-schedule-of-debt` |
| `/blog/rent-smart-wales` | Wales guide + Ask Heaven + `/pricing` | `/wales-eviction-notices`, `/products/ast`, `/landlord-documents-england` where relevant for document journeys |
| `/blog/northern-ireland-private-tenancies-order` | Ask Heaven + `AST` + `/pricing` | `/northern-ireland-tenancy-agreement-template`, `/notice-to-quit-northern-ireland-guide`, `/products/ast` |
| `/blog/northern-ireland-landlord-registration` | Ask Heaven + `AST` + `/pricing` | `/northern-ireland-tenancy-agreement-template`, `/notice-to-quit-northern-ireland-guide`, `/products/ast` |
| `/blog/northern-ireland-deposit-protection` | Ask Heaven + `AST` + `/pricing` | `/northern-ireland-tenancy-agreement-template`, `/products/ast`, `/inventory-schedule-of-condition-england` equivalent journey pages if NI versions exist later |
| `/blog/uk-fire-safety-landlords` | two Ask Heaven links + `/pricing` | `/products/ast`, `/rental-inspection-report-england`, `/landlord-documents-england` |
| `/blog/uk-money-claims-online-guide` | `Money Claim Pack` + calculator + `/pricing` | `/money-claim-online-mcol`, `/money-claim-unpaid-rent`, `/money-claim-small-claims-landlord` |
| `/blog/uk-property-inventory-guide` | two Ask Heaven links + `/pricing` | `/inventory-schedule-of-condition-england`, `/rental-inspection-report-england`, `/money-claim-property-damage` |

## Pages To Ignore For SEO Linking Work

These routes showed up in repo audits but should not be part of public internal-link priorities:

- `/dashboard/admin/orders`
- `/dashboard/admin/users`
- `/dashboard/profile`
- `/success/[product]/[caseId]`
- `/wizard`
- `/wizard/flow`
- `/wizard/preview/[caseId]`
- `/wizard/review`

## Recommended Rollout Order

### Sprint 1

- `/blog/england-county-court-forms`
- `/blog/england-bailiff-eviction`
- `/blog/england-possession-hearing`
- `/blog/how-to-serve-eviction-notice`
- `/blog/how-long-does-eviction-take-uk`

Reason:

- these are high-intent court/process pages
- they should pass stronger authority into `/products/complete-pack`
- they fit the existing authority chain best

### Sprint 2

- `/blog/england-money-claim-online`
- `/blog/england-particulars-of-claim`
- `/blog/uk-money-claims-online-guide`
- `/blog/uk-end-of-tenancy-guide`
- `/blog/uk-property-inventory-guide`

Reason:

- strong alignment to money-claim and evidence/document routes

### Sprint 3

- compliance and safety posts currently routing mainly to Ask Heaven and `/pricing`

Reason:

- these pages need better commercial-document bridges, not just generic tool exits

## Final Conclusion

The repo does not currently show a sitewide internal-link collapse.

What it does show is:

- a shared linking system that already exists on major templates
- a keyword audit that is generating false positives on several route families
- a meaningful but manageable set of blog posts with weak contextual internal-link depth

If you want the highest ROI next step, the work should focus on the `19` limited-coverage posts first, especially the court-stage and process-stage England eviction content.
