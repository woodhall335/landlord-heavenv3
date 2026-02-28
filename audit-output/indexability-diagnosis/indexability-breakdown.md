# Production crawl indexability breakdown

## Commands executed
- `SEO_AUDIT_BASE_URL=https://landlordheaven.co.uk node scripts/deep-seo-audit.mjs`
- `SEO_AUDIT_BASE_URL=https://landlordheaven.co.uk node scripts/seo-runtime-crawl.mjs`
- `SEO_AUDIT_TIMEOUT_MS=60000 SEO_AUDIT_CONCURRENCY=3 SEO_AUDIT_BASE_URL=https://landlordheaven.co.uk node scripts/seo-runtime-crawl.mjs`

## Results observed in this environment
- `deep-seo-audit.mjs` failed immediately with `TypeError: fetch failed` and cause `ENETUNREACH`.
- `curl -I` to all representative production URLs failed with `curl: (56) CONNECT tunnel failed, response 403` and only showed an Envoy proxy 403 (no origin headers).
- The runtime crawl commands did not complete successfully in this environment due upstream connectivity constraints.

## Latest generated runtime dataset (`audit-output/seo-current/seo_audit_report.json`)
Using the currently available report (runtimeBaseUrl already set to `https://landlordheaven.co.uk` in `seo_audit_summary.json`):

- total audited URLs: **301**
- indexable URLs: **0**
- status `0` URLs: **301**
- noindex_meta URLs: **0**
- indexabilityReasons aggregate:
  - `4xx_5xx_or_fetch_error`: **301**

Interpretation: non-indexability is being dominated by fetch/connectivity failures rather than explicit `noindex` directives.
