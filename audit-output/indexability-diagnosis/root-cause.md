# Root cause

**Single most likely root cause:** the audit environment cannot reliably reach `https://landlordheaven.co.uk` (proxy/tunnel/network path failure), so crawls classify pages as non-indexable via fetch errors (`status=0`) rather than true SEO directives.

## Evidence
1. Direct production checks fail at network/proxy layer:
   - `curl -I https://landlordheaven.co.uk/...` returns `curl: (56) CONNECT tunnel failed, response 403` and an Envoy 403, preventing origin header/body inspection.
2. Deep audit against production fails before analysis:
   - `TypeError: fetch failed` with `AggregateError [ENETUNREACH]`.
3. Available runtime crawl dataset for production base URL shows all failures are fetch-based:
   - 301/301 URLs have `status=0` and `indexabilityReasons: 4xx_5xx_or_fetch_error`.
   - 0 URLs flagged for `noindex_meta`.
4. Repository SEO defaults are indexable by default and do not set global noindex.

Conclusion: current "many pages non-indexable" signal is a crawl fragility/connectivity artifact, not evidence of a sitewide production noindex policy.
