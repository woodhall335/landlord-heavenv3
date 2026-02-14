# Codex SEO Diagnosis Report (GSC HTTPS vs Sitemap mismatch)

## 1) What the merged audit already proves

### Core counts from merged artifacts
- Route files inventoried: **284**.
- Page routes discovered: **173**.
- Sitemap entries: **214** total (**213 unique paths**, with `/money-claim-online-mcol` duplicated).
- Audited URLs: **216**.
- Derived indexable URLs: **58** (59 pages returned 200, but `/wizard` is intentionally `noindex`).
- Duplicate titles/descriptions: **0 / 0**.

### Host/protocol baseline
- Sitemap host/protocol is consistently **`https://landlordheaven.co.uk/*`**.
- Runtime crawl for this artifact set ran against **`http://localhost:5000`**.

### Runtime crawl outcomes
- Runtime statuses in report: **157 with status=0**, **59 with status=200**.
- Fetch error breakdown among failures:
  - `This operation was aborted`: **96**
  - `fetch failed`: **61**
- Successful 200 examples include `/tools`, tool detail pages, many Wales/UK blog pages, `/tenant-not-paying-rent`, `/tenant-damaging-property`, and `/wizard`.

### Indexable vs non-indexable breakdown (from this run)
- Indexability reason counts:
  - `4xx_5xx_or_fetch_error`: **157**
  - `noindex_meta`: **1** (`/wizard`)
  - `blocked_by_robots`: **0**
  - `canonical_points_elsewhere`: **0**
- This means almost all non-indexability in this run is due to runtime fetch failure, not explicit SEO directives.

### Metadata field coverage on successful pages (status=200 only)
- `<title>`: present on **59/59**.
- `meta description`: present on **59/59**.
- Canonical: present on **57/59** (2 missing).
- OG title/description: present on **59/59**.
- OG image: present on **43/59** (16 missing).
- Twitter title/description: present on **59/59**.
- Twitter image: present on **58/59** (1 missing).
- JSON-LD blocks: present on **59/59** successful pages.

### Sitemap vs route inventory mismatch (how detected)
Detection logic in audit script:
1. Build route inventory from `src/app/**` `page.tsx` (static vs dynamic).
2. Parse sitemap XML entries and extract `path`.
3. Compare public static page routes (excluding `/api`, `/auth`, `/dashboard`, `/wizard`, `/success`) to sitemap paths.
4. Any public static route absent from sitemap path set is classified as missing.

Observed result:
- Public static routes missing from sitemap: **37**.
- Representative missing paths include tenancy variants, legacy/alt routes, and `/products/money-claim-pack`.

## 2) Ranked hypothesis set for GSC “HTTPS = 35” vs sitemap ~214+ mismatch

> Goal: explain why sitemap scale and GSC HTTPS-count scale can diverge without assuming a single root cause.

### H1 (Most likely): GSC HTTPS report scope is not “all known URLs”
**Hypothesis**: The HTTPS report count (35) reflects only URLs Google selected/tested in that report context, not total sitemap URLs.

**How to confirm**
- In GSC, open report help text + filters (property scope, page state, sampled set behavior).
- Compare HTTPS report export URL count vs Indexing > Pages report totals and sitemap submitted/discovered counts.
- Check whether examples are subset-based.

---

### H2: Property mismatch (domain property vs URL-prefix property)
**Hypothesis**: Team is viewing an HTTPS report under a URL-prefix property with narrower coverage than the full domain sitemap.

**How to confirm**
- Verify property type in GSC UI and compare numbers in:
  - `https://landlordheaven.co.uk/` URL-prefix
  - Domain property `landlordheaven.co.uk`
  - Any `www` URL-prefix property.

---

### H3: Google has discovered many sitemap URLs but only crawled/tested a smaller subset
**Hypothesis**: Large sitemap + small tested set reflects crawl budget/prioritization rather than missing URLs.

