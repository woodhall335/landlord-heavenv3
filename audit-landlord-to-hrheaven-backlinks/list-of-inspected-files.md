# List Of Inspected Files

Audit status: repository inspection only. No production code changes made.

## Route Files Inspected Or Sampled

- `src/app/(marketing)/products/ast/page.tsx`
- `src/app/(marketing)/products/notice-only/page.tsx`
- `src/app/(marketing)/products/complete-pack/page.tsx`
- `src/app/(marketing)/products/money-claim/page.tsx`
- `src/app/standard-tenancy-agreement/page.tsx`
- `src/app/hmo-shared-house-tenancy-agreement/page.tsx`
- `src/app/money-claim-cleaning-costs/page.tsx`
- `src/app/money-claim-carpet-damage/page.tsx`
- `src/app/money-claim-bathroom-damage/page.tsx`
- `src/app/money-claim-appliance-damage/page.tsx`
- `src/app/money-claim-abandoned-goods/page.tsx`
- `src/app/tenant-left-without-paying-rent/page.tsx`
- `src/app/how-to-sue-tenant-for-unpaid-rent/page.tsx`
- `src/app/county-court-claim-form-guide/page.tsx`
- `src/app/warrant-of-possession/page.tsx`
- `src/app/court-bailiff-eviction-guide/page.tsx`
- `src/app/bailiff-eviction-process/page.tsx`
- `src/app/eviction-cost-uk/page.tsx`
- `src/app/tenancy-agreements/wales/page.tsx`
- `src/app/tenancy-agreements/northern-ireland/page.tsx`
- `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-1/page.tsx`
- `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-1a/page.tsx`
- `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-8/page.tsx`
- `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-13/page.tsx`
- `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-14/page.tsx`
- `src/app/section-8-grounds/how-to-evict-a-tenant-using-ground-17/page.tsx`

## SEO And Content Registry Files Inspected Or Sampled

- `src/lib/seo/wizard-landing-content.ts`
- `src/lib/seo/pass1-longform-content.ts`
- `src/lib/seo/pass2-longform-content.ts`
- `src/lib/seo/page-taxonomy.ts`
- `src/lib/seo/internal-links.ts`
- `src/lib/seo/eviction-intent-pages.ts`
- `src/lib/seo/england-current-framework-pages.ts`
- `src/lib/seo/product-owner-metadata.ts`
- `src/lib/seo/england-tenancy-route-cards.ts`
- `src/lib/seo/blog-commercial-linking.ts`
- `src/lib/seo/commercial-linking.ts`
- `src/lib/seo/static-route-inventory.ts`

## Blog And Component Files Inspected Or Sampled

- `src/app/(marketing)/blog/[slug]/page.tsx`
- `src/app/(marketing)/blog/page.tsx`
- `src/components/blog/BlogCTA.tsx`
- `src/components/blog/BlogInlineProductCard.tsx`
- `src/components/blog/BlogCtaContext.tsx`
- `src/components/seo/SeoPageContextPanel.tsx`
- `src/components/seo/ContentLinker.tsx`
- `src/components/seo/RelatedLinks.tsx`
- `src/components/seo/IntentProductCTA.tsx`

## Ground And Legal Config Inspected

- `config/jurisdictions/uk/england/grounds/ground_16.json`
- `config/jurisdictions/uk/england/grounds/ground_13.json`
- `config/jurisdictions/uk/england/grounds/ground_14.json`
- `config/jurisdictions/uk/england/grounds/ground_17.json`
- `config/jurisdictions/uk/england/eviction_grounds.json`

## Search Terms Used In Repository Audit

- `property manager`
- `letting agent`
- `estate agent`
- `cleaner`
- `cleaning`
- `caretaker`
- `staff`
- `employee`
- `employment`
- `contractor`
- `maintenance`
- `admin assistant`
- `property business`
- `landlord company`
- `managing agent`
- `agent`

## Notable Findings

- Existing strongest overlap pages are tenancy hub, HMO/shared-house tenancy, cleaning-cost money claim, and selected operational guides.
- `ground_16.json` exists and is highly relevant to employment-linked accommodation.
- No route was found for `/section-8-grounds/how-to-evict-a-tenant-using-ground-16`, making it a strong new-content opportunity.
- Many pages mention cleaning, contractors, or agents only incidentally. Those should not automatically receive HRHeaven links.
