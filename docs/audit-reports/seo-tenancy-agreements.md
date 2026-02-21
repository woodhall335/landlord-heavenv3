# Tenancy Agreements SEO + Jurisdiction Audit

## Routes checked
- `/tenancy-agreements/england`
- `/tenancy-agreements/wales`
- `/tenancy-agreements/scotland`
- `/tenancy-agreements/northern-ireland`
- `/tenancy-agreements/england-wales` (jurisdiction picker)
- `/tenancy-agreement-template` (free template landing page)

## Metadata + schema status
- England, Wales, Scotland, and Northern Ireland jurisdiction pages now ship 2026-focused titles with stable pricing signals and jurisdiction-correct terminology in descriptions.
- Each jurisdiction page includes Product, FAQ, and Breadcrumb JSON-LD schema.
- The jurisdiction picker and template landing page already have their own metadata but do not include jurisdiction-specific Product/FAQ/Breadcrumb schema.

## CTA + routing checks
- Primary CTAs on each jurisdiction page route into the tenancy agreement wizard with `jurisdiction` set to the matching nation (england, wales, scotland, northern-ireland).
- Internal “Related links” sections now connect each jurisdiction page to its eviction guide, tools hub, Ask Heaven, and the matching blog category.