**How to confirm**
- Compare sitemap “Submitted” vs “Discovered URLs”.
- Inspect Indexing statuses: Discovered-not-indexed / Crawled-not-indexed counts.
- Sample URL Inspection for URLs in sitemap but absent from HTTPS examples.

---

### H4: Host/protocol canonicalization inconsistencies (http/www/apex) reduce canonical consolidation
**Hypothesis**: Even with sitemap on `https://landlordheaven.co.uk`, internal links, redirects, or canonicals may sometimes point to `http://` or `www`, fragmenting Google signals.

**How to confirm**
- Crawl rendered HTML link graph for `http://` or `www.` internal links.
- Header checks:
  - `curl -I http://landlordheaven.co.uk/...`
  - `curl -I https://www.landlordheaven.co.uk/...`
  - Ensure single-hop 301 to canonical apex HTTPS.
- Validate canonical tag host/protocol consistency for representative pages.

---

### H5: Robots environment behavior could be correct in prod but mismatched in non-prod audits
**Hypothesis**: `robots.ts` is environment-gated (`Disallow: /` outside prod). If an environment is misdetected in deployment or testing, crawl observations skew heavily.

**How to confirm**
- Check deployed `/robots.txt` on production host directly.
- Confirm `VERCEL_ENV` / `NODE_ENV` values in prod deployment logs.
- Ensure prod emits allow-list + sitemap URL (not blanket disallow).

---

### H6: Sitemap completeness gaps (37 public static routes currently absent) reduce Google discovery pathways
**Hypothesis**: Missing static pages in sitemap means Google depends on internal links for discovery, reducing tested/indexed footprint.

**How to confirm**
- Recompute route inventory vs sitemap on production build artifacts.
- Review whether each missing route is intentionally excluded or accidental.
- Validate whether missing routes receive internal links and non-orphan crawl paths.

---

### H7: Runtime rendering/fetch fragility on some pages can suppress metadata/indexability signals
**Hypothesis**: Local audit had heavy abort/fetch failures; if similar upstream dependencies fail in production under Googlebot requests, pages may return partial or unstable HTML.

**How to confirm**
- Synthetic checks from multiple regions for TTFB, status, and full HTML head completeness.
- Log/trace SSR data-fetch failures by route.
- Compare bot and browser requests for divergent response behavior.

---

### H8: Duplicate/near-duplicate intent clusters lead to “crawled/discovered but not indexed”
**Hypothesis**: Many similar tenancy/money-claim pages may be de-prioritized if Google sees overlap/thin differentiation.

**How to confirm**
- Export non-indexed URL sets from GSC and cluster by template/topic.
- Compare title/H1/intro uniqueness and content depth signals.
- Inspect canonical self-reference consistency among similar pages.

---

### H9: Redirect/canonical chains from older URLs may still dominate tested sample
**Hypothesis**: GSC HTTPS examples may emphasize legacy/redirecting URLs while newer sitemap URLs have less crawl history.

**How to confirm**
- Audit redirect maps + historic submitted sitemaps.
- Check if examples disproportionately include redirected URLs.
- Inspect final indexed canonical chosen by Google in URL Inspection.

---

### H10: Report lag / recency effects
**Hypothesis**: Sitemap updates or fixes are newer than Google’s report refresh cycle.

**How to confirm**
- Compare sitemap last submission date, crawl dates, and report last-updated timestamps.
- Re-check after fresh recrawl requests on representative URLs.

## 3) Repo-level SEO source-of-truth map (read-only)

