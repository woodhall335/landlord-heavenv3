# Fix plan

## A) No sitewide noindex misconfiguration detected in code
- Keep current production-intended defaults:
  - `src/app/layout.tsx` uses `defaultMetadata`.
  - `src/lib/seo/metadata.ts` default robots = index/follow.
  - `src/app/robots.ts` allows crawl in production and disallows only private sections.

## B) Stabilize audit reliability (primary fix)
1. **Improve crawl diagnostics for connectivity failures**
   - File: `scripts/seo-runtime-crawl.mjs`
   - Add explicit counters for failure categories (`dns_error`, `tls_error`, `fetch_failed`, `timeout_abort`) in summary output.
   - Emit clear warning when >20% URLs are `status=0` to avoid mislabeling as SEO policy.

2. **Fail-fast classification guard**
   - File: `scripts/deep-seo-audit.mjs`
   - If seed URL cannot be fetched due network/proxy error, exit with a dedicated diagnosis code/message: `audit_unreliable_connectivity`.

3. **Optional CI smoke check before full crawl**
   - New script: `scripts/check-origin-reachability.mjs`
   - Verify base URL can return headers/body for `/` and `/robots.txt` before running heavy audit.

4. **Run production crawl from network with direct origin reachability**
   - Execute current audit commands from CI runner/Vercel cron/self-hosted runner with unrestricted egress and no intercepting proxy.

## C) Route intent policy confirmation
- Intentional non-indexable groups:
  - `/wizard/*`, `/auth/*`, `/dashboard/*`, `/checkout/*`, `/success/*`.
- Should remain indexable:
  - `/`, `/products/*`, `/money-claim`, `/eviction-notice-template`, `/tools` and key landing/blog pages in sitemap.

## D) Regression tests to add
- Unit test for `src/lib/seo/metadata.ts`: default robots must be index/follow.
- Unit test for `src/app/robots.ts`: production env emits allowlist + sitemap; non-prod emits disallow `/`.
- Integration smoke test: representative public pages must not emit `noindex`.
