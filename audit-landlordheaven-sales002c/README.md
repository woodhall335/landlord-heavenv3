# SALES-002C indexability audit

Generated: 2026-07-24T12:10:02.987Z

Base URL checked: http://127.0.0.1:5102

Routes audited: 62

Commercial route defects after correction: 0

Technical indexability is separate from actual Google indexing. This audit confirms whether routes are crawlable/indexable from source and rendered HTTP responses; it does not claim Google has indexed them.

Key corrections applied:

- Assisted-prep intake query-state URLs are now intentionally noindex and absent from the sitemap. Public assisted-prep discovery pages remain indexable.
- The top-20 organic Scotland First-tier Tribunal article is represented in the sitemap because it is rendered indexable, self-canonical and meaningful.
- Retired or duplicate aliases such as /products/money-claim-pack and /hmo-tenancy-agreement-template are excluded from sitemap coverage while preserving canonical public destination routes.