| File path | What it controls | Key exports/functions | Host determination |
|---|---|---|---|
| `src/lib/seo/urls.ts` | Canonical origin and canonical URL construction | `SITE_ORIGIN`, `getCanonicalUrl(path)` | Hard-coded `SITE_ORIGIN = https://landlordheaven.co.uk` |
| `src/lib/seo/metadata.ts` | Central metadata helper/defaults (title/description/canonical/OG/Twitter/robots) | `generateMetadata`, `generateMetadataForPageType`, `defaultMetadata` | Uses `getCanonicalUrl()` + `SITE_ORIGIN`; also sets `metadataBase` |
| `src/lib/seo/index.ts` | SEO barrel exports used across app | Re-exports metadata helpers + `SITE_ORIGIN` | Indirect via `urls.ts` |
| `src/app/layout.tsx` | Global metadata defaults and global JSON-LD organization injection | `export const metadata` | Sets `metadataBase: new URL(SITE_ORIGIN)` |
| `src/app/sitemap.ts` | Sitemap URL assembly: marketing/product/landing/tools/blog/Ask Heaven; excludes private prefixes | `default async function sitemap()` | Uses `SITE_ORIGIN` for all emitted URLs |
| `src/app/robots.ts` | robots.txt behavior by environment (prod allow; non-prod disallow all) | `default function robots()` | Uses `SITE_ORIGIN` for sitemap URL |
| `src/app/blog/[slug]/page.tsx` | Dynamic per-post metadata | `generateMetadata` | Canonical/metadata constructed per post |
| `src/app/ask-heaven/[slug]/page.tsx` | Dynamic per-question metadata | `generateMetadata` | Canonical/metadata per approved question |
| `src/app/ask-heaven/page.tsx` | Ask Heaven index metadata | `generateMetadata` | Uses site SEO helpers/base origin |
| `src/app/wizard/page.tsx` | Wizard metadata policy | `generateMetadata` | Sets canonical to public landing route when recognized; `robots: noindex,follow` |

### Per-route metadata override reality
There are many direct `export const metadata` and several `generateMetadata` implementations across `src/app/**` (marketing, products, tools, blog/ask-heaven dynamic pages, wizard). This means metadata truth is **central helper + many route-level overrides**, not one file only.

## 4) Why the current artifacts cannot yet prove production truth

1. Crawl base was local (`http://localhost:5000`), while sitemap uses production HTTPS origin.
2. 157/216 URLs failed fetch in that run, so field coverage and indexability conclusions are strongly sample-limited.
3. `robots_rules.json` shows `Disallow: /` + no sitemap pointer, which is expected for non-production mode but not representative of prod SEO serving.
4. `seo_audit_summary.json` appears partially overwritten by the runtime crawl script (it keeps some mismatch keys but no longer contains full original route-vs-sitemap counters), so the most complete mismatch interpretation comes from `SEO_AUDIT_FINDINGS.md` + recomputation.

## 5) Recommended next audit run (production-truth focused)

## A) Base URL strategy
Run against:
1. Primary prod apex: `https://landlordheaven.co.uk`
2. Optional prod `www`: `https://www.landlordheaven.co.uk`
3. Local compare: `http://localhost:5000`

## B) Exact command sequence

```bash
# 1) inventory + sitemap/robots parse + baseline SEO extraction
SEO_AUDIT_BASE_URL=https://landlordheaven.co.uk node scripts/deep-seo-audit.mjs

# 2) runtime crawl (same base)
SEO_AUDIT_BASE_URL=https://landlordheaven.co.uk node scripts/seo-runtime-crawl.mjs

# optional host-variant check
SEO_AUDIT_BASE_URL=https://www.landlordheaven.co.uk node scripts/deep-seo-audit.mjs
SEO_AUDIT_BASE_URL=https://www.landlordheaven.co.uk node scripts/seo-runtime-crawl.mjs

# optional local diff run
SEO_AUDIT_BASE_URL=http://localhost:5000 node scripts/deep-seo-audit.mjs
SEO_AUDIT_BASE_URL=http://localhost:5000 node scripts/seo-runtime-crawl.mjs
```

## C) Coverage checklist for next run
Ensure sampled/forced URLs include:
- Home + core commercial: `/`, `/pricing`, `/tools`, `/ask-heaven`.
- Each tool page and validator route.
- Each product page (`/products/*`) and key wizard landing pages (`/eviction-notice`, `/eviction-pack-england`, `/money-claim`).
- Blog index + representative sample across UK/England/Scotland/Wales/NI clusters.
- Programmatic pages intended for indexing (e.g., canonical Ask Heaven question pages).

