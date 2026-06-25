# Backlink Implementation Plan

Audit status: plan only. No production code changes made.

## Recommended Approach

Use Landlord Heaven to support HRHeaven, but only through relevant editorial links. The goal is to create a small, defensible link graph between related brands, not a mass cross-site link network.

## Phase 0: Pre-Implementation Checks

Before adding any links:

1. Confirm the HRHeaven destination URLs are live and indexable.
2. Confirm each HRHeaven page has strong title, H1, canonical, and no accidental noindex.
3. Confirm Landlord Heaven pages selected for linking are indexable.
4. Confirm no HRHeaven links already exist sitewide.
5. Decide whether links should open normally, not in a new tab by default.
6. Use normal followed links only where editorially relevant; do not add `nofollow` unless the link is paid/sponsored.

## Phase 1: Add The Safest Existing-Page Links

Add 3 to 5 links first.

### Link 1

Source:

`/products/ast`

Destination:

`https://hrheaven.co.uk/industry/real-estate`

Suggested context:

In a short paragraph near property-business or route comparison content:

> If you run a letting agency or property business with staff, keep tenancy paperwork separate from employment documents. HRHeaven covers HR documents for property businesses.

Anchor:

`HR documents for property businesses`

### Link 2

Source:

`/hmo-shared-house-tenancy-agreement`

Destination:

`https://hrheaven.co.uk/industry/cleaning/cleaner-employment-contract`

Suggested context:

Near communal cleaning / shared-house management wording:

> If you employ a regular cleaner for communal areas, keep the house rules separate from the cleaner employment contract.

Anchor:

`cleaner employment contract`

### Link 3

Source:

`/money-claim-cleaning-costs`

Destination:

`https://hrheaven.co.uk/industry/cleaning/cleaner-employment-contract`

Suggested context:

Near professional cleaning quotes/invoices:

> One-off cleaning invoices belong in the claim evidence. If you employ cleaning staff regularly, use separate employment paperwork for cleaning staff.

Anchor:

`employment paperwork for cleaning staff`

### Link 4

Source:

`/standard-tenancy-agreement`

Destination:

`https://hrheaven.co.uk/industry/real-estate`

Suggested context:

Only add if the page gets a short property-business aside:

> Landlords who operate through a property company may also need staff documents, but those should sit outside the tenancy agreement.

Anchor:

`staff documents for property management businesses`

### Link 5

Source:

`/tenant-refusing-access`

Destination:

`https://hrheaven.co.uk/employment-contract`

Suggested context:

Only add where discussing maintenance workers and contractor records:

> If the same person works for you regularly rather than quoting as an independent contractor, check whether you need an employment contract.

Anchor:

`employment contract`

## Phase 2: Create HR-Overlap Support Articles

Create these pages before scaling more links:

1. `/hiring-a-property-manager-employment-contract-checklist`
2. `/landlords-hiring-staff-employee-or-contractor`
3. `/section-8-grounds/how-to-evict-a-tenant-using-ground-16`
4. `/employment-documents-for-property-management-businesses`
5. `/letting-agency-employee-handbook`

Each article should include one carefully placed HRHeaven link and then internally link back to relevant Landlord Heaven property pages.

## Phase 3: Review Performance

After links are live for 4 to 8 weeks:

1. Check HRHeaven referral traffic.
2. Check HRHeaven Search Console impressions for linked pages.
3. Check whether Landlord Heaven pages remain stable.
4. Check anchor distribution.
5. Add more links only where users are engaging and the context remains natural.

## Implementation Rules

- 1 HRHeaven link per existing page.
- 1 to 2 HRHeaven links per new HR-overlap article.
- No sitewide links.
- No footer/sidebar/header links.
- No links from checkout, dashboard, wizard, or generated documents.
- No repeated exact-match anchors.
- No links where HR is not part of the visible paragraph.

## Suggested First Sprint

1. Verify HRHeaven destination pages.
2. Add links to `/products/ast`, `/hmo-shared-house-tenancy-agreement`, and `/money-claim-cleaning-costs`.
3. Create `/hiring-a-property-manager-employment-contract-checklist`.
4. Create `/landlords-hiring-staff-employee-or-contractor`.
5. Re-crawl and confirm links are present only on intended pages.

## QA Checklist

- Link appears once on source page.
- Anchor is natural and not repeated elsewhere.
- Destination URL is correct.
- Link is surrounded by relevant copy.
- No global component was edited.
- No checkout/wizard/dashboard page includes the link.
- Page remains readable and not promotional.
- Sitemap/indexability unaffected.
