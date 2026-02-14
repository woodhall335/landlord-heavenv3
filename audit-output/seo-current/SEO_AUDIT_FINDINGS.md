# SEO Audit Findings

## Counts
- Route files inventoried: 284
- Page routes discovered: 173
- Sitemap entries: 214
- Audited URLs: 216
- Indexable URLs (derived): 58
- Duplicate titles: 0
- Duplicate descriptions: 0

## Host and protocol
- Sitemap hosts: landlordheaven.co.uk
- Sitemap protocols: https:
- Runtime crawl base: http://localhost:5000

## Mismatch analysis
- Sitemap entries without route match: 0
- Public static routes missing from sitemap: 37
- Sitemap URLs with runtime fetch failure/timeouts (status=0 in this run): 155

### Missing-from-sitemap examples
- /assured-shorthold-tenancy-agreement
- /ast-template-england
- /ast-tenancy-agreement-template
- /claim-rent-arrears-tenant
- /common-prt-tenancy-mistakes-scotland
- /fixed-term-periodic-occupation-contract-wales
- /fixed-term-tenancy-agreement-northern-ireland
- /how-to-sue-tenant-for-unpaid-rent
- /joint-occupation-contract-wales
- /joint-prt-tenancy-agreement-scotland
- /joint-tenancy-agreement-northern-ireland
- /mcol-money-claim-online
- /money-claim-rent-arrears
- /ni-private-tenancy-agreement
- /occupation-contract-template-wales
- /premium-tenancy-agreement
- /private-residential-tenancy-agreement-scotland
- /products/money-claim-pack
- /prt-template-scotland
- /prt-tenancy-agreement-template-scotland

## Indexability reason counts
- blocked_by_robots: 0
- noindex_meta: 1
- canonical_points_elsewhere: 0
- runtime fetch failures (4xx_5xx_or_fetch_error): 157

## Field coverage
- Missing <title>: 157
- Missing meta description: 157
- Missing canonical: 159

## Top issues
1. **High** — Sitemap includes many URLs that did not return content in the runtime crawl run (status 0/timeouts). Impacted URLs: 155.
2. **High** — 37 public static routes are not represented in sitemap.ts path lists.
3. **Medium** — Robots is environment-dependent; non-production blocks all crawling, production only blocks selected private areas. Confirm deployment env matches intent.
4. **Medium** — Canonical mismatches detected on 0 pages where canonical points elsewhere.