## D) Crawl robustness improvements (proposal only; not implemented)
Minimal safe changes to `scripts/seo-runtime-crawl.mjs`:
1. Make timeout configurable (`SEO_AUDIT_TIMEOUT_MS`, default 30000 or 60000).
2. Make concurrency configurable (`SEO_AUDIT_CONCURRENCY`, default 3–4 for local, 6 for prod).
3. Add retries for transient errors (`AbortError`, ECONNRESET, 429, 5xx) with jittered backoff.
4. Capture richer failure class (`dns_error`, `tls_error`, `timeout_abort`, `http_429`, `http_5xx`, etc.).
5. Record response headers (`x-robots-tag`, `cache-control`, `location`, `server`).
6. Optional HEAD preflight before GET to quickly classify redirects/status.

## 6) Exact confirmation checks for each discrepancy area

## A) GSC interpretation checks
- Export HTTPS report URLs and compare count to sitemap submitted/discovered in GSC.
- Compare against Indexing > Pages totals.

## B) Host + protocol canonicalization checks
- Header/redirect tests:
  - `curl -I http://landlordheaven.co.uk/`
  - `curl -I https://www.landlordheaven.co.uk/`
  - `curl -I https://landlordheaven.co.uk/`
- Canonical extraction test on representative URLs:
  - `curl -s https://landlordheaven.co.uk/<path> | sed -n '1,200p' | rg -n "canonical|og:url|twitter:"`

## C) Robots + noindex checks
- `curl -s https://landlordheaven.co.uk/robots.txt`
- `curl -s https://landlordheaven.co.uk/wizard | rg -n "name=\"robots\"|canonical"`

## D) Sitemap completeness checks
- Compare `route_inventory.json` static public routes to `sitemap_entries.json` paths.
- Confirm whether each missing route is intentional (retired/noindex/private) or accidental omission.

## E) Runtime/render failure checks
- For failing URLs, gather status/TTFB and head tags from production (not localhost).
- Correlate with app logs for SSR dependency failures.

## F) Crawl coverage quality checks
- Internal-link depth audit from top nav and hubs (`/tools`, `/blog`, key products).
- Thin/duplicate cluster analysis for similar long-tail pages.

## 7) Minimal safe fix proposals (NOT implemented)

1. **Sitemap completeness safeguards**
   - Add an automated test that fails CI if public static route count and sitemap coverage diverge beyond an allowlist.
   - De-duplicate sitemap path list at generation time (currently duplicate `/money-claim-online-mcol`).

2. **Canonical host consistency**
   - Add CI check to assert canonical URLs always use `https://landlordheaven.co.uk` and never `http`/`www` unless intentionally configured.

3. **Robots environment safety rails**
   - Add explicit startup log/assertion for prod robots mode.
   - Optionally guard against accidental prod `Disallow: /` with a test against built output.

4. **Runtime audit resiliency in CI/dev**
   - Add timeout/concurrency/retry env vars so audits fail less often due to local server load.

5. **OpenAI build-time key decoupling (if impacting CI audit jobs)**
   - For SEO audit CI job, provide a mode that skips feature initializers requiring external AI keys at build/start time so sitemap/robots/head can still be validated.

## 8) Wizard SEO exclusion confirmation (explicit)

Confirmed from code:
1. Wizard routes are intentionally excluded from sitemap via `excludedPrefixes` containing `/wizard`.
2. Wizard page metadata sets `robots` to `index:false, follow:true` (`noindex, follow`).
3. SEO landing pages can still link users into wizard URLs (e.g., `wizardUrl` fields in landing content) without making wizard indexable, because noindex is controlled at the wizard route response.

This matches desired behavior: **landing pages indexable; wizard transactional flow non-indexable**.
